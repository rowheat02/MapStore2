/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

const FilterView = ({
    className,
    configs = [],
    componentMap = {},
    selections = {},
    getSelectionHandler = () => () => {}
}) => {
    if (!configs?.length) {
        return null;
    }

    return (
        <div className={['ms-filter-builder-mock-previews', className].filter(Boolean).join(' ')}>
            {configs.map((config) => {
                const Component = componentMap[config.variant];
                if (!Component) {
                    return null;
                }
                const { layout = {} } = config;
                const getLayoutProps = () => {
                    if (config.variant === 'chips') {
                        return {
                            layoutDirection: layout.direction,
                            layoutMaxHeight: layout.maxHeight,
                            selectedColor: layout.selectedColor
                        };
                    }
                    if (config.variant === 'checkbox') {
                        return {
                            layoutDirection: layout.direction,
                            layoutMaxHeight: layout.maxHeight
                        };
                    }
                    return {};
                };
                return (
                    <Component
                        key={config.id}
                        filterName={config.filterName}
                        items={config.items}
                        selectionMode={config.selectionMode}
                        selectedValues={selections[config.id] || []}
                        onSelectionChange={getSelectionHandler(config.id)}
                        {...getLayoutProps()}
                    />
                );
            })}
        </div>
    );
};

FilterView.propTypes = {
    className: PropTypes.string,
    configs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        variant: PropTypes.string.isRequired,
        filterName: PropTypes.string,
        selectionMode: PropTypes.string,
        items: PropTypes.array,
        layout: PropTypes.shape({
            direction: PropTypes.oneOf(['horizontal', 'vertical']),
            maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            selectedColor: PropTypes.string
        })
    })),
    componentMap: PropTypes.object,
    selections: PropTypes.object,
    getSelectionHandler: PropTypes.func
};

export default FilterView;

