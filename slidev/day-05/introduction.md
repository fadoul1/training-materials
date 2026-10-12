---
title: "Jour 5 — Agent Plugins et Capstone"
description: "Packager les primitives de la semaine en plugin installable partout, puis les utiliser toutes ensemble sur une tache de bout en bout"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 5 — Agent Plugins et Capstone

<br>


<!--
C'est le jour de synthese. On ne decouvre plus de primitive — on les packagae, on les partage, et on les fait travailler ensemble.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

**Partie 1 — Agent Plugins**

1. **Bilan de la semaine** — Les 7 primitives en un coup d'oeil
2. **Qu'est-ce qu'un plugin ?** — Un package, pas une nouvelle primitive
3. **Anatomie d'un plugin** — `plugin.json`, portable vs. specifique a l'outil
4. **`${PLUGIN_ROOT}`** — rendre un hook portable d'un repo a l'autre
5. **Atelier guide** — construire, installer, prouver que ca marche ailleurs
6. **Partager en securite** — marketplace, SHA epingle, checklist d'installation

**Partie 2 — Capstone**

7. **Le scenario** — fermer la boucle ouverte au Jour 4
8. **Le workflow en 8 etapes** — chaque primitive au bon moment
9. **Debrief collectif** — quelle primitive a eu le plus d'impact ?
10. **Apres la formation** — comment etendre votre configuration

</v-clicks>

---
layout: section
---

# Bilan de la semaine

---

# Les 7 primitives — Tout est en place

| # | Primitive | Role | Declenchement |
|---|-----------|------|----------------|
| 1 | **Always-On Instructions** | Standards universels du projet | Automatique — chaque session |
| 2 | **File-Based Instructions** | Regles par couche applicative | Automatique — selon `applyTo` |
| 3 | **Prompt Files** | Workflows encodes en commandes `/` | Manuel — vous tapez `/commande` |
| 4 | **Agent Skills** | Workflows proceduraux par intention | Automatique — Copilot choisit |
| 5 | **Custom Agents** | Personas expertes multi-tours | Manuel — `@nom-de-lagent` |
| 6 | **MCP** | Portee sur des systemes externes | Automatique — outils ajoutes au modele |
| 7 | **Hooks** | Application deterministe d'une regle | Automatique — a chaque appel d'outil |

<br>

<v-click>

> Aujourd'hui, ces 7 primitives travaillent **ensemble** — et on les emballe pour qu'une autre equipe n'ait pas a tout reconstruire.

</v-click>

---
layout: section
---

# Primitive — Agent Plugins

---

# Qu'est-ce qu'un Agent Plugin ?

> Un plugin n'est **pas** une nouvelle primitive. C'est un **package** de primitives (skills, agents, serveurs MCP, hooks) qui s'installent ensemble — pour qu'elles entrent dans la boucle de Copilot dans **chaque** repository que vous ouvrez.

<br>

<v-clicks>

- Sans plugin : copier `.github/` d'un repo a l'autre, et garder les copies synchronisees a la main
- Avec plugin : un seul install, et toute mise a jour se propage
- VS Code suit le standard ouvert **Agent Plugins 1.0** — le meme que Copilot CLI

</v-clicks>

---

# Anatomie d'un plugin

```
mon-copilot-kit/
├── plugin.json                       ← manifeste (obligatoire)
├── skills/mon-skill/SKILL.md         ← portable — decouvert automatiquement
├── mcp.json                          ← portable — cle "mcpServers"
├── scripts/...                       ← appele par le hook
└── com.github.copilot/               ← specifique a Copilot, les autres clients l'ignorent
    ├── agents/mon-agent.agent.md
    └── hooks/hooks.json
```

<v-clicks>

- `$schema` + `name` — obligatoires ; `name` en minuscules, chiffres, tirets, points
- `version` — a incrementer a **chaque** release, sinon les copies installees ne se mettent jamais a jour
- `skills/` et `mcp.json` sont decouverts automatiquement — pas la peine de les lister dans le manifeste

</v-clicks>

---

# `${PLUGIN_ROOT}` — portabilite du hook

Le hook du workspace pointe vers un chemin **relatif a ce repo** :
```
.github/hooks/scripts/protect-migrations.ps1
```

Un plugin est installe **ailleurs** et utilise dans **d'autres** repositories — il doit pointer vers son propre dossier :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "bash ${PLUGIN_ROOT}/scripts/protect-migrations.sh",
        "windows": "powershell -NoProfile -ExecutionPolicy Bypass -File ${PLUGIN_ROOT}/scripts/protect-migrations.ps1",
        "timeout": 15
      }
    ]
  }
}
```

<v-click>

> VS Code remplace `${PLUGIN_ROOT}` par le chemin absolu du plugin et le met entre guillemets — les espaces dans le chemin ne posent pas de probleme.

</v-click>

---

# Le piege de format le plus courant

Le `mcp.json` du **workspace** et celui d'un **plugin** n'utilisent pas la meme cle :

```json
// .vscode/mcp.json (workspace) — cle "servers"
{ "servers": { "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" } } }
```

```json
// plugin/mcp.json — cle "mcpServers"
{ "mcpServers": { "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" } } }
```

<v-click>

> ⚠️ C'est l'erreur de format numero un lors de la construction d'un premier plugin.

</v-click>

---
layout: section
---

# Atelier guide — construire le plugin

---

# Les 6 etapes

<v-clicks>

1. **Manifeste** — `plugin.json` avec `$schema`, `name`, `version`, `description`
2. **Skill, agent, scripts** — copier sans les modifier ceux deja construits cette semaine
3. **Hook** — remplacer le chemin relatif par `${PLUGIN_ROOT}`, adapter le message de refus
4. **MCP** — `mcp.json` avec la cle `mcpServers` (pas `servers`)
5. **Installer en local** — declarer le plugin dans `chat.pluginLocations` (parametres utilisateur)
6. **Prouver que ca marche ailleurs** — ouvrir un dossier sans aucun `.github/`, verifier que le hook protege quand meme une migration existante

</v-clicks>

<br>

<v-click>

> **Desactiver le plugin** fait disparaitre skill, agent, serveur MCP et hook **ensemble** — un plugin se (des)active comme un tout.

</v-click>

---

# Checklist securite — avant d'installer un plugin

<v-clicks>

Un plugin **execute du code sur votre machine** : les hooks lancent une commande a chaque evenement correspondant, les serveurs MCP demarrent un processus ou appellent un service avec vos identifiants — et **sans prompt de confiance** : installer le plugin, c'est deja la decision de confiance.

- [ ] Qui le publie ? La marketplace est-elle approuvee par l'organisation ?
- [ ] Lire `hooks.json` et **chaque** script qu'il appelle
- [ ] Lire `mcp.json` : quelles commandes, quelles URLs, quelles variables d'environnement
- [ ] Epingler un **SHA de commit complet** pour tout ce qui vient en dehors de l'organisation

</v-clicks>

<br>

<v-click>

> Les administrateurs peuvent restreindre marketplaces et plugins via des parametres geres ; `allowManagedHooksOnly` ne laisse tourner que des hooks geres centralement.

</v-click>

---
layout: section
---

# Capstone — fermer la boucle

---

# Le scenario

> Au Jour 1, `/review-code` a trouve qu'un controller logue une donnee personnelle. Au Jour 4, le serveur MCP GitHub en a fait une issue. **Aujourd'hui, on ferme la boucle avec chaque primitive de la semaine.**

<br>

<v-click>

Travaillez sur une branche dediee. Chaque etape qui suit mobilise une primitive differente.

</v-click>

---

# Le workflow en 8 etapes

| Etape | Action | Primitive |
|-------|--------|-----------|
| 1 | Lire l'issue GitHub et resumer ce qui doit changer | **MCP** |
| 2 | Corriger le probleme en mode Agent | **Always-on instructions** — la regle precise decide de la nouvelle ligne de log |
| 3 | Ajouter un test prouvant que la donnee n'est plus loguee | **File-based instructions** |
| 4 | Lancer les tests et corriger les echecs | **Skill** `run-and-fix-tests` |
| 5 | Nettoyer le code sans changer le comportement | **Custom agent** — puis suivre son handoff |
| 6 | Demander, au passage, de "nettoyer" une migration existante | **Hook** — refuse |
| 7 | Revue de code finale → doit passer | **Prompt file** `/review-code` |
| 8 | Commenter l'issue avec un resume du correctif | **MCP** |

---

# Debrief collectif

<v-clicks>

1. **A quelle etape** avez-vous tape le moins de mots pour le plus de resultat ? Pourquoi ?
2. Quelle regle a ete **appliquee** sans que vous le demandiez, et laquelle a ete **imposee** — impossible a contourner meme en insistant ?
3. Suivant le principe "commencer petit" : quelle **seule** customisation ajouteriez-vous a votre projet la semaine prochaine, et quelle primitive est-ce ?

</v-clicks>

---
layout: section
---

# Apres la formation

---

# Comment etendre votre configuration

<v-clicks>

**Semaine 1 apres la formation :**
- Committer `copilot-instructions.md` dans votre vrai projet
- Ajouter un premier fichier file-based pour vos tests
- Tester `/review-code` sur un vrai PR

**Semaine 2-3 :**
- Configurer un skill pour votre runner de tests
- Identifier un cas ou un Custom Agent apporterait de la valeur
- Connecter un premier serveur MCP (GitHub, ou un systeme interne)

**Sur le long terme :**
- Ajouter un hook uniquement la ou une mauvaise action coute plus cher qu'une mauvaise reponse
- Packager ce qui est partage entre plusieurs repos ou equipes en plugin
- Revue trimestrielle des instructions — ajouter une regle a chaque fois que Copilot repete la meme erreur

</v-clicks>

---

# Le principe fondateur

<br>

> Copilot est un **nouveau membre talentueux de l'equipe**.
> Il ecrit du bon code mais ne connait **rien** de votre codebase,
> vos conventions, ou votre architecture.
>
> **La configuration, c'est son onboarding.**
> Plus cet onboarding est complet, plus il est efficace.

<br>

<v-click>

Vous avez maintenant 7 primitives pour faire cet onboarding **une fois**, l'imposer quand il le faut, et le **partager** avec toute l'equipe.

</v-click>

---
layout: section
---

# Recapitulatif de la semaine

---

# Les 5 jours en un tableau

| Jour | Sujet | Ce que vous avez construit |
|------|-------|------------------------------|
| 1 | Fondamentaux | Modele mental, contexte, tokens, modes |
| 2 | Instructions + Prompts | `copilot-instructions.md` + fichiers file-based + prompt files |
| 3 | Skills + Custom Agents | `run-and-fix-tests`, `ef-core-migration`, Refactoring Expert |
| 4 | MCP + Hooks | Serveur GitHub, `protect-migrations` |
| **5** | **Plugins + Capstone** | **Un plugin installable + une feature corrigee de bout en bout** |

---

# Ce que vous emportez

<v-clicks>

- La **metaphore fondatrice** : Copilot = nouveau dev talentueux a onboarder
- **7 primitives** qui se complementent : contexte, tache, portee, application
- Un **workflow reproductible** : comprendre → implementer → tester → refactorer → reviewer
- Un **plugin** qui emballe tout ca et se partage avec une equipe en un install
- Un **environnement `.github/` complet**, pret a etre adapte a votre projet

</v-clicks>

---
layout: center
---

# Merci
