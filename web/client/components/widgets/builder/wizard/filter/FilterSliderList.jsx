/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';
import Slider from 'react-nouislider';

const FilterSliderList = ({
    items = [],
    selectionMode = 'single',
    selectedValues = [],
    onSelectionChange = () => {},
    layoutDirection = 'vertical',
    layoutMaxHeight
}) => {
    const count = items.length;
    const maxIndex = Math.max(0, count - 1);

    const selectedIndex = useMemo(() => {
        if (!selectedValues?.length || count === 0) {
            return 0;
        }
        const idx = items.findIndex((item) => item.id === selectedValues[0]);
        return idx >= 0 ? idx : 0;
    }, [items, selectedValues, count]);

    const range = useMemo(() => ({
        min: 0,
        max: maxIndex
    }), [maxIndex]);

    const pipsConfig = useMemo(() => (count > 0 ? {
        mode: 'steps',
        stepped: true,
        density: 0,
        format: {
            to: (value) => {
                const idx = Math.min(Math.round(value), count - 1);
                return items[idx]?.label ?? '';
            }
        }
    } : null), [items, count]);

    const handleChange = (values) => {
        const index = Math.round(parseFloat(values[0]));
        const item = items[index];
        if (item && !item.disabled) {
            onSelectionChange([item.id]);
        }
    };

    if (count === 0) {
        return null;
    }

    const containerStyle = {
        marginBottom: 24,
        ...(layoutMaxHeight && { maxHeight: layoutMaxHeight, overflow: 'visible' })
    };

    if (count === 1) {
        return (
            <FormGroup className="ms-filter-slider-list" style={containerStyle}>
                <div className="ms-filter-slider-list-single" style={{ padding: '8px 0' }}>
                    {items[0].label}
                </div>
            </FormGroup>
        );
    }

    return (
        <FormGroup
            className="ms-filter-slider-list"
            style={containerStyle}
            data-selection-mode={selectionMode}
            data-layout-direction={layoutDirection}
        >
            <Slider
                start={[selectedIndex]}
                range={range}
                step={1}
                connect={[false, false]}
                behaviour="tap"
                pips={pipsConfig}
                onChange={handleChange}
            />
        </FormGroup>
    );
};

FilterSliderList.propTypes = {
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
    onSelectionChange: PropTypes.func,
    layoutDirection: PropTypes.oneOf(['horizontal', 'vertical']),
    layoutMaxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default FilterSliderList;
