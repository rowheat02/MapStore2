/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
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
import FilterView from './FilterView';

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
        selections,
        handleChange,
        handleFilterSelect,
        handleAddFilter,
        handleDeleteFilter,
        handleRenameFilter,
        handleSelectionChange
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
                        componentMap={mockVariantComponentMap}
                        selections={selections}
                        getSelectionHandler={handleSelectionChange}
                    />
                    <FilterSelector
                        filters={savedFilters}
                        selectedFilterId={selectedFilterId}
                        onSelect={handleFilterSelect}
                        onAdd={handleAddFilter}
                        onDelete={handleDeleteFilter}
                        onRename={handleRenameFilter}
                    />
                    {data && (
                        <FilterView
                            config={data}
                            componentMap={mockVariantComponentMap}
                            selections={selections[data.id] || []}
                            onSelectionChange={handleSelectionChange(data.id)}
                        />
                    )}
                    {data && (
                        <FilterWizard data={data} onChange={handleChange} />
                    )}
                </div>
            ) : null}
        </BorderLayout>
    );
};

export default FilterBuilder;
