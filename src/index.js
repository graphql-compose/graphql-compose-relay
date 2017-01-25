/* @flow */

import { composeWithRelay, typeMapForNode, nodeFieldConfig } from './composeWithRelay';
import { fromGlobalId, toGlobalId } from './globalId';
import NodeInterface from './nodeInterface';

export default composeWithRelay;
export {
  composeWithRelay,
  NodeInterface,
  typeMapForNode,
  nodeFieldConfig,
  fromGlobalId,
  toGlobalId,
};
