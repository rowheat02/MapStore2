/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';

const NEW_FILTER_ID = 'new-filter';

const FilterSelector = ({
    filters = [],
    selectedFilterId,
    onSelect = () => {},
    onAdd = () => {},
    onDelete = () => {},
    onRename = () => {}
}) => {
    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState('');

    const selectedFilter = useMemo(
        () => filters.find(filter => filter.id === selectedFilterId),
        [filters, selectedFilterId]
    );

    const options = useMemo(() => ([
        {
            value: NEW_FILTER_ID,
            label: '[New Filter]'
        },
        ...filters.map((filter, idx) => ({
            value: filter.id,
            label: `[Filter ${idx + 1}] ${filter.name || 'Untitled'}`
        }))
    ]), [filters]);

    const handleSelect = (value) => {
        if (value === NEW_FILTER_ID) {
            onSelect(null);
            setEditMode(false);
            return;
        }
        onSelect(value);
        setEditMode(false);
    };

    const handleToggleEdit = () => {
        if (!selectedFilter) {
            return;
        }
        if (editMode) {
            onRename(selectedFilter.id, editValue);
            setEditMode(false);
            return;
        }
        setEditValue(selectedFilter.name || '');
        setEditMode(true);
    };

    const handleAdd = () => {
        setEditMode(false);
        onAdd();
    };

    const handleDelete = () => {
        setEditMode(false);
        if (selectedFilter) {
            onDelete(selectedFilter.id);
        }
    };

    const currentValue = selectedFilterId || NEW_FILTER_ID;

    return (
        <div className="ms-filter-selector">
            <FormGroup className="form-group-flex">
                <div className="ms-filter-selector-row">
                    <div className="ms-filter-selector-field">
                        {editMode && selectedFilter
                            ? (
                                <FormControl
                                    type="text"
                                    value={editValue}
                                    placeholder="Filter name..."
                                    onChange={(event) => setEditValue(event.target.value)}
                                />
                            )
                            : (
                                <Select
                                    clearable={false}
                                    value={currentValue}
                                    options={options}
                                    onChange={(option) => handleSelect(option?.value)}
                                />
                            )
                        }
                    </div>
                    <div className="ms-filter-selector-actions">
                        <Button
                            bsStyle="primary"
                            onClick={handleToggleEdit}
                            disabled={!selectedFilter}
                        >
                            <Glyphicon glyph={editMode ? 'ok' : 'pencil'} />
                        </Button>
                        <Button
                            bsStyle="primary"
                            onClick={handleAdd}
                        >
                            <Glyphicon glyph="plus" />
                        </Button>
                        <Button
                            bsStyle="primary"
                            onClick={handleDelete}
                            disabled={!selectedFilter || filters.length <= 1}
                        >
                            <Glyphicon glyph="trash" />
                        </Button>
                    </div>
                </div>
            </FormGroup>
        </div>
    );
};

FilterSelector.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        data: PropTypes.object
    })),
    selectedFilterId: PropTypes.string,
    onSelect: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    onRename: PropTypes.func
};

export default FilterSelector;

