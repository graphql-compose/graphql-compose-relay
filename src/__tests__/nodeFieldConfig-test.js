/* @flow */

import { graphql } from 'graphql-compose';
import { findByIdResolver, userTypeComposer } from '../__mocks__/userTypeComposer';
import { toGlobalId } from '../globalId';
import { getNodeFieldConfig } from '../nodeFieldConfig';

const { GraphQLInterfaceType, GraphQLNonNull } = graphql;

describe('nodeFieldConfig', () => {
  const typeToFindByIdMap = {
    User: {
      resolver: findByIdResolver,
      tc: userTypeComposer,
    },
  };
  const config = getNodeFieldConfig(typeToFindByIdMap);

  it('should have type GraphQLInterfaceType', () => {
    expect(config).toBeTruthy();
    expect(config.type).toBeInstanceOf(GraphQLInterfaceType);
    expect(config.type.name).toBe('Node');
  });

  it('should have args with id', () => {
    expect(config.args.id.type).toBeInstanceOf(GraphQLNonNull);
  });

  it('should have resolve function', () => {
    expect(config.resolve).toBeDefined();
    expect(config.resolve.call).toBeDefined();
    expect(config.resolve.apply).toBeDefined();
  });

  it('should return null if args.id not defined', () => {
    const source = {};
    const args = {};
    const context = {};
    const info = ({}: any);
    expect(config.resolve(source, args, context, info)).toBeNull();
  });

  it('should return null if findById not defined for type', () => {
    const source = {};
    const args = { id: toGlobalId('UnexistedType', 1) };
    const context = {};
    const info = ({}: any);
    expect(config.resolve(source, args, context, info)).toBeNull();
  });

  it('should return Promise if type exists, but id not exist', () => {
    const source = {};
    const args = { id: toGlobalId('User', 666) };
    const context = {};
    const info = ({}: any);
    expect(config.resolve(source, args, context, info)).toBeInstanceOf(Promise);
  });

  it('should return Promise with user data', async () => {
    const source = {};
    const args = { id: toGlobalId('User', 1) };
    const context = {};
    const info = ({}: any);
    const res = await config.resolve(source, args, context, info);
    // $FlowFixMe
    expect(res.name).toBe('Pavel');
  });
});
