---
title: "Jour 3 — Prompt Files : commandes slash reutilisables"
description: "Encoder vos workflows d'equipe en commandes slash reproductibles et parametrables"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 3 — Prompt Files : commandes slash reutilisables

<br>


<!--
Aujourd'hui on passe de la configuration passive aux outils actifs.
Les prompt files vous permettent d'encoder les workflows de votre equipe une seule fois et de les reutiliser a l'infini.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

1. **Rappel** — Ou en sommes-nous dans les 5 primitives
2. **Qu'est-ce qu'un Prompt File ?** — La difference avec les instructions
3. **Anatomie d'un prompt** — Frontmatter, modes, variables
4. **Les prompts du projet** — `/review-code`, `/generate-feature`, `/explain-architecture`
5. **Variables `${input:x}`** — Rendre les prompts parametrables
6. **Ask vs. Agent** — Choisir le bon mode d'execution
7. **Demo** — Voir `/review-code` et `/generate-feature` en action
8. **Lab 03** — Vous creez votre propre prompt `/add-integration-scenario`

</v-clicks>

---
layout: section
---

# Rappel — Ou en sommes-nous ?

---

# Les 5 primitives — Progression

| # | Primitive | Statut |
|---|-----------|--------|
| 1 | Always-On Instructions | ✅ Acquis |
| 2 | File-Based Instructions | ✅ Acquis |

<br>

<v-click>

> Jusqu'ici : des primitives **passives** (toujours actives, invisibles).
> A partir d'aujourd'hui : des primitives **actives** (invoquees explicitement).

</v-click>

---
layout: section
---

# Primitive 3 — Prompt Files

---

# Qu'est-ce qu'un Prompt File ?

> Un **Prompt File** est un template de tache reutilisable, invoque avec une commande `/`. C'est une macro pour les workflows que vous executez regulierement.

<br>

<v-clicks>

**Sans Prompt File :**
- Vous retapez le meme prompt de revue de code chaque semaine
- Chaque developpeur le formule differemment → resultats inconsistants
- Le contexte, les contraintes et le format de sortie sont perdus a chaque fois

**Avec Prompt File :**
- `/review-code` — meme revue, meme structure, chaque fois
- `/generate-feature` — scaffolding complet en une commande
- Toute l'equipe utilise les memes workflows → coherence garantie

</v-clicks>

---

# Instructions vs. Prompts — La difference fondamentale

| | Instructions | Prompts |
|---|-------------|---------|
| **Declenchement** | Automatique (toujours) | Explicite (`/commande`) |
| **Role** | Definir un **comportement** | Definir une **tache** |
| **Exemple** | "Toujours utiliser les constructeurs primaires" | "Maintenant, fais CETTE revue de code" |
| **Frequence** | Chaque session | A la demande |
| **Parametre** | Non | Oui (`${input:variable}`) |

<br>

<v-click>

> **Regle simple :** Instructions = *comment* Copilot doit se comporter. Prompts = *quoi* Copilot doit faire maintenant.

</v-click>

---

# Anatomie d'un Prompt File

```
.github/
└── prompts/
    └── review-code.prompt.md    ← doit finir par .prompt.md
```

<br>

```yaml
---
name: review-code          ← apparait dans le menu /
description: "..."         ← texte d'aide affiché dans le chat
mode: ask                  ← ask | agent
model: gpt-4o              ← modele a utiliser (optionnel)
---
```

<v-clicks>

- **`name`** — le slug de la commande slash (sans espaces)
- **`description`** — aide les developpeurs a comprendre quand utiliser ce prompt
- **`mode`** — definit si Copilot peut modifier des fichiers ou non
- Le **corps** du fichier est le prompt complet envoye a Copilot

</v-clicks>

---

# Les deux modes d'execution

| Mode | Ce qu'il fait | Quand l'utiliser |
|------|--------------|-----------------|
| **`ask`** | Lecture seule, conversationnel | Revue, explication, brainstorming |
| **`agent`** | Cree et modifie des fichiers, execute des commandes | Scaffolding, generation de code, corrections |

<br>

<v-clicks>

**Exemples :**
- `/review-code` → `mode: ask` — Copilot lit et commente, ne touche pas aux fichiers
- `/generate-feature` → `mode: agent` — Copilot cree les fichiers, le handler, les tests
- `/explain-architecture` → `mode: ask` — Copilot explique, produit un diagramme Mermaid

</v-clicks>

<br>

<v-click>

> **Regle de securite :** Utilisez `ask` par defaut. Ne passez a `agent` que si le prompt doit creer ou modifier des fichiers.

</v-click>

---
layout: section
---

# Les prompts du projet

---

# `/review-code` — Revue structuree et reproductible

```yaml
---
name: review-code
mode: ask
---
```

<v-clicks>

**Ce que le prompt fait :**
- Verifie la conformite aux regles de `copilot-instructions.md`
- Classe les problemes par severite : **Critical** / **Major** / **Minor** / **Info**
- Couvre : Clean Architecture, idiomes du langage, patterns CQRS, logging, securite, tests
- Produit un **Resume** avec le probleme le plus important en tete

**Pourquoi c'est mieux qu'un prompt ad-hoc :**
- La meme revue chaque fois — pas d'oubli de categorie
- Le format est previsible → facile a parcourir pour le reviewer humain
- Encode le savoir collectif de l'equipe dans la revue

</v-clicks>

---

# `/generate-feature` — Scaffolding complet en une commande

```yaml
---
name: generate-feature
mode: agent
---
```

<v-clicks>

**Variables parametrables :**
- `${input:entityName}` — ex: `Employee`, `Department`
- `${input:featureType}` — `Command` ou `Query`
- `${input:operation}` — ex: `Create`, `GetById`, `GetByDepartment`

**Ce que Copilot genere automatiquement :**
- Dossier `Features/{Entity}/{Type}/{Operation}/`
- `{Operation}Command.cs` / `{Operation}Handler.cs` / `{Operation}Validator.cs`
- Stub de mapper + classe de test avec deux `[Fact]` prepares

</v-clicks>

---

# `/explain-architecture` — Documentation generee a la demande

```yaml
---
name: explain-architecture
mode: ask
---
```

<v-clicks>

**Variable :** `${input:scope}` — ex: `CQRS flow`, `EF Core model`, `couche Application`

**Resultat :**
- Trace le chemin d'une requete HTTP de bout en bout
- Produit un **diagramme de sequence Mermaid**
- Reference les **vrais noms de classes** du projet (pas des exemples generiques)
- Explique pourquoi `BaseResponse` est retourne (pas d'exceptions)

**Cas d'usage :** Onboarding d'un nouveau developpeur, documentation sprint, code review PR

</v-clicks>

---
layout: section
---

# Variables `${input:x}` — Prompts parametrables

---

# Rendre un prompt reutilisable

Sans variable, le prompt est lie a une entite specifique :

```markdown
Genere les fichiers CQRS pour l'entite Employee...
```

<br>

Avec `${input:variable}`, un seul prompt couvre tous les cas :

```markdown
Genere les fichiers CQRS pour l'entite **${input:entityName}**
Type d'operation : **${input:featureType}** — **${input:operation}**
```

<v-click>

Quand vous tapez `/generate-feature`, Copilot vous demande :
```
entityName: Department
featureType: Command
operation: Create
```

Et genere exactement le bon scaffolding.

</v-click>

---

# Bonnes pratiques pour les variables

<v-clicks>

- **Noms explicites** — `${input:entityName}` > `${input:x}`
- **Une variable par information** — ne pas surcharger une seule variable
- **Documenter les valeurs attendues** dans le corps du prompt :

```markdown
## Parametres
- **entityName** : Nom en PascalCase de l'entite (ex: Employee, Department)
- **featureType** : `Command` (ecriture) ou `Query` (lecture)
- **operation** : Verbe en PascalCase (ex: Create, GetById, Delete)
```

- **Tester avec des valeurs limites** — espaces, caracteres speciaux, noms longs

</v-clicks>

---
layout: section
---

# Demo — Prompt Files en action

---

# Demo 1 — `/review-code`

**Scenario :** Revue d'un handler qui viole plusieurs regles du projet

<v-clicks>

**Etape 1 :** Ouvrir `CreateEmployeeHandler.cs`

**Etape 2 :** Taper `/review-code` dans Copilot Chat

**Observer la structure de sortie :**
- `[CRITICAL]` — violation de securite ou perte de donnees
- `[MAJOR]` — violation d'architecture (ex: entite retournee directement, pas de DTO)
- `[MINOR]` — style ou idiome (ex: `var` trop generique, logging par interpolation)
- `[INFO]` — suggestion d'amelioration
- **Resume** — le probleme le plus important en une phrase

**Relancer `/review-code`** apres correction → le rapport doit etre plus court

</v-clicks>

---

# Demo 2 — `/generate-feature`

**Scenario :** Scaffolding d'une nouvelle entite `Department`

<v-clicks>

**Etape 1 :** Taper `/generate-feature` en mode Agent

**Etape 2 :** Renseigner les variables :
- `entityName` → `Department`
- `featureType` → `Command`
- `operation` → `Create`

**Observer ce que Copilot cree :**
- Dossier `Features/Departments/Commands/CreateDepartment/`
- 3 fichiers : Command, Handler, Validator
- Handler avec constructeur primaire + `[LoggerMessage]` + `BaseResponse`
- `CancellationToken` passe sur chaque appel async

**Verifier :** `dotnet build` doit passer sans erreur

</v-clicks>

---
layout: section
---

# Concevoir un bon Prompt File

---

# Anatomie d'un prompt efficace

Un bon prompt file contient toujours :

<v-clicks>

1. **Contexte** — A qui s'adresse ce prompt, sur quel projet
2. **Tache precise** — Ce que Copilot doit faire, etape par etape
3. **Contraintes** — Les regles a respecter (reference aux instructions)
4. **Format de sortie** — La structure exacte attendue (tableau, liste, code block...)
5. **Exemples** — Ce qui est correct, ce qui ne l'est pas

</v-clicks>

<br>

<v-click>

> Plus le prompt est precis, plus le resultat est previsible — et reproductible.

</v-click>

---

# Prompt + Instructions = Resultat garanti

```
/generate-feature
     │
     ▼
Prompt file          →  "Voici les etapes de scaffolding"
     +
copilot-instructions.md  →  "Voici les conventions du projet"
     +
handlers.instructions.md →  "Voici les regles du handler"
     │
     ▼
Code conforme aux standards du projet, du premier coup
```

<v-click>

> Le prompt definit **la tache**. Les instructions definissent **le style**. Les deux ensemble produisent un resultat coherent et reproductible.

</v-click>

---
layout: section
---

# Comparaison : Instructions vs. Prompts vs. Skills

---

# Quand utiliser quoi ?

| | Instructions | Prompts | Skills |
|-|-------------|---------|--------|
| **Invocation** | Automatique | `/commande` | Automatique (intention) |
| **Role** | Regles et conventions | Template de tache | Workflow procedurale |
| **Parametre** | Non | Oui (`${input:x}`) | Non |
| **Type de fichier** | `.instructions.md` | `.prompt.md` | `SKILL.md` |
| **Exemple** | "Utiliser FluentAssertions" | "Fais une revue de code maintenant" | "Lance les tests et corrige les echecs" |

<br>

<v-click>

> **Skills** = Jour 4. Retenez pour l'instant : Prompts = invocation explicite par `/`, Skills = invocation implicite par l'intention.

</v-click>

---
layout: section
---

# Recapitulatif

---

# Ce que vous savez maintenant

<v-clicks>

- Un **Prompt File** encode un workflow d'equipe en commande slash reproductible
- Le frontmatter definit le **nom**, le **mode** (`ask`/`agent`) et le **modele**
- `${input:variable}` rend un prompt **parametrable** pour plusieurs entites
- **`ask`** = lecture seule, **`agent`** = cree et modifie des fichiers
- Prompt + Instructions = resultat **coherent** et **previsible**
- Trois prompts cles : `/review-code`, `/generate-feature`, `/explain-architecture`

</v-clicks>

---

# Decision guide — Quel outil utiliser ?

| Besoin | Outil |
|--------|-------|
| Copilot applique toujours ces regles | Always-On Instructions |
| Regles actives seulement sur certains fichiers | File-Based Instructions |
| Je veux lancer un workflow precis avec `/` | Prompt File |
| Copilot doit detecter mon intention et agir seul | Skill (Jour 4) |
| Je veux un expert IA avec une personnalite | Custom Agent (Jour 5) |

---

# Demain — Jour 4

## Agent Skills : workflows automatiques par intention

<v-clicks>

- Comprendre le **mecanisme de decouverte** par correspondance semantique
- Utiliser `run-and-fix-tests` — sans taper `/`, Copilot detecte l'intention
- Utiliser `ef-core-migration` — ajout de migration avec les bons flags
- Ecrire un nouveau `SKILL.md` de zero en suivant le standard **agentskills.io**

</v-clicks>

<br>

<v-click>

**Labs : vous construisez un skill `setup-local-dev` qui guide l'onboarding.**

</v-click>

---
layout: center
---

# Questions ?
