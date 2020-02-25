import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: <>GraphQL</>,
    imageUrl: 'img/graphql_logo.svg',
    description: (
      <>
        Easily create code first GraphQL CRUD resolvers, with out of the box filtering, paging, sorting, and mutations.
      </>
    ),
  },
  {
    title: <>NestJS</>,
    imageUrl: 'img/nestjs_logo.svg',
    description: (
      <>
        Built on top of <code>nestjs</code>. Allowing you to hit the ground running without having to learn a whole new
        framework.
      </>
    ),
  },
  {
    title: <>TypeScript</>,
    imageUrl: 'img/ts_logo.png',
    description: <>Built with typescript from the ground up.</>,
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title={`${siteConfig.title}`} description={`${siteConfig.tagline}`}>
      <header className={classnames('hero', styles.heroBanner)}>
        <div className="container">
          <img alt="Nestjs-query" className={styles.heroLogo} src={useBaseUrl('img/logo.svg')} />
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames('button button--outline button--secondary button--lg', styles.getStarted)}
              to={useBaseUrl('docs/introduction/getting-started')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
