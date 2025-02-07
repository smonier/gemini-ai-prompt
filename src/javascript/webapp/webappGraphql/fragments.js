import {gql} from '@apollo/client';

export const CORE_NODE_FIELDS = gql`
    fragment CoreNodeFields on JCRNode {
        workspace
        uuid
        path
        name
        primaryNodeType {
            name
#            supertypes{name}
        }
#        mixinTypes {name}
#        site{
#            workspace
#            uuid
#            displayName
#        }
    }`;

export const IMAGES_PROPERTY = gql`
    ${CORE_NODE_FIELDS}
    fragment ImagesProperty on JCRNode {
        image: property(name:"image",){ node: refNode { ...CoreNodeFields url} }
#        images: property(name:"images",){ nodes: refNodes { ...CoreNodeFields url} }
    }`;
