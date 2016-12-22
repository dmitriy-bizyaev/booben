/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    MainRegion,
    Content,
} from '@reactackle/reactackle';

import { ToolWindow } from './ToolWindow/ToolWindow';
import { ToolPanel } from './ToolPanel/ToolPanel';

import ToolType from '../../models/Tool';
import ToolStateType from '../../models/ToolState';

import {
    collapseToolsPanel,
    dockTool,
    undockTool,
    focusTool,
    selectTool,
    closeTool,
    setStickyTool,
    setToolActiveSection,
} from '../../actions/desktop';

import { List } from 'immutable';

import { noop } from '../../utils/misc';

class DesktopComponent extends PureComponent {
  render() {
    const windows = [];

    this.props.toolGroups.forEach(tools => {
      tools.forEach(tool => {
        const toolState =
                    this.props.toolStates.get(tool.id) ||
                    new ToolStateType();

        if (toolState.docked || toolState.closed) return;

        const onDock = () => this.props.onToolDock(tool);

        const onClose = () => this.props.onToolClose(tool);

        const onFocus = () => this.props.onToolFocus(tool);

        const onTitleChange = newTitle =>
                    this.props.onToolTitleChange(tool, newTitle);

        const onStickRegionEnter = () =>
                    this.props.onToolStickRegionEnter(tool);

        const onStickRegionLeave = () =>
                    this.props.onToolStickRegionLeave(tool);

        const onStopDrag = () => {
          const toolState = this.props.toolStates.get(tool.id);
          if (toolState.isInDockRegion) this.props.onToolDock(tool);
        };

        const onActiveSectionChange = newActiveSection =>
                    this.props.onToolActiveSectionChange(tool, newActiveSection);

        windows.push(
          <ToolWindow
            key={tool.id}
            tool={tool}
            toolState={toolState}
            constrainPosition
            marginRight={8}
            marginBottom={8}
            stickRegionRight={100}
            onDock={onDock}
            onClose={onClose}
            onFocus={onFocus}
            onTitleChange={onTitleChange}
            onStickRegionEnter={onStickRegionEnter}
            onStickRegionLeave={onStickRegionLeave}
            onStopDrag={onStopDrag}
            onActiveSectionChange={onActiveSectionChange}
          />,
                );
      });
    });

    return (
      <MainRegion>
        <Content>
          {this.props.children}
          {windows}
        </Content>

        <ToolPanel
          isExpanded={this.props.toolsPanelIsExpanded}
          toolGroups={this.props.toolGroups}
          toolStates={this.props.toolStates}
          onCollapse={this.props.onToolsPanelCollapse}
          onToolSelect={this.props.onActiveToolChange}
          onToolUndock={this.props.onToolUndock}
          onToolTitleChange={this.props.onToolTitleChange}
          onToolActiveSectionChange={this.props.onToolActiveSectionChange}
        />
      </MainRegion>
    );
  }
}

DesktopComponent.propTypes = {
  toolGroups: ImmutablePropTypes.listOf(
        ImmutablePropTypes.listOf(PropTypes.instanceOf(ToolType)),
    ),

  toolStates: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ToolStateType),
        PropTypes.string,
    ),

  toolsPanelIsExpanded: PropTypes.bool,

  onToolsPanelCollapse: PropTypes.func,
  onActiveToolChange: PropTypes.func,
  onToolTitleChange: PropTypes.func,
  onToolDock: PropTypes.func,
  onToolUndock: PropTypes.func,
  onToolClose: PropTypes.func,
  onToolFocus: PropTypes.func,
  onToolStickRegionEnter: PropTypes.func,
  onToolStickRegionLeave: PropTypes.func,
  onToolActiveSectionChange: PropTypes.func,
};

DesktopComponent.defaultProps = {
  toolGroups: List(),
  onToolTitleChange: noop,
};

DesktopComponent.displayName = 'Desktop';

const mapStateToProps = ({ desktop }) => ({
  toolStates: desktop.toolStates,
  toolsPanelIsExpanded: desktop.toolsPanelIsExpanded,
});

const mapDispatchToProps = dispatch => ({
  onToolsPanelCollapse: () =>
        void dispatch(collapseToolsPanel()),

  onActiveToolChange: tool =>
        void dispatch(selectTool(tool.id)),

  onToolDock: tool =>
        void dispatch(dockTool(tool.id)),

  onToolUndock: (tool, nextActiveTool) =>
        void dispatch(undockTool(
            tool.id,
            nextActiveTool !== null ? nextActiveTool.id : null),
        ),

  onToolClose: tool =>
        void dispatch(closeTool(tool.id)),

  onToolFocus: tool =>
        void dispatch(focusTool(tool.id)),

  onToolStickRegionEnter: tool =>
        void dispatch(setStickyTool(tool.id)),

  onToolStickRegionLeave: () =>
        void dispatch(setStickyTool(null)),

  onToolActiveSectionChange: (tool, newActiveSection) =>
        void dispatch(setToolActiveSection(tool.id, newActiveSection)),
});

export const Desktop = connect(mapStateToProps, mapDispatchToProps)(DesktopComponent);
