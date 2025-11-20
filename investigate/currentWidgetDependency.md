# Widget Dependency Investigation

## Overview

MapStore widgets share state through a `dependenciesMap` plus a `mapSync` flag:

- `dependenciesMap` says “widget prop X mirrors dependency path Y” (e.g. `layer`, `filter`, `viewport`).
- `mapSync` toggles spatial propagation (viewport/center/zoom) and enables chained filter propagation.

Connecting widgets runs the `toggleConnection` → `configureDependency` flow (`web/client/epics/widgets.js`):

1. `toggleConnection` inspects `availableDependenciesSelector`.  
   - If only one match exists, it wires the connection immediately.  
   - If multiple candidates exist it opens the **dependency selector UI** (`toggleDependencySelector`, `DEPENDENCY_SELECTOR_KEY`) so the user explicitly picks the source widget/map.
2. `configureDependency` sets `mapSync` and updates `dependenciesMap` via `updateDependencyMap`, which expands mappings differently for tables (`layer`, `filter`, `quickFilters`, `options`), maps (`layers`, `groups`, `viewport`, `zoom`, `center`), and dimensions (`dimension.currentTime`, `dimension.offsetTime`).

After a connection is stored:

1. `alignDependenciesToWidgets` runs when dashboards load, widgets insert, or map config changes. It flattens every dependency source (map widgets, table widgets, the global map, timeline dimension) into a dictionary stored at `state.widgets.dependencies`.
2. `dependenciesSelector` resolves each dependency path into real data:  
   - `"map.*"` paths read directly from the viewer map state.  
   - Paths like `widgets[<id>].maps[<mapId>].layers` dereference other widgets.  
   - Global selectors (dimension, router, etc.) are read straight from Redux.
3. `dependenciesToWidget` (and sibling enhancers) remap those resolved values to the props each widget expects, recursively following transitive dependencies so quickFilters/filters/options propagate through chains of widgets.

### Runtime propagation helpers

- `convertDependenciesMappingForCompatibility` / `updateDependenciesMapOfMapList` keep dependency paths accurate when legacy dashboards load or when a map widget switches its active map.
- Reducer defaults (`web/client/reducers/widgets.js`) seed `viewport`, `center`, `zoom` to the viewer map so new widgets can connect immediately.
- When a widget is deleted, the reducer strips any other widget’s `dependenciesMap` that pointed to it, preventing orphaned connections.

## Dependency Flow Overview

Widgets opt into cross-widget orchestration by storing a `dependenciesMap` (which prop mirrors which dependency path) plus a `mapSync` flag (turns on spatial/temporal sync). `updateDependencyMap` rewrites mappings per target widget type and ensures `dependenciesMap` + `mapSync` entries exist when a connection is toggled.

```58:119:web/client/epics/widgets.js
const updateDependencyMap = (active, targetId, { dependenciesMap, mappings}) => {
    const tableDependencies = ["layer", "filter", "quickFilters", "options"];
    const mapDependencies = ["layers", "groups", "viewport", "zoom", "center"];
    ...
    return active
        ? { ...cleanDependenciesMap, ...overrides, ["dependenciesMap"]: `${depToTheWidget}.dependenciesMap`, ["mapSync"]: `${depToTheWidget}.mapSync`}
        : omit(cleanDependenciesMap, [Object.keys(mappings)]);
};
const configureDependency = (active, dependency, options) =>
    Rx.Observable.of(
        onEditorChange("mapSync", active),
        onEditorChange('dependenciesMap',
            updateDependencyMap(active, dependency, options)
        )
    );
```

Once connections exist, `alignDependenciesToWidgets` materializes all dependency keys—including the global map (`map`), widget-specific map instances, tables, and timeline dimension values—so downstream selectors can dereference them.

```133:169:web/client/epics/widgets.js
export const alignDependenciesToWidgets = (action$, { getState = () => { } } = {}) =>
    action$.ofType(MAP_CONFIG_LOADED, DASHBOARD_LOADED, INSERT)
        .map(() => availableDependenciesSelector(getState()))
        ...
        .map((maps = []) => loadDependencies(maps.reduce( (deps, m) => {
            const depToTheWidget = m.split(".maps")[0];
            const depToTheMap = m.replace(/.map$/, "");
            if (!endsWith(m, "map")) {
                return {
                    ...deps,
                    [`${m}.filter`]: `${m}.filter`,
                    [`${m}.quickFilters`]: `${m}.quickFilters`,
                    ...
                    [`dimension.currentTime`]: `dimension.currentTime`,
                    [`dimension.offsetTime`]: `dimension.offsetTime`
                };
            }
            return {
                ...deps,
                [`${depToTheWidget}.dependenciesMap`]: `${depToTheWidget}.dependenciesMap`,
                [`${depToTheWidget}.mapSync`]: `${depToTheWidget}.mapSync`,
                [m === "map" ? "viewport" : `${depToTheMap}.viewport`]: `${depToTheMap}.bbox`,
                [m === "map" ? "center" : `${depToTheMap}.center`]: `${depToTheMap}.center`,
                [m === "map" ? "zoom" : `${depToTheMap}.zoom`]: `${depToTheMap}.zoom`,
                [m === "map" ? "layers" : `${depToTheMap}.layers`]: m === "map" ? `layers.flat` : `${depToTheMap}.layers`,
                [m === "map" ? "groups" : `${depToTheMap}.groups`]: m === "map" ? `layers.groups` : `${depToTheMap}.groups`,
                [`dimension.currentTime`]: `dimension.currentTime`,
                [`dimension.offsetTime`]: `dimension.offsetTime`
            };
        }, {}))
        );
```

`availableDependenciesSelector` defines the list of connectable sources (map widgets per map instance, global map, compatible tables) so the connect flow can present valid options only.

```97:143:web/client/selectors/widgets.js
export const availableDependenciesSelector = createSelector(
    getMapWidgets,
    getTableWidgets,
    mapSelector,
    pathnameSelector,
    (ws = [], tableWidgets = [], map = [], pathname) => ({
        availableDependencies:
            flatten(ws
                .map(({id, maps = []}) => maps.map(({mapId} = {})=> `widgets[${id}].maps[${mapId}].map`)))
                .concat(castArray(map).map(() => "map"))
                .concat(castArray(tableWidgets).filter(() => pathname.indexOf("viewer") === -1).map(({id}) => `widgets[${id}]`))
    }));
```

The reducer owns `state.widgets.dependencies`, initializing it with default global map bindings and refreshing/clearing entries as dashboards load or users switch maps.

```48:95:web/client/reducers/widgets.js
const emptyState = {
    dependencies: {
        viewport: "map.bbox",
        center: "map.center",
        zoom: "map.zoom"
    },
    containers: { floating: { widgets: [] } },
    builder: { map: null, settings: { step: 0 } }
};
...
case LOAD_DEPENDENCIES:
    const {dependencies} = action;
    return set(`dependencies`, dependencies, state);
case RESET_DEPENDENCIES:
    return set('dependencies', emptyState.dependencies, state);
```

At render time, `dependenciesSelector` resolves each dependency path into live data (global map fragments, other widgets’ props, router state, etc.) so enhancers can consume plain values.

```181:196:web/client/selectors/widgets.js
export const dependenciesSelector = createShallowSelector(
    getDependenciesMap,
    getDependenciesKeys,
    state => getDependenciesKeys(state).map(k =>
        k.indexOf("map.") === 0
            ? get(mapSelector(state), k.slice(4))
            : k.match(WIDGETS_REGEX)
                ? getWidgetDependency(k, getFloatingWidgets(state), getMapWidgets(state))
                : get(state, k) ),
    (map, keys, values) => keys.reduce((acc, k, i) => ({
        ...acc,
        [Object.keys(map)[i]]: values[i]
    }), {})
);
```

Finally, `dependenciesToWidget` (and siblings) remap resolved values to the props the destination widget expects, walking dependency chains so quickFilters/filters cascade through multiple hops—this is the “dependency propagation” described in the mentor note.

```69:108:web/client/components/widgets/enhancers/dependenciesToWidget.js
export const buildDependencies = (map, deps, originalWidgetId, updatedDependencyMap = []) => {
    if (map) {
        const dependenciesGenerated = Object.keys(map).reduce((ret, k) => {
            if (k === "dependenciesMap" && deps[map[k]] && deps[map.mapSync] && deps[map[k]][k]
                && deps[map[k]][k].indexOf(originalWidgetId) === -1
                && updatedDependencyMap.every(dep => deps[map[k]][k] !== dep)
            ) {
                const _updatedDependencyMap = updatedDependencyMap.concat(deps[map[k]][k]);
                return {
                    ...ret,
                    ...pick(buildDependencies(deps[map[k]], deps, originalWidgetId, _updatedDependencyMap), ["options", "layer", "quickFilters", "filter", "dependenciesMap"])
                };
            }
            return {
                ...ret,
                [k]: deps[map[k]]
            };
        }, {});
        return dependenciesGenerated;
    }
    return deps;
};
```

## Widget Interactions

### Map Widget

- **Filter by extent / table filters**: `dependenciesToFilter` injects viewport + quickFilters + attribute filters into OGC filters when `mapSync` is true.
- **Multiple traces/layers**: the same enhancer iterates chart traces so every trace inherits propagated filters.
- **Map-to-map sync**: `dependenciesToMapProp('center'|'zoom')` copies center/zoom; `dependenciesToLayers` pushes CQL filters into synchronized map layers; `dependenciesToExtent` reacts to `dependencies.extentObj` and runs WPS `bounds` for quickFilters.
- **Map list**: `updateDependenciesMapOfMapList` rewrites dependency paths when a map widget switches its active map.

### Table Widget

- **Quick filters**: `tableWidget` enhancer debounces column filters into `quickFilters.<attribute>`.
- **Zoom interactions**: row actions either dispatch `zoomToExtent` (viewer) or store `dependencies.extentObj` so connected maps zoom themselves (dashboard).

### Chart / Counter Widgets

- Consume `dependenciesToFilter` + `dependenciesToOptions`; each trace receives propagated filters and viewparams from its source layer.

### Legend Widget

- Reads `layers`, `groups`, `viewport`, and `zoom` via dependencies and writes back visibility, opacity, expansion, and interactive legend filters to the connected map layers.

### Timeline / Dimension

- `alignDependenciesToWidgets` exposes `dimension.currentTime` and `dimension.offsetTime`.
- Charts use `dependenciesToShapes` to build timeline overlays whenever those values exist.

### Viewparams Handling

- `dependenciesToOptions` inspects dependency layers for `viewparams` (case-insensitive) and merges them into widget `options`, ensuring SQL view parameters follow the dependency chain. Multi-trace charts inherit the same logic trace-by-trace.

## Widget-Specific Interactions (Code References)

### Map widget (source & target)

- Spatial + attribute filters  
```40:91:web/client/components/widgets/enhancers/dependenciesToFilter.js
const createFilterProps = ({ mapSync, geomProp, dependencies = {}, filter: filterObj, layer, quickFilters, options } = {}) => {
    ...
    if (!mapSync) {
        return { filter: !isEmpty(newFilterObj) || layerFilter ? filter(and(...)) : undefined };
    }
    if (layer && dependencies && dependencies.quickFilters && dependencies.layer && (layer.name === dependencies.layer.name) ) {
        newFilterObj = {...newFilterObj, ...composeFilterObject(newFilterObj, dependencies.quickFilters, dependencies.options)};
    }
    ...
    if (dependencies.viewport) {
        const bounds = Object.keys(viewport.bounds).reduce((p, c) => ({...p, [c]: parseFloat(viewport.bounds[c])}), {});
        geom = getViewportGeometry(bounds, viewport.crs);
        ...
```
- Multi-trace propagation  
```116:127:web/client/components/widgets/enhancers/dependenciesToFilter.js
if (props.traces) {
    return {
        traces: props.traces.map((trace) => ({
            ...trace,
            ...createFilterProps({
                ...pick(props, TRACE_PROPS),
                ...trace
            })
        }))
    };
}
```
- Layer-level CQL propagation  
```20:74:web/client/components/widgets/enhancers/dependenciesToLayers.js
if (mapSync && !isEmpty(layerInCommon)) {
    ...
    if (!isEmpty(filterObjCollection) && toCQLFilter(filterObjCollection)) {
        cqlFilter = toCQLFilter(filterObjCollection);
        layersUpdatedWithCql = arrayUpdate(
            false,
            {
                ...layerInCommon,
                params: optionsToVendorParams({ params: {CQL_FILTER: cqlFilter}}, layerInCommon && layerInCommon.params && layerInCommon.params.CQL_FILTER)
            },
            {name: targetLayerName},
            map.layers
        );
        return {
            maps: arrayUpdate(false, {
                ...map,
                layers: layersUpdatedWithCql
            }, {mapId: selectedMapId},  maps)
        };
    }
}
```
- Center/zoom sync  
```16:28:web/client/components/widgets/enhancers/dependenciesToMapProp.js
export default (prop) => withPropsOnChange(
    ({ mapSync, dependencies = {}, selectedMapId } = {}, { mapSync: newMapSync, dependencies: newDependencies, selectedMapId: newSelectedMapId }) =>
        newDependencies && shallowEqual(dependencies[prop], newDependencies[prop])
            || mapSync === newMapSync
        || selectedMapId === newSelectedMapId,
    ({ maps = [], mapSync, dependencies = {}, selectedMapId }) => {
        const map = find(maps, {mapId: selectedMapId}) || {};
        const updatedMap = dependencies[prop] && mapSync ? set(prop, dependencies[prop], map) : map;
        return {
            mapStateSource: "__dependency_system__",
            maps: maps.map((m)=> m.mapId === updatedMap.mapId ? updatedMap : m),
            map: updatedMap
        };
    }
);
```
- Zoom-to-extent orchestration  
```30:134:web/client/components/widgets/enhancers/dependenciesToExtent.js
withPropsOnChange((props = {}, nextProps = {}) => {
    const currentExtentObj = props.widgets?.find(i=>i?.dependencies?.extentObj);
    const nextExtentObj = nextProps.widgets?.find(i=>i?.dependencies?.extentObj);
    return !(isEqual(currentExtentObj, nextExtentObj)) && nextExtentObj;
},
({ id, widgets, updateProperty, hookRegister })=>{
    const tblWidgetWithExtentObj = widgets?.find(i=>i?.dependencies?.extentObj);
    const extentObj = tblWidgetWithExtentObj?.dependencies?.extentObj;
    ...
    if (hook && hookRegister?.id === id && connectedMaps) {
        hook(extentObj.extent, { crs: extentObj.crs, maxZoom: extentObj.maxZoom });
        updateProperty(tblWidgetWithExtentObj.id, `dependencies.extentObj`, undefined);
    }
})
...
```
- Map list adjustments  
```443:469:web/client/utils/WidgetsUtils.js
export const updateDependenciesMapOfMapList = (allWidgets = [], widgetId, selectedMapId) => {
    ...
    if (isUpdateNeeded) {
        widgets = widgets.map(widget => {
            const dependenciesMap = widget.dependenciesMap;
            const modifiedWidgetId = !isEmpty(dependenciesMap) && (WIDGETS_REGEX.exec(Object.values(dependenciesMap)[0]) || [])[1];
            return {
                ...widget,
                ...(!isEmpty(dependenciesMap) && modifiedWidgetId === widgetId && {
                    dependenciesMap: Object.keys(dependenciesMap).reduce((dm, k) => {
                        const [,, mapIdToReplace] = WIDGETS_MAPS_REGEX.exec(dependenciesMap[k]) || [];
                        if (mapIdToReplace) {
                            return {
                                ...dm,
                                [k]: dependenciesMap[k].replace(mapIdToReplace, selectedMapId)
                            };
                        }
                        return {...dm, [k]: dependenciesMap[k]};
                    }, {})})
            };
        });
    }
    return widgets;
};
```

###	Table widget

- QuickFilters propagation  
```92:101:web/client/components/widgets/enhancers/tableWidget.js
withPropsOnChange(["gridEvents"], ({ gridEvents = {}, updateProperty = () => {}, id } = {}) => {
    const _debounceOnAddFilter = debounce((...args) => updateProperty(...args), 500);
    return {
        gridEvents: {
            ...gridEvents,
            onAddFilter: (widgetFilter) => _debounceOnAddFilter(id, `quickFilters.${widgetFilter.attribute}`, widgetFilter),
            ...
        }
    };
}),
```
- Zoom-to-feature  
```32:88:web/client/components/widgets/enhancers/tableWidget.js
const mapWidgetsConnectedWithTable = ownProps?.widgets?.filter(i => i.widgetType === 'map' && i?.dependenciesMap && i?.dependenciesMap?.mapSync?.includes(ownProps.id) && i.mapSync) || [];
...
gridTools: (isMapSync && isDashboardWidget) || (isMapViewerWidget) ? gridTools.map((t) => ({
    ...
    events: {
        onClick: async(p, opts, describe, {crs, maxZoom} = {}) => {
            ...
            if (isDashboardWidget) {
                ownProps?.updateProperty(ownProps.id, `dependencies.extentObj`, {
                    extent: p.bbox,
                    crs: crs || "EPSG:4326", maxZoom
                });
            } else {
                dispatch(zoomToExtent(p.bbox, crs || "EPSG:4326", maxZoom));
            }
```

### Chart / Counter widgets

- Viewparams + trace propagation  
```13:44:web/client/components/widgets/enhancers/dependenciesToOptions.js
const addViewParamsToOptions = ({ dependencies = {}, options, layer = {} }) => {
    const params = getDependencyLayerParams(layer, dependencies);
    const viewParamsKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "viewparams");
    const viewParams = params and viewParamsKey and params[viewParamsKey];
    return {
        options: viewParams ? {
            ...options,
            viewParams
        } : options
    };
};
export default compose(
    withPropsOnChange(
        ['dependencies', 'options', 'traces'],
        ({ traces, ...props } = {}) => {
            if (traces) {
                return {
                    traces: traces.map((trace) => ({
                        ...trace,
                        ...addViewParamsToOptions({ ...trace, dependencies: props.dependencies })
                    }))
                };
            }
            return addViewParamsToOptions(props);
        }
    )
);
```

### Legend widget

- Layer state sync + interactive filters  
```22:79:web/client/components/widgets/enhancers/legendWidget.js
withProps(({ dependencies = {}, dependenciesMap = {} }) => {
    const allLayers = dependencies[dependenciesMap.layers] || dependencies.layers || [];
    const groups = castArray(dependencies[dependenciesMap.groups] || dependencies.groups || []);
    let layers = allLayers
        .filter((layer = {}) =>
            layer.group !== 'background' && !getInactiveNode(layer?.group || DEFAULT_GROUP_ID, groups)
        )
        .map(({ group, ...layer }) => layer);
    layers = updateLayerWithLegendFilters(layers, dependencies);
    return {
        allLayers,
        map: {
            layers,
            groups: [],
            projection: dependencies.projection,
            bbox: dependencies.viewport
        },
        dependencyMapPath: dependenciesMap.layers || '',
        scales: getScales(...),
        currentZoomLvl: dependencies.zoom
    };
}),
withHandlers({
    updateProperty: ({ updateProperty, dependencyMapPath, allLayers = [] }) => (key, value) => {
        if (dependencyMapPath) {
            const [, widgetId, mapId] = WIDGETS_MAPS_REGEX.exec(dependencyMapPath) || [];
            if (mapId && key === 'map') {
                const updatedLayers = value?.layers || [];
                const newLayers = allLayers.map(layer => {
                    const updateLayer = updatedLayers.find(l => l.id === layer.id);
                    if (updateLayer) {
                        return {
                            ...layer,
                            visibility: updateLayer.visibility,
                            opacity: updateLayer.opacity,
                            expanded: updateLayer.expanded,
                            layerFilter: updateLayer.layerFilter
                        };
                    }
                    return layer;
                });
                updateProperty(widgetId, "maps", { mapId, layers: newLayers }, 'merge');
            }
        }
    }
})
```

### Global Map & Timeline Sources

- Timeline overlays  
```11:40:web/client/components/widgets/enhancers/dependenciesToShapes.js
const getShapesFromDependencies = ({ dependencies = {}, xAxisOpts, yAxisOpts, layout = {} }) => {
    const resolvedTimeRange = {
        start: dependencies["dimension.currentTime"],
        end: dependencies["dimension.offsetTime"]
    };
    if (!resolvedTimeRange || (!resolvedTimeRange.start && !resolvedTimeRange.end)) {
        return { layout };
    }
    const currentTimeShapes = addCurrentTimeShapes({ xAxisOpts, yAxisOpts }, resolvedTimeRange);
    if (!currentTimeShapes || currentTimeShapes length === 0) {
        return { layout };
    }
    return {
        layout: {
            ...layout,
            shapes: [...(layout?.shapes || []), ...currentTimeShapes]
        }
    };
};
```

## Mentor Scenario Coverage

The mentor brief listed the following behaviors; each is satisfied by the mechanisms above:

- **Map widget**
  - *Filter other widgets by extent* – `dependenciesToFilter` builds spatial filters from `dependencies.viewport` when the target exposes a geometry.  
  - *Filter table/chart/counter by quickFilters* – table-originated quickFilters propagate through `dependenciesMap` and are merged into every downstream widget’s filter.  
  - *Multiple charts/layers* – each chart trace runs through the same enhancer pipeline, so every trace receives spatial + attribute filters.  
  - *Pass layers/groups to legend* – map widgets expose `layers`, `groups`, `viewport`, `zoom`, `center` through dependencies so legend widgets can mirror and edit them.  
  - *Control center/zoom of another map* – `dependenciesToMapProp('center'|'zoom')` copies those props between connected map widgets.

- **Table widget**
  - *Apply quickFilters to other widgets* – `tableWidget` debounces column filters into `quickFilters.<attribute>`, which `dependenciesToFilter` and `dependenciesToLayers` consume.  
  - *Filter the same layer on the map* – when a connected map shares the same layer name, map widgets inject table filters/CQL via `dependenciesToLayers`.  
  - *Filter chart traces* – chart traces share the same propagation path as counters/tables, so table quickFilters and attribute filters reach each trace.  
  - *Zoom to extent / single feature* – clicking a row either dispatches `zoomToExtent` (viewer) or stores `dependencies.extentObj`, which `dependenciesToExtent` detects and applies to connected map widgets.

- **Legend widget**
  - *Update visibility/opacity/expanded* – handler inside `legendWidget` writes back to the source map’s layers via `updateProperty`.  
  - *Interactive legend filters* – `updateLayerWithLegendFilters` merges legend-driven attribute filters back into the layers so they propagate to other widgets.  
  - *Dependency propagation* – because the legend reads from `dependenciesMap`, it stays synced even across transitive chains.  
  - *mapSync flag awareness* – legends inherit `mapSync` state from the connected map widget, preventing accidental desync.

- **Additional requirements**
  - *Dependency propagation* – handled centrally by `dependenciesToWidget` recursion and reducer cleanup.  
  - *mapSync flag* – toggled automatically during connection; cascades through dependency chains to signal whether spatial logic should execute.  
  - *Viewparams management* – `dependenciesToOptions` ensures SQL view parameters propagate.  
  - *Global Map as source / Global Map layers as target* – `alignDependenciesToWidgets` always publishes the viewer map as `"map"` with `layers.flat`, `layers.groups`, `viewport`, `center`, `zoom`.  
  - *Timeline as source* – `dimension.currentTime` / `dimension.offsetTime` feed `dependenciesToShapes`, letting timeline ranges drive chart decorations.

## Flow Diagram

```mermaid
flowchart LR
    A[User connects widgets<br/>(toggleConnection)] --> B[configureDependency<br/>sets mapSync + dependenciesMap]
    B --> C[alignDependenciesToWidgets<br/>loadDependencies]
    C --> D[state.widgets.dependencies<br/>(paths)]
    D --> E[dependenciesSelector<br/>resolves live values]
    E --> F[dependenciesToWidget<br/>propagates chains]
    F --> G{Widget enhancers}
    G -->|filters/options| H[dependenciesToFilter<br/>dependenciesToOptions]
    G -->|map props/layers| I[dependenciesToLayers<br/>dependenciesToMapProp<br/>dependenciesToExtent]
    G -->|legend/time| J[legendWidget<br/>dependenciesToShapes]
    H & I & J --> K[Target widget props updated<br/>(map/table/chart/counter/legend)]
```

## Key Files

- `web/client/epics/widgets.js` – connection flow, dependency alignment.
- `web/client/utils/WidgetsUtils.js` – helpers (`updateDependenciesMapOfMapList`, `convertDependenciesMappingForCompatibility`, `buildDependencies` support code).
- `web/client/selectors/widgets.js` – `availableDependenciesSelector`, `dependenciesSelector`.
- `web/client/components/widgets/enhancers/...` – the enhancers that consume dependencies:
  - `dependenciesToWidget`, `dependenciesToFilter`, `dependenciesToOptions`
  - `dependenciesToLayers`, `dependenciesToMapProp`, `dependenciesToExtent`, `dependenciesToShapes`
  - `legendWidget`, `tableWidget`

## Key Takeaways & Next Steps

- Dependency wiring is declarative: once `dependenciesMap` references another widget/global map/timeline, enhancers propagate filters, viewparams, layers, and map state; `mapSync` determines whether spatial logic should run.
- Map widgets act as both sources (viewport, layers, groups) and targets (accepting quickFilters/CQL), enabling all mentor scenarios (extent filtering, legend sync, multi-map sync).
- Tables are the primary attribute filter source, debouncing column filters into `quickFilters` and emitting per-row extents that maps consume through `dependenciesToExtent`.
- Legends can both read and mutate map layer state, keeping layer visibility/opacity/filter state in sync.
- Timeline values feed directly into chart enhancer overlays, letting the global timeline control chart decorations.

**Next steps**

- To inspect runtime connections, log `state.widgets.containers.floating.widgets[].dependenciesMap` while toggling connectors; it shows exactly which props map to which dependency paths.
- For onboarding docs, consider exporting the Mermaid diagram and adding a matrix of supported mappings (viewport, filters, layers, center, zoom, dimension times) so newcomers can trace each mapping end-to-end.
