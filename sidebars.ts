import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  trainingSidebar: [
    { type: 'doc', id: 'intro', label: 'Accueil' },
    {
      type: 'category',
      label: 'Modules',
      items: [
        'modules/module-01/index',
        'modules/module-02/index',
        'modules/module-03/index',
        'modules/module-04/index',
        'modules/module-05/index',
        'modules/module-06/index',
      ],
    },
    {
      type: 'category',
      label: 'Labs',
      items: [
        {
          type: 'category',
          label: 'Java (Spring Boot)',
          items: [
            'labs/java/index',
            'labs/java/lab-01-always-on-instructions',
            'labs/java/lab-02-file-based-instructions',
            'labs/java/lab-03-prompt-files',
            'labs/java/lab-04-skills',
            'labs/java/lab-05-custom-agents',
            'labs/java/lab-06-end-to-end-workflow',
          ],
        },
        {
          type: 'category',
          label: '.NET (ASP.NET Core)',
          items: [
            'labs/dotnet/index',
            'labs/dotnet/lab-01',
            'labs/dotnet/lab-02',
            'labs/dotnet/lab-03',
            'labs/dotnet/lab-04',
            'labs/dotnet/lab-05',
            'labs/dotnet/lab-06',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Ressources',
      items: [
        'references/index',
      ],
    },
  ],
};

export default sidebars;
