/* @flow */

import { TypeComposer } from 'graphql-compose';
import {
  GraphQLInterfaceType,
  GraphQLSchema,
  GraphQLNonNull,
  graphql,
} from 'graphql-compose/lib/graphql';
import { composeWithRelay } from '../composeWithRelay';
import { userTypeComposer } from '../__mocks__/userTypeComposer';
import { rootQueryTypeComposer } from '../__mocks__/rootQueryTypeComposer';
import { rootMutationTypeComposer } from '../__mocks__/rootMutationTypeComposer';
import { toGlobalId } from '../globalId';

describe('composeWithRelay', () => {
  const userComposer = composeWithRelay(userTypeComposer);
  const rootQueryComposer = composeWithRelay(rootQueryTypeComposer);
  const rootMutationComposer = composeWithRelay(rootMutationTypeComposer);

  describe('basic checks', () => {
    it('should return TypeComposer', () => {
      expect(userComposer).toBeInstanceOf(TypeComposer);
    });

    it('should throw error if got a not TypeComposer', () => {
      // $FlowFixMe
      expect(() => composeWithRelay(123)).toThrowError('should provide TypeComposer instance');
    });

    it('should throw error if TypeComposer without recordIdFn', () => {
      const tc = userTypeComposer.clone('AnotherUserType2');
      delete tc.gqType._gqcGetRecordIdFn;
      expect(() => composeWithRelay(tc)).toThrowError('should have recordIdFn');
    });

    it('should thow error if typeComposer does not have findById resolver', () => {
      const tc = userTypeComposer.clone('AnotherUserType');
      tc.removeResolver('findById');
      expect(() => composeWithRelay(tc)).toThrowError(
        "does not have resolver with name 'findById'"
      );
    });
  });

  describe('when pass RootQuery type composer', () => {
    it('should add `node` field to RootQuery', () => {
      const nodeField = rootQueryComposer.getField('node');
      expect(nodeField.type).toBeInstanceOf(GraphQLInterfaceType);
      // $FlowFixMe
      expect(nodeField.type.name).toBe('Node');
    });
  });

  describe('when pass User type composer (not RootQuery)', () => {
    it('should add or override id field', () => {
      const idField = userComposer.getField('id');
      expect(idField.description).toContain('globally unique ID');
    });

    it('should make id field NonNull', () => {
      const idField = userComposer.getField('id');
      expect(idField.type).toBeInstanceOf(GraphQLNonNull);
    });

    it('should resolve globalId in `user.id` field', async () => {
      rootQueryTypeComposer.setField(
        'user',
        userTypeComposer.getResolver('findById').getFieldConfig()
      );
      const schema = new GraphQLSchema({
        query: rootQueryTypeComposer.getType(),
      });
      const query = `{
        user(_id: 1) {
          id
          name
        }
      }`;
      const result = await graphql(schema, query);
      // $FlowFixMe
      expect(result.data.user.id).toBe(toGlobalId('User', 1));
      // $FlowFixMe
      expect(result.data.user.name).toBe('Pavel');
    });

    it('should resolve globalId in `node.id` field', async () => {
      rootQueryTypeComposer.setField(
        'user',
        userTypeComposer.getResolver('findById').getFieldConfig()
      );
      const schema = new GraphQLSchema({
        query: rootQueryTypeComposer.getType(),
      });
      const query = `{
        node(id: "${toGlobalId('User', 1)}") {
          ...user
        }
      }
      fragment user on User {
        id
        name
      }`;
      const result = await graphql(schema, query);
      // $FlowFixMe
      expect(result.data.node.id).toBe(toGlobalId('User', 1));
      // $FlowFixMe
      expect(result.data.node.name).toBe('Pavel');
    });

    it('should passthru clientMutationId in mutations', async () => {
      rootMutationComposer.setField(
        'createUser',
        userTypeComposer.getResolver('createOne').getFieldConfig()
      );
      const schema = new GraphQLSchema({
        query: rootQueryTypeComposer.getType(),
        mutation: rootMutationComposer.getType(),
      });
      const query = `mutation {
        createUser(input: { name: "Ok", clientMutationId: "123" }) {
          record {
            name
          }
          clientMutationId
        }
      }`;
      const result = await graphql(schema, query);
      // $FlowFixMe
      expect(result.data.createUser.record.name).toBe('Ok');
      // $FlowFixMe
      expect(result.data.createUser.clientMutationId).toBe('123');
    });
  });
});
