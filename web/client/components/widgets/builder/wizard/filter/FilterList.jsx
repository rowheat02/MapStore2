/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

const FilterList = ({
    filters = []
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
                {filters.map((filter, idx) => {
                    const layerName = filter.data?.layer || 'No layer selected';
                    const filterType = filter.data?.type || 'Not configured';
                    return (
                        <div
                            key={filter.id}
                            className="ms-filter-list-item"
                        >
                            <div className="ms-filter-list-item-header">
                                <strong>{`[Filter ${idx + 1}] ${filter.name || 'Untitled'}`}</strong>
                            </div>
                            <div className="ms-filter-list-item-details">
                                <span className="ms-filter-list-item-layer">Layer: {layerName}</span>
                                <span className="ms-filter-list-item-type">Type: {filterType}</span>
                            </div>
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
    }))
};

export default FilterList;

