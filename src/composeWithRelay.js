/* @flow */
/* eslint-disable no-use-before-define */

import { type TypeComposer, _ProtoTypeComposer } from 'graphql-compose';
import { GraphQLID, GraphQLNonNull } from 'graphql-compose/lib/graphql';
import NodeInterface from './nodeInterface';
import wrapMutationResolver from './wrapMutationResolver';
import { toGlobalId } from './globalId';
import { getNodeFieldConfig } from './nodeFieldConfig';

// all wrapped typeComposers with Relay, stored in this variable
// for futher type resolving via NodeInterface.resolveType method
export const TypeMapForRelayNode = {};
export const nodeFieldConfig = getNodeFieldConfig(TypeMapForRelayNode);

export function composeWithRelay(typeComposer: TypeComposer): TypeComposer {
  if (!(typeComposer instanceof _ProtoTypeComposer)) {
    throw new Error('You should provide TypeComposer instance to composeWithRelay method');
  }

  if (typeComposer.getTypeName() === 'Query' || typeComposer.getTypeName() === 'RootQuery') {
    typeComposer.setField('node', nodeFieldConfig);
    return typeComposer;
  }

  if (typeComposer.getTypeName() === 'Mutation' || typeComposer.getTypeName() === 'RootMutation') {
    // just skip
    return typeComposer;
  }

  if (!typeComposer.hasRecordIdFn()) {
    throw new Error(
      `TypeComposer(${typeComposer.getTypeName()}) should have recordIdFn. ` +
        'This function returns ID from provided object.'
    );
  }

  const findById = typeComposer.getResolver('findById');
  if (!findById) {
    throw new Error(
      `TypeComposer(${typeComposer.getTypeName()}) provided to composeWithRelay ` +
        'should have findById resolver.'
    );
  }
  TypeMapForRelayNode[typeComposer.getTypeName()] = {
    resolver: findById,
    tc: typeComposer,
  };

  typeComposer.addFields({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globally unique ID among all types',
      resolve: source => toGlobalId(typeComposer.getTypeName(), typeComposer.getRecordId(source)),
    },
  });

  typeComposer.addInterface(NodeInterface);

  typeComposer.getResolvers().forEach((resolver, resolverName) => {
    if (resolver.kind === 'mutation') {
      const wrappedResolver = wrapMutationResolver(resolver, {
        resolverName,
        rootTypeName: typeComposer.getTypeName(),
      });
      typeComposer.setResolver(resolverName, wrappedResolver);
    }
  });

  return typeComposer;
}
