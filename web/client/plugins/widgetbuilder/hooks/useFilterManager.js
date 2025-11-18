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
    type: undefined,
    categoriesFrom: undefined,
    groupBy: undefined,
    sortBy: undefined
});

const initialFilters = [
    {
        id: 'filter-1',
        name: 'Region Filter',
        data: {
            title: 'Region Filter',
            layer: 'layer-1',
            type: 'category',
            categoriesFrom: 'grouped_values',
            groupBy: 'sub_region',
            sortBy: 'name'
        }
    },
    {
        id: 'filter-2',
        name: 'Date Range Filter',
        data: {
            title: 'Date Range Filter',
            layer: 'layer-2',
            type: 'date',
            categoriesFrom: 'attribute_values',
            groupBy: 'year',
            sortBy: 'date'
        }
    }
];

const useFilterManager = () => {
    const [widgetTitle, setWidgetTitle] = useState('Filter widget');
    const [savedFilters, setSavedFilters] = useState(initialFilters);
    const [selectedFilterId, setSelectedFilterId] = useState(initialFilters[0]?.id || null);
    const [data, setData] = useState(initialFilters[0]?.data || createEmptyFilterData());

    const selectedFilter = useMemo(
        () => savedFilters.find(filter => filter.id === selectedFilterId),
        [savedFilters, selectedFilterId]
    );

    const handleChange = (key, value) => {
        setData(prev => {
            const nextData = {
                ...prev,
                [key]: value
            };
            if (selectedFilter) {
                setSavedFilters(filters => filters.map(filter => filter.id === selectedFilterId
                    ? { ...filter, data: nextData }
                    : filter));
            }
            return nextData;
        });
    };

    const handleFilterSelect = (filterId) => {
        setSelectedFilterId(filterId);
        if (filterId) {
            const nextFilter = savedFilters.find(filter => filter.id === filterId);
            setData(nextFilter?.data || createEmptyFilterData());
        } else {
            setData(createEmptyFilterData());
        }
    };

    const handleAddFilter = () => {
        const newFilter = {
            id: `filter-${Date.now()}`,
            name: `New Filter ${savedFilters.length + 1}`,
            data: createEmptyFilterData()
        };
        setSavedFilters(filters => [...filters, newFilter]);
        setSelectedFilterId(newFilter.id);
        setData(newFilter.data);
    };

    const handleDeleteFilter = (filterId) => {
        setSavedFilters(filters => {
            const nextFilters = filters.filter(filter => filter.id !== filterId);
            if (selectedFilterId === filterId) {
                const fallback = nextFilters[0];
                setSelectedFilterId(fallback?.id || null);
                setData(fallback?.data || createEmptyFilterData());
            }
            return nextFilters.length ? nextFilters : [];
        });
    };

    const handleRenameFilter = (filterId, name) => {
        const label = name?.trim() || 'Untitled';
        setSavedFilters(filters => filters.map(filter => filter.id === filterId
            ? { ...filter, name: label }
            : filter));
    };

    return {
        widgetTitle,
        setWidgetTitle,
        savedFilters,
        selectedFilterId,
        data,
        handleChange,
        handleFilterSelect,
        handleAddFilter,
        handleDeleteFilter,
        handleRenameFilter
    };
};

export default useFilterManager;

