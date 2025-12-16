/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Convert filter selections to filterObj format (mapstore format).
 * This is a template/simple implementation - can be enhanced later.
 * 
 * @param {object} filterData - Filter data object with layer, valueAttribute, etc.
 * @param {array} selections - Array of selected item IDs/values
 * @returns {object} Filter object in mapstore format
 */
export const selectionsToFilterObj = (filterData, selections = []) => {
    if (!filterData || !filterData.data || selections.length === 0) {
        // Return empty filterObj structure
        return {
            format: 'mapstore',
            version: '1.0.0',
            filters: []
        };
    }

    const { data } = filterData;
    const { layer, valueAttribute, filterComposition = 'OR' } = data;

    if (!layer || !valueAttribute) {
        return {
            format: 'mapstore',
            version: '1.0.0',
            filters: []
        };
    }

    // Create filter parts for each selected value
    // This is a simplified template - actual implementation would use filterBuilder
    const filterParts = selections.map(selectedValue => {
        // Template: Create a simple attribute filter
        // Format: { attribute: valueAttribute, operator: '=', value: selectedValue }
        return {
            format: 'ogc',
            filterFields: {
                [valueAttribute]: {
                    operator: '=',
                    value: selectedValue
                }
            }
        };
    });

    // Combine filters based on filterComposition (AND/OR)
    // For now, return a simple structure
    // TODO: Use proper filterBuilder to create OGC/CQL filters
    return {
        format: 'mapstore',
        version: '1.0.0',
        filters: filterParts,
        groupFields: filterComposition === 'AND' ? [] : undefined,
        // Store metadata for reference
        _metadata: {
            layerName: layer.name,
            layerId: layer.id,
            valueAttribute,
            selectedCount: selections.length,
            filterComposition
        }
    };
};

