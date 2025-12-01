/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useMemo, useState } from 'react';

const createEmptyFilterData = () => ({
    title: '',
    layer: undefined,
    dataSource: 'features',
    valuesFrom: 'grouped',
    valueAttribute: undefined,
    labelAttribute: undefined,
    sortBy: undefined,
    maxFeatures: 200,
    filterComposition: 'AND',
    userDefinedItems: []
});

const initialFilters = [
    {
        id: 'chips-multi',
        variant: 'chips',
        label: 'Regions (multi-select)',
        name: 'Regions (multi-select)',
        icon: 'flag',
        selectionMode: 'multiple',
        layout: {
            direction: 'horizontal',
            maxHeight: 180,
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
            layer: 'layer-1',
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
            layer: 'layer-1',
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
            layer: 'layer-1',
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
            layer: 'layer-1',
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
            layer: 'layer-2',
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
            layer: 'layer-2',
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

const useFilterManager = () => {
    const [widgetTitle, setWidgetTitle] = useState('Filter widget');
    const [savedFilters, setSavedFilters] = useState(initialFilters);
    const [selectedFilterId, setSelectedFilterId] = useState(initialFilters[0]?.id || null);
    const [data, setData] = useState(initialFilters[0] || null);
    const [selections, setSelections] = useState(() =>
        initialFilters.reduce((acc, config) => ({
            ...acc,
            [config.id]: config.selectionMode === 'single'
                ? [config.items[0]?.id].filter(Boolean)
                : config.items.slice(0, 2).map((item) => item.id)
        }), {})
    );

    const selectedFilter = useMemo(
        () => savedFilters.find(filter => filter.id === selectedFilterId),
        [savedFilters, selectedFilterId]
    );

    const updateNestedProperty = (obj, path, value) => {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const result = { ...obj };
        let current = result;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            current[key] = current[key] ? { ...current[key] } : {};
            current = current[key];
        }
        current[lastKey] = value;
        return result;
    };

    const handleChange = (key, value) => {
        setData(prev => {
            if (!prev) return prev;

            const isNested = key.includes('.');
            const nextFilter = isNested
                ? updateNestedProperty({ ...prev }, key, value)
                : { ...prev, [key]: value };

            if (selectedFilter) {
                setSavedFilters(filters => filters.map(filter => filter.id === selectedFilterId
                    ? nextFilter
                    : filter));
            }
            return nextFilter;
        });
    };

    const handleFilterSelect = (filterId) => {
        setSelectedFilterId(filterId);
        if (filterId) {
            const nextFilter = savedFilters.find(filter => filter.id === filterId);
            setData(nextFilter || null);
        } else {
            setData(null);
        }
    };

    const handleAddFilter = () => {
        const newFilter = {
            id: `filter-${Date.now()}`,
            variant: 'checkbox',
            label: `New Filter ${savedFilters.length + 1}`,
            name: `New Filter ${savedFilters.length + 1}`,
            icon: 'filter',
            selectionMode: 'multiple',
            layout: {
                direction: 'vertical',
                maxHeight: 260
            },
            items: [],
            data: createEmptyFilterData()
        };
        setSavedFilters(filters => [...filters, newFilter]);
        setSelectedFilterId(newFilter.id);
        setData(newFilter);
        setSelections(prev => ({
            ...prev,
            [newFilter.id]: []
        }));
    };

    const handleDeleteFilter = (filterId) => {
        setSavedFilters(filters => {
            const nextFilters = filters.filter(filter => filter.id !== filterId);
            if (selectedFilterId === filterId) {
                const fallback = nextFilters[0];
                setSelectedFilterId(fallback?.id || null);
                setData(fallback || null);
            }
            return nextFilters.length ? nextFilters : [];
        });
        setSelections(prev => {
            const next = { ...prev };
            delete next[filterId];
            return next;
        });
    };

    const handleRenameFilter = (filterId, name) => {
        const label = name?.trim() || 'Untitled';
        setSavedFilters(filters => filters.map(filter => filter.id === filterId
            ? { ...filter, name: label, label: label }
            : filter));
        if (data && data.id === filterId) {
            setData(prev => prev ? { ...prev, name: label, label: label } : null);
        }
    };

    const handleSelectionChange = (filterId) => (nextValues) => {
        setSelections(prev => ({
            ...prev,
            [filterId]: nextValues
        }));
    };

    return {
        widgetTitle,
        setWidgetTitle,
        savedFilters,
        selectedFilterId,
        data,
        selections,
        handleChange,
        handleFilterSelect,
        handleAddFilter,
        handleDeleteFilter,
        handleRenameFilter,
        handleSelectionChange
    };
};

export default useFilterManager;

