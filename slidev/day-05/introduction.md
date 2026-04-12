---
title: "Jour 5 — Custom Agents : personas IA specialisees"
description: "Creer des agents avec une methodologie propre, des gardes-fous et des handoffs entre specialistes"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 5 — Custom Agents : personas IA specialisees

<br>


<!--
Aujourd'hui on cree des agents specialises — des personas IA avec leur propre facon de penser, de repondre et leurs propres gardes-fous.
La difference avec les instructions : un agent est actif, il a une identite et la maintient sur toute une session.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

1. **Rappel** — Les 4 primitives maitrisees, la derniere aujourd'hui
2. **Qu'est-ce qu'un Custom Agent ?** — La difference avec les instructions et les prompts
3. **La formule de l'agent** — Les 5 sections obligatoires
4. **Les agents du projet** — Refactoring Expert et .NET Upgrade Expert
5. **Les handoffs** — Chaîner des agents specialistes entre eux
6. **Les gardes-fous** — "Ce que je ne fais jamais" est aussi important que les capacites
7. **Demo** — Comparer Copilot par defaut vs. agent specialise
8. **Lab 05** — Vous creez un agent Security Reviewer de zero

</v-clicks>

---
layout: section
---

# Rappel — La derniere primitive

---

# Les 5 primitives — Ligne d'arrivee

| # | Primitive | Statut |
|---|-----------|--------|
| 1 | Always-On Instructions | ✅ Acquis |
| 2 | File-Based Instructions | ✅ Acquis |
| 3 | Prompt Files | ✅ Acquis |
| 4 | Agent Skills | ✅ Acquis |
| **5** | **Custom Agents** | 🔵 **Aujourd'hui** |

<br>

<v-click>

> Demain : **Jour 6** — vous assemblez les 5 primitives ensemble sur un workflow complet de bout en bout.

</v-click>

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

# Agent 2 — .NET Upgrade Expert

**Fichier :** `.github/agents/dotnet-upgrade-expert.agent.md`

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

.NET Upgrade Expert
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

- Un **Custom Agent** est une persona active avec methodologie, format et gardes-fous
- La **formule en 5 sections** : Qui / Comment je pense / Comment je reponds / Toujours / Jamais
- Les **gardes-fous** sont aussi importants que les capacites — ils empeche la derive
- Les **handoffs** permettent de chaîner des specialistes sans surcharger un seul agent
- `@clean-architecture-refactor-expert` → tableau violations + plan + diffs
- `@dotnet-upgrade-expert` → audit + plan incremental + checklist de verification

</v-clicks>

---

# Demain — Jour 6

## Workflow End-to-End : les 5 primitives ensemble

<v-clicks>

- Implementer une feature complete de bout en bout
- Utiliser chaque primitive au bon moment dans le workflow
- Voir comment les primitives se **complementent** — aucune ne fait tout seule
- Debriefing collectif : quelle primitive a eu le plus d'impact ?

</v-clicks>

<br>

<v-click>

**Le Jour 6 est le test final de tout ce que vous avez construit cette semaine.**

</v-click>

---
layout: center
---

# Questions ?
