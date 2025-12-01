/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import filterWidgetEnhancer from '../../components/widgets/enhancers/filterWidget';
import LoadingSpinner from '../../components/misc/LoadingSpinner';

const FilterView = ({
    className,
    filterData,
    componentMap = {},
    selections = [],
    onSelectionChange = () => {},
    loading = false
}) => {
    if (!filterData) {
        return null;
    }

    const Component = componentMap[filterData.variant];
    if (!Component) {
        return null;
    }

    const { layout = {} } = filterData;
    const getLayoutProps = () => {
        if (filterData.variant === 'chips') {
            return {
                layoutDirection: layout.direction,
                layoutMaxHeight: layout.maxHeight,
                selectedColor: layout.selectedColor
            };
        }
        if (filterData.variant === 'checkbox') {
            return {
                layoutDirection: layout.direction,
                layoutMaxHeight: layout.maxHeight
            };
        }
        return {};
    };

    return (
        <div className={['ms-filter-builder-mock-previews', className].filter(Boolean).join(' ')} style={{ position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 10
                }}>
                    <LoadingSpinner />
                </div>
            )}
            <Component
                key={filterData.id}
                filterName={filterData.label}
                filterIcon={filterData.icon}
                items={filterData.items}
                selectionMode={filterData.selectionMode}
                selectedValues={selections || []}
                onSelectionChange={onSelectionChange}
                {...getLayoutProps()}
            />
        </div>
    );
};

FilterView.propTypes = {
    className: PropTypes.string,
    filterData: PropTypes.shape({
        id: PropTypes.string.isRequired,
        variant: PropTypes.string.isRequired,
        label: PropTypes.string,
        icon: PropTypes.string,
        selectionMode: PropTypes.string,
        items: PropTypes.array,
        layout: PropTypes.shape({
            direction: PropTypes.oneOf(['horizontal', 'vertical']),
            maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            selectedColor: PropTypes.string
        })
    }),
    componentMap: PropTypes.object,
    selections: PropTypes.array,
    onSelectionChange: PropTypes.func,
    loading: PropTypes.bool
};

export default compose(
    filterWidgetEnhancer
)(FilterView);

