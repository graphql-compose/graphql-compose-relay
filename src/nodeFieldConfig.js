/* @flow */
/* eslint-disable no-param-reassign */

import {
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import { fromGlobalId } from './globalId';
import NodeInterface from './nodeInterface';
import type { TypeComposerMap } from './definition.js';

// this fieldConfig must be set to RootQuery.node field
export function getNodeFieldConfig(typeComposerMap: TypeComposerMap) {
  return {
    description: 'Fetches an object that has globally unique ID among all types',
    type: NodeInterface,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The globally unique ID among all types',
      },
    },
    resolve: (source: mixed, args: {[argName: string]: mixed}, context: mixed, info: mixed) => {
      if (!args.id || !(typeof args.id === 'string')) {
        return null;
      }
      const { type, id } = fromGlobalId(args.id);

      const typeComposer = typeComposerMap[type];
      if (!typeComposer) {
        return null;
      }

      const resolver = typeComposer.getResolver('findById');
      if (resolver && resolver.resolve) {
        // suppose that first argument is argument with id field
        const idArgName = Object.keys(resolver.args)[0];

        return resolver.resolve({
          source,
          args: { [idArgName]: id },
          context,
          info,
        });
      }

      return null;
    },
  };
}
