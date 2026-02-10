import React, { useState, useMemo, useEffect } from 'react';
import {connect} from 'react-redux';
import { getPossibleTargetsEditingWidget, TARGET_TYPES } from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import FlexBox from '../../../../layout/FlexBox';
import { getEditingWidget, getWidgetInteractionTreeGenerated } from '../../../../../selectors/widgets';
import Message from '../../../../I18N/Message';
import { DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap';
import tooltip from '../../../../misc/enhancers/tooltip';

const TDropdownButton = tooltip(DropdownButton);


const FilterActionsTab = ({
    data = {},
    sourceWidgetId,
    onEditorChange = () => {}
}) => {

    const memoizedTargets = useMemo(() => {
        return getPossibleTargetsEditingWidget("filter", data?.data?.layer);
    }, [data?.data?.layer]);

    const [baseTargets, setBaseTargets] = useState([]);
    const [optionalTargets, setOptionalTargets] = useState([]);

    useEffect(() => {
        const isStyle = data?.data?.dataSource === "userDefined" && data.data.userDefinedType === "styleList";
        const requiredTargetType = isStyle ? TARGET_TYPES.APPLY_STYLE : TARGET_TYPES.APPLY_FILTER;
        const availableOptionalTargets = memoizedTargets.filter(t => t.isOptional);
        setBaseTargets(memoizedTargets.filter(t => !t.isOptional && t.targetType === requiredTargetType));
        setOptionalTargets(prevOptionalTargets => prevOptionalTargets.filter(
            optionalTarget => availableOptionalTargets.some(availableTarget => availableTarget.targetType === optionalTarget.targetType)
        ));
    }, [memoizedTargets, data]);

    const availableOptionalTargets = useMemo(() => {
        return memoizedTargets.filter(target => target.isOptional);
    }, [memoizedTargets]);

    const visibleTargets = useMemo(() => {
        return [...baseTargets, ...optionalTargets];
    }, [baseTargets, optionalTargets]);

    const addOptionalTarget = (targetType) => {
        const target = availableOptionalTargets.find(item => item.targetType === targetType);
        if (!target || optionalTargets.some(item => item.targetType === targetType)) {
            return;
        }
        setOptionalTargets(prevOptionalTargets => [...prevOptionalTargets, target]);
    };

    const removeOptionalTarget = (targetType) => {
        setOptionalTargets(prevOptionalTargets => prevOptionalTargets.filter(target => target.targetType !== targetType));
    };

    const notSelectedOptionalTargets = availableOptionalTargets.filter(
        target => !optionalTargets.some(selectedTarget => selectedTarget.targetType === target.targetType)
    );

    return (
        <div className="ms-filter-wizard-actions-tab">
            <FlexBox
                inline
                wrap
                style={{width: "100%", marginBottom: "10px"}}
                centerChildrenVertically
            >
                <div style={{flex: 1}}>
                    <Message msgId="widgets.filterWidget.onSelectionChange" />
                </div>
                <TDropdownButton
                    id="filter-optional-targets-dropdown"
                    noCaret
                    className="square-button no-border"
                    title={<Glyphicon glyph="plus" />}
                    tooltip={<Message msgId="widgets.filterWidget.addOptionalTarget" />}
                    pullRight
                    bsStyle="default">
                    {notSelectedOptionalTargets.map(target => (
                        <MenuItem
                            key={target.targetType}
                            onSelect={() => addOptionalTarget(target.targetType)}>
                            {target.title}
                        </MenuItem>
                    ))}
                    {notSelectedOptionalTargets.length === 0 && (
                        <MenuItem disabled>No optional targets available</MenuItem>
                    )}
                </TDropdownButton>
            </FlexBox>
            <InteractionEditor
                targets={visibleTargets}
                sourceWidgetId={sourceWidgetId}
                currentSourceId={data?.id}
                onEditorChange={onEditorChange}
                onRemoveTarget={removeOptionalTarget}
                isStyleOnly={data?.data?.dataSource === "userDefined" && data.data.userDefinedType === "styleList"}
            />
        </div>
    );
};

export default connect((state) => {
    const editingWidget = getEditingWidget(state);
    return {
        widgetInteractionTree: getWidgetInteractionTreeGenerated(state),
        sourceWidgetId: editingWidget?.id
    };
}, null)(FilterActionsTab);
