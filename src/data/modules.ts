export interface TrainingModule {
  day: string;
  title: string;
  href: string;
  primitives: string;
  duration: string;
}

export const modules: TrainingModule[] = [
  {
    day: 'Jour 1',
    title: 'Comprendre Copilot et pourquoi la configuration compte',
    href: '/modules/module-01',
    primitives: 'Modele mental, contexte, tokens, 5 primitives',
    duration: '1h 00m',
  },
  {
    day: 'Jour 2',
    title: 'Custom Instructions et Prompt Files',
    href: '/modules/module-02',
    primitives:
      'Primitive 1 : Always-On Instructions · Primitive 2 : File-Based Instructions · Primitive 3 : Prompt Files',
    duration: '2h 30m',
  },
  {
    day: 'Jour 3',
    title: 'Agent Skills : automatisation multi-etapes avec scripts',
    href: '/modules/module-03',
    primitives: 'Primitive 4 : Agent Skills',
    duration: '1h 30m',
  },
  {
    day: 'Jour 4',
    title: 'Custom Agents : personas specialisees avec scope controle',
    href: '/modules/module-04',
    primitives: 'Primitive 5 : Custom Agents',
    duration: '1h 00m',
  },
  {
    day: 'Jour 5',
    title: 'Workflow End-to-End et Projet Final',
    href: '/modules/module-05',
    primitives: 'Capstone guide + projet libre + presentations',
    duration: '2h 00m',
  },
];
