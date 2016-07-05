import { expect } from 'chai';
import { TypeComposer, InputTypeComposer } from 'graphql-compose';
import { composeWithRelay } from '../composeWithRelay';
import { userTypeComposer } from '../__mocks__/userTypeComposer';
import { toGlobalId } from '../globalId';
import {
  GraphQLString,
  GraphQLID,
} from 'graphql';

describe('MutationMiddleware', () => {
  composeWithRelay(userTypeComposer);
  const fieldConfig = userTypeComposer.getResolver('createOne').getFieldConfig();

  describe('args', () => {
    it('should add `clientMutationId` field to args.input', () => {
      const itc = new InputTypeComposer(fieldConfig.args.input.type);
      expect(itc.hasField('clientMutationId')).to.be.true;
      expect(itc.getFieldType('clientMutationId')).equal(GraphQLString);
    });
  });

  describe('outputType', () => {
    it('should add `clientMutationId` field to payload', () => {
      const tc = new TypeComposer(fieldConfig.type);
      expect(tc.hasField('clientMutationId')).to.be.true;
      expect(tc.getFieldType('clientMutationId')).equal(GraphQLString);
    });

    it('should add `nodeId` field to payload', () => {
      const tc = new TypeComposer(fieldConfig.type);
      expect(tc.hasField('nodeId')).to.be.true;
      expect(tc.getFieldType('nodeId')).equal(GraphQLID);
    });
  });

  describe('resolve', () => {
    it('should passthru `clientMutationId`', async () => {
      const result = await fieldConfig.resolve(
        {},
        { input: { clientMutationId: '333' } },
      );
      expect(result).property('clientMutationId').equal('333');
    });

    it('should return `nodeId` with globalId', async () => {
      const result = await fieldConfig.resolve(
        {},
        { input: { id: 'newRecord' } },
      );
      expect(result).property('nodeId').equal(toGlobalId('User', 'newRecord'));
    });
  });
});
