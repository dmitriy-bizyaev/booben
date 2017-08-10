/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { isCompatibleType } from '@jssy/types';
import { getComponentMeta, getString } from '../../lib/meta';
import { walkSimpleValues } from '../../lib/components';
import { findFirstConnectionInPath } from '../../lib/schema';
import { objectSome, objectToArray, mapListToArray } from '../../utils/misc';

/**
 *
 * @param {JssyValueDefinition} targetValueDef
 * @param {?Object<string, JssyTypeDefinition>} targetUserTypedefs
 * @param {Immutable.Map<number, Object>} components
 * @param {ComponentsMeta} meta
 * @param {string} language
 * @return {{filter: function(componentId: number): boolean, dataGetter: function(componentId: number): Array<ComponentDataItem>}}
 */
export const getStateSlotPickerFns = (
  targetValueDef,
  targetUserTypedefs,
  components,
  meta,
  language,
) => {
  const filter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);

    if (!componentMeta.state) return false;

    return objectSome(
      componentMeta.state,
      stateSlotDef => isCompatibleType(
        targetValueDef,
        stateSlotDef,
        targetUserTypedefs,
        componentMeta.types,
      ),
    );
  };

  const dataGetter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);

    return objectToArray(
      componentMeta.state,
      (stateSlotDef, stateSlotName) => ({
        name: getString(
          componentMeta.strings,
          stateSlotDef.textKey,
          language,
        ),

        description: getString(
          componentMeta.strings,
          stateSlotDef.descriptionTextKey,
          language,
        ),

        unavailable: !isCompatibleType(
          targetValueDef,
          stateSlotDef,
          targetUserTypedefs,
          componentMeta.types,
        ),

        data: stateSlotName,
      }),
    );
  };

  return { filter, dataGetter };
};

export const getConnectionDataValuePickerFns = (
  components,
  meta,
  schema,
  project,
  language,
) => {
  const filter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    let ret = false;

    // eslint-disable-next-line consistent-return
    const visitor = jssyValue => {
      if (
        jssyValue.isLinkedWithData() &&
        jssyValue.sourceData.dataContext.size === 0
      ) {
        const queryPath = mapListToArray(
          jssyValue.sourceData.queryPath,
          step => step.field,
        );

        const connectionIdx = findFirstConnectionInPath(schema, queryPath);

        if (connectionIdx !== -1) {
          ret = true;
          return walkSimpleValues.BREAK;
        }
      }
    };

    const options = {
      meta,
      schema,
      project,
      walkSystemProps: true,
      walkDesignerValues: false,
      walkFunctionArgs: true,
      walkActions: false,
      visitIntermediateNodes: false,
    };

    walkSimpleValues(component, componentMeta, visitor, options);

    return ret;
  };

  const dataGetter = componentId => {
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    const ret = [];

    // eslint-disable-next-line consistent-return
    const visitor = (jssyValue, valueDef, pathSteps, isSystemProp) => {
      if (
        jssyValue.isLinkedWithData() &&
        jssyValue.sourceData.dataContext.size === 0
      ) {
        const queryPath = mapListToArray(
          jssyValue.sourceData.queryPath,
          step => step.field,
        );

        const connectionIdx = findFirstConnectionInPath(schema, queryPath);

        if (connectionIdx !== -1) {
          const fullPath = isSystemProp
            ? ['systemProps', ...pathSteps]
            : ['props', ...pathSteps];

          ret.push({
            name: fullPath.join(' > '),
            description: '',
            unavailable: false,
            data: fullPath,
          });
        }
      }
    };

    const options = {
      meta,
      schema,
      project,
      walkSystemProps: true,
      walkDesignerValues: false,
      walkFunctionArgs: true,
      walkActions: false,
      visitIntermediateNodes: false,
    };

    walkSimpleValues(component, componentMeta, visitor, options);

    return ret;
  };

  return { filter, dataGetter };
};
