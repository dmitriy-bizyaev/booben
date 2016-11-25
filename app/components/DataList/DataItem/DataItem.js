'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { noop } from '../../../utils/misc';

import {
    Button,
    RadioGroup,
    Radio,
    TooltipIcon
} from '@reactackle/reactackle';

export const DataItem = props => {
    let className = 'data-list-item';

    if (props.chosen) className += ' is-chosen';
    if (props.state) className += ' state-' + props.state;
    if (props.actionType) className += ' action-type-' + props.actionType;

    let tooltip = null,
        content = null,
        description = null,
        argsButton = null,
        actionsRight = null;
    
    if (props.tooltip) {
        tooltip = (
            <TooltipIcon text={props.tooltip} />
        );
    }
    
    if (props.argsButton) {
        argsButton = <Button text="Set Arguments" narrow/>;
    }
    
    if (props.connection) {
        actionsRight =
            <div className="data-item_actions data-item_actions-right">
                <div className="data-item_actions data-item_actions-right">
                    <Button icon="chevron-right" />
                </div>
            </div>
    }
    
    if (props.description) {
        description =
            <div className="data-item_description">
                {props.description}
            </div>
    }
    
    if (description || argsButton) {
        content =
            <div className="data-item_content">
                { description }
                <div className="data-item_buttons">
                    { argsButton }
                    <Button text="Apply" narrow />
                </div>
            </div>
    }
    
    const onClick = props.onClick;

    return (
        <div className={className} onClick={() => void onClick(props.arg)}>
           <div className='data-item_content-box'>
                
                <div className='data-item_title-box'>
                    <div className="data-item_title">
                        <span className="data-item_title-text">{props.title}</span>
                        <span className="data-item_type">{props.type}</span>
                        {tooltip}
                    </div>
                </div>
                
                { content }
            </div>
    
            { actionsRight }
        </div>
    );
};

DataItem.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    tooltip: PropTypes.string,
    actionType: PropTypes.oneOf(['jump', 'select']),
    required: PropTypes.bool,
    argsButton: PropTypes.bool,
    chosen: PropTypes.bool,
    state: PropTypes.oneOf(["error", "success"]),
    connection: PropTypes.bool,
    arg: PropTypes.any,

    onClick: PropTypes.func
};

DataItem.defaultProps = {
    title: '',
    description: '',
    type: '',
    tooltip: '',
    actionType: 'select',
    required: false,
    argsButton: false,
    chosen: false,
    state: null,
    connection: false,
    arg: null,

    onClick: noop
};

DataItem.displayName = 'DataItem';