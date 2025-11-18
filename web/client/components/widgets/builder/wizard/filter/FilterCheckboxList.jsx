/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Checkbox, Radio } from 'react-bootstrap';

const FilterCheckboxList = ({
    filterName,
    items = [],
    selectionMode = 'multiple',
    selectedValues = [],
    onSelectionChange = () => {}
}) => {
    const isSingle = selectionMode === 'single';

    const handleToggle = (value) => {
        if (isSingle) {
            onSelectionChange([value]);
            return;
        }
        const alreadySelected = selectedValues.includes(value);
        const nextValues = alreadySelected
            ? selectedValues.filter((val) => val !== value)
            : [...selectedValues, value];
        onSelectionChange(nextValues);
    };

    const ControlComponent = isSingle ? Radio : Checkbox;

    return (
        <FormGroup className="ms-filter-checkbox-list">
            {filterName ? (
                <ControlLabel className="ms-filter-checkbox-list-title">
                    {filterName}
                </ControlLabel>
            ) : null}
            <div className="ms-filter-checkbox-list-items">
                {items.map(({ id, label, description, disabled }) => (
                    <ControlComponent
                        key={id}
                        inline
                        checked={selectedValues.includes(id)}
                        onChange={() => handleToggle(id)}
                        disabled={disabled}
                    >
                        <span className="ms-filter-checkbox-list-item-label">{label}</span>
                        {description ? (
                            <span className="ms-filter-checkbox-list-item-description">
                                {description}
                            </span>
                        ) : null}
                    </ControlComponent>
                ))}
            </div>
        </FormGroup>
    );
};

FilterCheckboxList.propTypes = {
    filterName: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        disabled: PropTypes.bool
    })),
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    selectedValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    onSelectionChange: PropTypes.func
};

export default FilterCheckboxList;


