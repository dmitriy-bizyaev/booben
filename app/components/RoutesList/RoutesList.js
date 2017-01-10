'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import './RoutesList.scss';

export const RoutesList = props => (
  <ul className="routes-list-wrapper">
    {props.children}
  </ul>
);

RoutesList.displayName = 'RoutesList';

export * from './RouteCard/RouteCard';
export * from './RouteNewButton/RouteNewButton';
