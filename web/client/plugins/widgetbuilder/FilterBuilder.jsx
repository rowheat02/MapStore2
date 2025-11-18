/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, useState } from 'react';
import BorderLayout from '../../components/layout/BorderLayout';
import FilterWizard from '../../components/widgets/builder/wizard/FilterWizard';
import FilterSelector from '../../components/widgets/builder/wizard/filter/FilterSelector';
import FilterList from '../../components/widgets/builder/wizard/filter/FilterList';
import FilterCheckboxList from '../../components/widgets/builder/wizard/filter/FilterCheckboxList';
import FilterChipList from '../../components/widgets/builder/wizard/filter/FilterChipList';
import FilterDropdownList from '../../components/widgets/builder/wizard/filter/FilterDropdownList';
import BuilderHeader from './BuilderHeader';
import Message from '../../components/I18N/Message';
import { Button, Glyphicon, FormGroup, ControlLabel, InputGroup, FormControl } from 'react-bootstrap';
import useFilterManager from './hooks/useFilterManager';

const HeaderToolbar = ({ onReset = () => {} }) => (
    <div className="ms-filter-builder-toolbar">
        <Button
            className="square-button no-border"
            bsStyle="primary"
            onClick={onReset}
        >
            <Glyphicon glyph="arrow-left" />
        </Button>
        <div className="ms-filter-builder-title">
            <Message msgId="widgets.types.filter.title" />
        </div>
    </div>
);

const FilterBuilder = ({ enabled, onClose = () => {} } = {}) => {
    const mockFilterConfigs = useMemo(() => ([
        {
            id: 'checkbox-multi',
            variant: 'checkbox',
            filterName: 'Status (multi-select)',
            selectionMode: 'multiple',
            items: [
                { id: 'active', label: 'Active' },
                { id: 'paused', label: 'Paused' },
                { id: 'archived', label: 'Archived', disabled: true }
            ]
        },
        {
            id: 'checkbox-single',
            variant: 'checkbox',
            filterName: 'Owner (single-select)',
            selectionMode: 'single',
            items: [
                { id: 'self', label: 'My data' },
                { id: 'shared', label: 'Shared with me' },
                { id: 'public', label: 'Public' }
            ]
        },
        {
            id: 'chips-multi',
            variant: 'chips',
            filterName: 'Regions (multi-select)',
            selectionMode: 'multiple',
            items: [
                { id: 'north', label: 'North' },
                { id: 'south', label: 'South' },
                { id: 'east', label: 'East' },
                { id: 'west', label: 'West' }
            ]
        },
        {
            id: 'chips-single',
            variant: 'chips',
            filterName: 'Category (single-select)',
            selectionMode: 'single',
            items: [
                { id: 'environment', label: 'Environment' },
                { id: 'transport', label: 'Transport' },
                { id: 'utilities', label: 'Utilities' }
            ]
        },
        {
            id: 'dropdown-multi',
            variant: 'dropdown',
            filterName: 'Priority (multi-select)',
            selectionMode: 'multiple',
            items: [
                { id: 'urgent', label: 'Urgent' },
                { id: 'high', label: 'High' },
                { id: 'medium', label: 'Medium' },
                { id: 'low', label: 'Low' }
            ]
        },
        {
            id: 'dropdown-single',
            variant: 'dropdown',
            filterName: 'Timeframe (single-select)',
            selectionMode: 'single',
            items: [
                { id: '24h', label: 'Last 24 hours' },
                { id: '7d', label: 'Last 7 days' },
                { id: '30d', label: 'Last 30 days' }
            ]
        }
    ]), []);

    const [mockSelections, setMockSelections] = useState(() =>
        mockFilterConfigs.reduce((acc, config) => ({
            ...acc,
            [config.id]: config.selectionMode === 'single'
                ? [config.items[0]?.id].filter(Boolean)
                : config.items.slice(0, 2).map((item) => item.id)
        }), {})
    );

    const handleMockSelectionChange = (key) => (nextValues) => {
        setMockSelections((current) => ({
            ...current,
            [key]: nextValues
        }));
    };

    const mockVariantComponentMap = useMemo(() => ({
        checkbox: FilterCheckboxList,
        chips: FilterChipList,
        dropdown: FilterDropdownList
    }), []);

    const {
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
    } = useFilterManager();

    return (
        <BorderLayout
            className="bg-body"
            header={
                <BuilderHeader onClose={onClose}>
                    <HeaderToolbar onReset={onClose} />
                </BuilderHeader>
            }
        >
            {enabled ? (
                <div className="ms-filter-builder-content">
                    <FormGroup className="form-group-flex">
                        <ControlLabel>Title</ControlLabel>
                        <InputGroup>
                            <FormControl
                                value={widgetTitle}
                                type="text"
                                placeholder="Enter widget title..."
                                onChange={(e) => setWidgetTitle(e.target.value)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FilterList
                        filters={savedFilters}
                    />
                    <div className="ms-filter-builder-mock-previews">
                        {mockFilterConfigs.map((config) => {
                            const Component = mockVariantComponentMap[config.variant];
                            if (!Component) {
                                return null;
                            }
                            return (
                                <Component
                                    key={config.id}
                                    filterName={config.filterName}
                                    items={config.items}
                                    selectionMode={config.selectionMode}
                                    selectedValues={mockSelections[config.id] || []}
                                    onSelectionChange={handleMockSelectionChange(config.id)}
                                />
                            );
                        })}
                    </div>
                    <FilterSelector
                        filters={savedFilters}
                        selectedFilterId={selectedFilterId}
                        onSelect={handleFilterSelect}
                        onAdd={handleAddFilter}
                        onDelete={handleDeleteFilter}
                        onRename={handleRenameFilter}
                    />
                    <FilterWizard data={data} onChange={handleChange} />
                </div>
            ) : null}
        </BorderLayout>
    );
};

export default FilterBuilder;
