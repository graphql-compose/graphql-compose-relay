import { expect } from 'chai';
import {
  graphql,
  GraphQLInterfaceType,
  GraphQLSchema,
  GraphQLNonNull,
} from 'graphql';
import { TypeComposer } from 'graphql-compose';
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
      expect(userComposer).instanceof(TypeComposer);
    });

    it('should throw error if got a not TypeComposer', () => {
      expect(() => composeWithRelay(123)).to.throw('should provide TypeComposer instance');
    });

    it('should throw error if TypeComposer without recordIdFn', () => {
      const tc = userTypeComposer.clone('AnotherUserType2');
      delete tc.gqType._gqcGetRecordIdFn;
      expect(() => composeWithRelay(tc)).to.throw('should have recordIdFn');
    });

    it('should thow error if typeComposer does not have findById resolver', () => {
      const tc = userTypeComposer.clone('AnotherUserType');
      tc.removeResolver('findById');
      expect(() => composeWithRelay(tc)).to.throw('should have findById resolver');
    });
  });

  describe('when pass RootQuery type composer', () => {
    it('should add `node` field to RootQuery', () => {
      const nodeField = rootQueryComposer.getField('node');
      expect(nodeField).to.be.ok;
      expect(nodeField).property('type').instanceof(GraphQLInterfaceType);
      expect(nodeField).deep.property('type.name').to.equal('Node');
    });
  });

  describe('when pass User type composer (not RootQuery)', () => {
    it('should add or override id field', () => {
      const idField = userComposer.getField('id');
      expect(idField.description).to.contain('globally unique ID');
    });

    it('should make id field NonNull', () => {
      const idField = userComposer.getField('id');
      expect(idField.type).instanceof(GraphQLNonNull);
    });

    it('should resolve globalId in `user.id` field', async () => {
      rootQueryTypeComposer.addField('user',
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
      expect(result).deep.property('data.user.id').equal(toGlobalId('User', 1));
      expect(result).deep.property('data.user.name').equal('Pavel');
    });

    it('should resolve globalId in `node.id` field', async () => {
      rootQueryTypeComposer.addField('user',
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
      expect(result).deep.property('data.node.id').equal(toGlobalId('User', 1));
      expect(result).deep.property('data.node.name').equal('Pavel');
    });

    it('should passthru clientMutationId in mutations', async () => {
      rootMutationComposer.addField('createUser',
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
      expect(result).deep.property('data.createUser.record.name')
        .equal('Ok');
      expect(result).deep.property('data.createUser.clientMutationId')
        .equal('123');
    });
  });
});
