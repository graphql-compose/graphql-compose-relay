import { expect } from 'chai';
import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  getNamedType,
} from 'graphql';
import { TypeComposer, InputTypeComposer } from 'graphql-compose';
import { composeWithRelay } from '../composeWithRelay';
import { userTypeComposer } from '../__mocks__/userTypeComposer';
import { toGlobalId } from '../globalId';


describe('wrapMutationResolver', () => {
  composeWithRelay(userTypeComposer);
  const fieldConfig = userTypeComposer.getResolver('createOne').getFieldConfig();
  const fieldConfigManyArgsWithInput
    = userTypeComposer.getResolver('manyArgsWithInput').getFieldConfig();
  const fieldConfigManyArgsWithoutInput
    = userTypeComposer.getResolver('manyArgsWithoutInput').getFieldConfig();

  describe('args', () => {
    it('should add `clientMutationId` field to args.input', () => {
      const itc = new InputTypeComposer(fieldConfig.args.input.type);
      expect(itc.hasField('clientMutationId')).to.be.true;
      expect(itc.getFieldType('clientMutationId')).equal(GraphQLString);
    });


    it('should create required args.input! if not exists', () => {
      expect(fieldConfigManyArgsWithoutInput.args).property('input').to.be.ok;

      expect(fieldConfigManyArgsWithoutInput.args)
        .deep.property('input.type').instanceof(GraphQLNonNull);
    });

    it('should create args.input if not exists and move all args into it', () => {
      expect(fieldConfigManyArgsWithoutInput.args).to.have.all.keys(['input']);

      const type = getNamedType(fieldConfigManyArgsWithoutInput.args.input.type);
      const itc = new InputTypeComposer(type);
      expect(itc.hasField('sort')).to.be.true;
      expect(itc.hasField('limit')).to.be.true;
      expect(itc.hasField('clientMutationId')).to.be.true;
    });

    it('should leave other arg untouched if args.input exists', () => {
      expect(fieldConfigManyArgsWithInput.args).to.have.all.keys(['input', 'sort', 'limit']);

      const type = getNamedType(fieldConfigManyArgsWithInput.args.input.type);
      const itc = new InputTypeComposer(type);
      expect(itc.hasField('sort')).to.be.false;
      expect(itc.hasField('limit')).to.be.false;
      expect(itc.hasField('clientMutationId')).to.be.true;
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
        { input: { clientMutationId: '333' } }
      );
      expect(result).property('clientMutationId').equal('333');
    });

    it('should return `nodeId` with globalId', async () => {
      const result = await fieldConfig.resolve(
        {},
        { input: { id: 'newRecord' } }
      );
      expect(result).property('nodeId').equal(toGlobalId('User', 'newRecord'));
    });
  });
});
