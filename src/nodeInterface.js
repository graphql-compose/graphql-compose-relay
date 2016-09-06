/* @flow */

import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLInterfaceType,
} from 'graphql';


const NodeInterface = new GraphQLInterfaceType({
  name: 'Node',
  description: 'An object, that can be fetched by the globally unique ID among all types.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globally unique ID among all types.',
    },
  }),
  resolveType: (payload) => {
    // `payload.__nodeType` was added to payload via nodeFieldConfig.resolve
    // $FlowFixMe
    return payload.__nodeType ? payload.__nodeType : null;
  },
});

export default NodeInterface;
