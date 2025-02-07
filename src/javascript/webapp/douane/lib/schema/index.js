import {workspace} from '../config';
export default {
    context: {
        title: 'context validation schema ',
        description: 'context is an object provided by the page in charge to load the app',
        type: 'object',
        properties: {
            locale: {type: 'string', pattern: '[a-z]{2}(?:_[A-Z]{2})?'}, // "fr" or "fr_FR"
            siteUUID: {type: 'string'}, // "3ff7b68c-1cfa-4d50-8377-03f19db3a985"
            siteName: {type: 'string'}, // "Acme"
            scope: {type: 'string'}, // SiteKey "acme"
            workspace: {
                type: 'string',
                enum: workspace,
                default: workspace[1]// "live"
            },
            gqlServerUrl: {
                type: 'string',
                format: 'uri',
                default: process.env.REACT_APP_JCONTENT_GQL_ENDPOINT || 'http://localhost:8080/modules/graphql'
            },
            contextServerUrl: {
                type: ['string', 'null']
                // Format: 'uri'
            },
            baseURL: {
                type: 'string',
                format: 'uri',
                default: process.env.REACT_APP_JCONTENT_HOST || 'http://localhost:8080'
            },
            geminiToken: {type: 'string'},
            geminiModel: {type: 'string'}
        },
        required: [
            'locale',
            'siteUUID',
            'siteName',
            'scope',
            'gqlServerUrl',
            'baseURL'
        ],
        additionalProperties: false
    }
};
