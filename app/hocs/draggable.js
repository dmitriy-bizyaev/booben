/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { toClassComponent } from '../utils/react';
import { noop, pointPositionRelativeToCircle } from '../utils/misc';

const propTypes = {
  dragEnable: PropTypes.bool,
  dragStartRadius: PropTypes.number,
  dragTitle: PropTypes.string,
  dragData: PropTypes.any,
  onDragTryStart: PropTypes.func,
  onDragStartProgress: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragCancel: PropTypes.func,
};

const defaultProps = {
  dragEnable: true,
  dragStartRadius: 20,
  dragTitle: '',
  dragData: null,
  onDragTryStart: noop,
  onDragStartProgress: noop,
  onDragStart: noop,
  onDragCancel: noop,
};

const IS_DRAGGABLE = Symbol('Is draggable component');

const makeDisplayName = displayName => `draggable(${displayName})`;

const wrap = OriginalComponent => class extends OriginalComponent {
  constructor(props) {
    super(props);

    this.__draggableElement = null;
    this.__draggableTryingStartDrag = false;
    this.__draggableStartDragX = 0;
    this.__draggableStartDragY = 0;

    this.__draggableHandleMouseDown =
      this.__draggableHandleMouseDown.bind(this);
    this.__draggableHandleMouseMove =
      this.__draggableHandleMouseMove.bind(this);
    this.__draggableHandleMouseUp =
      this.__draggableHandleMouseUp.bind(this);
  }

  componentDidMount(...args) {
    if (super.componentDidMount) super.componentDidMount(...args);
    this.__draggableUpdateElement();
  }

  componentDidUpdate(...args) {
    if (super.componentDidUpdate) super.componentDidUpdate(...args);
    this.__draggableUpdateElement();
  }

  componentWillUnmount(...args) {
    if (super.componentWillUnmount) super.componentWillUnmount(...args);

    if (this.__draggableTryingStartDrag)
      this.__draggableStopTryDrag();
  }

  __draggableStopTryDrag() {
    this.__draggableTryingStartDrag = false;
    window.removeEventListener('mousemove', this.__draggableHandleMouseMove);
    window.removeEventListener('mouseup', this.__draggableHandleMouseUp);
  }

  __draggableUpdateElement() {
    const newElement = findDOMNode(this);
    if (newElement === this.__draggableElement) return;

    if (this.__draggableElement) {
      if (this.__draggableTryingStartDrag)
        this.__draggableStopTryDrag();

      this.__draggableElement.removeEventListener(
        'mousedown',
        this.__draggableHandleMouseDown,
      );
    }

    this.__draggableElement = newElement;

    if (this.__draggableElement) {
      this.__draggableElement.addEventListener(
        'mousedown',
        this.__draggableHandleMouseDown,
      );
    }
  }

  __draggableHandleMouseDown(event) {
    const { dragEnable, dragTitle, dragData, onDragTryStart } = this.props;

    if (!dragEnable) return;

    event.preventDefault();
    this.__draggableTryingStartDrag = true;
    window.addEventListener('mousemove', this.__draggableHandleMouseMove);
    window.addEventListener('mouseup', this.__draggableHandleMouseUp);
    this.__draggableStartDragX = event.pageX;
    this.__draggableStartDragY = event.pageY;

    onDragTryStart({
      title: dragTitle,
      data: dragData,
      element: this.__draggableElement,
      pageX: event.pageX,
      pageY: event.pageY,
      screenX: event.screenX,
      screenY: event.screenY,
    });
  }

  __draggableHandleMouseMove(event) {
    const {
      dragStartRadius,
      dragTitle,
      dragData,
      onDragStart,
      onDragStartProgress,
    } = this.props;

    if (this.__draggableTryingStartDrag) {
      const pointPosition = dragStartRadius > 0
        ? pointPositionRelativeToCircle(
          event.pageX,
          event.pageY,
          this.__draggableStartDragX,
          this.__draggableStartDragY,
          dragStartRadius,
        )
        : Infinity;

      const willStartDrag = pointPosition >= 1;

      if (willStartDrag) {
        this.__draggableStopTryDrag();

        onDragStart({
          title: dragTitle,
          data: dragData,
          pageX: event.pageX,
          pageY: event.pageY,
          screenX: event.screenX,
          screenY: event.screenY,
        });
      } else {
        onDragStartProgress({
          title: dragTitle,
          data: dragData,
          progress: pointPosition,
          pageX: event.pageX,
          pageY: event.pageY,
          screenX: event.screenX,
          screenY: event.screenY,
        });
      }
    }
  }

  __draggableHandleMouseUp(event) {
    const { dragTitle, dragData, onDragCancel } = this.props;

    if (this.__draggableTryingStartDrag) {
      this.__draggableStopTryDrag();

      onDragCancel({
        title: dragTitle,
        data: dragData,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
      });
    }
  }
};

export default component => {
  const ret = wrap(toClassComponent(component));
  ret.propTypes = { ...component.propTypes, ...propTypes };
  ret.defaultProps = { ...component.defaultProps, ...defaultProps };
  ret.displayName = makeDisplayName(component.displayName);
  ret[IS_DRAGGABLE] = true;
  return ret;
};

export const isDraggableComponent = component =>
  !!component && !!component[IS_DRAGGABLE];
