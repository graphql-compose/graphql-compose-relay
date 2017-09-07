/* @flow */

import { composeWithRelay, TypeMapForRelayNode, nodeFieldConfig } from './composeWithRelay';
import { fromGlobalId, toGlobalId } from './globalId';
import NodeInterface from './nodeInterface';

export default composeWithRelay;
export {
  composeWithRelay,
  NodeInterface,
  TypeMapForRelayNode,
  nodeFieldConfig,
  fromGlobalId,
  toGlobalId,
};
