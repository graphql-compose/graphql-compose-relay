/* @flow */

import { ObjectTypeComposer, schemaComposer } from 'graphql-compose';
import {
  GraphQLInterfaceType,
  GraphQLSchema,
  GraphQLNonNull,
  graphql,
} from 'graphql-compose/lib/graphql';
import { composeWithRelay } from '../composeWithRelay';
import { userTC } from '../__mocks__/userTC';
import { toGlobalId } from '../globalId';

describe('composeWithRelay', () => {
  const userComposer = composeWithRelay(userTC);
  const queryTC = composeWithRelay(schemaComposer.Query);
  const mutationTC = composeWithRelay(schemaComposer.Mutation);

  describe('basic checks', () => {
    it('should return ObjectTypeComposer', () => {
      expect(userComposer).toBeInstanceOf(ObjectTypeComposer);
    });

    it('should throw error if got a not ObjectTypeComposer', () => {
      expect(() => composeWithRelay((123: any))).toThrowError(
        'should provide ObjectTypeComposer instance'
      );
    });

    it('should throw error if ObjectTypeComposer without recordIdFn', () => {
      const tc = userTC.clone('AnotherUserType2');
      delete tc._gqcGetRecordIdFn;
      expect(() => composeWithRelay(tc)).toThrowError('should have recordIdFn');
    });

    it('should thow error if typeComposer does not have findById resolver', () => {
      const tc = userTC.clone('AnotherUserType');
      tc.removeResolver('findById');
      expect(() => composeWithRelay(tc)).toThrowError(
        "does not have resolver with name 'findById'"
      );
    });
  });

  describe('when pass RootQuery type composer', () => {
    it('should add `node` field to RootQuery', () => {
      const nodeField: any = queryTC.getField('node');
      expect(nodeField.type.getType()).toBeInstanceOf(GraphQLInterfaceType);
      expect(nodeField.type.getTypeName()).toBe('Node');
    });
  });

  describe('when pass User type composer (not RootQuery)', () => {
    it('should add or override id field', () => {
      const idField = userComposer.getFieldConfig('id');
      expect(idField.description).toContain('globally unique ID');
    });

    it('should make id field NonNull', () => {
      const idField = userComposer.getFieldConfig('id');
      expect(idField.type).toBeInstanceOf(GraphQLNonNull);
    });

    it('should resolve globalId in `user.id` field', async () => {
      queryTC.setField('user', userTC.getResolver('findById'));
      const schema = new GraphQLSchema({
        query: queryTC.getType(),
      });
      const query = `{
        user(_id: 1) {
          id
          name
        }
      }`;
      const result: any = await graphql(schema, query);
      expect(result.data.user.id).toBe(toGlobalId('User', 1));
      expect(result.data.user.name).toBe('Pavel');
    });

    it('should resolve globalId in `node.id` field', async () => {
      queryTC.setField('user', userTC.getResolver('findById'));
      const schema = new GraphQLSchema({
        query: queryTC.getType(),
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
      const result: any = await graphql(schema, query);
      expect(result.data.node.id).toBe(toGlobalId('User', 1));
      expect(result.data.node.name).toBe('Pavel');
    });

    it('should passthru clientMutationId in mutations', async () => {
      mutationTC.setField('createUser', userTC.getResolver('createOne'));
      const schema = new GraphQLSchema({
        query: queryTC.getType(),
        mutation: mutationTC.getType(),
      });
      const query = `mutation {
        createUser(input: { name: "Ok", clientMutationId: "123" }) {
          record {
            name
          }
          clientMutationId
        }
      }`;
      const result: any = await graphql(schema, query);
      expect(result.data.createUser.record.name).toBe('Ok');
      expect(result.data.createUser.clientMutationId).toBe('123');
    });
  });
});
