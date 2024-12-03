/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    USER_SESSION_SAVED, USER_SESSION_LOADING, USER_SESSION_LOADED, USER_SESSION_REMOVED, ENABLE_AUTO_SAVE,
    SAVE_MAP_CONFIG, SET_CHECKED_SESSION_TO_CLEAR } from "../actions/usersession";

// move to utils
function getCheckedIds(nodes) {
    let ids = [];

    // Iterate over each node in the list
    nodes.forEach(node => {
        // If the node is checked, add its ID to the result array
        if (node.checked) {
            ids.push(node.id);
        }

        // If the node has children, recursively check them
        if (node.children) {
            ids = ids.concat(getCheckedIds(node.children));
        }
    });

    return ids;
}
// const MAP_PARTS= {
//     MAP_POS: "__standard__map_position"

// }
// const DEFAULT_SAVE = Object.keys(MAP_PARTS)
/**
 * Handles state for userSession
 * ```javascript
 * {
 *    autoSave: true|false // enable/disable auto save
 *    id: id of the session
 *    session: the session loaded/saved
 *    config: the config of the map
 *    loading: {} // an object containing loading state
 * }
 * ```
 * @name usersession
 * @memberof reducers
 */
export default (state = {
    excludeFromSave: ["map_position"],
    autoSave: false,
    sessionsToClear: [
        {
            id: 1,
            label: 'Everything',
            checked: true,
            children: [
                {
                    id: 2,
                    label: 'Map',
                    checked: true,
                    children: [
                        {
                            // id: MAP_PARTS.MAP_POS,
                            id: 2,
                            label: 'Zoom and center'
                            // checked: !isNotContainedIn(excludeFromSave)
                        },
                        {
                            id: 4,
                            label: 'Visualization Mode (3D/2D)',
                            checked: true
                        },
                        {
                            id: 5,
                            label: 'Layers',
                            checked: true,
                            children: [
                                {
                                    id: 6,
                                    label: 'Annotations layer',
                                    checked: true
                                },
                                {
                                    id: 7,
                                    label: 'Measurements layer',
                                    checked: true
                                },
                                {
                                    id: 78,
                                    label: 'Background layers',
                                    checked: true
                                },
                                {
                                    id: 8,
                                    label: 'Other layers',
                                    checked: true
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 12,
                    label: 'Catalog Services',
                    checked: true
                },
                {
                    id: 13,
                    label: 'Widgets',
                    checked: true
                },
                {
                    id: 14,
                    label: 'Search',
                    checked: true,
                    children: [
                        {
                            id: 15,
                            label: 'Services',
                            checked: true
                        },
                        {
                            id: 16,
                            label: 'Bookmarks',
                            checked: true
                        }
                    ]
                },
                {
                    id: 22,
                    label: 'Feature Grid',
                    checked: true
                },
                {
                    id: 17,
                    label: 'Other',
                    checked: true,
                    children: [
                        // getRegisterHandlers().map((key) => ({
                        //     id: key,
                        //     label: getLabelForHandler(key), // return check if label is present --> <Message msgId=`${userSession.tree.labels.${key}`}/> if not fallback to use the key.
                        //     checked: true
                        // }))
                    ]
                }

            ]
        }
    ],
    checkedSessionToClear: []
}, action) => {
    switch (action.type) {
    case ENABLE_AUTO_SAVE: {
        return {
            ...state,
            autoSave: action.enabled
        };
    }
    case USER_SESSION_SAVED:
        return {
            ...state,
            id: action.id,
            session: action.session
        };
    case USER_SESSION_LOADED:
        return {
            ...state,
            id: action.id,
            session: action.session
        };
    case USER_SESSION_LOADING:
        return {
            ...state,
            loading: {
                name: action.name,
                value: action.value
            }
        };
    case USER_SESSION_REMOVED:
        return {
            ...state,
            id: undefined,
            session: action.newSession
        };
    case SAVE_MAP_CONFIG:
        return {
            ...state,
            config: action.config
        };
    case SET_CHECKED_SESSION_TO_CLEAR:

        return {
            ...state,
            checkedSessionToClear: getCheckedIds(action.tree)
        };
    default:
        return state;
    }
};
