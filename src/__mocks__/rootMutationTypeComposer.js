import { TypeComposer } from 'graphql-compose';
import {
  GraphQLObjectType,
} from 'graphql';

const RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
  },
});

export const rootMutationTypeComposer = new TypeComposer(RootMutation);
