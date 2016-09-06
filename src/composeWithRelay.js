/* @flow */
/* eslint-disable no-use-before-define */

import { GraphQLID, GraphQLNonNull } from 'graphql';
import { TypeComposer } from 'graphql-compose';
import NodeInterface from './nodeInterface';
import MutationMiddleware from './mutationMiddleware';
import { toGlobalId } from './globalId';
import { getNodeFieldConfig } from './nodeFieldConfig';

// all wrapped typeComposers with Relay, stored in this variable
// for futher type resolving via NodeInterface.resolveType method
export const typeComposerMap = {};
export const nodeFieldConfig = getNodeFieldConfig(typeComposerMap);

export function composeWithRelay(
  typeComposer: TypeComposer
): TypeComposer {
  if (!(typeComposer instanceof TypeComposer)) {
    throw new Error('You should provide TypeComposer instance to composeWithRelay method');
  }

  if (typeComposer.getTypeName() === 'RootQuery') {
    typeComposer.addField('node', nodeFieldConfig);
    return typeComposer;
  }

  if (typeComposer.getTypeName() === 'RootMutation') {
    // just skip
    return typeComposer;
  }

  if (!typeComposer.hasRecordIdFn()) {
    throw new Error(`TypeComposer(${typeComposer.getTypeName()}) should have recordIdFn. `
                  + 'This function returns ID from provided object.');
  }

  const findById = typeComposer.getResolver('findById');
  if (!findById) {
    throw new Error(`TypeComposer(${typeComposer.getTypeName()}) provided to composeWithRelay `
                  + 'should have findById resolver.');
  }
  typeComposerMap[typeComposer.getTypeName()] = findById;

  typeComposer.addFields({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globally unique ID among all types',
      resolve: (source) => toGlobalId(
        typeComposer.getTypeName(),
        typeComposer.getRecordId(source)
      ),
    },
  });

  typeComposer.addInterface(NodeInterface);

  typeComposer.getResolvers().forEach(resolver => {
    if (resolver.kind === 'mutation') {
      resolver.addMiddleware(new MutationMiddleware(typeComposer, resolver));
    }
  });

  return typeComposer;
}
