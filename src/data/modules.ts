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
    primitives: 'Modele mental, contexte, tokens, 7 primitives',
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
    title: 'Agent Skills et Custom Agents',
    href: '/modules/module-03',
    primitives: 'Primitive 4 : Agent Skills · Primitive 5 : Custom Agents',
    duration: '2h 30m',
  },
  {
    day: 'Jour 4',
    title: 'MCP et Hooks',
    href: '/modules/module-04',
    primitives: 'Primitive 6 : MCP · Primitive 7 : Hooks',
    duration: '2h 00m',
  },
  {
    day: 'Jour 5',
    title: 'Agent Plugins et Capstone',
    href: '/modules/module-05',
    primitives: 'Packaging en plugin + capstone mobilisant les 7 primitives',
    duration: '2h 00m',
  },
];
