/* @flow */
/* eslint-disable no-use-before-define */

import { ObjectTypeComposer } from 'graphql-compose';
import wrapMutationResolver from './wrapMutationResolver';
import { toGlobalId } from './globalId';
import { getNodeInterface } from './nodeInterface';
import { getNodeFieldConfig } from './nodeFieldConfig';

// all wrapped typeComposers with Relay, stored in this variable
// for futher type resolving via NodeInterface.resolveType method
export const TypeMapForRelayNode = {};

export function composeWithRelay<TContext>(
  tc: ObjectTypeComposer<any, TContext>
): ObjectTypeComposer<any, TContext> {
  if (!(tc instanceof ObjectTypeComposer)) {
    throw new Error('You should provide ObjectTypeComposer instance to composeWithRelay method');
  }

  const nodeInterface = getNodeInterface(tc.schemaComposer);
  const nodeFieldConfig = getNodeFieldConfig(TypeMapForRelayNode, nodeInterface);

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
      `ObjectTypeComposer(${tc.getTypeName()}) should have recordIdFn. ` +
        'This function returns ID from provided object.'
    );
  }

  const findById = tc.getResolver('findById');
  if (!findById) {
    throw new Error(
      `ObjectTypeComposer(${tc.getTypeName()}) provided to composeWithRelay ` +
        'should have findById resolver.'
    );
  }
  TypeMapForRelayNode[tc.getTypeName()] = {
    resolver: findById,
    tc,
  };

  tc.addFields({
    id: {
      type: 'ID!',
      description: 'The globally unique ID among all types',
      resolve: (source) => toGlobalId(tc.getTypeName(), tc.getRecordId(source)),
    },
  });

  tc.addInterface(nodeInterface);

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
