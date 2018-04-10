import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  draggable: PropTypes.bool,
};

const defaultProps = {
  draggable: false,
};

const draggable = ({ draggable }) => draggable ? 'cursor: move;' : '';

export const BlockContentTitleAreaStyled = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: 38px;
  position: relative;
  ${draggable}
`;

BlockContentTitleAreaStyled.displayName = 'BlockContentTitleAreaStyled';
BlockContentTitleAreaStyled.propTypes = propTypes;
BlockContentTitleAreaStyled.defaultProps = defaultProps;
