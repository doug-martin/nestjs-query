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
    Persistence: [
      'persistence/services',
      {
        type: 'category',
        label: 'Sequelize',
        items: [
          'persistence/sequelize/getting-started',
          'persistence/sequelize/custom-service',
          'persistence/sequelize/serialization',
        ],
      },
      {
        type: 'category',
        label: 'TypeOrm',
        items: [
          'persistence/typeorm/getting-started',
          'persistence/typeorm/custom-service',
          'persistence/typeorm/multiple-databases',
          'persistence/typeorm/soft-delete',
        ],
      },
    ],
    GraphQL: [
      'graphql/getting-started',
      'graphql/dtos',
      'graphql/resolvers',
      'graphql/queries',
      'graphql/mutations',
      'graphql/subscriptions',
      'graphql/relations',
      'graphql/types',
      'graphql/federation',
    ],
    'Migration Guides': [
      'migration-guides/v0.5.x-to-v0.6.x',
      'migration-guides/v0.10.x-to-v0.11.x',
      'migration-guides/v0.12.x-to-v0.13.x',
      'migration-guides/v0.13.x-to-v0.14.x',
      'migration-guides/v0.14.x-to-v0.15.x',
      'migration-guides/v0.15.x-to-v0.16.x',
    ],
  },
};
