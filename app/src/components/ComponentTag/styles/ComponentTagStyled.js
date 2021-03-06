import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from './constants';

import {
  baseModule,
} from '../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  focused: false,
  colorScheme: 'dark',
};

const BORDER_WIDTH = constants.borderWidth;

const focused = ({ focused, colorScheme }) => focused
  ? css`
    background-color: ${constants[colorScheme].tag.bgColorFocused};
    border-color: ${constants[colorScheme].separatorColor};
  `
  : '';

const colorScheme = ({ colorScheme }) => css`
  border: ${BORDER_WIDTH}px solid ${constants[colorScheme].separatorColor};

  &:hover {
    background-color: ${constants[colorScheme].tag.bgColorHover};
  }
`;

/* colorScheme should be placed first because of border redefining */
export const ComponentTagStyled = styled.div`
  ${colorScheme}  
  box-sizing: border-box;
  padding: ${baseModule(0.25)}px;
  margin-top: -${BORDER_WIDTH}px;
  cursor: move;
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  user-select: none;
  border-left-width: 0;
  ${focused}
`;

ComponentTagStyled.displayName = 'ComponentTagStyled';
ComponentTagStyled.propTypes = propTypes;
ComponentTagStyled.defaultProps = defaultProps;
