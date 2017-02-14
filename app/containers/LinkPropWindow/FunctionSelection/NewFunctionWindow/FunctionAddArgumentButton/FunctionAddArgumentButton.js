/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { returnArg, noop } from '../../../../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func,
  onPress: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onPress: noop,
};

export const FunctionAddArgumentButton = ({ getLocalizedText, onPress }) => (
  <div className="function-arguments_list-button">
    <Button
      icon="plus"
      text={getLocalizedText('functions.new.newArg.button')}
      narrow
      onPress={onPress}
    />
  </div>
);

FunctionAddArgumentButton.propTypes = propTypes;
FunctionAddArgumentButton.defaultProps = defaultProps;
FunctionAddArgumentButton.displayName = 'FunctionAddArgumentButton';