import { TypeComposer, Resolver } from 'graphql-compose';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql';

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

export const userTypeComposer = new TypeComposer(UserType);
userTypeComposer.setRecordIdFn(obj => obj.id);

export const findByIdResolver = new Resolver(userTypeComposer, {
  name: 'findById',
  kind: 'query',
  outputType: UserType,
  args: {
    _id: {
      name: '_id',
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  resolve: (resolveParams) => {
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

export const createOneResolver = new Resolver(userTypeComposer, {
  name: 'createOne',
  kind: 'mutation',
  outputType: new GraphQLObjectType({
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
  resolve: (resolveParams) => {
    return Promise.resolve({
      recordId: resolveParams.args.input.id,
      record: resolveParams.args && resolveParams.args.input || {},
    });
  },
});

export const manyArgsWithInputResolver = new Resolver(userTypeComposer, {
  name: 'manyArgsWithInput',
  kind: 'mutation',
  outputType: new GraphQLObjectType({
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
  resolve: (resolveParams) => {
    return Promise.resolve({
      recordId: resolveParams.args.input.id,
      record: resolveParams.args && resolveParams.args.input || {},
    });
  },
});

export const manyArgsWithoutInputResolver = new Resolver(userTypeComposer, {
  name: 'manyArgsWithoutInput',
  kind: 'mutation',
  outputType: new GraphQLObjectType({
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
  resolve: (resolveParams) => {
    return Promise.resolve({
      recordId: resolveParams.args.input.id,
      record: resolveParams.args && resolveParams.args.input || {},
    });
  },
});
