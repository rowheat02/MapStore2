/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const createEmptyFilterData = () => ({
    title: '',
    layer: null,
    dataSource: 'features',
    valuesFrom: 'grouped',
    valueAttribute: undefined,
    labelAttribute: undefined,
    sortBy: undefined,
    maxFeatures: 20,
    filterComposition: 'AND',
    userDefinedItems: []
});

const generateSelectionsPreview = (config = {}) => {
    const { selectionMode = 'multiple', items = [] } = config;
    if (selectionMode === 'single') {
        return items[0]?.id ? [items[0].id] : [];
    }
    return items.slice(0, 2).map(item => item.id);
};

export const initialFilters = [
    {
        id: 'chips-multi',
        variant: 'chips',
        label: 'Regions (multi-select)',
        name: 'Regions (multi-select)',
        icon: 'flag',
        selectionMode: 'multiple',
        layout: {
            direction: 'horizontal',
            maxHeight: 80,
            selectedColor: '#0d99ff'
        },
        items: [
            { id: 'north', label: 'North' },
            { id: 'south', label: 'South' },
            { id: 'east', label: 'East' },
            { id: 'west', label: 'West' },
            { id: 'central', label: 'Central' },
            { id: 'coastal', label: 'Coastal' },
            { id: 'islands', label: 'Islands' },
            { id: 'metro', label: 'Metro' }
        ],
        data: {
            title: 'Regions (multi-select)',
            layer: null,
            dataSource: 'features',
            valuesFrom: 'grouped',
            valueAttribute: 'region',
            sortBy: 'alphabetical',
            filterComposition: 'AND',
            userDefinedItems: []
        }
    },
    {
        id: 'chips-single',
        variant: 'chips',
        label: 'Category (single-select)',
        name: 'Category (single-select)',
        icon: 'tag',
        selectionMode: 'single',
        layout: {
            direction: 'vertical',
            selectedColor: '#f18f01'
        },
        items: [
            { id: 'environment', label: 'Environment' },
            { id: 'transport', label: 'Transport' },
            { id: 'utilities', label: 'Utilities' },
            { id: 'education', label: 'Education' },
            { id: 'health', label: 'Health' },
            { id: 'finance', label: 'Finance' },
            { id: 'recreation', label: 'Recreation' },
            { id: 'other-cat', label: 'Other' }
        ],
        data: {
            title: 'Category (single-select)',
            layer: null,
            dataSource: 'features',
            valuesFrom: 'grouped',
            valueAttribute: 'category',
            sortBy: 'alphabetical',
            filterComposition: 'AND',
            userDefinedItems: []
        }
    },
    {
        id: 'checkbox-multi',
        variant: 'checkbox',
        label: 'Status (multi-select)',
        name: 'Status (multi-select)',
        icon: 'check',
        selectionMode: 'multiple',
        layout: {
            direction: 'horizontal',
            maxHeight: 260
        },
        items: [
            { id: 'active', label: 'Active' },
            { id: 'paused', label: 'Paused' },
            { id: 'archived', label: 'Archived', disabled: true },
            { id: 'draft', label: 'Draft' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'live', label: 'Live' },
            { id: 'pending', label: 'Pending review' },
            { id: 'disabled', label: 'Disabled' }
        ],
        data: {
            title: 'Status (multi-select)',
            layer: null,
            dataSource: 'features',
            valuesFrom: 'grouped',
            valueAttribute: 'status',
            sortBy: 'alphabetical',
            filterComposition: 'AND',
            userDefinedItems: []
        }
    },
    {
        id: 'checkbox-single',
        variant: 'checkbox',
        label: 'Owner (single-select)',
        name: 'Owner (single-select)',
        icon: 'user',
        selectionMode: 'single',
        layout: {
            direction: 'horizontal',
            maxHeight: 140
        },
        items: [
            { id: 'self', label: 'My data' },
            { id: 'shared', label: 'Shared with me' },
            { id: 'public', label: 'Public' },
            { id: 'partners', label: 'Partner data' },
            { id: 'external', label: 'External' },
            { id: 'system', label: 'System owned' },
            { id: 'legacy', label: 'Legacy' },
            { id: 'other', label: 'Other owners' }
        ],
        data: {
            title: 'Owner (single-select)',
            layer: null,
            dataSource: 'features',
            valuesFrom: 'grouped',
            valueAttribute: 'owner',
            sortBy: 'alphabetical',
            filterComposition: 'AND',
            userDefinedItems: []
        }
    },
    {
        id: 'dropdown-multi',
        variant: 'dropdown',
        label: 'Priority (multi-select)',
        name: 'Priority (multi-select)',
        icon: 'star',
        selectionMode: 'multiple',
        layout: {},
        items: [
            { id: 'urgent', label: 'Urgent' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
            { id: 'backlog', label: 'Backlog' },
            { id: 'deferred', label: 'Deferred' },
            { id: 'onhold', label: 'On hold' },
            { id: 'info', label: 'Informational' }
        ],
        data: {
            title: 'Priority (multi-select)',
            layer: null,
            dataSource: 'features',
            valuesFrom: 'single',
            valueAttribute: 'priority',
            labelAttribute: 'priority',
            sortBy: 'alphabetical',
            maxFeatures: 200,
            filterComposition: 'AND',
            userDefinedItems: []
        }
    },
    {
        id: 'dropdown-single',
        variant: 'dropdown',
        label: 'Timeframe (single-select)',
        name: 'Timeframe (single-select)',
        icon: 'calendar',
        selectionMode: 'single',
        layout: {},
        items: [
            { id: '24h', label: 'Last 24 hours' },
            { id: '7d', label: 'Last 7 days' },
            { id: '30d', label: 'Last 30 days' },
            { id: '90d', label: 'Last 90 days' },
            { id: 'ytd', label: 'Year to date' },
            { id: '1y', label: 'Last year' },
            { id: '2y', label: 'Last 2 years' },
            { id: 'custom', label: 'Custom range' }
        ],
        data: {
            title: 'Timeframe (single-select)',
            layer: null,
            dataSource: 'features',
            valuesFrom: 'single',
            valueAttribute: 'year',
            labelAttribute: 'year',
            sortBy: 'ascending',
            maxFeatures: 200,
            filterComposition: 'AND',
            userDefinedItems: []
        }
    }
];

export const createDefaultSelections = (filters = initialFilters) =>
    filters.reduce((acc, config) => ({
        ...acc,
        [config.id]: generateSelectionsPreview(config)
    }), {});

const getNewFilterName = (count = 0) => `New Filter ${count + 1}`;

export const createNewFilter = (filtersCount = 0) => {
    const label = getNewFilterName(filtersCount);
    return {
        id: `filter-${Date.now()}`,
        variant: 'checkbox',
        label,
        name: label,
        icon: 'filter',
        selectionMode: 'multiple',
        layout: {
            direction: 'vertical',
            maxHeight: 150
        },
        items: [],
        data: createEmptyFilterData()
    };
};

export const updateNestedProperty = (obj = {}, path = '', value) => {
    if (!path) {
        return obj;
    }
    const keys = path.split('.');
    const lastKey = keys.pop();
    const result = { ...obj };
    let current = result;
    keys.forEach((key) => {
        current[key] = current[key] ? { ...current[key] } : {};
        current = current[key];
    });
    current[lastKey] = value;
    return result;
};

