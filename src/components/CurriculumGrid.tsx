import React from 'react';
import ModuleCard from './ModuleCard';
import { modules } from '../data/modules';

export default function CurriculumGrid() {
  return (
    <div className="module-grid">
      {modules.map((module, index) => (
        <ModuleCard key={module.href} module={module} index={index} />
      ))}
    </div>
  );
}
