/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
import Text from '../../../../../layout/Text';
import {Glyphicon, Button} from 'react-bootstrap';
import {
    getDirectlyPluggableTargets,
    getConfigurableTargets,
    getConfiguredTargets
} from '../../../../../../utils/InteractionUtils';
import './interaction-wizard.less';

/**
 * Buttons to manage the interaction (plug/unplug and configuration)
 * @param {object} item the InteractionMetadata item
 * @param {boolean} plugged this means there the interaction is active
 * @param {boolean} setPlugged activates the plug for the interaction
 * @param {object} configuration the configuration for the interaction, if any
 * @param {boolean} showConfiguration tells if the configuration is visible or not
 * @param {function} setShowConfiguration toggles the UI for configuration
 * @param {boolean} isPluggable tells if the interaction can be plugged or not
 * @param {boolean} isConfigurable tells if the interaction can be configured or not
 * @returns {React.ReactElement}
 */
const InteractionButtons = (item, plugged, setPlugged, configuration, showConfiguration, setShowConfiguration = () => {}, isPluggable, isConfigurable) => {

    return (
        <FlexBox gap="xs">
            <Button
                visible={isConfigurable}
                bsStyle={showConfiguration ? "primary" : "default"}
                borderTransparent style={{ padding: 0, background: 'transparent' }}>
                <Glyphicon glyph="cog" />
            </Button>
            <Button
                bsStyle={plugged ? "primary" : "default"}
                disabled={isPluggable}
                borderTransparent style={{ padding: 0, background: 'transparent' }}>
                <Glyphicon glyph="plug" />
            </Button>
        </FlexBox>
    );
};
const InteractionConfiguration = ({show}) => {
    if (!show) return null;
    return <>
        <div>Config here</div>
    </>;
};
const InteractionsRow = ({item, event}) => {
    // from interactions we can derive if the target is plugged or not, and its configuration
    const [plugged, setPlugged] = React.useState(false); // TODO derive from interaction
    const [showConfiguration, setShowConfiguration] = React.useState(false);
    const [configuration, setConfiguration] = React.useState(); // TODO derive from interaction
    const directlyPluggableTargets = getDirectlyPluggableTargets(item, event);
    const configurableTargets = getConfigurableTargets(item, event);
    const configuredTargets = getConfiguredTargets(item, event, configuration); // TODO derive from interactions

    // tree should be already filtered but just in case
    // if (directlyPluggableTargets.length === 0 && configurableTargets.length === 0) {
    //     return null;
    // }
    const isPluggable = directlyPluggableTargets.length === 1 || configuredTargets.length > 0;
    const isConfigurable = configurableTargets.length > 0;
    return (
        <FlexBox key={item.id} component="li" gap="xs" column>
            <FlexBox gap="xs" className="ms-connection-row">
                <Glyphicon glyph={item.glyph}/>
                <Text className="ms-flex-fill">{item.title}</Text>
                <InteractionButtons
                    item={item}
                    plugged={plugged}
                    isPluggable={isPluggable}
                    isConfigurable={isConfigurable}
                    configuration={configuration}
                    setPlugged={setPlugged}
                    showConfiguration={showConfiguration}
                    setShowConfiguration={setShowConfiguration}

                />
            </FlexBox>
            <InteractionConfiguration item={item} show={showConfiguration} />
            <FlexBox component="ul" column gap="xs">
                {item.children?.map((child, idx) => (
                    <InteractionsRow key={idx} item={child} event={event} />
                ))}
            </FlexBox>
        </FlexBox>
    );
};

const InteractionTargetsList = ({event}) => {
    const container = {
        id: 'container1',
        glyph: 'dashboard',
        title: 'Widgets'
    };

    const children = [{
        id: 'chart1',
        title: 'US People',
        glyph: 'chart',
        children: [
            { glyph: 'bar', title: 'Families' },
            { glyph: '1-line', title: 'SUM(FAMILIES)' }
        ]
    },
    {
        id: 'chart2',
        title: 'US surface',
        children: [
            { glyph: 'bar', title: 'Profit Distribution' },
            { glyph: '1-line', title: 'Profit Distribution' }
        ]
    }, {
        title: "States Map Widget",
        id: 'chart3',
        glyph: 'dashboard',
        children: [
            {
                glyph: '1-map',
                title: 'States',

                children: [
                    { glyph: '1-layer', title: 'States of US'}
                ]
            }
        ]
    }];
    return (<FlexBox className="ms-interaction-target" component="li" gap="xs" key={container.id} column onPointerOver={() => {/* todo highlight*/}} >
        <FlexBox gap="xs" className="ms-connection-row">
            <Glyphicon glyph={container.glyph} />
            {container.title}

        </FlexBox>

        <FlexBox component="ul" column gap="xs">
            {children?.map((item) => <InteractionsRow key={item.id} item={item} event={event} />)}
        </FlexBox>
    </FlexBox>);
};


const InteractionEventsSelector = ({event, expanded, toggleExpanded = () => {}}) => {

    return (<FlexBox className="ms-interactions-container" component="ul" column gap="sm">
        <FlexBox component="li" gap="xs" column>
            <FlexBox className="ms-interactions-event"gap="sm" centerChildrenVertically >
                <Button
                    onClick={() => toggleExpanded()}
                    borderTransparent
                    style={{ padding: 0, background: 'transparent' }}>
                    {
                        expanded ? <Glyphicon glyph="chevron-down" /> : <Glyphicon glyph="chevron-right" />
                    }
                </Button>
                <Glyphicon glyph="filter" />
                <Text fontSize="md">{event.title}</Text>
            </FlexBox>
            {expanded && <FlexBox className="ms-interactions-targets" component="ul" column gap="sm" >
                <InteractionTargetsList event={event} />
            </FlexBox>}
        </FlexBox>
    </FlexBox>);
};

export default InteractionEventsSelector;
