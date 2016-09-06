/* @flow */
/* eslint-disable no-param-reassign, import/prefer-default-export */

import { GraphQLID, GraphQLNonNull } from 'graphql';
import { getProjectionFromAST } from 'graphql-compose';
import { fromGlobalId } from './globalId';
import NodeInterface from './nodeInterface';
import type { TypeFindByIdMap, GraphQLResolveInfo } from './definition.js';


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
    resolve: (
      source: mixed,
      args: {[argName: string]: mixed},
      context: mixed,
      info: GraphQLResolveInfo
    ) => {
      if (!args.id || !(typeof args.id === 'string')) {
        return null;
      }
      const { type, id } = fromGlobalId(args.id);

      const findById = typeToFindByIdMap[type];
      if (findById && findById.resolve) {
        const tc = findById.getTypeComposer();
        const graphqlType = tc.getType();

        // set `returnType` to `info` for proper work of `getProjectionFromAST`
        // it will correctly add required fields for `relation` to `projection`
        let projection;
        if (info) {
          info.returnType = graphqlType;
          projection = getProjectionFromAST(info);
        } else {
          projection = {};
        }

        // suppose that first argument is argument with id field
        const idArgName = Object.keys(findById.args)[0];
        return findById.resolve({
          source,
          args: { [idArgName]: id }, // eg. mongoose has _id fieldname, so should map
          context,
          info,
          projection,
        }).then(res => {
          if (!res) return res;
          res.__nodeType = graphqlType;
          return res;
        });
      }

      return null;
    },
  };
}
