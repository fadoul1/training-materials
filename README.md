# GitHub Copilot in Practice — Support de formation

Support de formation Accenture sur GitHub Copilot : documentation Docusaurus + présentations Slidev.

---

## Structure du projet

```
training-materials/
├── docs/              ← Pages Docusaurus (labs, modules, ressources)
├── slidev/
│   ├── day-01/        ← Présentation Jour 1
│   ├── day-02/        ← Présentation Jour 2
│   ├── day-03/        ← Présentation Jour 3
│   ├── day-04/        ← Présentation Jour 4
│   ├── day-05/        ← Présentation Jour 5
│   └── day-06/        ← Présentation Jour 6
├── static/
│   └── resources/     ← Fichiers ressources téléchargeables (instructions, prompts, skills, agents)
└── package.json
```

---

## Prérequis

- **Node.js** >= 20
- **yarn** (ou npm)

```bash
npm install
```

---

## Docusaurus — Site de documentation

### Développement local (hot reload)

```bash
npm start
```

Ouvre le site sur `http://localhost:3000`. Les modifications des fichiers `docs/` sont reflétées en direct.

### Build de production

```bash
npm run build
```

Génère les fichiers statiques dans le dossier `build/`.

### Servir le build de production localement

```bash
npm run serve
```

---

## Slidev — Présentations

> **Important :** Slidev ne dispose pas de hot reload intégré au projet. Après chaque modification d'un fichier dans `slidev/`, il faut relancer la commande de développement ou rebuilder la présentation.

### Lancer une présentation en mode développement

```bash
npx slidev slidev/day-01/introduction.md
```

Remplacer `day-01` par le jour souhaité (`day-02`, `day-03`, etc.).

La présentation s'ouvre sur `http://localhost:3030`.

### Builder une présentation pour la production

```bash
npx slidev build slidev/day-01/introduction.md --out build/slides/day-01
```

Les fichiers générés sont dans `build/slides/day-01/`.

### Exporter une présentation en PDF

```bash
npx slidev export slidev/day-01/introduction.md --output slides-day-01.pdf
```

> Requiert [Playwright](https://playwright.dev/) : `npx playwright install chromium`

### Workflow après modification d'un fichier Slidev

```bash
# 1. Modifier le fichier
#    slidev/day-XX/introduction.md

# 2. Relancer le serveur de développement
npx slidev slidev/day-XX/introduction.md

# OU rebuilder pour la production
npx slidev build slidev/day-XX/introduction.md --out build/slides/day-XX
```

---

## Déploiement

```bash
# Avec SSH
USE_SSH=true npm run deploy

# Sans SSH
GIT_USER=<votre-username-GitHub> npm run deploy
```

Publie le contenu du dossier `build/` sur la branche `gh-pages`.
