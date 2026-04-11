import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "GitHub Copilot in Practice",
  tagline: "Configure, Automate, and Extend Your AI Assistant",
  favicon: "img/favicon.ico",

  url: "https://copilot-training.accenture.com",
  baseUrl: "/",

  staticDirectories: ["static"],

  organizationName: "accenture",
  projectName: "copilot-training",

  onBrokenLinks: "warn",

  i18n: {
    defaultLocale: "fr",
    locales: ["fr"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ["@docusaurus/theme-mermaid"],

  plugins: [
    [
      "./plugins/docusaurus-plugin-slidev",
      {
        path: "./slidev",
        routeBasePath: "/slidev",
        pageTitle: "Presentations",
        pageTagline: "Supports de formation GitHub Copilot in Practice",
        theme: "unicorn",
        addons: [],
        buildTimeout: 120,
        autoInstall: true,
      },
    ],
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  themeConfig: {
    navbar: {
      title: "Copilot Training",
      logo: {
        alt: "Accenture Logo",
        src: "img/logo.svg",
      },
      items: [
        { type: "doc", docId: "intro", label: "Accueil", position: "left" },
        { to: "/modules/module-01", label: "Modules", position: "left" },
        { to: "/labs/java", label: "Labs Java", position: "left" },
        { to: "/labs/dotnet", label: "Labs .NET", position: "left" },
        { to: "/references", label: "Ressources", position: "left" },
        { to: "/slidev", label: "Presentations", position: "left" },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Formation",
          items: [
            { label: "Accueil", to: "/" },
            { label: "Modules", to: "/modules/module-01" },
            { label: "Labs Java", to: "/labs/java" },
            { label: "Labs .NET", to: "/labs/dotnet" },
          ],
        },
        {
          title: "Ressources",
          items: [
            {
              label: "GitHub Copilot Docs",
              href: "https://docs.github.com/en/copilot",
            },
            {
              label: "VS Code Copilot",
              href: "https://code.visualstudio.com/docs/copilot/overview",
            },
            {
              label: "Agent Skills (agentskills.io)",
              href: "https://agentskills.io",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Accenture. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "csharp",
        "java",
        "json",
        "yaml",
        "bash",
        "powershell",
        "markdown",
      ],
    },
    mermaid: {
      theme: {
        light: "neutral",
        dark: "dark",
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
