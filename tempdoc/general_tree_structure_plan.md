# General Tree Structure and Definitions --- Plan

## Purpose

Define a standardized hierarchical structure (metadata tree) used to
describe all interactive elements inside MapStore widgets, maps, charts,
tables, and nested components.

This structure is the foundation for: - Event emission & propagation\
- UI wiring configuration\
- Compatible target detection\
- Node path generation\
- Future extension of widgets/tools

------------------------------------------------------------------------

## 1. Node Types

### **1.1 Element**

Represents an actual interactive unit.

Characteristics: - Identified by `name` **or** `id` - Can contain
children (elements or collections) - Can define `interactionMetadata` -
Examples: widget, map instance, layer, chart, trace

### **1.2 Collection**

Represents a list/array of nodes.

Characteristics: - Contains multiple elements, each identified by
**id** - Cannot have interaction metadata directly - Examples:
widgets\[\], layers\[\], charts\[\], traces\[\]

------------------------------------------------------------------------

## 2. Path Definition Rules

Each node has a navigable internal path used for wiring and routing.

Examples:

    widgets['w-id-1']
    widgets['w-id-1'].charts['chart-id-1']
    widgets['w-id-1'].charts['chart-id-1'].traces['trace-id']
    widgets['w-id-1'].maps['map-id-1']
    map.layers['layer-1']

Rules: - Node referenced by **name** (elements) or **id** (collection
elements) - Names and IDs are not mixed at the same level - Paths
resemble JS dot/bracket notation but resolved by a custom resolver

------------------------------------------------------------------------

## 3. Structural Representation

### **Widgets**

    widgets (collection)
      └── widgets['w-id'] (element)

### **Charts inside widgets**

    widgets['w-id'].charts (collection)
      └── charts['chart-id'] (element)
            └── traces (collection)
                 └── traces['trace-id'] (element)

### **Maps inside widgets**

    widgets['w-wid'].maps (collection)
      └── maps['map-id'] (element)
            └── layers (collection)
                 └── layers['layer-id'] (element)

### **Main Map (standalone map mode)**

    map (element)
      └── layers (collection)

------------------------------------------------------------------------

## 4. Node Properties

### **4.1 Identification**

-   `id`: identifier inside a collection\
-   `name`: identifier for element nodes\
-   `title`: UI label\
-   `icon`: optional visual marker

### **4.2 Structural**

-   `children[]`: nested elements or collections

### **4.3 Interaction Metadata (elements only)**

#### Events (sources)

-   `eventType`
-   `dataType`
-   Optional: event-specific metadata (layer name, attribute, etc.)

#### Targets (receivers)

-   `targetType` (e.g., applyFilter, zoomToViewport)
-   `expectedDataType`
-   `targetProperty`
-   `mode`: update / upsert / replace
-   Optional: constraints (layer match, etc.)

------------------------------------------------------------------------

## 5. Purpose of This Model

The tree allows MapStore to: - Generate wiring UI automatically\
- Validate event → target compatibility\
- Support arbitrarily nested widget structures\
- Cleanly separate UI from behavior\
- Move from pull-based dependencies to event-driven push communication\
- Provide pluggable extension mechanisms

This abstraction makes the system future-proof and easier to extend with
new widget types, dynamic filters, timelines, and other interactive
components.
