/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import Select from 'react-select';

const FilterLayoutTab = ({
    data = {},
    onChange = () => {}
}) => {
    return (
        <div className="ms-filter-wizard-layout-tab">
            <div className="ms-wizard-form-separator">Layout</div>
            <FormGroup className="form-group-flex">
                <ControlLabel>Type</ControlLabel>
                <InputGroup>
                    <Select
                        value={data.type ? { value: data.type, label: data.type } : null}
                        options={[
                            { value: 'Category', label: 'Category' },
                            { value: 'Range', label: 'Range' },
                            { value: 'Date', label: 'Date' }
                        ]}
                        placeholder="Select type..."
                        onChange={(val) => onChange('type', val?.value)}
                    />
                </InputGroup>
            </FormGroup>
        </div>
    );
};

export default FilterLayoutTab;

