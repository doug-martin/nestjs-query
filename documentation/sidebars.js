/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  docs: {
    Introduction: ['introduction/getting-started', 'introduction/install', 'introduction/example'],
    Concepts: [
      'concepts/dtos',
      'concepts/queries',
      'concepts/services',
      {
        type: 'category',
        label: 'Advanced',
        items: ['concepts/assemblers'],
      },
    ],
    Typeorm: [
      'typeorm/getting-started',
      'typeorm/usage',
      {
        type: 'category',
        label: 'Advanced',
        items: ['typeorm/advanced/multiple-databases', 'typeorm/advanced/soft-delete'],
      },
    ],
    Sequelize: ['sequelize/getting-started', 'sequelize/usage'],
    GraphQL: [
      'graphql/getting-started',
      'graphql/dtos',
      'graphql/resolvers',
      'graphql/queries',
      'graphql/mutations',
      'graphql/relations',
      'graphql/types',
      'graphql/federation',
    ],
    'Migration Guides': ['migration-guides/v0.5.x-to-v0.6.x'],
  },
};
