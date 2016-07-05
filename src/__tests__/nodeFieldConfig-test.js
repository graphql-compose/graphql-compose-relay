import { expect } from 'chai';
import { findByIdResolver } from '../__mocks__/userTypeComposer';
import { toGlobalId } from '../globalId';
import { getNodeFieldConfig } from '../nodeFieldConfig';
import {
  GraphQLInterfaceType,
  GraphQLNonNull,
} from 'graphql';

describe('nodeFieldConfig', () => {
  const typeToFindByIdMap = {
    'User': findByIdResolver,
  };
  const config = getNodeFieldConfig(typeToFindByIdMap);

  it('should have type GraphQLInterfaceType', () => {
    expect(config).to.be.ok;
    expect(config).property('type').instanceof(GraphQLInterfaceType);
    expect(config).deep.property('type.name').to.equal('Node');
  });

  it('should have args with id', () => {
    expect(config).deep.property('args.id.type').instanceof(GraphQLNonNull);
  });

  it('should have resolve function', () => {
    expect(config).respondTo('resolve');
  });

  it('should return null if args.id not defined', () => {
    expect(config.resolve({}, {})).to.be.null;
  });

  it('should return null if findById not defined for type', () => {
    expect(
      config.resolve({}, { id: toGlobalId('UnexistedType', 1) })
    ).to.be.null;
  });

  it('should return Promise if type exists, but id not exist', () => {
    expect(
      config.resolve({}, { id: toGlobalId('User', 666) })
    ).instanceof(Promise);
  });

  it('should return Promise with user data', async () => {
    const res = await config.resolve({}, { id: toGlobalId('User', 1) });
    expect(res).property('name').to.equal('Pavel');
  });
});
