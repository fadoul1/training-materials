---
title: "Jour 3 — Agent Skills et Custom Agents"
description: "Packager des workflows multi-etapes qui se declenchent automatiquement, puis creer des personas IA specialisees avec gardes-fous et handoffs"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 3 — Agent Skills et Custom Agents

<br>


<!--
Aujourd'hui on explore deux primitives actives qui se declenchent sans taper de commande /.
Les Skills se declenchent sur l'intention. Les Custom Agents se declenchent sur une identite que vous activez pour toute une session.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

**Partie 1 — Agent Skills**

1. **Rappel** — Les primitives vues jusqu'ici
2. **Qu'est-ce qu'un Skill ?** — La difference avec les prompts
3. **Le mecanisme de decouverte** — Comment Copilot choisit un skill
4. **L'art de la description** — La cle qui fait tout
5. **Les skills du projet** — `run-and-fix-tests` et `ef-core-migration`
6. **Anatomie d'un `SKILL.md`** — Structure et contenu
7. **Demo** — Skills en action, sans taper `/`
8. **Lab Partie 1** — Vous creez `setup-local-dev` de zero

</v-clicks>

---

# Ce que nous allons couvrir (suite)

<v-clicks>

**Partie 2 — Custom Agents**

9. **Qu'est-ce qu'un Custom Agent ?** — La difference avec les instructions et les prompts
10. **La formule de l'agent** — Les 5 sections obligatoires
11. **Les agents du projet** — Refactoring Expert et C# Migration Specialist
12. **Les handoffs** — Chaîner des agents specialistes entre eux
13. **Les gardes-fous** — "Ce que je ne fais jamais" est aussi important que les capacites
14. **Demo** — Comparer Copilot par defaut vs. agent specialise
15. **Lab Partie 2** — Vous creez un agent Security Reviewer de zero

</v-clicks>

<!--
Skills et Agents sont les deux dernieres primitives "classiques" avant d'ouvrir le systeme vers l'exterieur demain avec MCP et les Hooks.
-->

---
layout: section
---

# Rappel — La progression

---

# Les primitives — Bilan a mi-parcours

| # | Primitive | Statut |
|---|-----------|--------|
| 1 | Always-On Instructions | ✅ Acquis |
| 2 | File-Based Instructions | ✅ Acquis |
| 3 | Prompt Files | ✅ Acquis |
| **4** | **Agent Skills** | 🔵 **Aujourd'hui** |
| **5** | **Custom Agents** | 🔵 **Aujourd'hui** |
| 6 | MCP | ⏳ Demain |
| 7 | Hooks | ⏳ Demain |

<br>

<v-click>

> Rappel de la hierarchie :
> - Instructions = **regles passives** (toujours actives)
> - Prompts = **taches explicites** (vous tapez `/`)
> - Skills = **workflows automatiques** (Copilot decide)
> - Agents = **personas specialisees** (identite active sur toute une session)

</v-click>

---
layout: section
---

# Primitive 4 — Agent Skills

---

# Qu'est-ce qu'un Skill ?

> Un **Skill** est un package de connaissance procedurale que Copilot charge automatiquement quand votre message **correspond semantiquement** a sa description. Vous ne tapez pas `/` — Copilot decide de l'utiliser.

<br>

<v-clicks>

**Comparaison avec les Prompts :**

| Prompt File | Skill |
|-------------|-------|
| Invoque avec `/commande` | S'active par intention |
| Vous choisissez l'outil | Copilot choisit l'outil |
| Idéal pour les taches explicites | Idéal pour les workflows recurrents |
| `generate-feature.prompt.md` | `SKILL.md` dans un dossier dedié |

</v-clicks>

---

# Le mecanisme de decouverte

```
Chaque session Copilot charge :
  ┌─────────────────────────────────┐
  │  Catalogue des skills           │
  │  (noms + descriptions)          │
  └─────────────────────────────────┘
           │
           ▼
  Vous tapez : "lance les tests et dis-moi ce qui echoue"
           │
           ▼
  Copilot compare votre message aux descriptions
           │
           ▼
  Correspondance trouvee : "run-and-fix-tests"
           │
           ▼
  Charge le SKILL.md complet dans le contexte
           │
           ▼
  Execute : dotnet test → parse → rapport + corrections
```

---

# L'art de la description — La cle de tout

La **description** du skill est le seul element que Copilot lit pour decider de le charger.

<v-clicks>

| Mauvaise description | Bonne description |
|---------------------|-------------------|
| `"Test runner skill"` | `"Lance dotnet test, analyse les echecs et suggere des corrections ciblees. Utiliser quand l'utilisateur veut lancer les tests, verifier les resultats, investiguer des echecs, ou corriger des tests unitaires."` |
| `"Migration tool"` | `"Guide l'ajout, la revue, l'application et le rollback de migrations EF Core avec les flags --project et --startup-project corrects. Utiliser quand l'utilisateur parle de migration, schema, dotnet ef, ou changement de base de donnees."` |

</v-clicks>

<br>

<v-click>

> **Regle d'or :** Incluez **ce que fait le skill** ET les **phrases que l'utilisateur dirait naturellement** pour ce besoin.

</v-click>

---

# Structure d'un Skill

```
.github/
└── skills/
    └── run-and-fix-tests/     ← nom du dossier = nom du skill
        └── SKILL.md           ← fichier obligatoire
```

<br>

```yaml
---
name: run-and-fix-tests           ← minuscules, tirets uniquement
description: "..."                ← LE champ le plus important
argument-hint: "..."              ← indication affichee dans le chat
---
```

<v-clicks>

- Le **dossier** peut contenir d'autres fichiers (templates, scripts, donnees de reference)
- Le **`SKILL.md`** contient les instructions completes que Copilot suivra
- Le standard est ouvert : **agentskills.io**

</v-clicks>

---
layout: section
---

# Les skills du projet

---

# Skill 1 — `run-and-fix-tests`

**Declencheurs naturels :**
```
"lance les tests"
"pourquoi mes tests sont casses ?"
"dotnet test echoue, aide-moi a debugger"
"run the tests and fix any failures"
```

<v-clicks>

**Ce que le skill fait (en ordre) :**

1. Lance `dotnet test tests/LeaveManagement.Application.UnitTests --verbosity normal`
2. Parse la sortie — detecte les tests en echec
3. Consulte la **table de diagnostic** (pattern d'erreur → cause probable)
4. Propose des corrections ciblees fichier par fichier
5. Demande de relancer les tests apres correction

</v-clicks>

---

# Skill 1 — La table de diagnostic

| Pattern d'erreur | Cause probable | Action |
|-----------------|----------------|--------|
| `NullReferenceException` dans un handler | Repository mock non configure | Ajouter `.Setup()` pour la methode manquante |
| `AutoMapper: Missing map` | Mapping non enregistre | Ajouter le profile dans `MappingProfile.cs` |
| `CS0246: type not found` | Using manquant ou namespace incorrect | Verifier les imports |
| `FluentValidation: Must not be empty` | Commande de test sans champ requis | Initialiser tous les champs obligatoires dans Arrange |

<br>

<v-click>

> La table de diagnostic est ce qui distingue un Skill d'un prompt generique — elle encode la **connaissance du projet**.

</v-click>

---

# Skill 2 — `ef-core-migration`

**Declencheurs naturels :**
```
"ajoute une migration pour la nouvelle entite Department"
"le schema a change, mets a jour la base"
"comment appliquer la migration ?"
"dotnet ef migrations add ..."
```

<v-clicks>

**Ce que le skill fait :**

1. Verifie que `dotnet ef` est installe (`dotnet ef --version`)
2. Genere la commande avec les **deux flags obligatoires** :
   ```bash
   dotnet ef migrations add NomMigration \
     --project src/LeaveManagement.Infrastructure \
     --startup-project src/LeaveManagement.API
   ```
3. Indique ou verifier le fichier genere avant d'appliquer
4. Guide l'application : `dotnet ef database update ...`
5. Explique le rollback si necessaire

</v-clicks>

---

# Skill 2 — Pourquoi les deux flags sont critiques

Sans les flags, `dotnet ef` echoue si plusieurs projets contiennent un `DbContext` :

```bash
# ❌ Sans flags — erreur ambigue si plusieurs projets
dotnet ef migrations add AddDepartment

# ✅ Avec flags — toujours fiable
dotnet ef migrations add AddDepartment \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```

<v-click>

> Ce type de **connaissance specifique au projet** est exactement ce qu'un Skill doit encoder. Un developpeur junior ne connait pas ces flags — le Skill lui evite l'erreur.

</v-click>

---
layout: section
---

# Demo — Skills en action

---

# Demo 1 — `run-and-fix-tests` (sans taper `/`)

**Scenario :** Un test echoue apres l'ajout d'une nouvelle feature

<v-clicks>

**Etape 1 :** Dans Copilot Chat (Agent mode), taper :
```
run the tests and tell me if anything is failing
```

**Etape 2 :** Observer que Copilot :
- Reconnait l'intention (sans `/`)
- Lance `dotnet test` dans le terminal
- Parse la sortie et identifie les echecs

**Etape 3 :** Tester une autre formulation :
```
pourquoi mes tests sont casses ?
```

**Meme skill, meme resultat** — la correspondance est **semantique**, pas par mot-cle.

</v-clicks>

---

# Demo 2 — `ef-core-migration`

**Scenario :** Ajouter une entite `Department` avec sa table en base

<v-clicks>

**Etape 1 :** Taper dans Copilot Chat :
```
Verifie si dotnet ef est installe et ajoute une migration AddDepartmentEntity
```

**Observer :**
- Copilot charge le skill `ef-core-migration`
- Verifie la presence de l'outil
- Genere la commande **avec les deux flags** — jamais sans

**Etape 2 :** Continuer dans la meme session :
```
maintenant applique la migration a la base
```

Copilot enchaîne avec `dotnet ef database update` — **maintien du contexte** entre les tours.

</v-clicks>

---
layout: section
---

# Ecrire un bon `SKILL.md`

---

# Structure recommandee d'un SKILL.md

```markdown
---
name: mon-skill
description: "Ce que le skill fait + quand l'utiliser (phrases naturelles)"
argument-hint: "Etape optionnelle a sauter directement (ex: 'connection string')"
---

## Prerequis
Ce qui doit etre en place avant d'executer

## Etape 1 — [Nom]
Instructions detaillees + commande exacte

## Etape 2 — [Nom]
...

## Table d'erreurs courantes
| Erreur | Cause | Correction |

## Apres execution
Ce que l'utilisateur doit verifier
```

---

# Les trois ingredients d'un Skill utile

<v-clicks>

**1. Une description qui fait correspondance**
→ Inclure les phrases exactes que l'equipe dirait pour ce besoin

**2. Des etapes precises et sequentielles**
→ Chaque etape doit produire un etat stable (le projet compile, les tests passent)

**3. Une table de diagnostic**
→ Anticiper les erreurs courantes — c'est la valeur ajoutee par rapport a un prompt generique

</v-clicks>

<br>

<v-click>

> Un Skill sans table de diagnostic est un prompt deguise. La table est ce qui encode la **connaissance de l'equipe** et evite les allers-retours.

</v-click>

---

# Skills vs. Prompts vs. Instructions — Le guide definitif

| Scenario | Outil |
|----------|-------|
| "Toujours nommer les tests en `MethodName_State_Result`" | Always-On Instructions |
| "Regles tests actives seulement sur `*Tests.cs`" | File-Based Instructions |
| "Je tape `/review-code` pour lancer la revue" | Prompt File |
| "Je dis 'lance les tests' et Copilot agit seul" | **Skill** |
| "J'ai besoin d'un expert securite pour toute la session" | **Custom Agent** |
| "Le skill necessite un template ou un script annexe" | **Skill** (avec dossier) |

---
layout: section
---

# Recapitulatif — Partie 1

---

# Ce que vous savez maintenant (Agent Skills)

<v-clicks>

- Un **Skill** est un package de connaissance procedurale a declenchement automatique
- Copilot lit les **descriptions** de tous les skills et choisit celui qui correspond a votre message
- La **description** est le champ le plus important — elle doit inclure les phrases naturelles de l'equipe
- `run-and-fix-tests` → lance `dotnet test`, parse, diagnostique, corrige
- `ef-core-migration` → genere les commandes avec les bons flags, guide pas a pas
- Un Skill peut contenir **plusieurs fichiers** (templates, scripts, donnees de reference)
- Le standard est ouvert : **agentskills.io**

</v-clicks>

---
layout: section
---

# Primitive 5 — Custom Agents

---

# Qu'est-ce qu'un Custom Agent ?

> Un **Custom Agent** est une persona IA specialisee avec sa propre methodologie, son propre format de reponse et ses propres gardes-fous. Il maintient son identite sur **toute la session**.

<br>

<v-clicks>

- Un agent n'est pas une liste de regles — c'est un **expert avec une façon de penser**
- Il s'active via le selecteur d'agent : `@nom-de-lagent`
- Chaque question dans la session beneficie du contexte accumule depuis le debut
- Il peut **refuser** des requetes qui violent ses principes

</v-clicks>

---

# Instructions vs. Custom Agents — La difference cle

| Always-On Instructions | Custom Agent |
|------------------------|-------------|
| "Utilise les constructeurs primaires" | "Je suis un expert refactoring. Je diagnostique les violations." |
| Regles de style passives | Persona active avec une methodologie |
| Toujours en contexte | Active par `@agent-name` |
| Pas de memoire de conversation | Maintient sa persona sur toute la session |
| Dit quoi faire | Decide comment approcher le probleme |

<br>

<v-click>

> **Analogie :** Les instructions sont le **reglement interne** de l'equipe. Un agent est un **consultant expert** que vous appelez pour une mission.

</v-click>

---

# Ou vivent les agents

```
.github/
└── agents/
    └── {nom}.agent.md        ← n'importe quel .md dans agents/
```

<br>

```yaml
---
name: clean-architecture-refactor-expert   ← affiché dans le selecteur
description: "..."                         ← texte d'aide dans le chat
---
```

<v-clicks>

- Le **nom** doit etre en minuscules avec tirets — c'est ce que vous tapez apres `@`
- La **description** aide les developpeurs a choisir le bon agent
- Le **corps** du fichier est le system prompt de l'agent

</v-clicks>

---
layout: section
---

# La formule de l'agent — 5 sections

---

# La formule en 5 sections

Tout agent efficace repond a ces 5 questions :

<v-clicks>

| Section | Question | Exemple |
|---------|----------|---------|
| **Qui je suis** | Persona + background | "Senior .NET architect, 20 ans d'experience" |
| **Comment je pense** | Methodologie + questions que je pose toujours | "Est-ce que ce handler injecte ApplicationContext ?" |
| **Comment je reponds** | Structure de sortie + format | "Tableau de violations, puis plan, puis diffs" |
| **Ce que je fais toujours** | Comportements constants | "Fournir un fix pour chaque violation trouvee" |
| **Ce que je ne fais jamais** | Gardes-fous | "Ne jamais suggerer de static — toujours DI" |

</v-clicks>

---

# Pourquoi "Ce que je ne fais jamais" est crucial

<v-clicks>

Sans gardes-fous, un agent derive :
- L'utilisateur demande quelque chose de contraire aux bonnes pratiques
- L'agent obtempere — il est "poli" par defaut
- Le code produit viole l'architecture du projet

Avec gardes-fous :
- L'agent **refuse** et **explique pourquoi**
- Le refus est une valeur ajoutee, pas un obstacle
- L'agent reste coherent meme sous pression

</v-clicks>

<br>

<v-click>

> **Exemple :** "Peux-tu deplacer la logique de validation dans une classe utilitaire statique ?"
> L'agent refuse : "La validation statique casse l'injection de dependances et rend les tests impossibles."

</v-click>

---
layout: section
---

# Les agents du projet

---

# Agent 1 — Clean Architecture Refactor Expert

**Fichier :** `.github/agents/clean-architecture-refactor-expert.agent.md`

<v-clicks>

**Persona :** Senior .NET architect, 20+ ans d'experience en Clean Architecture

**Specialite :** Violations CQRS, injection de `ApplicationContext`, mapping inline, logging par interpolation, `CancellationToken` manquant

**Comment il repond :**
1. **Tableau de violations** — Location / Violation / Severite / Regle violee
2. **Plan de refactoring** — etapes sequentielles, chaque etape laisse le projet compilable
3. **Diffs avant/apres** — code concret pour chaque correction
4. **Handoff** — "Lancez `/run-and-fix-tests` pour verifier que rien n'est casse"

</v-clicks>

---

# Agent 1 — Ses gardes-fous

**Ce que l'expert ne fait jamais :**

<v-clicks>

- N'injecte jamais `ApplicationContext` directement dans un handler
- Ne suggere jamais de `static` — toujours DI
- Ne propose jamais de mapper inline — toujours via un profile dedie
- Ne consolide jamais plusieurs etapes de refactoring en un seul commit
- Ne commence jamais a modifier sans avoir produit le tableau de violations

</v-clicks>

<br>

<v-click>

> Testez ses gardes-fous : demandez-lui de "deplacer la validation dans un utilitaire statique". Il doit refuser et expliquer pourquoi DI est la bonne approche.

</v-click>

---

# Agent 2 — C# Migration Specialist

**Fichier :** `.github/agents/c-sharp-migration-specialist.md`

<v-clicks>

**Persona :** Principal .NET engineer specialise dans les migrations de version

**Specialite :** .NET 6/7/8 → .NET 10, `Startup.cs` → Minimal API, `SpecFlow` → Reqnroll, Swashbuckle → Scalar

**Comment il repond :**
1. **Audit de l'etat actuel** — versions des packages vs. versions cibles
2. **Plan de migration** — etapes ordonnees, une seule chose a la fois
3. **Checklist de verification** — `dotnet build` + `dotnet test` apres chaque etape

**Sa garde-fous cle :** Ne jamais upgrader tous les packages en un seul commit

</v-clicks>

---
layout: section
---

# Les handoffs — Chaîner les agents

---

# Pourquoi les handoffs ?

<v-clicks>

Chaque agent est un **specialiste focuse**. Un seul agent ne peut pas tout faire efficacement :

- L'expert refactoring sait ce qui est mauvais — mais ce n'est pas lui qui lance les tests
- L'expert upgrade sait planifier — mais c'est le skill `run-and-fix-tests` qui valide

</v-clicks>

<br>

<v-clicks>

**Principle :** Chaque agent termine sa partie et **passe le relais** :

```
Clean Architecture Expert
  → "Refactoring termine. Lancez /run-and-fix-tests pour valider."

C# Migration Specialist
  → "Migration appliquee. Lancez dotnet build, puis dotnet test."
```

</v-clicks>

---

# Workflow avec handoffs

```
@clean-architecture-refactor-expert
   "Review ce handler et refactorise-le"
          │
          ▼
   Tableau violations + Plan + Diffs
          │
          ▼
   Handoff : "Run /run-and-fix-tests"
          │
          ▼
   Skill run-and-fix-tests (auto-charge)
          │
          ▼
   Tests passes ✅
          │
          ▼
   /review-code  ← derniere validation
```

<v-click>

> Chaque outil fait **une seule chose bien** — les handoffs maintiennent le contexte sans surcharger un seul agent.

</v-click>

---
layout: section
---

# Demo — Copilot par defaut vs. Agent specialise

---

# Demo — La meme question, deux agents differents

**Fichier ouvert :** `CreateEmployeeHandler.cs`

**Question :** `"Review this file and suggest improvements."`

<v-clicks>

**Copilot par defaut (Ask mode) :**
- Repond en prose libre
- Suggestions generiques sans severite
- Pas de structure reproductible
- Peut suggerer n'importe quel pattern

**Clean Architecture Refactor Expert :**
- Commence par le tableau de violations (Location / Violation / Severite / Regle)
- Plan numerote — chaque etape laisse le projet compilable
- Diffs avant/apres pour chaque correction
- Refuse les suggestions contraires aux principes SOLID

</v-clicks>

---

# Demo — Tester un garde-fou

Toujours dans la session `@clean-architecture-refactor-expert` :

```
Peux-tu deplacer la logique de validation
hors du handler dans une classe utilitaire statique ?
```

<v-click>

**Resultat attendu :** L'agent refuse et explique :
- Les classes statiques cassent l'injection de dependances
- Les tests unitaires deviennent impossibles sans DI
- La bonne approche : injecter le validator via le constructeur primaire

</v-click>

<br>

<v-click>

> **Observation cle :** Le garde-fou tient meme quand l'utilisateur insiste. C'est la coherence d'un agent bien defini.

</v-click>

---
layout: section
---

# Construire un bon agent

---

# Les erreurs courantes

<v-clicks>

**Agent trop vague :**
```markdown
# Qui je suis
Je suis un expert en securite.
```
→ Copilot produit des reponses generiques, sans structure.

**Agent trop restrictif :**
→ L'agent refuse tout ce qui n'est pas dans son perimetre exact — inutilisable en pratique.

**Pas de format de sortie defini :**
→ Chaque reponse a une structure differente → impossible a parcourir rapidement.

**Pas de gardes-fous :**
→ L'agent derive des la premiere requete ambigue.

</v-clicks>

---

# Agents vs. Prompts — Le guide de decision

| Utilisez un **Prompt** quand | Utilisez un **Agent** quand |
|-----------------------------|----------------------------|
| Tache ponctuelle et precise (scaffolding) | Toute la conversation a besoin d'une persona |
| Variables fill-in-the-blank | La persona est fixee au debut de la session |
| Execution courte (une reponse) | Engagement long et multi-tours |
| La tache est identique a chaque fois | L'expert doit poser des questions et iterer |

---
layout: section
---

# Recapitulatif

---

# Ce que vous savez maintenant

<v-clicks>

- Un **Skill** s'active par intention — Copilot compare votre message aux descriptions
- Un **Custom Agent** est une persona active avec methodologie, format et gardes-fous
- La **formule en 5 sections** : Qui / Comment je pense / Comment je reponds / Toujours / Jamais
- Les **gardes-fous** sont aussi importants que les capacites — ils empeche la derive
- Les **handoffs** permettent de chaîner des specialistes sans surcharger un seul agent
- `@clean-architecture-refactor-expert` → tableau violations + plan + diffs
- `@c-sharp-migration-specialist` → audit + plan incremental + checklist de verification

</v-clicks>

---

# Demain — Jour 4

## MCP et Hooks : la portee et l'application des regles

<v-clicks>

- Connecter Copilot a un systeme externe (GitHub) avec un serveur **MCP**
- Transformer un finding de revue de code en issue GitHub, sans quitter l'editeur
- Comprendre pourquoi une instruction ne suffit pas toujours — et ce qu'un **hook** garantit en plus
- Ecrire un hook `PreToolUse` qui bloque l'edition d'une migration deja appliquee

</v-clicks>

<br>

<v-click>

**Pas de lab separe demain : l'atelier guide est integre directement dans la session.**

</v-click>

---
layout: center
---

# Questions ?
