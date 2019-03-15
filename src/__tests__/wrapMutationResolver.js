/* @flow */

import { schemaComposer } from 'graphql-compose';
import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  getNamedType,
} from 'graphql-compose/lib/graphql';
import { composeWithRelay } from '../composeWithRelay';
import { userTC } from '../__mocks__/userTC';
import { toGlobalId } from '../globalId';

describe('wrapMutationResolver', () => {
  composeWithRelay(userTC);
  const fieldConfig: any = userTC.getResolver('createOne').getFieldConfig();
  const fieldConfigManyArgsWithInput: any = userTC
    .getResolver('manyArgsWithInput')
    .getFieldConfig();
  const fieldConfigManyArgsWithoutInput: any = userTC
    .getResolver('manyArgsWithoutInput')
    .getFieldConfig();

  describe('args', () => {
    it('should add `clientMutationId` field to args.input', () => {
      const itc = schemaComposer.createInputTC(fieldConfig.args.input.type);
      expect(itc.hasField('clientMutationId')).toBe(true);
      expect(itc.getFieldType('clientMutationId')).toBe(GraphQLString);
    });

    it('should create required args.input! if not exists', () => {
      expect(fieldConfigManyArgsWithoutInput.args.input).toBeTruthy();

      expect(fieldConfigManyArgsWithoutInput.args.input.type).toBeInstanceOf(GraphQLNonNull);
    });

    it('should create args.input if not exists and move all args into it', () => {
      expect(Object.keys(fieldConfigManyArgsWithoutInput.args)).toEqual(
        expect.arrayContaining(['input'])
      );

      const type: any = getNamedType(fieldConfigManyArgsWithoutInput.args.input.type);
      const itc = schemaComposer.createInputTC(type);
      expect(itc.hasField('sort')).toBe(true);
      expect(itc.hasField('limit')).toBe(true);
      expect(itc.hasField('clientMutationId')).toBe(true);
    });

    it('should leave other arg untouched if args.input exists', () => {
      expect(Object.keys(fieldConfigManyArgsWithInput.args)).toEqual(
        expect.arrayContaining(['input', 'sort', 'limit'])
      );

      const type: any = getNamedType(fieldConfigManyArgsWithInput.args.input.type);
      const itc = schemaComposer.createInputTC(type);
      expect(itc.hasField('sort')).toBe(false);
      expect(itc.hasField('limit')).toBe(false);
      expect(itc.hasField('clientMutationId')).toBe(true);
    });
  });

  describe('outputType', () => {
    it('should add `clientMutationId` field to payload', () => {
      const tc = schemaComposer.createObjectTC(fieldConfig.type);
      expect(tc.hasField('clientMutationId')).toBe(true);
      expect(tc.getFieldType('clientMutationId')).toBe(GraphQLString);
    });

    it('should add `nodeId` field to payload', () => {
      const tc = schemaComposer.createObjectTC(fieldConfig.type);
      expect(tc.hasField('nodeId')).toBe(true);
      expect(tc.getFieldType('nodeId')).toBe(GraphQLID);
    });
  });

  describe('resolve', () => {
    it('should passthru `clientMutationId`', async () => {
      const result = await fieldConfig.resolve({}, { input: { clientMutationId: '333' } });
      expect(result.clientMutationId).toBe('333');
    });

    it('should return `nodeId` with globalId', async () => {
      const result = await fieldConfig.resolve({}, { input: { id: 'newRecord' } });
      expect(result.nodeId).toBe(toGlobalId('User', 'newRecord'));
    });
  });
});
