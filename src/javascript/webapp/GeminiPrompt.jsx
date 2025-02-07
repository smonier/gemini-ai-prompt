import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import {ApolloProvider} from '@apollo/client';
import {CxsCtxProvider} from './unomi/cxs';

import {JahiaCtxProvider} from './contexts';
import AjvError from './components/Error/Ajv';
import {contextValidator} from './douane';

// Import {StylesProvider, createGenerateClassName} from '@material-ui/core/styles';
// import {getRandomString} from './ShoppingCart/misc/utils';

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {appLanguageBundle} from './i18n/resources';
import {syncTracker} from './unomi/trackerWem';
import {getClient} from './webappGraphql';
import {Store} from './store';

// Const generateClassName = createGenerateClassName({
//     // DisableGlobal:true,
//     seed: getRandomString(8, 'aA')
// });

const render = async (target, context) => {
    try {
        context = contextValidator(context);
        const {
            workspace,
            locale,
            scope,
            gqlServerUrl,
            contextServerUrl,
            siteUUID,
            geminiToken,
            geminiModel
        } = context;

        const client = getClient(gqlServerUrl);

        i18n.use(initReactI18next) // Passes i18n down to react-i18next
            .init({
                resources: appLanguageBundle,
                lng: locale,
                fallbackLng: 'en',
                interpolation: {
                    escapeValue: false // React already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
                }
            });

        if (workspace === 'LIVE' && !window.wem && contextServerUrl) {
            if (!window.digitalData) {
                window.digitalData = {
                    _webapp: true,
                    scope,
                    site: {
                        siteInfo: {
                            siteID: scope
                        }
                    },
                    page: {
                        pageInfo: {
                            pageID: 'WebApp-Jahia-GeminiPrompt',
                            pageName: document.title,
                            pagePath: document.location.pathname,
                            destinationURL: document.location.origin + document.location.pathname,
                            language: locale,
                            categories: [],
                            tags: []
                        }
                    },
                    events: [],
                    // LoadCallbacks:[{
                    //     priority:5,
                    //     name:'Unomi tracker context loaded',
                    //     execute: () => {
                    //         window.cxs = window.wem.getLoadedContext();
                    //     }
                    // }],
                    wemInitConfig: {
                        contextServerUrl,
                        timeoutInMilliseconds: '1500',
                        // ContextServerCookieName: "context-profile-id",
                        activateWem: true,
                        // TrackerProfileIdCookieName: "wem-profile-id",
                        trackerSessionIdCookieName: 'wem-session-id'
                    }
                };
            }

            window.wem = syncTracker();
        }

        const root = ReactDOM.createRoot(document.getElementById(target));

        root.render(
            <React.StrictMode>
                <JahiaCtxProvider value={{
                    workspace,
                    locale,
                    scope,
                    contextServerUrl,
                    geminiModel,
                    geminiToken
                }}
                >
                    <Store siteUUID={siteUUID}>
                        <ApolloProvider client={client}>
                            <CxsCtxProvider>
                                <App/>
                            </CxsCtxProvider>
                        </ApolloProvider>
                    </Store>
                </JahiaCtxProvider>
            </React.StrictMode>
        );
    } catch (e) {
        console.error('error : ', e);
        // Note: create a generic error handler
        return (
            <AjvError
                item={e.message}
                errors={e.errors}
            />
        );
    }
};

window.jahiaGeminiPrompt = render;
