/* @flow */
/* eslint-disable no-param-reassign */

import { TypeComposer, InputTypeComposer, type Resolver } from 'graphql-compose';
import {
  GraphQLObjectType,
  getNamedType,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql-compose/lib/graphql';
import { toGlobalId } from './globalId';

export type WrapMutationResolverOpts = {
  resolverName: string,
  rootTypeName: string,
  [optName: string]: mixed,
};

function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function wrapMutationResolver(
  resolver: Resolver,
  opts: WrapMutationResolverOpts
): Resolver {
  const { resolverName, rootTypeName } = opts;

  function prepareArgs(newResolver: Resolver) {
    let ITC: InputTypeComposer;
    if (newResolver.args.input && newResolver.args.input.type) {
      const inputNamedType = getNamedType(newResolver.args.input.type);
      if (inputNamedType instanceof GraphQLInputObjectType) {
        ITC = new InputTypeComposer(inputNamedType);
      }
    } else {
      // create input arg, and put into all current args

      ITC = InputTypeComposer.create({
        name: `Relay${upperFirst(resolverName)}${rootTypeName}Input`,
        fields: (newResolver.args: any),
      });
      newResolver.setArgs({
        input: {
          name: 'input',
          // nonNull due required arg clientMutationId
          type: new GraphQLNonNull(ITC.getType()),
        },
      });
      // $FlowFixMe
      newResolver._relayIsArgsWrapped = true;
    }

    // add `clientMutationId` to args.input field
    if (ITC && !ITC.hasField('clientMutationId')) {
      ITC.setField('clientMutationId', {
        type: 'String',
        description:
          'The client mutation ID used by clients like Relay to track the mutation. ' +
          'If given, returned in the response payload of the mutation.',
      });
    }
  }

  function prepareResolve(newResolver, prevResolver) {
    newResolver.setResolve(resolveParams => {
      let clientMutationId;

      if (resolveParams && resolveParams.args) {
        if (resolveParams.args.input && resolveParams.args.input.clientMutationId) {
          clientMutationId = resolveParams.args.input.clientMutationId;
          delete resolveParams.args.input.clientMutationId;
        }
      }

      if (newResolver._relayIsArgsWrapped) {
        resolveParams.args = resolveParams.args.input;
      }

      return prevResolver.resolve(resolveParams).then(res => {
        res.nodeId = toGlobalId(rootTypeName, res.recordId);
        if (clientMutationId) {
          res.clientMutationId = clientMutationId;
        }
        return res;
      });
    });
  }

  function prepareType(newResolver, prevResolver) {
    const outputType = prevResolver.getType();

    if (!(outputType instanceof GraphQLObjectType)) {
      return;
    }

    const outputTC = new TypeComposer(outputType);
    if (!outputTC.hasField('nodeId')) {
      outputTC.setField('nodeId', {
        type: 'ID',
        description: 'The globally unique ID among all types',
      });
    }

    if (!outputTC.hasField('clientMutationId')) {
      outputTC.setField('clientMutationId', {
        type: 'String',
        description:
          'The client mutation ID used by clients like Relay to track the mutation. ' +
          'If given, returned in the response payload of the mutation.',
      });
    }

    newResolver.setType(outputTC.getType());
  }

  return resolver.wrap(
    (newResolver, prevResolver) => {
      prepareArgs(newResolver);
      prepareResolve(newResolver, prevResolver);
      prepareType(newResolver, prevResolver);
      return newResolver;
    },
    { name: 'RelayMutation' }
  );
}
