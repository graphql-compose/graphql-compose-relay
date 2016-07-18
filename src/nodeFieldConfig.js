/* @flow */
/* eslint-disable no-param-reassign */

import {
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import { fromGlobalId } from './globalId';
import NodeInterface from './nodeInterface';
import type { TypeFindByIdMap } from './definition.js';
import { getProjectionFromAST } from 'graphql-compose';

// this fieldConfig must be set to RootQuery.node field
export function getNodeFieldConfig(typeToFindByIdMap: TypeFindByIdMap) {
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

      const findById = typeToFindByIdMap[type];
      if (findById && findById.resolve) {
        // suppose that first argument is argument with id field
        const idArgName = Object.keys(findById.args)[0];
        return findById.resolve({
          source,
          args: { [idArgName]: id }, // eg. mongoose has _id fieldname, so should map
          context,
          info,
          projection: getProjectionFromAST(info),
        }).then(res => {
          if (res) {
            res.__nodeType = findById.getTypeComposer().getType();
          }
          return res;
        });
      }

      return null;
    },
  };
}
