/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
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
import FilterView from './FilterView';
import { onEditorChange } from '../../actions/widgets';
import { wizardSelector, wizardStateToProps } from './commons';
import {
    initialFilters,
    createDefaultSelections,
    createNewFilter,
    updateNestedProperty
} from './utils/filterBuilderDefaults';

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

const FilterBuilderComponent = ({
    enabled,
    onClose = () => {},
    editorData = {},
    onEditorChange: onChangeEditor = () => {}
} = {}) => {
    const {
        widgetType,
        title: widgetTitle,
        filters = [],
        selectedFilterId = null,
        selections = {}
    } = editorData;

    const mockVariantComponentMap = useMemo(() => ({
        checkbox: FilterCheckboxList,
        chips: FilterChipList,
        dropdown: FilterDropdownList
    }), []);

    const data = useMemo(
        () => filters.find(filter => filter.id === selectedFilterId) || null,
        [filters, selectedFilterId]
    );

    useEffect(() => {
        if (!enabled || widgetType !== 'filter') {
            return;
        }
        if (!filters.length) {
            onChangeEditor('filters', initialFilters);
            onChangeEditor('selectedFilterId', initialFilters[0]?.id || null);
        }
        if (!Object.keys(selections || {}).length) {
            const sourceFilters = filters.length ? filters : initialFilters;
            onChangeEditor('selections', createDefaultSelections(sourceFilters));
        }
        if (!widgetTitle) {
            onChangeEditor('title', 'Filter widget');
        }
    }, [enabled, widgetType, filters, selections, widgetTitle, onChangeEditor]);

    const handleTitleChange = useCallback((value = '') => {
        onChangeEditor('title', value);
    }, [onChangeEditor]);

    const handleFilterSelect = useCallback((filterId) => {
        onChangeEditor('selectedFilterId', filterId || null);
    }, [onChangeEditor]);

    const handleAddFilter = useCallback(() => {
        const nextFilter = createNewFilter(filters.length);
        const nextFilters = [...filters, nextFilter];
        onChangeEditor('filters', nextFilters);
        onChangeEditor('selectedFilterId', nextFilter.id);
        onChangeEditor('selections', {
            ...(selections || {}),
            [nextFilter.id]: []
        });
    }, [filters, selections, onChangeEditor]);

    const handleDeleteFilter = useCallback((filterId) => {
        if (!filterId) {
            return;
        }
        const nextFilters = filters.filter(filter => filter.id !== filterId);
        onChangeEditor('filters', nextFilters);
        if (selections && selections[filterId]) {
            const nextSelections = { ...selections };
            delete nextSelections[filterId];
            onChangeEditor('selections', nextSelections);
        }
        if (selectedFilterId === filterId) {
            onChangeEditor('selectedFilterId', nextFilters[0]?.id || null);
        }
    }, [filters, selections, selectedFilterId, onChangeEditor]);

    const handleRenameFilter = useCallback((filterId, name) => {
        const label = name?.trim() || 'Untitled';
        const nextFilters = filters.map(filter => filter.id === filterId
            ? { ...filter, name: label, label }
            : filter);
        onChangeEditor('filters', nextFilters);
        if (data && data.id === filterId) {
            handleFilterSelect(filterId);
        }
    }, [filters, data, handleFilterSelect, onChangeEditor]);

    const handleChange = useCallback((key, value) => {
        if (!data) {
            return;
        }
        const nextFilter = key.includes('.')
            ? updateNestedProperty({ ...data }, key, value)
            : { ...data, [key]: value };
        const nextFilters = filters.map(filter =>
            filter.id === data.id ? nextFilter : filter
        );
        onChangeEditor('filters', nextFilters);
    }, [data, filters, onChangeEditor]);

    const handleSelectionChange = useCallback((filterId) => (nextValues = []) => {
        onChangeEditor('selections', {
            ...(selections || {}),
            [filterId]: nextValues
        });
    }, [selections, onChangeEditor]);

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
                                value={widgetTitle || ''}
                                type="text"
                                placeholder="Enter widget title..."
                                onChange={(e) => handleTitleChange(e.target.value)}
                            />
                        </InputGroup>
                    </FormGroup>
                    <FilterList
                        filters={filters}
                        componentMap={mockVariantComponentMap}
                        selections={selections}
                        getSelectionHandler={handleSelectionChange}
                    />
                    <FilterSelector
                        filters={filters}
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

export default connect(
    wizardSelector,
    {
        onEditorChange
    },
    wizardStateToProps
)(FilterBuilderComponent);
