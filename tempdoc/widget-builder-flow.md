# Widget Builder Flow and State Management

## Chart Widget Builder Flow

### 1. Select Chart Type Widget
- **Component**: `WidgetTypeSelector` (`web/client/components/widgets/builder/WidgetTypeSelector.jsx`)
- **Entry Point**: `WidgetTypeBuilder` (`web/client/plugins/widgetbuilder/WidgetTypeBuilder.jsx`)
- **Action**: `onEditorChange("widgetType", "chart")` → dispatches `EDITOR_CHANGE` action
- **State Location**: `widgets.builder.editor.widgetType = "chart"` (Redux store)

### 2. Select Layer (if not already selected)
- **Component**: `ChartLayerSelector` (`web/client/plugins/widgetbuilder/ChartLayerSelector.jsx`)
- **Condition**: Shown if `!layer || showLayers` (from `ChartBuilder.jsx` line 106-109)
- **Process**:
  - User selects layer from catalog
  - Layer validation via `canGenerateCharts(layer)`
  - On proceed: `onLayerChoice(key, value)` updates editor data
- **State Location**: `widgets.builder.editor.layer` or `widgets.builder.editor.charts[].traces[].layer`

### 3. Configure Chart Options (Step 0)
- **Component**: `ChartWizard` → `ChartOptions` step (`web/client/components/widgets/builder/wizard/ChartWizard.jsx`)
- **Sub-components**:
  - `ChartTraceEditSelector` - Select/add traces
  - `ChartOptionsComp` (WPSWidgetOptions) - Configure trace data (x-axis, y-axis, aggregation)
  - `ChartStyleEditor` - Style options
  - `TraceAxesOptions` - Axis configuration
  - `ChartValueFormatting` - Value formatting
  - `TraceLegendOptions` - Legend options
  - `NullManagement` - Null value handling
- **Preview**: Live chart preview with `PreviewChart` or `SampleChart`
- **State Updates**: `onChange` dispatches `EDITOR_CHANGE` with paths like:
  - `charts[chartId].traces[traceId].type`
  - `charts[chartId].traces[traceId].options.propertyName`
  - `charts[chartId].traces[traceId].options.aggregationFunction`
- **Validation**: `isChartOptionsValid(trace.options)` checked per trace

### 4. Configure Widget Options (Step 1)
- **Component**: `ChartWizard` → `WidgetOptions` step
- **Sub-component**: `ChartWidgetOptions` - Widget-level settings (title, description, etc.)
- **State Location**: `widgets.builder.editor.title`, `widgets.builder.editor.description`, etc.

### 5. Finish & Insert Widget
- **Action**: Click Save button in `Toolbar` (`web/client/components/widgets/builder/wizard/chart/Toolbar.jsx`)
- **Handler**: `onFinish()` from `wizardStateToProps` (`web/client/plugins/widgetbuilder/commons.js` line 34-38)
- **Action Dispatched**: `insertWidget(widget, target)` → `INSERT` action
- **Reducer**: `widgetsReducer` handles `INSERT` (`web/client/reducers/widgets.js` line 108-131)
- **Result**: Widget added to `widgets.containers[target].widgets[]` with generated ID

## State Management

### Redux Store Structure

```javascript
{
  widgets: {
    builder: {
      editor: {           // Current widget being edited
        widgetType: "chart",
        charts: [...],    // Chart configurations
        selectedChartId: "...",
        selectedTraceId: "...",
        layer: {...},     // Or in charts[].traces[].layer
        dependenciesMap: {...},
        title: "...",
        // ... other widget properties
      },
      settings: {
        step: 0,          // Current wizard step (0 or 1)
        valid: true       // Whether current step is valid
      }
    },
    containers: {
      floating: {
        widgets: [...]    // All created widgets
      }
    },
    dependencies: {...}   // Widget dependencies
  }
}
```

### Key Selectors

Located in `web/client/selectors/widgets.js`:

- **`getEditingWidget`** - Gets `widgets.builder.editor`
- **`getEditorSettings`** - Gets `widgets.builder.settings`
- **`getWidgetLayer`** - Gets layer from editor (handles charts/traces structure)
- **`wizardSelector`** - Combines editor data, settings, layer, widgets for wizard components

### Key Actions

Located in `web/client/actions/widgets.js`:

- **`EDITOR_CHANGE`** - Updates editor data (handled by `editorChange` utility in `WidgetsUtils.js`)
- **`EDITOR_SETTING_CHANGE`** - Updates builder settings (step, valid)
- **`INSERT`** - Inserts widget into containers
- **`setPage`** - Changes wizard step

### State Flow

1. **Type Selection** → `EDITOR_CHANGE("widgetType", "chart")`
2. **Layer Selection** → `EDITOR_CHANGE("layer", layer)` or `EDITOR_CHANGE("charts[...].traces[...].layer", layer)`
3. **Chart Configuration** → Multiple `EDITOR_CHANGE` calls with nested paths
4. **Step Navigation** → `EDITOR_SETTING_CHANGE("step", stepNumber)`
5. **Validation** → `EDITOR_SETTING_CHANGE("valid", boolean)`
6. **Finish** → `INSERT` action creates widget in containers

## Component Hierarchy

```
WidgetsBuilder (Plugin)
  └── WidgetTypeBuilder
      ├── WidgetTypeSelector (if no widgetType selected)
      └── ChartBuilder (if widgetType === "chart")
          ├── ChartLayerSelector (if no layer selected)
          └── ChartWizard
              ├── ChartOptions (Step 0)
              │   ├── ChartTraceEditSelector
              │   ├── ChartOptionsComp (WPSWidgetOptions)
              │   ├── ChartStyleEditor
              │   ├── TraceAxesOptions
              │   ├── ChartValueFormatting
              │   ├── TraceLegendOptions
              │   └── NullManagement
              └── WidgetOptions (Step 1)
                  └── ChartWidgetOptions
```

## Key Files

### Components
- `web/client/plugins/widgetbuilder/WidgetTypeBuilder.jsx` - Main builder router
- `web/client/plugins/widgetbuilder/ChartBuilder.jsx` - Chart builder container
- `web/client/components/widgets/builder/WidgetTypeSelector.jsx` - Widget type selection UI
- `web/client/components/widgets/builder/wizard/ChartWizard.jsx` - Chart wizard steps
- `web/client/plugins/widgetbuilder/ChartLayerSelector.jsx` - Layer selection UI

### State Management
- `web/client/reducers/widgets.js` - Widget reducer (handles all widget state)
- `web/client/actions/widgets.js` - Widget actions
- `web/client/selectors/widgets.js` - Widget selectors
- `web/client/plugins/widgetbuilder/commons.js` - Common selectors and utilities for builders
- `web/client/utils/WidgetsUtils.js` - Widget utility functions (including `editorChange`)

### Enhancers
- `web/client/plugins/widgetbuilder/enhancers/chartLayerSelector.js` - Layer selector enhancer
- `web/client/components/widgets/enhancers/builderConfiguration.js` - Builder configuration enhancer

## Notes

- State is centralized in Redux store
- Components read state via selectors and update via actions
- The wizard uses a 2-step process (Chart Options → Widget Options)
- Layer selection can happen at different points depending on context (dashboard vs map)
- Multi-chart support: charts can have multiple traces, each with its own layer
- Validation happens at each step to enable/disable navigation buttons

