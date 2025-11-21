/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FilterView from '../../../../../plugins/widgetbuilder/FilterView';

const FilterList = ({
    filters = [],
    componentMap = {},
    selections = {},
    getSelectionHandler = () => () => {}
}) => {
    if (filters.length === 0) {
        return (
            <div className="ms-filter-list-empty">
                No saved filters. Create a new filter to get started.
            </div>
        );
    }

    return (
        <div className="ms-filter-list">
            <div className="ms-filter-list-items">
                {filters.map((filter) => {
                    return (
                        <div
                            key={filter.id}
                            className="ms-filter-list-item"
                        >

                            <FilterView
                                config={filter}
                                componentMap={componentMap}
                                selections={selections[filter.id] || []}
                                onSelectionChange={getSelectionHandler(filter.id)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

FilterList.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        data: PropTypes.object
    })),
    componentMap: PropTypes.object,
    selections: PropTypes.object,
    getSelectionHandler: PropTypes.func
};

export default FilterList;

