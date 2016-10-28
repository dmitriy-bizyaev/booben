/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { getProject, getMetadata } from '../api';

/**
 *
 * @type {string}
 */
export const PROJECT_REQUEST = 'PROJECT_REQUEST';

/**
 *
 * @param {string} projectName
 * @return {Object}
 */
const requestProject = projectName => ({
    type: PROJECT_REQUEST,
    projectName
});

/**
 *
 * @type {string}
 */
export const PROJECT_LOADED = 'PROJECT_LOADED';

/**
 *
 * @param {Object} project
 * @param {Object} metadata
 * @return {Object}
 */
const projectLoaded = (project, metadata) => ({
    type: PROJECT_LOADED,
    project,
    metadata
});

/**
 *
 * @type {string}
 */
export const PROJECT_LOAD_FAILED = 'PROJECT_LOAD_FAILED';

/**
 *
 * @param {Object} error
 * @return {Object}
 */
const projectLoadFailed = error => ({
    type: PROJECT_LOAD_FAILED,
    error
});

/**
 *
 * @param {string} projectName
 * @return {function(dispatch: function(action: Object))}
 */
export const loadProject = projectName => dispatch => {
    dispatch(requestProject(projectName));

    Promise.all([getProject(projectName), getMetadata(projectName)])
        .then(([project, metadata]) => void dispatch(projectLoaded(project, metadata)))
        .catch(err => void dispatch(projectLoadFailed(err)))
};

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_CREATE = 'PROJECT_ROUTE_CREATE';

/**
 *
 * @param {number[]} where - indexes of routes in path
 * @param {string} path
 * @param {string} title
 * @return {Object}
 */
export const createRoute = (where, path, title) => ({
    type: PROJECT_ROUTE_CREATE,
    where,
    path,
    title
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_DELETE = 'PROJECT_ROUTE_DELETE';

/**
 *
 * @param {Immutable.List<number>} where - indexes of routes in path
 * @param {number} idx - index of route to delete
 * @return {Object}
 */
export const deleteRoute = (where, idx) => ({
    type: PROJECT_ROUTE_DELETE,
    where,
    idx
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_UPDATE_FIELD = 'PROJECT_ROUTE_UPDATE_FIELD';

/**
 *
 * @param {number[]|Immutable.List<number>} where - indexes of routes in path
 * @param {number} idx - index of route to rename
 * @param {string} field
 * @param {*} newValue
 * @return {Object}
 */
export const updateRouteField = (where, idx, field, newValue) => ({
    type: PROJECT_ROUTE_UPDATE_FIELD,
    where,
    idx,
    field,
    newValue
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_DELETE = 'PROJECT_COMPONENT_DELETE';

/**
 *
 * @param {string} componentId - Component ID
 * @return {Object}
 */
export const deleteComponent = componentId => ({
    type: PROJECT_COMPONENT_DELETE,
    componentId
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_MOVE = 'PROJECT_COMPONENT_MOVE';

/**
 *
 * @param {number[]} where - index of component
 * @return {Object}
 */
export const moveComponent = (sourceId, targetId, position) => ({
    type: PROJECT_COMPONENT_MOVE,
    sourceId,
    targetId,
    position
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_CREATE_ROOT = 'PROJECT_COMPONENT_CREATE_ROOT';

/**
 * @param  {number}  routeId
 * @param  {boolean} isIndexRoute
 * @param  {ProjectComponent}  component
 * @return {object}
 */
export const createRootComponent = (routeId, isIndexRoute, component) => ({
    type: PROJECT_COMPONENT_CREATE_ROOT,
    routeId,
    isIndexRoute,
    component
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_CREATE = 'PROJECT_COMPONENT_CREATE';

/**
 * @param  {number} targetId
 * @param  {number} position
 * @param  {ProjectComponent} component
 */
export const createComponent = (targetId, position, component) => ({
    type: PROJECT_COMPONENT_CREATE,
    targetId,
    position,
    component
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_UPDATE_PROP_VALUE = 'PROJECT_COMPONENT_UPDATE_PROP_VALUE';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {string} newSource
 * @param {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataAction|SourceDataDesigner} newSourceData
 * @return {Object}
 */
export const updateComponentPropValue = (componentId, propName, newSource, newSourceData) => ({
    type: PROJECT_COMPONENT_UPDATE_PROP_VALUE,
    componentId,
    propName,
    newSource,
    newSourceData
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_RENAME = 'PROJECT_COMPONENT_RENAME';

/**
 *
 * @param {number} componentId
 * @param {string} newTitle
 * @return {Object}
 */
export const renameComponent = (componentId, newTitle) => ({
    type: PROJECT_COMPONENT_RENAME,
    componentId,
    newTitle
});

/**
 * 
 * @type {string}
 */
export const PROJECT_COMPONENT_TOGGLE_REGION = 'PROJECT_COMPONENT_TOGGLE_REGION';

/**
 * 
 * @param {number} componentId
 * @param {number} regionIdx
 * @param {boolean} enable
 * @return {Object}
 */
export const toggleComponentRegion = (componentId, regionIdx, enable) => ({
    type: PROJECT_COMPONENT_TOGGLE_REGION,
    componentId,
    regionIdx,
    enable
});
