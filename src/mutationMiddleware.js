/* @flow */
/* eslint-disable no-param-reassign */

import { ResolverMiddleware, TypeComposer } from 'graphql-compose';
import { GraphQLID, GraphQLString, GraphQLObjectType } from 'graphql';
import { toGlobalId } from './globalId';
import type {
  ResolverMWArgsFn,
  ResolverMWArgs,
  ResolverMWResolveFn,
  ResolverMWResolve,
  ResolverMWOutputTypeFn,
  ResolverMWOutputType,
} from './definition';


export default class MutationMiddleware extends ResolverMiddleware {
  // constructor(typeComposer, opts = {}) {
  //   super(typeComposer, opts);
  // }

  args:ResolverMWArgs = (next: ResolverMWArgsFn) => (args) => {
    const nextArgs = next(args);

    if (!nextArgs.clientMutationId) {
      nextArgs.clientMutationId = {
        type: GraphQLString,
        description: 'The client mutation ID used by clients like Relay to track the mutation. '
                   + 'If given, returned in the response payload of the mutation.',
      };
    }

    return nextArgs;
  };


  resolve:ResolverMWResolve = (next: ResolverMWResolveFn) => (resolveParams) => {
    let clientMutationId;

    if (resolveParams && resolveParams.args && resolveParams.args.input
        && resolveParams.args.input.clientMutationId) {
      clientMutationId = resolveParams.args.input.clientMutationId;
      delete resolveParams.args.input.clientMutationId;
    }

    return next(resolveParams)
      .then(res => {
        res.nodeId = toGlobalId(
          this.typeComposer.getTypeName(),
          this.typeComposer.getRecordId(res),
        );
        if (clientMutationId) {
          res.clientMutationId = clientMutationId;
        }
        return res;
      });
  };


  outputType:ResolverMWOutputType = (next: ResolverMWOutputTypeFn) => (outputType) => {
    const nextOutputType = next(outputType);

    if (!(nextOutputType instanceof GraphQLObjectType)) {
      return nextOutputType;
    }

    const outputTC = new TypeComposer(nextOutputType);
    if (!outputTC.hasField('nodeId')) {
      outputTC.addField('nodeId', {
        type: GraphQLID,
        description: 'The globally unique ID among all types',
      });
    }

    if (!outputTC.hasField('clientMutationId')) {
      outputTC.addField('clientMutationId', {
        type: GraphQLString,
        description: 'The client mutation ID used by clients like Relay to track the mutation. '
                   + 'If given, returned in the response payload of the mutation.',
      });
    }

    return outputTC.getType();
  };
}
