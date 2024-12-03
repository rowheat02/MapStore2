/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from "react";
import {connect} from "react-redux";
import {createPlugin} from "../utils/PluginsUtils";
import usersession from "../reducers/usersession";
import {saveUserSessionEpicCreator, autoSaveSessionEpicCreator, loadUserSessionEpicCreator,
    removeUserSessionEpicCreator, stopSaveSessionEpic, reloadOriginalConfigEpic,
    setSessionToDynamicReducers} from "../epics/usersession";
import Message from "../components/I18N/Message";
import {Glyphicon} from "react-bootstrap";
import {toggleControl} from "../actions/controls";
import { removeUserSession, enableAutoSave, setCheckedSessionToClear} from "../actions/usersession";
import ConfirmModal from "../components/resources/modals/ConfirmModal";
import Tree from './session/Tree';
import { getRegisterHandlers } from "../selectors/mapsave";
import { SESSION_IDS as IDS } from "../utils/ConfigUtils";

getRegisterHandlers();

const treeData = [
    {
        id: IDS.EVERYTHING,
        checked: true,
        disabled: false,
        children: [
            {
                id: IDS.MAP,
                label: 'Map',
                checked: true,
                disabled: false,
                children: [
                    {
                        id: IDS.MAP_POS,
                        checked: true,
                        disabled: false
                    },
                    {
                        id: IDS.VISUALIZATION_MODE,
                        checked: true,
                        disabled: false
                    },
                    {
                        id: IDS.LAYERS,
                        checked: true,
                        disabled: false,
                        children: [
                            {
                                id: IDS.ANNOTATIONS_LAYER,
                                checked: true,
                                disabled: false
                            },
                            {
                                id: IDS.MEASUREMENTS_LAYER,
                                checked: true,
                                disabled: false
                            },
                            {
                                id: IDS.BACKGROUND_LAYERS,
                                checked: true,
                                disabled: false
                            },
                            {
                                id: IDS.OTHER_LAYERS,
                                checked: true,
                                disabled: false
                            }
                        ]
                    }
                ]
            },
            {
                id: IDS.CATALOG_SERVICES,
                checked: true,
                disabled: false
            },
            {
                id: IDS.WIDGETS,
                checked: true,
                disabled: false
            },
            {
                id: IDS.SEARCH,
                checked: true,
                disabled: false,
                children: [
                    {
                        id: IDS.TEXT_SEARCH_SERVICES,
                        checked: true,
                        disabled: false
                    },
                    {
                        id: IDS.BOOKMARKS,
                        checked: true,
                        disabled: false
                    }
                ]
            },
            {
                id: IDS.FEATURE_GRID,
                checked: true,
                disabled: false
            },
            {
                id: IDS.OTHER,
                checked: true,
                disabled: false,
                children: [
                    // Additional children can be added here
                    // handled in userEffect below since customSavedConfig are not ready here
                ]
            }
        ]
    }
];


const ResetUserSession = connect((state) => ({
    enabled: state?.controls?.resetUserSession?.enabled ?? false,
    checks: state?.usersession.checkedSessionToClear
}), {
    setAutoSave: enableAutoSave,
    onClose: toggleControl.bind(null, 'resetUserSession', null),
    onConfirm: (checks) => removeUserSession(checks),
    onTreeUpdate: (tree) => setCheckedSessionToClear(tree)
})(({ enabled = false, onClose, onConfirm, setAutoSave = () => {}, onTreeUpdate, checks}) => {
    const [trees, setTrees] = useState(treeData);

    const confirm = () => {
        onClose();
        onConfirm(checks);
    };
    useEffect(() => {
        setAutoSave(true);
        // Specify how to clean up after this effect:
        return function cleanup() {
            setAutoSave(false);
        };
    }, []);

    useEffect(() =>{
        if (!enabled) return;
        // console.log(getRegisterHandlers(), 'Hello getRegisterHandlers');
        const tree = [...trees];
        // update the children of first element which is  `everything`
        tree[0].children.forEach((child) => {
            if (child.id === IDS.OTHER) {
                child.children = [
                    ...getRegisterHandlers().map((key) => {
                        return {
                            id: key,
                            label: key,
                            checked: true
                        };
                    }),
                    {
                        id: IDS.USER_PLUGINS,
                        checked: true,
                        disabled: false
                    }
                ];
            }
        });
        setTrees(tree);
    // `getRegisterHandlers` may not give all handlers at the load time so updating after dialog open
    }, [enabled]);
    // TODO: implement changes management
    return (<ConfirmModal onClose={onClose}
        onConfirm={() => confirm(checks)} show={enabled} buttonSize="large">

        <div style={{maxHeight: 400, overflowY: 'scroll'}}>
            <Message msgId="userSession.confirmRemove"/>
            <Message msgId={`userSession.sessionLabels.${IDS.EVERYTHING}`} />
            {/* Select what you want to reset: */}
            <Tree data={trees} onTreeUpdate={(updatedTree)=>{
                // console.log(updatedTree, 'setSelected');
                onTreeUpdate(updatedTree);
            }}/>
        </div>
    </ConfirmModal>);
});

const hasSession = (state) => state?.usersession?.session;

const saveUserSessionEpic = saveUserSessionEpicCreator();
const autoSaveSessionEpic = autoSaveSessionEpicCreator();
const loadUserSessionEpic = loadUserSessionEpicCreator();
const removeUserSessionEpic = removeUserSessionEpicCreator();

/**
 * `UserSession` plugin allows the user to automatically save the current map and restore it on the second access to the same map/context, without the necessity to save.
 *
 * User sessions persistence can be configured to use different storages. The default implementation is based on `localStorage`,
 * so the session is saved on the user's browser.
 *
 * It is also possible to save the session on a database, so it can be shared on different browsers / devices.
 *
 * The user session workflow works this way:
 *
 * * a session is identified by the combination of the current map and user identifiers (so that a session exists for each user / map combination)
 * * a session is loaded from the store and if it exists, it overrides the standard map configuration partially; by default current map centering and zoom are overridden
 * * the session is automatically saved at a configurable interval
 * * an item in the `BurgerMenu` allows to restore the session to the default map configuration
 *
 * Since user session handling works very low level, its basic features needs to be configured at the `localConfig.json`, globally, in the dedicated `userSession` object.
 * Then including or not including the plugin `UserSession` in your application context will determine the possibility to save (and so restore) the session.
 *
 * The `userSession` object in `localConfig.json` can be configured with the following properties:
 *
 * * `enabled`: 'false' / 'true'. Enables the functionality at global level.
 * * `saveFrequency`: interval (in milliseconds) between saves
 * * `provider`: the name of the storage provider to use. The options are:
 *     * `browser`: (default) localStorage based
 *     * `server`: database storage (based on MapStore backend services)
 *     * `serverbackup`: combination of browser and server, with a configurable backupFrequency interval, so that browser saving it's more frequent than server one
 * * `contextOnly`: true / false, when true each MapStore context will share only one session, if false each context sub-map will have its own session
 *
 * You can also implement your own, by defining its API and registering it on the Providers object:
 *
 * ```javascript
 * import {Providers} from "api/usersession"
 * Providers.mystorage = {
 *     getSession: ...,
 *     writeSession: ...,
 *     removeSession: ...
 * }
 * ```
 * @memberof plugins
 * @name UserSession
 * @class
 */
export default createPlugin('UserSession', {
    component: ResetUserSession,
    containers: {
        BurgerMenu: {
            name: 'UserSession',
            position: 1500,
            text: <Message msgId="userSession.remove" />,
            icon: <Glyphicon glyph="trash" />,
            action: toggleControl.bind(null, 'resetUserSession', null),
            tooltip: <Message msgId="userSession.tooltip" />,
            selector: (state) => {
                return { style: hasSession(state) ? {} : {display: "none"} };
            },
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: 'UserSession',
            position: 1500,
            icon: <Glyphicon glyph="trash" />,
            text: <Message msgId="userSession.remove" />,
            action: toggleControl.bind(null, 'resetUserSession', null),
            tooltip: "userSession.tooltip",
            selector: (state) => {
                return { style: hasSession(state) ? {} : {display: "none"} };
            },
            priority: 1,
            doNotHide: true
        }
    },
    reducers: {
        usersession
    },
    epics: {
        saveUserSessionEpic, autoSaveSessionEpic, stopSaveSessionEpic, loadUserSessionEpic, removeUserSessionEpic, reloadOriginalConfigEpic, setSessionToDynamicReducers
    }
});
