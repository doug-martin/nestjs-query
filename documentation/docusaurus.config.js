module.exports = {
  title: 'Nestjs-query',
  tagline: 'Easy CRUD for GraphQL.',
  url: 'https://doug-martin.github.io', // Your website URL
  baseUrl: '/nestjs-query/',
  favicon: 'img/favicon.ico',
  organizationName: 'doug-martin', // Usually your GitHub org/user name.
  projectName: 'nestjs-query', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Nestjs-query',
      logo: {
        alt: 'Nestjs-query Logo',
        src: 'img/logo.svg',
      },
      items: [
        { to: 'docs/introduction/getting-started', label: 'Docs', position: 'left' },
        { to: 'docs/faq', label: 'FAQ', position: 'left' },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/doug-martin/nestjs-query',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    algolia: {
      apiKey: '2bec315c442a99da17e68f485900e339',
      indexName: 'nestjs-query',
      algoliaOptions: {}, // Optional, if provided by Algolia
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/introduction/getting-started',
            },
            {
              label: 'Example',
              to: 'docs/introduction/example',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/doug-martin/nestjs-query',
            },
          ],
        },
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/doug-martin/nestjs-query/edit/master/documentation/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/doug-martin/nestjs-query/edit/master/documentation/blog',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
