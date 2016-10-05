'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Set, Map } from 'immutable';

import Builder from './Builder';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    setPreviewWorkspace,
    unsetPreviewWorkspace,
    showPreviewWorkspace,
    hidePreviewWorkspace,
    setDomElementToMap
} from '../../app/actions/preview';

import {
    componentDeleteFromRoute
} from '../../app/actions/project';

let workspaceMap = Map();

/**
 * Get owner React element by condition
 *
 * @param  {function} el
 * @param  {function} [condition]
 * @return {function}
 */
const getOwner = (el, condition) => {
    const owner = el._owner;
    if (!owner) return null;
    if (!condition) return owner;

    return condition(owner) ? owner : getOwner(owner, condition);
};

/**
 * Get child React element by condition
 *
 * @param  {function} el
 * @param  {function} [condition]
 * @return {function}
 */
const getChild = (el, condition) => {
    let child = null;

    if(el._renderedComponent) {
        child = el._renderedComponent;
        if (!child) return null;
        if (!condition) return child;
        return condition(child) ? child : getChild(child, condition);
    } else if(el._renderedChildren) {
        for(let key in el._renderedChildren) {
            if(condition(el._renderedChildren[key])) return el._renderedChildren[key];

            child = getChild(el._renderedChildren[key], condition);
            if(child) return child;
        }

        return null;
    }
};

const mouseEvents = [
    'click',
    'mouseover',
    'mouseout',
    'dragover',
    'dragleave',
    'drop',
    'mousedown'
];

class Preview extends Component {
    constructor(props) {
        super(props);

        this.domNode = null;
        this.domOverlay = null;
        this.dndParams = {};
        this.dndFlag = false;
        this.animationFrame = null;
        this.needRAF = true;
        this.currentRouteID = null;

        this._handleMouseEvent = this._handleMouseEvent.bind(this);
        this._handleResize = this._handleResize.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleStartDrag = this._handleStartDrag.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
        this._handlerChangeRoute = this._handlerChangeRoute.bind(this);
    }

    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);
        this.domOverlay = this.props.domOverlay;
        this.workspace = workspaceMap.get(this.currentRouteID);

        if (this.props.interactive) {
            mouseEvents.forEach(e => {
                this.domNode.addEventListener(e, this._handleMouseEvent, false);
            });

            window.addEventListener('resize', this._handleResize, false);

            this._updateWorkspace();
        }
    }

    componentWillMount() {
        this.routes = this.props.routes
            .map((route, routeIndex) => this._createRoute(route, routeIndex, route.path))
            .toArray();
    }

    componentWillUnmount() {
        if (this.props.interactive) {
            mouseEvents.forEach(e => {
                this.domNode.removeEventListener(e, this._handleMouseEvent, false);
            });

            window.removeEventListener('resize', this._handleResize, false);
        }

        this.domNode = null;
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.routes !== this.props.routes;
    }

    _updateWorkspace() {
        const builderWS = getChild(this['_reactInternalInstance'],
            item => item._currentElement.props.uid == this.workspace);

        if(!builderWS || !builderWS._renderedComponent) return;

        this.props.setWorkspace(this.workspace);
        this._setDomElementToMap(this.workspace, builderWS._renderedComponent._hostNode);
    }

    _handleResize() {}

    /**
     * Get array of selected components
     *
     * @param  {function} el
     * @param  {string} uid
     */
    _updateSelected(el, uid) {
        const owner = getOwner(el, item => item._currentElement.props.uid == uid),
            domEl = owner._renderedComponent._hostNode;

        this._setDomElementToMap(uid, domEl);

        if(this.props.selected.has(uid)) {
            this.props.deselectComponent(uid);
        } else {
            this.props.selectComponent(uid)
        }
    }

    /**
     * Get array of highlighted components
     *
     * @param  {function} el
     * @param  {string} uid
     */
    _updateHighlighted(el, uid) {
        const owner = getOwner(el, item => item._currentElement.props.uid == uid),
            domEl = owner._renderedComponent._hostNode;

        this._setDomElementToMap(uid, domEl);

        if(this.props.highlighted.has(uid)) {
            this.props.unhighlightComponent(uid);
        } else {
            this.props.highlightComponent(uid);
        }
    }

    _setDomElementToMap(key, value) {
        if(!this.props.domElementsMap.has(key)) {
            this.props.setDomElementToMap(key, value);
        }
    }

    _inWorkspace(uid) {
        const workspace = this.props.componentsMap.get(this.workspace),
            el = this.props.componentsMap.get(uid);

        for(var i in workspace.where) {
            if(workspace.where[i] != el.where[i]) return false;
        }

        return true;
    }

    _handleAnimationFrame() {
        var el = this.dndParams.el;

        el.style.transform = `translate(${this.dndParams.pageX}px,
            ${this.dndParams.pageY}px)`;
        this.animationFrame = null;
        this.needRAF = true;
    }

    _handleStartDrag(event) {
        if(this.dndFlag) return;

        this.domNode.addEventListener('mousemove', this._handleDrag);
        this.domNode.addEventListener('mouseup', this._handleStopDrag);
        window.top.addEventListener('mouseup', this._handleStopDrag);
    }

    _handleStopDrag(event) {
        this.domNode.removeEventListener('mousemove', this._handleDrag);
        this.domNode.removeEventListener('mouseup', this._handleStopDrag);
        window.top.removeEventListener('mouseup', this._handleStopDrag);

        this.props.hideWorkspace();

        if(!this.dndFlag) return;

        const keys = Object.keys(event.target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        this.dndFlag = false;

        if (riiKey && this.dndParams) {
            const owner = getOwner(event.target[riiKey]._currentElement, item => item._currentElement.props.uid);

            if(
                owner &&
                owner._currentElement.props.uid &&
                owner._currentElement.props.uid != this.dndParams.uid &&
                this._inWorkspace(owner._currentElement.props.uid)
            ) {
                // this.props.componentsMap.get(owner._currentElement.props.uid).where
            }
        }

        if (this.animationFrame !== null) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.domOverlay.removeChild(this.dndParams.el);
    }

    _handleDrag(event) {
        const moveX = event.pageX - this.dndParams.dragStartX,
            moveY = event.pageY - this.dndParams.dragStartY;

        if ( Math.abs(moveX) < 10 && Math.abs(moveY) < 10 ) {
            return;
        }

        if(!this.dndFlag) {
            var el = this.dndParams.el;
            el.innerHTML = this.props.componentsMap.get(this.dndParams.uid).name;

            el.style.position = 'absolute';
            el.style.zIndex = 1000;

            this.dndParams.pageX = this.dndParams.dragStartX + 10;
            this.dndParams.pageY = this.dndParams.dragStartY + 10;

            el.style.transform = `translate(${this.dndParams.pageX}px,
            ${this.dndParams.pageY}px)`;

            this.domOverlay.appendChild(el);
            this.dndFlag = true;

            this.props.componentDeleteFromRoute(this.dndParams.where);

            this.props.showWorkspace();
        }

        this.dndParams.pageX = event.pageX + 10;
        this.dndParams.pageY = event.pageY + 10;

        if (this.needRAF) {
            this.needRAF = false;

            this.animationFrame =
                window.requestAnimationFrame(this._handleAnimationFrame);
        }
    }

    /**
     * 
     * @param {MouseEvent} event
     */
    _handleMouseEvent(event) {
        const keys = Object.keys(event.target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        if (!riiKey) return;

        const el = event.target[riiKey]._currentElement,
            owner = getOwner(el, item => item._currentElement.props.uid);

        if (owner) {
            // event.stopPropagation();

            const type = event.type,
                uid = owner._currentElement.props.uid;

            if(!this._inWorkspace(uid)) return;

            if( type == 'click' ) {
                if(!event.ctrlKey) return;
                this._updateSelected(el, uid);
            } else if( type == 'dragover' || type == 'mouseover') {
                this._updateHighlighted(el, uid);
            } else if( type == 'dragleave' || type == 'mouseout') {
                this._updateHighlighted(el, uid);
            } else if( type == 'drop' ) {
                console.log({
                    source: JSON.parse(event.dataTransfer.getData("Text")),
                    target: uid
                });
            }

            if ( type == 'mousedown' ) {
                if (event.which != 1 || !event.ctrlKey) return;

                event.preventDefault();

                this.dndParams.el = document.createElement('div');
                this.dndParams.uid = uid;
                this.dndParams.where = this.props.componentsMap.get(uid).where;
                this.dndParams.dragStartX = event.pageX;
                this.dndParams.dragStartY = event.pageY;

                this._handleStartDrag();
            }
        }
    }

    _handlerChangeRoute(id) {
        this.currentRouteID = id;
    }

    _createRoute(route, index) {
        const routeIndex = Array.isArray(index) ? index : [index]; 

        const ret = {
            component: ({ children }) => <Builder
                component={this.props.routes.getIn(routeIndex).component}
                children={children}
                routeIndex={routeIndex}
            />
        };

        if (route && !route.isIndex) ret.path = route.path;

        if (route && !route.isIndex && route.children.size > 0) {
            const indexRouteIdx = route.children.findKey(route => route.isIndex),
                haveIndexRoute = typeof indexRouteIdx === 'undefined';

            const regularChildren = haveIndexRoute
                ? route.children
                : route.children.delete(indexRouteIdx);

            ret.childRoutes = regularChildren
                .map((child, routeIndex) => this._createRoute(
                    child,
                    [].concat(index, 'children', routeIndex)
                ))
                .toArray();

            ret.onEnter = this._handlerChangeRoute.bind(this, route.id);

            workspaceMap = workspaceMap.set(route.id, this.props.routes.getIn(routeIndex).component.uid)

            if (haveIndexRoute) {
                const indexRoute = route.children.get(indexRouteIdx);
                ret.indexRoute = this._createRoute(
                    indexRoute,
                    [].concat(index, 'children', indexRouteIdx)
                )
            }
        }

        return ret;
    }

    render() {
        return (
            <Router history={hashHistory} routes={this.routes} />
        );
    }
}

Preview.propTypes = {
    domOverlay: React.PropTypes.object,
    interactive: PropTypes.bool,
    routes: ImmutablePropTypes.listOf(
        ImmutablePropTypes.contains({
            id: PropTypes.number,
            path: PropTypes.string,
            component: ImmutablePropTypes.contains({
                uid: React.PropTypes.string,
                name: React.PropTypes.string,
                props: ImmutablePropTypes.map,
                children: ImmutablePropTypes.list
            })
        })
    ),
    selected: ImmutablePropTypes.set,
    highlighted: ImmutablePropTypes.set,
    deselectComponent: PropTypes.func,
    selectComponent: PropTypes.func,
    unhighlightComponent: PropTypes.func,
    highlightComponent: PropTypes.func,
    setWorkspace: PropTypes.func,
    unsetWorkspace: PropTypes.func,
    showWorkspace: PropTypes.func,
    hideWorkspace: PropTypes.func,
    setDomElementToMap: PropTypes.func
};

Preview.defaultProps = {
    domOverlay: null,
    interactive: false,
    routes: List(),
    selected: Set(),
    highlighted: Set(),
    componentsMap: Map(),
    domElementsMap: Map(),
    deselectComponent: /* istanbul ignore next */ () => {},
    selectComponent: /* istanbul ignore next */ () => {},
    highlightComponent: /* istanbul ignore next */ () => {},
    unhighlightComponent: /* istanbul ignore next */ () => {},
    setWorkspace: /* istanbul ignore next */ () => {},
    unsetWorkspace: /* istanbul ignore next */ () => {},
    showWorkspace: /* istanbul ignore next */ () => {},
    hideWorkspace: /* istanbul ignore next */ () => {},
    setDomElementToMap: /* istanbul ignore next */ () => {}
};

Preview.displayName = 'Preview';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    selected: state.preview.selectedItems,
    highlighted: state.preview.highlightedItems,
    componentsMap: state.preview.componentsMap,
    domElementsMap: state.preview.domElementsMap
});

const mapDispatchToProps = dispatch => ({
    deselectComponent: selected => void dispatch(deselectPreviewComponent(selected)),
    selectComponent: selected => void dispatch(selectPreviewComponent(selected)),
    highlightComponent: highlighted => void dispatch(highlightPreviewComponent(highlighted)),
    unhighlightComponent: highlighted => void dispatch(unhighlightPreviewComponent(highlighted)),
    componentDeleteFromRoute: (where) => void dispatch(componentDeleteFromRoute(where)),
    setWorkspace: component => void dispatch(setPreviewWorkspace(component)),
    unsetWorkspace: component => void dispatch(unsetPreviewWorkspace(component)),
    showWorkspace: () => void dispatch(showPreviewWorkspace()),
    hideWorkspace: () => void dispatch(hidePreviewWorkspace()),
    setDomElementToMap: (uid, component) => void dispatch(setDomElementToMap(uid, component))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
