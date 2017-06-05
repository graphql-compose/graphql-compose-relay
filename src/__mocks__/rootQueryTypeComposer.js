/* @flow */

import { TypeComposer, graphql } from 'graphql-compose';

const RootQuery = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {},
});

export const rootQueryTypeComposer = new TypeComposer(RootQuery);
