import {gql} from '@apollo/client';
import {CORE_NODE_FIELDS, IMAGES_PROPERTY} from './fragments';

const GET_PRODUCTS = gql`
    ${CORE_NODE_FIELDS}
    ${IMAGES_PROPERTY}
    query getProducts($workspace: Workspace!, $uuids: [String!]!, $language: String!) {
        response: jcr(workspace: $workspace) {
            workspace
            products: nodesById(uuids: $uuids) {
                ...CoreNodeFields
                url
                pimid:property(name:"pimid"){ value }
                title:displayName(language:$language)
                teaser:property(language:$language,name:"teaser"){ value }
                description:property(language:$language,name:"description"){ value }
                categories: property(language:$language,name:"j:defaultCategory",){ nodes: refNodes { ...CoreNodeFields title:displayName(language:$language)} }
                price:property(language:$language,name:"price"){ value }
                currency:property(language:$language,name:"currency"){ value }
                ...ImagesProperty
            }
        }
    }
`;

export {GET_PRODUCTS};
