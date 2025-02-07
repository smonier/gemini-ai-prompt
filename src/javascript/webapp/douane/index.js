import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from './lib/schema';
import {ContextException} from '../exceptions/ContextException';
import {getGQLWorkspace} from '../misc/utils';

const ajv = new Ajv({useDefaults: true});
addFormats(ajv);

// Note the try catch should be done here and a React component should be returned
const contextValidator = context => {
    const valid = ajv.validate(schema.context, context);
    if (!valid) {
        throw new ContextException({
            message: 'Context configuration object',
            errors: ajv.errors
        });
    }

    context.gqlServerUrl = `${context.baseURL}/modules/graphql`;
    context.filesEndpoint = `${context.baseURL}/files/${context.workspace}`;
    context.workspace = getGQLWorkspace(context.workspace);
    context.gqlVariables = {
        // Id: context.siteUUID,
        language: context.locale,
        workspace: context.workspace
    };

    return context;
};

export {
    contextValidator
};
