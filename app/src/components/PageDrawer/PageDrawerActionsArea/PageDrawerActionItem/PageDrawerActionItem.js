'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Button, withTooltip } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

const propTypes = {
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onPress: PropTypes.func,
};

const defaultProps = {
  icon: '',
  title: '',
  isActive: false,
  onPress: noop,
};

const PageDrawerActionItemComponent = props => {
  let className = 'page-drawer-action-item';
  if (props.isActive) className += ' is-active';
  
  let button = null;
  if (props.icon) {
    if (props.title) className += ' has-tooltip';
    button = (
      <Button icon={{ name: props.icon }} onPress={props.onPress} />
    );
  } else {
    button = (
      <Button text={{ name: props.title }} onPress={props.onPress} />
    );
  }
  
  if (props.title) {
    const TooltipComponent = props.Tooltip;
  
    /* eslint-disable react/jsx-handler-names */
    return (
      <div
        className={className}
        onMouseEnter={props.showTooltip}
        onMouseLeave={props.hideTooltip}
      >
        {button}
        <TooltipComponent text={props.title} />
      </div>
    );
    /* eslint-enable react/jsx-handler-names */
  } else {
    return (
      <div className={className}>
        {button}
      </div>
    );
  }
};

PageDrawerActionItemComponent.propTypes = propTypes;
PageDrawerActionItemComponent.defaultProps = defaultProps;
PageDrawerActionItemComponent.displayName = 'PageDrawerActionItem';

export const PageDrawerActionItem =
  withTooltip(PageDrawerActionItemComponent, true);
