/* @flow */

import { composeWithRelay } from '../composeWithRelay';
import { userTC } from '../__mocks__/userTC';
import { toGlobalId } from '../globalId';

describe('wrapMutationResolver', () => {
  composeWithRelay(userTC);
  const resolverCreateOne = userTC.getResolver('createOne');
  const resolverWithInput = userTC.getResolver('manyArgsWithInput');
  const resolverWithoutInput = userTC.getResolver('manyArgsWithoutInput');

  describe('args', () => {
    it('should add `clientMutationId` field to args.input', () => {
      const itc = resolverCreateOne.getArgITC('input');
      expect(itc.hasField('clientMutationId')).toBe(true);
      expect(itc.getFieldTypeName('clientMutationId')).toBe('String');
    });

    it('should create required args.input! if not exists', () => {
      expect(resolverWithoutInput.hasArg('input')).toBeTruthy();
      expect(resolverWithoutInput.isArgNonNull('input')).toBeTruthy();
    });

    it('should create args.input if not exists and move all args into it', () => {
      expect(resolverWithoutInput.hasArg('input')).toBeTruthy();
      const itc = resolverWithoutInput.getArgITC('input');
      expect(itc.hasField('sort')).toBe(true);
      expect(itc.hasField('limit')).toBe(true);
      expect(itc.hasField('clientMutationId')).toBe(true);
    });

    it('should leave other arg untouched if args.input exists', () => {
      expect(resolverWithInput.getArgNames()).toEqual(
        expect.arrayContaining(['input', 'sort', 'limit'])
      );

      const itc = resolverWithInput.getArgITC('input');
      expect(itc.hasField('sort')).toBe(false);
      expect(itc.hasField('limit')).toBe(false);
      expect(itc.hasField('clientMutationId')).toBe(true);
    });
  });

  describe('outputType', () => {
    it('should add `clientMutationId` field to payload', () => {
      const tc = resolverCreateOne.getOTC();
      expect(tc.hasField('clientMutationId')).toBe(true);
      expect(tc.getFieldTypeName('clientMutationId')).toBe('String');
    });

    it('should add `nodeId` field to payload', () => {
      const tc = resolverCreateOne.getOTC();
      expect(tc.hasField('nodeId')).toBe(true);
      expect(tc.getFieldTypeName('nodeId')).toBe('ID');
    });
  });

  describe('resolve', () => {
    it('should passthru `clientMutationId`', async () => {
      const result = await resolverCreateOne.resolve({
        args: { input: { clientMutationId: '333' } },
      });
      expect(result.clientMutationId).toBe('333');
    });

    it('should return `nodeId` with globalId', async () => {
      const result = await resolverCreateOne.resolve({ args: { input: { id: 'newRecord' } } });
      expect(result.nodeId).toBe(toGlobalId('User', 'newRecord'));
    });
  });
});
