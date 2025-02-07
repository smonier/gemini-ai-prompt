import React from 'react';
import {StoreCtxProvider} from '../contexts';
import * as PropTypes from 'prop-types';

const init = ({siteUUID}) => {
    const storageKey = `JAHIA_GEMINI_PROMPT_${siteUUID}`;
    /* eslint no-unused-vars: ["error", {"args": "after-used"}] */

    const geminiPrompt =
            localStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey)) : null;

    return {
        storageKey,
        geminiPrompt,
        showPrompt: false
    };
};

const reducer = (state, action) => {
    // Const timeoutTrackerWorkaround = 300;

    switch (action.case) {
        case 'TOGGLE_SHOW_PROMPT': {
            return {
                ...state,
                showPrompt: !state.showPrompt
                // CountNewItem: 0
            };
        }

        default:
            throw new Error(`[STORE] action case '${action.case}' is unknown `);
    }
};

export const Store = ({siteUUID, ...props}) => {
    const [state, dispatch] = React.useReducer(
        reducer,
        {siteUUID},
        init
    );
    return (
        <StoreCtxProvider value={{
            state,
            dispatch
        }}
        >
            {props.children}
        </StoreCtxProvider>
    );
};

Store.propTypes = {
    siteUUID: PropTypes.string.isRequired,
    children: PropTypes.object
};
