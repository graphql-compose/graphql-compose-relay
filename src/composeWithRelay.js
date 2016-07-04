/* @flow */
/* eslint-disable no-use-before-define */

import { TypeComposer } from 'graphql-compose';
import NodeInterface from './nodeInterface';
import MutationMiddleware from './mutationMiddleware';
import { toGlobalId } from './globalId';
import { GraphQLID, GraphQLString } from 'graphql';
import { getNodeFieldConfig } from './nodeFieldConfig';

// all wrapped typeComposers with Relay, stored in this variable
// for futher type resolving via NodeInterface.resolveType method
const typeComposerMap = {};

export function composeWithRelay(
  typeComposer: TypeComposer
): TypeComposer {
  if (typeComposer.getTypeName() === 'RootQuery') {
    typeComposer.addField('node', getNodeFieldConfig(typeComposerMap));
    return typeComposer;
  }

  typeComposerMap[typeComposer.getTypeName()] = typeComposer;

  typeComposer.addFields({
    id: {
      type: GraphQLID,
      description: 'The globally unique ID among all types',
      resolve: (source) => toGlobalId(
        typeComposer.getTypeName(),
        typeComposer.getRecordId(source)
      ),
    },
    _nodeTypeName: {
      type: GraphQLString,
      description: 'Cuurent object type name, for resolving via node interface.',
      resolve: typeComposer.getTypeName(),
    },
  });

  typeComposer.addInterface(NodeInterface);

  typeComposer.getResolvers().forEach(resolver => {
    if (resolver.kind === 'mutation') {
      resolver.addMiddleware(MutationMiddleware);
    }
  });

  return typeComposer;
}
