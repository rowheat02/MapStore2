/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { get } from 'lodash';
import {
    INTERACTION_EVENT,
    EXECUTE_TARGET_OPERATION,
    executeTargetOperation as executeTargetOperationAction
} from '../actions/interactions';
import { updateWidgetProperty } from '../actions/widgets';

/**
 * Helper: Extract widget ID from node path
 */
function extractWidgetIdFromNodePath(nodePath) {
    if (!nodePath) return null;

    // Match patterns like widgets["id"] or widgets['id']
    const match = nodePath.match(/^widgets\[["']([^"']+)["']\]/);
    return match ? match[1] : null;
}

/**
 * Epic to handle interaction events
 * Queries Redux state for matching interactions and dispatches target operations
 */
export const handleInteractionEvent = (action$, store) => action$
    .ofType(INTERACTION_EVENT)
    .mergeMap(({ payload }) => {
        
        const state = store.getState();
        const interactions = get(state, 'interactions.interactions', []);

        // Find matching interactions
        const matchingInteractions = interactions.filter(interaction => {
            // Check if interaction is enabled
            if (!interaction.enabled) {
                return false;
            }

            // Match by source node path
            if (interaction.source.nodePath !== payload.sourceNodePath) {
                return false;
            }

            // Match by event type
            if (interaction.source.eventType !== payload.eventType) {
                return false;
            }

            return true;
        });

        if (matchingInteractions.length === 0) {
            // eslint-disable-next-line no-console
            console.log('Interaction -> No plugged targets found for event', {
                eventType: payload.eventType,
                sourceNodePath: payload.sourceNodePath
            });
            return Rx.Observable.empty();
        }

        // eslint-disable-next-line no-console
        console.log('Interaction -> Plugged targets found', {
            count: matchingInteractions.length,
            targets: matchingInteractions.map(i => ({
                targetNodePath: i.target.nodePath,
                target: i.target.target,
                mode: i.target.mode
            }))
        });

        // Dispatch target operations for each matching interaction
        const actions = matchingInteractions.map(interaction => {
            return executeTargetOperationAction(interaction, payload);
        });

        return Rx.Observable.from(actions);
    });

/**
 * Epic to handle target operation execution
 * This is where the actual widget updates happen
 */
export const handleTargetOperation = (action$, store) => action$
    .ofType(EXECUTE_TARGET_OPERATION)
    .map(({ interaction, eventPayload }) => {
        const { target } = interaction;
        const state = store.getState();

        // Extract target widget ID from node path
        const targetId = extractWidgetIdFromNodePath(target.nodePath);

        if (!targetId) {
            // eslint-disable-next-line no-console
            console.warn(`Interaction -> Target widget ID not found for node path: ${target.nodePath}`);
            return { type: 'TARGET_OPERATION_SKIPPED', reason: 'target_not_found' };
        }

        // Verify target widget exists
        const widgets = get(state, 'widgets.containers.floating.widgets') || [];
        const targetWidget = widgets.find(w => w.id === targetId);

        if (!targetWidget) {
            // eslint-disable-next-line no-console
            console.warn(`Interaction -> Target widget not found: ${targetId}`);
            return { type: 'TARGET_OPERATION_SKIPPED', reason: 'widget_not_found' };
        }

        // eslint-disable-next-line no-console
        console.log('Interaction -> Target execution on this node path', {
            targetNodePath: target.nodePath,
            targetWidgetId: targetId,
            targetProperty: target.target,
            mode: target.mode || 'upsert',
            filterData: eventPayload.data
        });

        // Apply filter to widget property
        return updateWidgetProperty(
            targetId,
            target.target,
            eventPayload.data,
            target.mode || 'upsert'
        );
    });

export default {
    handleInteractionEvent,
    handleTargetOperation
};
