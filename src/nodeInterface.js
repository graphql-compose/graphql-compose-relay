/* @flow */

import { InterfaceTypeComposer, type SchemaComposer } from 'graphql-compose';

export function getNodeInterface<TContex>(
  sc: SchemaComposer<TContex>
): InterfaceTypeComposer<any, TContex> {
  if (sc.hasInstance('Node', InterfaceTypeComposer)) {
    return (sc.get('Node'): any);
  }

  const NodeInterface = InterfaceTypeComposer.create(
    {
      name: 'Node',
      description: 'An object, that can be fetched by the globally unique ID among all types.',
      fields: {
        id: {
          type: 'ID!',
          description: 'The globally unique ID among all types.',
        },
      },
      resolveType: payload => {
        // `payload.__nodeType` was added to payload via nodeFieldConfig.resolve
        return payload.__nodeType ? payload.__nodeType : null;
      },
    },
    sc
  );

  return NodeInterface;
}
