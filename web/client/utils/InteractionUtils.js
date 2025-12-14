
export const DATATYPES = {
    BBOX_COORDINATES: 'BBOX_COORDINATES',
    LAYER_FILTER: 'LAYER_FILTER',
    POINT: 'POINT',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    STRING_ARRAY: 'STRING_ARRAY',
    OBJECT_ARRAY: 'OBJECT_ARRAY',
    FEATURE: 'FEATURE',
    FEATURE_ARRAY: 'FEATURE_ARRAY'
    // Future datatypes: DATE, DATETIME
};

export const EVENTS = {
    // Map events
    VIEWPORT_CHANGE: 'viewportChange',
    CENTER_CHANGE: 'centerChange',
    ZOOM_CHANGE: 'zoomChange',
    FEATURE_CLICK: 'featureClick',
    // Chart events (future)
    TRACE_CLICK: 'traceClick',
    // Table events
    LAYER_FILTER_CHANGE: 'layerFilterChange',
    ZOOM_CLICK: 'zoomClick',
    // Legend events
    VISIBILITY_TOGGLE: 'visibilityToggle',
    // DynamicFilter events
    SELECTION_CHANGE: 'selectionChange'
};

export const TARGET_TYPES = {
    ZOOM_TO_VIEWPORT: 'zoomToViewport',
    VIEWPORT_FILTER: 'viewportFilter',
    APPLY_FILTER: 'applyFilter',
    CHANGE_CENTER: 'changeCenter',
    CHANGE_ZOOM: 'changeZoom',
    FILTER_BY_VIEWPORT: 'filterByViewport'
};

export const getDirectlyPluggableTargets = (item, event) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        JSON.stringify(t.constraints) === JSON.stringify(event?.constraints)
    );
};
export const getConfigurableTargets = (item, event) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        JSON.stringify(t.constraints) !== JSON.stringify(event?.constraints)
        // TODO: check compatibility by transformation rules
    );
};

export const isConfigurationValidForTarget = (configuration, target, event) => {
    return false; // TODO: implement configuration validation rules
};

export const getConfiguredTargets = (item, event, configuration) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        isConfigurationValidForTarget(configuration, t, event)
    );
};
export function generateLayerMetadataTree(layer) {
    return {
        type: "element",
        name: layer.id,
        title: layer.title ?? layer.name ?? layer.id, // NOTE: title can be localized
        icon: '1-layer',
        interactionMetadata: {
            targets: [{
                targetType: TARGET_TYPES.APPLY_FILTER,
                expectedDataType: DATATYPES.LAYER_FILTER,
                attributeName: "layerFilter.filters",
                constraints: {
                    layer: {
                        name: layer.name,
                        id: layer.id
                    }
                },
                mode: "upsert"
            },
            // TODO: if it has geometry, we can add a target BBOX_COORDINATES for filtering by extent
            {
                targetType: TARGET_TYPES.FILTER_BY_VIEWPORT,
                expectedDataType: DATATYPES.BBOX_COORDINATES,
                attributeName: 'layerFilter.filters',
                mode: 'upsert'
            }
            ]
        }
    };
}
/**
 * Returns true if the layer supports interactions
 * @param {object} layer the layer
 * @returns {boolean}
 */
export function isInteractionSupported(layer) {
    return ['wms', 'wfs'].includes(layer?.type);
}

/**
 * Returns the layers metadata tree array.
 * @param {object[]} layers array of layers
 * @returns {object[]}
 */
export function generateLayersMetadataTree(layers) {
    return layers.filter(isInteractionSupported).map(generateLayerMetadataTree);
}

/**
 * Generates the map metadata tree.
 * @param {object} mapState the state of the map
 * @param {object[]} layers the list of layers
 * @returns {object}
 */
export function generateMapMetadataTree(mapState, layers) {
    return {
        type: "element",
        name: "map",
        children: [/*
            // TO DO: enable map interactions{
            type: "element",
            name: "viewport"
            interactionMetadata: {
                events: [
                    { eventType: "viewportChange", dataType: "BBOX_COORDINATES"},

                ],
                "targets": [
                    {
                        targetType: "zoomToViewport",
                        attributeName: "viewport",
                        expectedDataType: "BBOX_COORDINATES",
                        mode: "update"
                    },
                    {
                        attributeName: "center",
                        expectedDataType: "POINT",
                        mode: "update"
                    },
                    {
                        attributeName: "zoom",
                        expectedDataType: "MU",
                        mode: "update"
                    }
                ]
            },
            MORE for
                { eventType: "centerChange", dataType: "POINT"},
                { eventType: "zoomChange", dataType: "NUMBER"}

        }, */
            {
                type: "collection",
                name: "layers",
                children: generateLayersMetadataTree(layers)
            }

        ]
    };
}

export function generateWidgetMetadataTree(widget) {
    switch (widget?.widgetType) {
    case "map":
        return {
            type: "element",
            name: widget.id,
            title: widget.title || widget.id,
            icon: 'map',
            children: [{
                type: "collection",
                name: "maps",
                children: [] // TO DO: add map layers metadata tree
            }]
        };
    case "chart":
        return {
            type: "element",
            name: widget.id,
            collection: 'charts',
            title: widget.title || widget.id,
            icon: 'chart',
            children: []
        };
    default:
        return {
            type: "element",
            name: widget.id,
            title: widget.title || widget.id,
            icon: 'widget',
            children: []
        };
    }
}
export function isInteractionSupportedWidget(widget) {
    return (widget?.widgetType === "map" || widget?.widgetType === "table");
}

export function generateWidgetsMetadataTree(widgets) {
    const collection = {
        type: 'collection',
        name: 'widgets',
        icon: 'dashboard',
        children: widgets.filter(isInteractionSupportedWidget).map( w => generateWidgetMetadataTree(w))
    };
    return collection;
}

export function generateInteractionMetadataTree(plugins, widgets, mapState, layers) {
    console.log(plugins, widgets, mapState, layers, "plugins1");

    const tree = {
        type: "element",
        name: "root",
        children: []
    };

    // if (plugins.includes("Map")) {
    tree.children.push(generateMapMetadataTree(mapState, layers));
    // }

    // if (plugins.includes("Widgets")) {
    //     tree.children.push(generateWidgetsMetadataTree(widgets));
    // }
    return tree;
}

/**
 * This utility generates a sub-tree for the interaction metadata for the given events and targets,
 * filtering by the supported data types.
 * @param {object} tree the metadata tree
 * @param {array} events the events that should be used to filter the interaction metadata tree by supported data types in targets
 * @returns {object} the interaction metadata sub-tree
 */
export function generateInteractionMetadataSubTree(tree, events = []) {
    const supportedDataTypes = events?.map(e => e.dataType) || [];
    const interactionMetadata = tree?.interactionMetadata;
    if (!interactionMetadata) return null;
    const filteredTargets = (interactionMetadata?.targets || []).filter( t => supportedDataTypes.includes(t.expectedDataType));
    if (filteredTargets.length === 0) return null;
    return {
        ...interactionMetadata,
        targets: filteredTargets
    };
}

/**
 * Creates a base element tree node structure.
 * @param {object} item the item object (widget, trace, etc.)
 * @param {string} icon the icon identifier
 * @param {array} children the children array
 * @returns {object} the base element tree node
 */
function createBaseElementNode(item, icon, children = []) {
    return {
        type: "element",
        id: item?.id,
        title: item?.title || item?.id,
        icon,
        children
    };
}

/**
 * Maps trace type to icon name.
 * @param {string} traceType the trace type (bar, pie, line)
 * @returns {string} the icon name
 */
function getTraceIcon(traceType) {
    if (traceType === 'bar') return 'bar-chart';
    if (traceType === 'pie') return 'pie-chart';
    if (traceType === 'line') return 'line-chart';
    return 'bar-chart'; // default
}

/**
 * Generates a tree node for a chart trace element.
 * @param {object} trace the chart trace object
 * @returns {object} the chart trace metadata tree node
 */
export function generateChartTraceTreeNode(trace) {
    const traceIcon = getTraceIcon(trace?.type);
    const baseNode = createBaseElementNode(trace, traceIcon);
    return {
        ...baseNode,
        interactionMetadata: {
            events: [
                // Future events - to be implemented
                // {
                //     eventType: EVENTS.TRACE_CLICK,
                //     dataType: DATATYPES.FEATURE
                // },
                // {
                //     eventType: EVENTS.LAYER_FILTER_CHANGE,
                //     dataType: DATATYPES.LAYER_FILTER
                // }
            ],
            targets: [
                {
                    targetType: TARGET_TYPES.APPLY_FILTER,
                    expectedDataType: DATATYPES.LAYER_FILTER,
                    targetProperty: "dependencies.filters",
                    constraints: {
                        layer: { name: trace?.layer?.name || "" }
                    },
                    mode: "upsert"
                },
                {
                    targetType: TARGET_TYPES.FILTER_BY_VIEWPORT,
                    targetProperty: "dependencies.viewports",
                    expectedDataType: DATATYPES.BBOX_COORDINATES,
                    mode: "upsert"
                }
            ]
        }
    };
}

/**
 * Generates a tree node for a chart element.
 * @param {object} chart the chart object
 * @param {string} widgetTitle the widget title to use for the chart
 * @returns {object} the chart element metadata tree node
 */
function generateChartElementNode(chart, widgetTitle) {
    return {
        type: "element",
        id: chart?.chartId || chart?.id,
        title: widgetTitle,
        children: [{
            type: "collection",
            name: "traces",
            interactionMetadata: {},
            children: (chart?.traces || []).map(generateChartTraceTreeNode)
        }]
    };
}

/**
 * Generates a tree node for a chart widget element.
 * @param {object} widget the chart widget object
 * @returns {object} the chart widget metadata tree node
 */
export function generateChartWidgetTreeNode(widget) {
    const charts = widget?.charts || [];

    return {
        type: "element",
        id: widget?.id,
        children: charts.map(chart => generateChartElementNode(chart, widget?.title || widget?.id))
    };
}

/**
 * Generates a tree node for a table widget element.
 * @param {object} widget the table widget object
 * @returns {object} the table widget metadata tree node
 */
export function generateTableWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'table');
    return {
        ...baseNode,
        interactionMetadata: {
            events: [
                {
                    eventType: EVENTS.LAYER_FILTER_CHANGE,
                    dataType: DATATYPES.LAYER_FILTER
                },
                {
                    eventType: EVENTS.ZOOM_CLICK,
                    dataType: DATATYPES.FEATURE
                }
            ]
        }
    };
}

/**
 * Generates a tree node for a counter widget element.
 * @param {object} widget the counter widget object
 * @returns {object} the counter widget metadata tree node
 */
export function generateCounterWidgetTreeNode(widget) {
    return createBaseElementNode(widget, 'counter');
}

/**
 * Generates a tree node for a map widget element.
 * @param {object} widget the map widget object
 * @returns {object} the map widget metadata tree node
 */
export function generateMapWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'map');
    return {
        ...baseNode,
        interactionMetadata: {
            events: [
                {
                    eventType: EVENTS.VIEWPORT_CHANGE,
                    dataType: DATATYPES.BBOX_COORDINATES
                },
                {
                    eventType: EVENTS.CENTER_CHANGE,
                    dataType: DATATYPES.POINT
                },
                {
                    eventType: EVENTS.ZOOM_CHANGE,
                    dataType: DATATYPES.NUMBER
                },
                {
                    eventType: EVENTS.FEATURE_CLICK,
                    dataType: DATATYPES.FEATURE
                }
            ]
        }
    };
}

/**
 * Generates a tree node for a dynamic filter widget element.
 * @param {object} widget the dynamic filter widget object
 * @returns {object} the dynamic filter widget metadata tree node
 */
export function generateDynamicFilterWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'filter');
    return {
        ...baseNode,
        interactionMetadata: {
            events: [
                {
                    eventType: EVENTS.SELECTION_CHANGE,
                    dataType: DATATYPES.FEATURE_ARRAY
                    // Note: selectionChange can emit FEATURE_ARRAY, FEATURE, STRING_ARRAY, or STRING
                    // depending on filter type. Using FEATURE_ARRAY as default, can be extended later.
                }
            ]
        }
    };
}

/**
 * Generates a tree node for a generic widget element.
 * Dispatches to the appropriate widget-specific function based on widget type.
 * @param {object} widget the widget object
 * @returns {object} the widget metadata tree node
 */
export function generateWidgetTreeNode(widget) {
    switch (widget?.widgetType) {
    case "chart":
        return generateChartWidgetTreeNode(widget);
    case "table":
        return generateTableWidgetTreeNode(widget);
    case "counter":
        return generateCounterWidgetTreeNode(widget);
    case "map":
        return generateMapWidgetTreeNode(widget);
    case "filter":
        return generateDynamicFilterWidgetTreeNode(widget);
    default:
        return createBaseElementNode(widget, 'widget');
    }
}

/**
 * Generates a root tree node containing all widget tree nodes.
 * @param {array} widgets array of widget objects
 * @returns {object} the root tree node with widgets collection as child TODO: CONSIDER FOR MAP also
 */
export function generateRootTree(widgets) {
    const widgetsArray = widgets || [];
    const widgetNodes = widgetsArray
        .filter(widget => widget !== null && widget !== undefined)
        .map(widget => generateWidgetTreeNode(widget));

    return {
        type: "element",
        name: "root",
        children: [{
            type: "collection",
            name: "widgets",
            children: widgetNodes
        }]
    };
}
