import React from 'react';
import Link from '@docusaurus/Link';
import { motion } from 'framer-motion';
import styles from './HomepageHero.module.css';

export default function HomepageHero() {
  return (
    <header className={styles.hero}>
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        GitHub <span className={styles.titleAccent}>Copilot</span> in Practice
      </motion.h1>
      <motion.p
        className={styles.tagline}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Configurez, automatisez et etendez votre assistant IA — une formation de 5 jours
        pour maitriser Copilot au-dela des simples suggestions.
      </motion.p>
      <motion.div
        className={styles.ctaRow}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link className="button button--primary button--lg" to="/modules/module-01">
          Commencer le Module 1
        </Link>
        <Link className="button button--outline button--primary button--lg" to="/intro">
          Voir le programme detaille
        </Link>
      </motion.div>
    </header>
  );
}
