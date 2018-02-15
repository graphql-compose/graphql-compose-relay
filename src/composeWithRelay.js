/* @flow */
/* eslint-disable no-use-before-define */

import { TypeComposer } from 'graphql-compose';
import { GraphQLID, GraphQLNonNull } from 'graphql-compose/lib/graphql';
import NodeInterface from './nodeInterface';
import wrapMutationResolver from './wrapMutationResolver';
import { toGlobalId } from './globalId';
import { getNodeFieldConfig } from './nodeFieldConfig';

// all wrapped typeComposers with Relay, stored in this variable
// for futher type resolving via NodeInterface.resolveType method
export const TypeMapForRelayNode = {};
export const nodeFieldConfig = getNodeFieldConfig(TypeMapForRelayNode);

export function composeWithRelay<T>(typeComposer: T): T {
  return (_composeWithRelay((typeComposer: any)): any);
}

export function _composeWithRelay(tc: TypeComposer): TypeComposer {
  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('You should provide TypeComposer instance to composeWithRelay method');
  }

  if (tc.getTypeName() === 'Query' || tc.getTypeName() === 'RootQuery') {
    tc.setField('node', nodeFieldConfig);
    return tc;
  }

  if (tc.getTypeName() === 'Mutation' || tc.getTypeName() === 'RootMutation') {
    // just skip
    return tc;
  }

  if (!tc.hasRecordIdFn()) {
    throw new Error(
      `TypeComposer(${tc.getTypeName()}) should have recordIdFn. ` +
        'This function returns ID from provided object.'
    );
  }

  const findById = tc.getResolver('findById');
  if (!findById) {
    throw new Error(
      `TypeComposer(${tc.getTypeName()}) provided to composeWithRelay ` +
        'should have findById resolver.'
    );
  }
  TypeMapForRelayNode[tc.getTypeName()] = {
    resolver: findById,
    tc,
  };

  tc.addFields({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globally unique ID among all types',
      resolve: source => toGlobalId(tc.getTypeName(), tc.getRecordId(source)),
    },
  });

  tc.addInterface(NodeInterface);

  tc.getResolvers().forEach((resolver, resolverName) => {
    if (resolver.kind === 'mutation') {
      const wrappedResolver = wrapMutationResolver(resolver, {
        resolverName,
        rootTypeName: tc.getTypeName(),
      });
      tc.setResolver(resolverName, wrappedResolver);
    }
  });

  return tc;
}
