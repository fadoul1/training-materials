import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/NotFound/Content';
import Heading from '@theme/Heading';

export default function NotFoundContent({className}: Props): ReactNode {
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="row">
        <div className="col col--6 col--offset-3" style={{textAlign: 'center'}}>
          <Heading as="h1" className="hero__title">
            Page introuvable
          </Heading>
          <p>
            Cette page n'existe pas ou a ete deplacee. Verifiez l'URL ou repartez
            depuis l'un des liens ci-dessous.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '1.5rem',
            }}>
            <Link className="button button--primary button--lg" to="/">
              Retour a l'accueil
            </Link>
            <Link className="button button--outline button--primary button--lg" to="/modules/module-01">
              Voir les modules
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
