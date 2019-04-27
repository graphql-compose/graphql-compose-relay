/* @flow */
/* eslint-disable no-param-reassign */

import { InputTypeComposer, ObjectTypeComposer, type Resolver } from 'graphql-compose';
import { toGlobalId } from './globalId';

export type WrapMutationResolverOpts = {
  resolverName: string,
  rootTypeName: string,
  [optName: string]: mixed,
};

function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function wrapMutationResolver<TSource, TContext, TArgs>(
  resolver: Resolver<TSource, TContext, TArgs>,
  opts: WrapMutationResolverOpts
): Resolver<TSource, TContext, TArgs> {
  const { resolverName, rootTypeName } = opts;
  const sc = resolver.schemaComposer;

  function prepareArgs(newResolver: Resolver<TSource, TContext, TArgs>) {
    let ITC: InputTypeComposer<TContext>;
    if (newResolver.hasArg('input')) {
      ITC = (newResolver.getArgTC('input'): any);
      if (!(ITC instanceof InputTypeComposer)) {
        return;
      }
    } else {
      // create input arg, and put into all current args
      ITC = sc.createInputTC({
        name: `Relay${upperFirst(resolverName)}${rootTypeName}Input`,
        fields: (newResolver.args: any),
      });
      newResolver.setArgs({
        input: {
          // nonNull due required arg clientMutationId
          type: ITC.getTypeNonNull(),
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

      if ((newResolver: any)._relayIsArgsWrapped) {
        resolveParams.args = (resolveParams.args: any).input;
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
    const outputTC = prevResolver.getTypeComposer();

    if (!(outputTC instanceof ObjectTypeComposer)) {
      return;
    }

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
