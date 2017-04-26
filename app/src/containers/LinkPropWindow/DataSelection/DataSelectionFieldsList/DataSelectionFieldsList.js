/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _forOwn from 'lodash.forown';
import { isCompatibleType } from '@jssy/types';
import { DataList, DataItem } from '../../../../components/DataList/DataList';

import {
  getJssyValueDefOfField,
  fieldHasArguments,
  FieldKinds,
  formatFieldName,
} from '../../../../utils/schema';

import { noop, returnArg, objectSome } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  type: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  linkTargetTypedef: PropTypes.object.isRequired,
  linkTargetUserTypedefs: PropTypes.object,
  getLocalizedText: PropTypes.func,
  onJumpIntoField: PropTypes.func,
  onSetFieldArguments: PropTypes.func,
  onApply: PropTypes.func,
};

const defaultProps = {
  linkTargetUserTypedefs: null,
  getLocalizedText: returnArg,
  onJumpIntoField: noop,
  onSetFieldArguments: noop,
  onApply: noop,
};

const fieldHasCompatibleSubFields = (
  fieldJssyTypedef,
  linkTargetTypedef,
  linkTargetUserTypedefs,
  failedTypedefs = new Set(),
) => {
  if (fieldJssyTypedef.type !== 'shape') return false;
  
  return objectSome(fieldJssyTypedef.fields, fieldTypedef => {
    const isCompatible = isCompatibleType(
      linkTargetTypedef,
      fieldTypedef,
      linkTargetUserTypedefs,
      {},
    );
    
    if (isCompatible) return true;
    
    // failedTypedefs set is used to take care of possible circular references
    // that can be present in typedefs generated from GraphQL schemas
    if (failedTypedefs.has(fieldTypedef)) return false;
    failedTypedefs.add(fieldTypedef);
    
    return fieldHasCompatibleSubFields(
      fieldTypedef,
      linkTargetTypedef,
      linkTargetUserTypedefs,
      failedTypedefs,
    );
  });
};

const getFieldCompatibility = (
  jssyType,
  linkTargetTypedef,
  linkTargetUserTypedefs,
) => {
  const isCompatible = isCompatibleType(
    linkTargetTypedef,
    jssyType,
    linkTargetUserTypedefs,
    {},
  );
  
  const hasCompatibleSubFields = fieldHasCompatibleSubFields(
    jssyType,
    linkTargetTypedef,
    linkTargetUserTypedefs,
  );
  
  return { isCompatible, hasCompatibleSubFields };
};

export class DataSelectionFieldsList extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      selectedFieldName: '',
    };
  
    this._handleFieldSelect = this._handleFieldSelect.bind(this);
    this._handleJumpIntoField = this._handleJumpIntoField.bind(this);
    this._handleSetFieldArguments = this._handleSetFieldArguments.bind(this);
    this._handleApplyClick = this._handleApplyClick.bind(this);
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleFieldSelect({ id: fieldName }) {
    this.setState({
      selectedFieldName: fieldName,
    });
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleJumpIntoField({ id: fieldName }) {
    this.props.onJumpIntoField({ fieldName });
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleSetFieldArguments({ id: fieldName }) {
    this.props.onSetFieldArguments({ fieldName });
  }

  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleApplyClick({ id: fieldName }) {
    this.props.onApply({ fieldName });
  }
  
  /**
   *
   * @param {DataField} field
   * @return {string}
   * @private
   */
  _formatFieldType(field) {
    const { getLocalizedText } = this.props;
    
    if (field.kind === FieldKinds.LIST) {
      return getLocalizedText('linkDialog.data.fields.listOf', {
        type: field.type,
      });
    }
    
    if (field.kind === FieldKinds.CONNECTION) {
      return getLocalizedText('linkDialog.data.fields.connectionTo', {
        type: field.type,
      });
    }
    
    return field.type;
  }
  
  /**
   *
   * @param {string} fieldName
   * @param {DataField} field
   * @param {boolean} isCompatible
   * @param {boolean} hasCompatibleSubFields
   * @return {?ReactElement}
   * @private
   */
  _renderField(fieldName, field, isCompatible, hasCompatibleSubFields) {
    const { getLocalizedText } = this.props;
    const { selectedFieldName } = this.state;
    
    const fieldType = this._formatFieldType(field);
    const selected = fieldName === selectedFieldName;
    const hasApplyButton = selected && isCompatible;
    const hasArgsButton = selected && fieldHasArguments(field);
    
    //noinspection JSValidateTypes
    return (
      <DataItem
        key={fieldName}
        id={fieldName}
        title={fieldName}
        tooltip={field.description}
        type={fieldType}
        selected={selected}
        canBeApplied={hasApplyButton}
        argsButton={hasArgsButton}
        connection={hasCompatibleSubFields}
        getLocalizedText={getLocalizedText}
        onSelect={this._handleFieldSelect}
        onJumpIntoClick={this._handleJumpIntoField}
        onSetArgumentsClick={this._handleSetFieldArguments}
        onApplyClick={this._handleApplyClick}
      />
    );
  }
  
  render() {
    const {
      type,
      schema,
      linkTargetTypedef,
      linkTargetUserTypedefs,
    } = this.props;
  
    const items = [];
  
    _forOwn(type.fields, (field, fieldName) => {
      const jssyType = getJssyValueDefOfField(field, schema);
    
      const { isCompatible, hasCompatibleSubFields } = getFieldCompatibility(
        jssyType,
        linkTargetTypedef,
        linkTargetUserTypedefs,
      );
    
      if (!isCompatible && !hasCompatibleSubFields) return;
    
      items.push(this._renderField(
        fieldName,
        field,
        isCompatible,
        hasCompatibleSubFields,
      ));
    
      if (!field.connectionFields) return;
    
      _forOwn(field.connectionFields, (connField, connFieldName) => {
        const fullName = formatFieldName(fieldName, connFieldName);
        const connFieldJssyType = getJssyValueDefOfField(connField, schema);
      
        const {
          isCompatible,
          hasCompatibleSubFields,
        } = getFieldCompatibility(
          connFieldJssyType,
          linkTargetTypedef,
          linkTargetUserTypedefs,
        );
      
        if (!isCompatible && !hasCompatibleSubFields) return;
      
        items.push(this._renderField(
          fullName,
          connField,
          isCompatible,
          hasCompatibleSubFields,
        ));
      });
    });
  
    //noinspection JSValidateTypes
    return (
      <DataList>
        {items}
      </DataList>
    );
  }
}

DataSelectionFieldsList.propTypes = propTypes;
DataSelectionFieldsList.defaultProps = defaultProps;
DataSelectionFieldsList.displayName = 'DataSelectionFieldsList';
