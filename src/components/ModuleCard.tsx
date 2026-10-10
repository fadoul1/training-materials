import React from 'react';
import Link from '@docusaurus/Link';
import FadeInView from './FadeInView';
import type { TrainingModule } from '../data/modules';

interface ModuleCardProps {
  module: TrainingModule;
  /** Stagger index — adds 0.08s delay per card */
  index?: number;
}

export default function ModuleCard({ module, index = 0 }: ModuleCardProps) {
  return (
    <FadeInView delay={index * 0.08} direction="up">
      <Link to={module.href} className="module-card">
        <div className="module-card__day">{module.day}</div>
        <div className="module-card__title">{module.title}</div>
        <div className="module-card__description">{module.primitives}</div>
        <div className="module-card__duration">{module.duration}</div>
      </Link>
    </FadeInView>
  );
}
