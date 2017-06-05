/* @flow */

import { TypeComposer, graphql } from 'graphql-compose';

const RootMutation = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: {},
});

export const rootMutationTypeComposer = new TypeComposer(RootMutation);
