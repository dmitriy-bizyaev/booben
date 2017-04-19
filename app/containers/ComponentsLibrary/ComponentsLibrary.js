/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { createSelector } from 'reselect';
import { List, Record, Map, OrderedMap } from 'immutable';
import _forOwn from 'lodash.forown';
import { Button } from '@reactackle/reactackle';
import { dragHandler } from '../../hocs/dragHandler';

import {
  Accordion,
  AccordionItemRecord,
} from '../../components/Accordion/Accordion';

import {
  BlockContentBox,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import {
  ComponentTag,
  ComponentTagWrapper,
} from '../../components/ComponentTag/ComponentTag';

import {
  setExpandedGroups,
  showAllComponents,
} from '../../actions/components-library';

import {
  currentSelectedComponentIdsSelector,
  currentComponentsSelector,
  haveNestedConstructorsSelector,
} from '../../selectors';

import { getLocalizedTextFromState } from '../../utils';
import { canInsertComponent } from '../../utils/meta';
import { combineFiltersAll } from '../../utils/misc';

//noinspection JSUnresolvedVariable
import defaultComponentIcon from '../../img/component_default.svg';

const LibraryComponentData = Record({
  name: '',
  fullName: '',
  text: null,
  descriptionText: null,
  textIntlKey: '',
  descriptionIntlKey: '',
  iconURL: '',
});

const LibraryGroupData = Record({
  name: '',
  namespace: '',
  text: null,
  descriptionText: null,
  textIntlKey: '',
  descriptionIntlKey: '',
  isDefault: false,
  components: List(),
});

const ComponentGroupsType = PropTypes.shape({
  groups: ImmutablePropTypes.listOf(PropTypes.instanceOf(LibraryGroupData)),
  filtered: PropTypes.bool,
});

const propTypes = {
  componentGroups: ComponentGroupsType.isRequired,
  expandedGroups: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
  language: PropTypes.string.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  draggedComponents: ImmutablePropTypes.map,
  draggedComponentId: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onStartDragNewComponent: PropTypes.func.isRequired,
  onExpandedGroupsChange: PropTypes.func.isRequired,
  onShowAllComponents: PropTypes.func.isRequired,
};

const defaultProps = {
  draggedComponents: null,
};

const GROUP_BUILTIN = new LibraryGroupData({
  name: '__builtin__',
  namespace: '',
  textIntlKey: 'componentGroups.builtin',
  descriptionIntlKey: 'componentGroups.builtin.desc',
  components: List([
    new LibraryComponentData({
      name: 'Outlet',
      fullName: 'Outlet',
      iconURL: defaultComponentIcon,
      textIntlKey: 'components.builtin.Outlet',
      descriptionIntlKey: 'components.builtin.Outlet.desc',
    }),
  ]),
});

const extractGroupsDataFromMeta = meta => {
  let groups = OrderedMap();

  _forOwn(meta, libMeta => {
    _forOwn(libMeta.componentGroups, (groupData, groupName) => {
      const fullName = `${libMeta.namespace}.${groupName}`;
      const libraryGroup = new LibraryGroupData({
        name: fullName,
        namespace: libMeta.namespace,
        text: Map(libMeta.strings[groupData.textKey]),
        descriptionText: Map(libMeta.strings[groupData.descriptionTextKey]),
        isDefault: false,
      });

      groups = groups.set(fullName, libraryGroup);
    });

    _forOwn(libMeta.components, componentMeta => {
      if (componentMeta.hidden) return;

      let defaultGroup = false,
        groupName;

      if (!componentMeta.group) {
        defaultGroup = true;
        groupName = `${libMeta.namespace}.__default__`;
      } else {
        groupName = `${libMeta.namespace}.${componentMeta.group}`;
      }

      if (defaultGroup && !groups.has(groupName)) {
        const group = new LibraryGroupData({
          name: groupName,
          namespace: libMeta.namespace,
          isDefault: true,
        });

        groups = groups.set(groupName, group);
      }

      const text = componentMeta.strings[componentMeta.textKey];
      const description =
        componentMeta.strings[componentMeta.descriptionTextKey];

      const libraryComponent = new LibraryComponentData({
        name: componentMeta.displayName,
        fullName: `${libMeta.namespace}.${componentMeta.displayName}`,
        text: Map(text),
        descriptionText: Map(description),
        iconURL: componentMeta.icon || defaultComponentIcon,
      });

      groups = groups.updateIn(
        [groupName, 'components'],
        components => components.push(libraryComponent),
      );
    });
  });
  
  groups = groups.set('__builtin__', GROUP_BUILTIN);

  return groups.toList().filter(group => !group.components.isEmpty());
};

const libraryGroupsSelector = createSelector(
  state => state.project.meta,
  extractGroupsDataFromMeta,
);

const getComponentNameString = (componentData, language, getLocalizedText) => {
  if (componentData.text)
    return componentData.text.get(language);
  
  if (componentData.textIntlKey)
    return getLocalizedText(componentData.textIntlKey);
  
  return componentData.name;
};

const getGroupNameString = (groupData, language, getLocalizedText) => {
  let name;
  
  if (groupData.isDefault)
    name = getLocalizedText('uncategorizedComponents');
  else if (groupData.text)
    name = groupData.text.get(language);
  else if (groupData.textIntlKey)
    name = getLocalizedText(groupData.textIntlKey);
  else
    name = groupData.name;
  
  return groupData.namespace
    ? `${groupData.namespace} - ${name}`
    : name;
};

const compareComponents = (language, getLocalizedText) => (a, b) => {
  const aText = getComponentNameString(a, language, getLocalizedText);
  const bText = getComponentNameString(b, language, getLocalizedText);
  
  if (aText < bText) return -1;
  if (aText > bText) return 1;
  return 0;
};

const libraryGroupsSortedByLanguageSelector = createSelector(
  libraryGroupsSelector,
  getLocalizedTextFromState,
  state => state.app.language,

  (groups, getLocalizedText, language) =>
    groups.map(group =>
      group.update('components', components =>
        components.sort(compareComponents(language, getLocalizedText)),
      ),
    ),
);

const filterGroupsAndComponents = (groups, includeComponent) => groups
  .map(
    group => group.update(
      'components',
      components => components.filter(includeComponent),
    ),
  )
  .filter(group => !group.components.isEmpty());

const libraryGroupsFilteredSelector = createSelector(
  libraryGroupsSortedByLanguageSelector,
  currentSelectedComponentIdsSelector,
  currentComponentsSelector,
  haveNestedConstructorsSelector,
  state => state.project.showAllComponentsOnPalette,
  state => state.project.meta,

  (
    groups,
    selectedComponentIds,
    components,
    haveNestedConstructors,
    showAllComponentsOnPalette,
    meta,
  ) => {
    const filterFns = [
      component => !haveNestedConstructors || component.fullName !== 'Outlet',
    ];

    if (selectedComponentIds.size === 1 && !showAllComponentsOnPalette) {
      const selectedComponentId = selectedComponentIds.first();
      const selectedComponent = components.get(selectedComponentId);
      const childComponentNames = selectedComponent.children
        .map(childId => components.get(childId).name);

      filterFns.push(
        component => canInsertComponent(
          component.fullName,
          selectedComponent.name,
          childComponentNames,
          -1,
          meta,
        ),
      );
    }

    const filteredGroups =
      filterGroupsAndComponents(groups, combineFiltersAll(filterFns));

    return {
      groups: filteredGroups,
      filtered: true,
    };
  },
);

const mapStateToProps = state => ({
  componentGroups: libraryGroupsFilteredSelector(state),
  expandedGroups: state.componentsLibrary.expandedGroups,
  language: state.app.language,
  draggingComponent: state.project.draggingComponent,
  draggedComponents: state.project.draggedComponents,
  draggedComponentId: state.project.draggedComponentId,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onExpandedGroupsChange: groups => void dispatch(setExpandedGroups(groups)),
  onShowAllComponents: () => void dispatch(showAllComponents()),
});

class ComponentsLibraryComponent extends PureComponent {
  _getFocusedComponentName() {
    const {
      draggingComponent,
      draggedComponents,
      draggedComponentId,
    } = this.props;
    
    if (draggingComponent) {
      const id = draggedComponentId > -1 ? draggedComponentId : 0;
      return draggedComponents.get(id).name;
    }
    
    return '';
  }
  
  render() {
    const {
      componentGroups,
      expandedGroups,
      onShowAllComponents,
      language,
      getLocalizedText,
      onStartDragNewComponent,
      onExpandedGroupsChange,
    } = this.props;

    const focusedComponentName = this._getFocusedComponentName();
    const { groups, filtered } = componentGroups;

    if (groups.isEmpty()) {
      if (filtered) {
        const noComponentsText =
          getLocalizedText('noComponentsCanBeInsertedInsideSelectedComponent');
        
        const showAllComponentsText = getLocalizedText('showAllComponents');
        
        return (
          <BlockContentPlaceholder text={noComponentsText}>
            <Button
              text={showAllComponentsText}
              onPress={onShowAllComponents}
            />
          </BlockContentPlaceholder>
        );
      } else {
        const noComponentsText = getLocalizedText('noComponentsInLibrary');
        
        return (
          <BlockContentPlaceholder text={noComponentsText} />
        );
      }
    }

    const accordionItems = groups.map(group => {
      const items = group.components.map(component => (
        <ComponentTag
          key={component.fullName}
          title={getComponentNameString(component, language, getLocalizedText)}
          image={component.iconURL}
          focused={focusedComponentName === component.fullName}
          onStartDrag={event => onStartDragNewComponent(event, component)}
        />
      ));

      return new AccordionItemRecord({
        id: group.name,
        title: getGroupNameString(group, language, getLocalizedText),
        content: (
          <ComponentTagWrapper>
            {items}
          </ComponentTagWrapper>
        ),
      });
    });

    return (
      <BlockContentBox isBordered>
        <Accordion
          single
          items={accordionItems}
          expandedItemIds={expandedGroups}
          onExpandedItemsChange={onExpandedGroupsChange}
        />
      </BlockContentBox>
    );
  }
}

ComponentsLibraryComponent.propTypes = propTypes;
ComponentsLibraryComponent.defaultProps = defaultProps;
ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

export const ComponentsLibrary = dragHandler(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ComponentsLibraryComponent),
);
