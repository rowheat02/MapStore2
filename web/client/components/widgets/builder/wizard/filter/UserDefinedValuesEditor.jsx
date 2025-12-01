/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FormGroup, ControlLabel, FormControl, Button, Glyphicon, Modal } from 'react-bootstrap';
import './UserDefinedValuesEditor.less';

const UserDefinedValuesEditor = ({
    items = [],
    onChange = () => {}
}) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [labelInput, setLabelInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [filterEditorIndex, setFilterEditorIndex] = useState(null);
    const [filterInput, setFilterInput] = useState('');

    // Reset inputs when editing index changes
    useEffect(() => {
        if (editingIndex !== null && items[editingIndex]) {
            setLabelInput(items[editingIndex].label || '');
            setValueInput(items[editingIndex].value || '');
        } else {
            setLabelInput('');
            setValueInput('');
        }
    }, [editingIndex, items]);

    const handleAddOrUpdate = () => {
        if (!labelInput.trim() || !valueInput.trim()) {
            return;
        }

        const existingFilter = editingIndex !== null ? (items[editingIndex]?.filter || null) : null;
        const newItem = { label: labelInput.trim(), value: valueInput.trim(), filter: existingFilter };

        if (editingIndex !== null) {
            // Update existing item
            const updatedItems = [...items];
            updatedItems[editingIndex] = newItem;
            onChange(updatedItems);
            setEditingIndex(null);
        } else {
            // Add new item
            const updatedItems = [...items, newItem];
            onChange(updatedItems);
        }

        setLabelInput('');
        setValueInput('');
    };

    const handleEdit = (index) => {
        setEditingIndex(index);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setLabelInput('');
        setValueInput('');
    };

    const handleRemove = (index) => {
        const updatedItems = items.filter((_, idx) => idx !== index);
        onChange(updatedItems);
        if (editingIndex === index) {
            setEditingIndex(null);
            setLabelInput('');
            setValueInput('');
        } else if (editingIndex !== null && index < editingIndex) {
            setEditingIndex(editingIndex - 1);
        }
        if (filterEditorIndex === index) {
            setFilterEditorIndex(null);
            setFilterInput('');
        }
    };

    const handleOpenFilterEditor = (index) => {
        if (!items[index]) {
            return;
        }
        const currentFilter = items[index].filter;
        const nextValue = typeof currentFilter === 'string'
            ? currentFilter
            : (currentFilter?.expression || '');
        setFilterEditorIndex(index);
        setFilterInput(nextValue);
    };

    const handleCloseFilterEditor = useCallback(() => {
        setFilterEditorIndex(null);
        setFilterInput('');
    }, []);

    const handleApplyFilterEditor = () => {
        if (filterEditorIndex === null) {
            return;
        }
        const trimmed = filterInput.trim();
        const updatedItems = items.map((item, idx) => {
            if (idx !== filterEditorIndex) {
                return item;
            }
            return trimmed
                ? { ...item, filter: { expression: trimmed } }
                : { ...item, filter: null };
        });
        onChange(updatedItems);
        handleCloseFilterEditor();
    };

    const handleClearFilter = (index) => {
        const updatedItems = items.map((item, idx) => idx === index ? { ...item, filter: null } : item);
        onChange(updatedItems);
    };

    useEffect(() => {
        if (filterEditorIndex !== null && !items[filterEditorIndex]) {
            handleCloseFilterEditor();
        }
    }, [filterEditorIndex, items, handleCloseFilterEditor]);

    // Filter out empty items and items being edited for display
    const savedItems = items
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) =>
            item.label && item.value && index !== editingIndex
        );

    return (
        <>
            <ControlLabel className="ms-filter-user-defined-label">Add Label/Value</ControlLabel>
            <FormGroup className="form-group-flex ms-filter-user-defined">

                {/* Input Row */}
                <div className="ms-filter-user-defined-input-row">
                    <div className="ms-filter-user-defined-input-group">
                        <span className="ms-filter-user-defined-input-label">Label:</span>
                        <FormControl
                            type="text"
                            placeholder="Enter label..."
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && labelInput.trim() && valueInput.trim()) {
                                    handleAddOrUpdate();
                                }
                            }}
                        />
                    </div>
                    <div className="ms-filter-user-defined-input-group">
                        <span className="ms-filter-user-defined-input-label">Value:</span>
                        <FormControl
                            type="text"
                            placeholder="Enter value..."
                            value={valueInput}
                            onChange={(e) => setValueInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && labelInput.trim() && valueInput.trim()) {
                                    handleAddOrUpdate();
                                }
                            }}
                        />
                    </div>
                    <div className="ms-filter-user-defined-input-actions">
                        <Button
                            bsStyle="primary"
                            onClick={handleAddOrUpdate}
                            disabled={!labelInput.trim() || !valueInput.trim()}
                        >
                            <Glyphicon glyph={editingIndex !== null ? "ok" : "plus"} />
                            {editingIndex !== null ? ' Update' : ' Add'}
                        </Button>
                        {editingIndex !== null && (
                            <Button
                                bsStyle="default"
                                onClick={handleCancel}
                                className="ms-filter-user-defined-cancel-btn"
                            >
                            Cancel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Saved Items List */}
                {savedItems.length > 0 && (
                    <div className="ms-filter-user-defined-list">
                        <div className="ms-filter-user-defined-list-header">
                            <span className="ms-filter-user-defined-label-col">Label</span>
                            <span className="ms-filter-user-defined-value-col">Value</span>
                            <span className="ms-filter-user-defined-filter-col">Filter</span>
                            <span className="ms-filter-user-defined-actions">Actions</span>
                        </div>
                        {savedItems.map(({ item, index }) => (
                            <div key={`user-defined-item-${index}`} className="ms-filter-user-defined-list-item">
                                <span className="ms-filter-user-defined-item-label">{item.label}</span>
                                <span className="ms-filter-user-defined-item-value">{item.value}</span>
                                <span className="ms-filter-user-defined-item-filter">{item.filter?.expression || 'Not defined'}</span>
                                <div className="ms-filter-user-defined-item-actions">
                                    <Button
                                        bsStyle="link"
                                        onClick={() => handleOpenFilterEditor(index)}
                                        title="Define filter"
                                    >
                                        <Glyphicon glyph="equalizer" />
                                    </Button>
                                    {item.filter && (
                                        <Button
                                            bsStyle="link"
                                            onClick={() => handleClearFilter(index)}
                                            title="Clear filter"
                                        >
                                            <Glyphicon glyph="remove-circle" />
                                        </Button>
                                    )}
                                    <Button
                                        bsStyle="link"
                                        onClick={() => handleEdit(index)}
                                        title="Edit"
                                    >
                                        <Glyphicon glyph="pencil" />
                                    </Button>
                                    <Button
                                        bsStyle="link"
                                        onClick={() => handleRemove(index)}
                                        title="Remove"
                                    >
                                        <Glyphicon glyph="trash" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </FormGroup>
            {filterEditorIndex !== null && (
                <Modal
                    show
                    onHide={handleCloseFilterEditor}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Define filter</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ControlLabel>Filter expression</ControlLabel>
                        <FormControl
                            componentClass="textarea"
                            rows={5}
                            placeholder="Enter filter expression (e.g. CQL)"
                            value={filterInput}
                            onChange={(e) => setFilterInput(e.target.value)}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCloseFilterEditor}>
                            Cancel
                        </Button>
                        <Button
                            bsStyle="primary"
                            onClick={handleApplyFilterEditor}
                            disabled={!filterInput.trim()}
                        >
                            Save filter
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default UserDefinedValuesEditor;

