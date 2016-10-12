import {
  GraphQLObjectType,
} from 'graphql';
import { TypeComposer } from 'graphql-compose';

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
  },
});

export const rootMutationTypeComposer = new TypeComposer(RootMutation);
