/* @flow */

import { schemaComposer } from 'graphql-compose';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql-compose/lib/graphql';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: GraphQLInt,
    },
    name: {
      type: GraphQLString,
    },
    nickname: {
      type: GraphQLString,
    },
  },
});

export const userTC = schemaComposer.createObjectTC(UserType);
userTC.setRecordIdFn(obj => obj.id);

export const findByIdResolver = schemaComposer.createResolver({
  name: 'findById',
  kind: 'query',
  type: UserType,
  args: {
    _id: {
      name: '_id',
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  resolve: resolveParams => {
    const args = resolveParams.args || {};
    if (args._id.toString() === '1') {
      return Promise.resolve({
        id: 1,
        name: 'Pavel',
        nickname: '@nodkz',
      });
    }
    if (args._id.toString() === '2') {
      return Promise.resolve({
        id: 2,
        name: 'Lee',
        nickname: '@leeb',
      });
    }
    return Promise.resolve(null);
  },
});
userTC.setResolver('findById', findByIdResolver);

export const createOneResolver = schemaComposer.createResolver({
  name: 'createOne',
  kind: 'mutation',
  type: new GraphQLObjectType({
    name: 'UserPayload',
    fields: {
      record: {
        type: UserType,
      },
    },
  }),
  args: {
    input: {
      name: 'input',
      type: new GraphQLInputObjectType({
        name: 'UserInput',
        fields: {
          name: {
            type: GraphQLString,
          },
        },
      }),
    },
  },
  resolve: resolveParams => {
    return Promise.resolve({
      recordId: resolveParams.args.input.id,
      record: (resolveParams.args && resolveParams.args.input) || {},
    });
  },
});
userTC.setResolver('createOne', createOneResolver);

export const manyArgsWithInputResolver = schemaComposer.createResolver({
  name: 'manyArgsWithInput',
  kind: 'mutation',
  type: new GraphQLObjectType({
    name: 'UserPayload',
    fields: {
      record: {
        type: UserType,
      },
    },
  }),
  args: {
    input: {
      name: 'input',
      type: new GraphQLInputObjectType({
        name: 'UserInput',
        fields: {
          name: {
            type: GraphQLString,
          },
        },
      }),
    },
    sort: {
      name: 'sort',
      type: GraphQLString,
    },
    limit: {
      name: 'limit',
      type: GraphQLInt,
    },
  },
  resolve: resolveParams => {
    return Promise.resolve({
      recordId: resolveParams.args.input.id,
      record: (resolveParams.args && resolveParams.args.input) || {},
    });
  },
});
userTC.setResolver('manyArgsWithInput', manyArgsWithInputResolver);

export const manyArgsWithoutInputResolver = schemaComposer.createResolver({
  name: 'manyArgsWithoutInput',
  kind: 'mutation',
  type: new GraphQLObjectType({
    name: 'UserPayload',
    fields: {
      record: {
        type: UserType,
      },
    },
  }),
  args: {
    sort: {
      name: 'sort',
      type: GraphQLString,
    },
    limit: {
      name: 'limit',
      type: GraphQLInt,
    },
  },
  resolve: resolveParams => {
    return Promise.resolve({
      recordId: resolveParams.args.input.id,
      record: (resolveParams.args && resolveParams.args.input) || {},
    });
  },
});
userTC.setResolver('manyArgsWithoutInput', manyArgsWithoutInputResolver);
