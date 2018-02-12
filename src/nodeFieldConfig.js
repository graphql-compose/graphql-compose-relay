/* @flow */
/* eslint-disable no-param-reassign, import/prefer-default-export */
import { getProjectionFromAST } from 'graphql-compose';
import { GraphQLID, GraphQLNonNull, type GraphQLResolveInfo } from 'graphql-compose/lib/graphql';
import type { Resolver, TypeComposer } from 'graphql-compose';
import { fromGlobalId } from './globalId';
import NodeInterface from './nodeInterface';

export type TypeMapForRelayNode = {
  [typeName: string]: { resolver: Resolver, tc: TypeComposer },
};

// this fieldConfig must be set to RootQuery.node field
export function getNodeFieldConfig(typeMapForRelayNode: TypeMapForRelayNode) {
  return {
    description: 'Fetches an object that has globally unique ID among all types',
    type: NodeInterface,
    args: {
      id: {
        type: (new GraphQLNonNull(GraphQLID): $FlowFixMe),
        description: 'The globally unique ID among all types',
      },
    },
    resolve: (
      source: mixed,
      args: { [argName: string]: mixed },
      context: mixed,
      info: GraphQLResolveInfo
    ) => {
      if (!args.id || !(typeof args.id === 'string')) {
        return null;
      }
      const { type, id } = fromGlobalId(args.id);

      if (!typeMapForRelayNode[type]) {
        return null;
      }
      const { tc, resolver: findById } = typeMapForRelayNode[type];
      if (findById && findById.resolve && tc) {
        const graphqlType = tc.getType();

        // set `returnType` to `info` for proper work of `getProjectionFromAST`
        // it will correctly add required fields for `relation` to `projection`
        let projection;
        if (info) {
          // $FlowFixMe
          info.returnType = graphqlType;
          projection = getProjectionFromAST(info);
        } else {
          projection = {};
        }

        // suppose that first argument is argument with id field
        const idArgName = Object.keys(findById.args)[0];
        return findById
          .resolve({
            source,
            args: { [idArgName]: id }, // eg. mongoose has _id fieldname, so should map
            context,
            info,
            projection,
          })
          .then(res => {
            if (!res) return res;
            res.__nodeType = graphqlType;
            return res;
          });
      }

      return null;
    },
  };
}
