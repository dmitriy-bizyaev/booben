'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

export const AccordionItem = props => {
    let className = 'accordion-item';

    className += props.expanded
        ? ' accordion-item-is-expanded'
        : ' accordion-item-is-collapsed';

    if (props.contentBlank) className += ' accordion-content-blank';

    return (
        <div className={className}>
            <div className="accordion-title-box" onClick={props.onExpand}>
                <div className="accordion-title">
                    {props.title}
                </div>

                <div className="accordion-title-icon accordion-icon-collapse">
                    <Icon name="chevron-down"/>
                </div>
            </div>

            <div className="accordion-item-content-box">
                {props.children}
            </div>
        </div>
    );
};

AccordionItem.propTypes = {
    title: PropTypes.string,
    expanded: PropTypes.bool,
    contentBlank: PropTypes.bool,
    onExpand: PropTypes.func
};

AccordionItem.defaultProps = {
    title: '',
    expanded: false,
    contentBlank: false,
    onExpand: noop
};

AccordionItem.displayName = 'AccordionItem';