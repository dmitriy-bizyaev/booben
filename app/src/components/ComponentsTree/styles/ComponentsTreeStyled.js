import styled from 'styled-components';
import { baseModule } from '../../../styles/themeSelectors';

export const ComponentsTreeStyled = styled.div`
  padding: ${baseModule(0.5)}px 0;
  flex-shrink: 0;
  display: flex;
  
  & > * {
    flex-grow: 1;
  }
`;

ComponentsTreeStyled.displayName = 'ComponentsTreeStyled';
