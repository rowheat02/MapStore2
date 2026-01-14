/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Alert, Glyphicon, ListGroup, ListGroupItem, Button, FormControl, InputGroup, Popover } from 'react-bootstrap';
import { getLayerCapabilities } from '../../../../../observables/wms';
import { getLayerOptions } from '../../../../../utils/WMSUtils';
import Filter from '../../../../misc/Filter';
import Overlay from '../../../../misc/Overlay';
import './LayerStylesList.less';

const LayerStylesList = ({
    layer,
    selectedStyle,
    onSelect
}) => {
    const [styles, setStyles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const [tempSelectedStyle, setTempSelectedStyle] = useState(null);

    useEffect(() => {
        if (!layer || layer.type !== 'wms' || !layer.url || !layer.name) {
            setStyles([]);
            setLoading(false);
            setError(null);
            return () => {};
        }

        // If styles are already available in the layer, use them
        if (layer.availableStyles && layer.availableStyles.length > 0) {
            setStyles(layer.availableStyles);
            setLoading(false);
            setError(null);
            return () => {};
        }

        // Otherwise, fetch capabilities
        setLoading(true);
        setError(null);
        setStyles([]);

        let cancelled = false;
        const subscription = getLayerCapabilities(layer).subscribe(
            (layerCapability) => {
                if (cancelled) {
                    return;
                }
                if (layerCapability) {
                    const layerOptions = getLayerOptions(layerCapability);
                    const availableStyles = layerOptions.availableStyles || [];
                    setStyles(availableStyles);
                    setLoading(false);
                    setError(null);
                } else {
                    setLoading(false);
                    setError('No layer capabilities found');
                }
            },
            (err) => {
                if (cancelled) {
                    return;
                }
                setLoading(false);
                setError(err?.message || 'Unable to load layer styles');
                setStyles([]);
            }
        );

        return () => {
            cancelled = true;
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        };
    }, [layer]);

    // Initialize tempSelectedStyle when popover opens
    useEffect(() => {
        if (showPopover) {
            setTempSelectedStyle(selectedStyle);
        }
    }, [showPopover, selectedStyle]);

    if (!layer || layer.type !== 'wms') {
        return null;
    }

    // Filter styles based on filterText
    const filteredStyles = useMemo(() => {
        if (!filterText) {
            return styles;
        }
        const lowerFilter = filterText.toLowerCase();
        return styles.filter(style => {
            const title = (style.title || style.name || '').toLowerCase();
            const name = (style.name || '').toLowerCase();
            return title.includes(lowerFilter) || name.includes(lowerFilter);
        });
    }, [styles, filterText]);

    const getStyleLabel = (style) => {
        if (!style) return 'Select a style...';
        if (typeof style === 'string') {
            const foundStyle = styles.find(s => s.name === style);
            return foundStyle ? (foundStyle.title || foundStyle.name) : style;
        }
        return style.title || style.name || 'Unnamed Style';
    };

    const handleStyleClick = (style) => {
        setTempSelectedStyle(style);
    };

    const handleSave = () => {
        if (onSelect && tempSelectedStyle) {
            onSelect(tempSelectedStyle);
        }
        setShowPopover(false);
    };

    const handleClose = () => {
        setTempSelectedStyle(selectedStyle); // Reset to original selection
        setFilterText(''); // Clear filter
        setShowPopover(false);
    };

    const getSelectedStyleObject = () => {
        if (!tempSelectedStyle) return null;
        if (typeof tempSelectedStyle === 'string') {
            return styles.find(s => s.name === tempSelectedStyle) || null;
        }
        return tempSelectedStyle;
    };

    const selectedStyleObj = getSelectedStyleObject();
    const displayLabel = getStyleLabel(selectedStyleObj || selectedStyle);

    const popoverContent = (
        <div className="ms-layer-styles-popover-content">
            <Filter
                filterText={filterText}
                filterPlaceholder="Filter styles..."
                onFilter={setFilterText}
            />
            {loading ? (
                <div className="ms-layer-styles-loading">
                    <Glyphicon glyph="refresh" className="spinning" /> Loading styles...
                </div>
            ) : error ? (
                <Alert bsStyle="danger">
                    <strong>Error:</strong> {error}
                </Alert>
            ) : filteredStyles.length === 0 ? (
                <div className="ms-layer-styles-empty">
                    {filterText ? 'No styles match your filter.' : 'No styles available for this layer.'}
                </div>
            ) : (
                <ListGroup className="ms-layer-styles-items">
                    {filteredStyles.map((style, index) => {
                        const label = getStyleLabel(style);
                        const isSelected = tempSelectedStyle && (
                            (typeof tempSelectedStyle === 'string' && tempSelectedStyle === style.name) ||
                            (typeof tempSelectedStyle === 'object' && tempSelectedStyle.name === style.name) ||
                            tempSelectedStyle === style
                        );
                        return (
                            <ListGroupItem
                                key={style.name || index}
                                active={isSelected}
                                onClick={() => handleStyleClick(style)}
                                className="ms-layer-style-item"
                            >
                                {label}
                            </ListGroupItem>
                        );
                    })}
                </ListGroup>
            )}
            <div className="ms-layer-styles-popover-footer">
                <Button
                    bsStyle="primary"
                    onClick={handleSave}
                    disabled={!tempSelectedStyle}
                    className="ms-layer-styles-save-btn"
                >
                    Save
                </Button>
                <Button
                    onClick={handleClose}
                    className="ms-layer-styles-close-btn"
                >
                    Close
                </Button>
            </div>
        </div>
    );

    const triggerButtonRef = useRef(null);

    return (
        <div className="ms-layer-styles-list">
            <InputGroup>
                <FormControl
                    type="text"
                    value={displayLabel}
                    placeholder="Select a style..."
                    readOnly
                    onClick={() => setShowPopover(true)}
                    style={{ cursor: 'pointer' }}
                />
                <InputGroup.Button>
                    <Button
                        ref={triggerButtonRef}
                        onClick={() => setShowPopover(!showPopover)}
                    >
                        <Glyphicon glyph="chevron-down" />
                    </Button>
                </InputGroup.Button>
            </InputGroup>
            <Overlay
                show={showPopover}
                target={() => triggerButtonRef.current}
                placement="bottom"
                rootClose
                onHide={handleClose}
            >
                <Popover
                    id="layer-styles-popover"
                    title="Select Layer Style"
                    className="ms-layer-styles-popover"
                >
                    {popoverContent}
                </Popover>
            </Overlay>
        </div>
    );
};

LayerStylesList.propTypes = {
    layer: PropTypes.object,
    selectedStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onSelect: PropTypes.func
};

LayerStylesList.defaultProps = {
    layer: null,
    selectedStyle: null,
    onSelect: () => {}
};

export default LayerStylesList;

