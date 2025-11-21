/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { layersSelector } from '../../../../../selectors/layers';
import { currentLocaleSelector } from '../../../../../selectors/locale';
import { getLayerTitle } from '../../../../../utils/LayersUtils';

const TYPE_OPTIONS = [
    { value: 'category', label: 'Category' },
    { value: 'range', label: 'Range' },
    { value: 'date', label: 'Date' },
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' }
];

const CATEGORIES_FROM_OPTIONS = [
    { value: 'grouped_values', label: 'Grouped values' },
    { value: 'attribute_values', label: 'Attribute values' },
    { value: 'distinct_values', label: 'Distinct values' },
    { value: 'custom_list', label: 'Custom list' }
];

const GROUP_BY_OPTIONS = [
    { value: 'sub_region', label: 'SUB_REGION' },
    { value: 'year', label: 'YEAR' },
    { value: 'category', label: 'CATEGORY' },
    { value: 'type', label: 'TYPE' },
    { value: 'status', label: 'STATUS' }
];

const SORT_BY_OPTIONS = [
    { value: 'sub_region', label: 'SUB_REGION' },
    { value: 'year', label: 'YEAR' },
    { value: 'category', label: 'CATEGORY' },
    { value: 'name', label: 'NAME' },
    { value: 'value', label: 'VALUE' },
    { value: 'date', label: 'DATE' }
];

const availableLayersSelector = createSelector(
    layersSelector,
    currentLocaleSelector,
    (layers, locale) => {
        return layers
            .filter(layer => {
                // Filter layers similar to availableSnappingLayers pattern
                const isWFSOrVector = ['wfs', 'vector'].includes(layer?.type);
                const isWMSWithWFS = layer?.type === 'wms' && layer?.search?.type === 'wfs';
                const isNotBackground = layer.group !== 'background';
                const isVisible = layer.visibility;
                return (isWFSOrVector || isWMSWithWFS) && isNotBackground && isVisible;
            })
            .map(layer => ({
                value: layer.id,
                label: getLayerTitle(layer, locale) || layer.name || layer.id
            }));
    }
);

const FilterDataTab = ({
    data = {},
    onChange = () => {},
    layerOptions = []
}) => {
    const filterData = data?.data || {};
    
    return (
        <div className="ms-filter-wizard-data-tab">
            <div className="ms-wizard-form-separator">Data</div>
            <FormGroup className="form-group-flex">
                <ControlLabel>Layer</ControlLabel>
                <InputGroup>
                    <Select
                        value={filterData.layer ? layerOptions.find(opt => opt.value === filterData.layer) : null}
                        options={layerOptions}
                        placeholder="Select layer..."
                        onChange={(val) => onChange('data.layer', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Type</ControlLabel>
                <InputGroup>
                    <Select
                        value={filterData.type ? TYPE_OPTIONS.find(opt => opt.value === filterData.type) : null}
                        options={TYPE_OPTIONS}
                        placeholder="Select type..."
                        onChange={(val) => onChange('data.type', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Categories From</ControlLabel>
                <InputGroup>
                    <Select
                        value={filterData.categoriesFrom ? CATEGORIES_FROM_OPTIONS.find(opt => opt.value === filterData.categoriesFrom) : null}
                        options={CATEGORIES_FROM_OPTIONS}
                        placeholder="Select categories from..."
                        onChange={(val) => onChange('data.categoriesFrom', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Group by</ControlLabel>
                <InputGroup>
                    <Select
                        value={filterData.groupBy ? GROUP_BY_OPTIONS.find(opt => opt.value === filterData.groupBy) : null}
                        options={GROUP_BY_OPTIONS}
                        placeholder="Select group by..."
                        onChange={(val) => onChange('data.groupBy', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
            <FormGroup className="form-group-flex">
                <ControlLabel>Sort by</ControlLabel>
                <InputGroup>
                    <Select
                        value={filterData.sortBy ? SORT_BY_OPTIONS.find(opt => opt.value === filterData.sortBy) : null}
                        options={SORT_BY_OPTIONS}
                        placeholder="Select sort by..."
                        onChange={(val) => onChange('data.sortBy', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
        </div>
    );
};

export default connect(
    createSelector(
        availableLayersSelector,
        (layerOptions) => ({ layerOptions })
    )
)(FilterDataTab);

