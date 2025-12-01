/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { mapPropsStream } from 'recompose';
import Rx from 'rxjs';
import isEqual from 'lodash/isEqual';
import {
    createDefaultSelections,
    createNewFilter,
    createEmptyFilterData
} from '../utils/filterBuilderDefaults';

const ensureFilterShape = (filter = {}) => ({
    ...filter,
    data: filter.data || createEmptyFilterData(),
    layout: filter.layout || {},
    actions: filter.actions || {}
});

const createFallbackFilter = () => ensureFilterShape(createNewFilter(0));

/**
 * Enhancer that handles filter initialization:
 * - Creates fallback filter if filters array is empty
 * - Initializes selections if empty
 * - Sets default widget title
 */
export const withFilterInitialization = mapPropsStream(props$ =>
    props$.distinctUntilChanged((prev, next) => {
        const prevData = prev.data || {};
        const nextData = next.data || {};
        return prev.enabled === next.enabled &&
            prevData.widgetType === nextData.widgetType &&
            isEqual(prevData.filters, nextData.filters) &&
            isEqual(prevData.selections, nextData.selections) &&
            prevData.title === nextData.title;
    }).switchMap(({ enabled, data: editorData = {}, onChange, ...props }) => {
        const {
            widgetType,
            filters = [],
            selections = {},
            title: widgetTitle
        } = editorData || {};

        if (!enabled || widgetType !== 'filter') {
            return Rx.Observable.of({ enabled, data: editorData, onChange, ...props });
        }

        // Create fallback filter if filters array is empty
        if (!filters.length) {
            const fallbackFilter = createFallbackFilter();
            if (onChange) {
                onChange('filters', [fallbackFilter]);
                onChange('selectedFilterId', fallbackFilter.id);
                onChange('selections', { [fallbackFilter.id]: [] });
            }
            return Rx.Observable.of({ enabled, data: editorData, onChange, ...props });
        }

        // Initialize selections if empty
        if (!Object.keys(selections || {}).length && filters.length) {
            if (onChange) {
                onChange('selections', createDefaultSelections(filters));
            }
        }

        // Set default widget title
        if (!widgetTitle && onChange) {
            onChange('title', 'Filter widget');
        }

        return Rx.Observable.of({ enabled, data: editorData, onChange, ...props });
    })
);

/**
 * Enhancer that ensures all filters have proper shape (data, layout, actions)
 */
export const withFilterShapeValidation = mapPropsStream(props$ =>
    props$.distinctUntilChanged((prev, next) => {
        const prevData = prev.data || {};
        const nextData = next.data || {};
        return isEqual(prevData.filters, nextData.filters);
    }).switchMap(({ data: editorData = {}, onChange, ...props }) => {
        const { filters = [] } = editorData || {};
        if (!filters.length) {
            return Rx.Observable.of({ data: editorData, onChange, ...props });
        }

        const nextFilters = filters.map(ensureFilterShape);
        const needsUpdate = !isEqual(nextFilters, filters);

        if (needsUpdate && onChange) {
            onChange('filters', nextFilters);
        }

        return Rx.Observable.of({ data: editorData, onChange, ...props });
    })
);

