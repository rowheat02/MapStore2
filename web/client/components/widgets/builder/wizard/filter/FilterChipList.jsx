/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const FilterChipList = ({
    filterName,
    items = [],
    selectionMode = 'multiple',
    selectedValues = [],
    onSelectionChange = () => {}
}) => {
    const isSingle = selectionMode === 'single';

    const handleToggle = (value) => {
        const alreadySelected = selectedValues.includes(value);
        if (isSingle) {
            if (alreadySelected && selectedValues.length === 1) {
                onSelectionChange([]);
                return;
            }
            onSelectionChange([value]);
            return;
        }
        const next = alreadySelected
            ? selectedValues.filter((item) => item !== value)
            : [...selectedValues, value];
        onSelectionChange(next);
    };

    return (
        <div className="ms-filter-chip-list">
            {filterName ? (
                <div className="ms-filter-chip-list-title">{filterName}</div>
            ) : null}
            <div className="ms-filter-chip-list-items">
                {items.map(({ id, label, disabled }) => {
                    const active = selectedValues.includes(id);
                    return (
                        <Button
                            key={id}
                            bsStyle={active ? 'primary' : 'default'}
                            className="ms-filter-chip-list-item"
                            disabled={disabled}
                            onClick={() => handleToggle(id)}
                        >
                            {label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

FilterChipList.propTypes = {
    filterName: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    })),
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    selectedValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    onSelectionChange: PropTypes.func
};

export default FilterChipList;


