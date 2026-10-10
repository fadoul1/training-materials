import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import HomepageHero from '../components/HomepageHero';
import CurriculumGrid from '../components/CurriculumGrid';
import FadeInView from '../components/FadeInView';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="GitHub Copilot in Practice"
      description="Configurez, automatisez et etendez votre assistant IA — formation GitHub Copilot de 5 jours."
    >
      <HomepageHero />

      <main>
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Programme</h2>
            <CurriculumGrid />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Parcours Labs</h2>
            <div className={styles.tracksGrid}>
              <FadeInView direction="up" delay={0}>
                <Link to="/labs/java" className={styles.trackCard}>
                  <span className="track-badge track-badge--java">Java</span>
                  <strong>Labs Java</strong>
                  <p>Spring Boot — mettez en pratique les 5 primitives Copilot sur un backend Java.</p>
                </Link>
              </FadeInView>
              <FadeInView direction="up" delay={0.08}>
                <Link to="/labs/dotnet" className={styles.trackCard}>
                  <span className="track-badge track-badge--dotnet">.NET</span>
                  <strong>Labs .NET</strong>
                  <p>ASP.NET Core — mettez en pratique les 5 primitives Copilot sur un backend .NET.</p>
                </Link>
              </FadeInView>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <FadeInView direction="up">
              <div className={styles.callout}>
                <h2 className={styles.sectionTitle}>Presentations</h2>
                <p>Les supports de presentation Slidev de la formation.</p>
                <Link className="button button--primary button--lg" to="/slidev">
                  Voir les presentations
                </Link>
              </div>
            </FadeInView>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Pre-requis</h2>
            <ul className={styles.prereqList}>
              <li>Maitrise d'au moins un langage de programmation (C#, Java, Python, Node.js, etc.)</li>
              <li>Familiarite avec les workflows Git</li>
              <li>Licence GitHub Copilot valide</li>
              <li>Environnement de developpement configure avec VS Code et Copilot active</li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
