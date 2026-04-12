---
title: "Jour 6 — Workflow End-to-End : les 5 primitives ensemble"
description: "Capstone : implementer une feature complete en utilisant chaque primitive au bon moment"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 6 — Workflow End-to-End : les 5 primitives ensemble

<br>


<!--
C'est le jour de synthese. Aujourd'hui on ne decouvre plus — on assemble.
Chaque primitive a sa place dans un workflow reel de livraison de feature.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

1. **Bilan de la semaine** — Les 5 primitives en un coup d'oeil
2. **La feature a implementer** — Un user story realiste de bout en bout
3. **Le workflow en 6 phases** — Chaque phase utilise une primitive differente
4. **Carte des primitives** — Ce qui s'active quand, et pourquoi
5. **Lab 06 — Capstone** — Vous implementez la feature complete
6. **Debrief collectif** — Quelle primitive a eu le plus d'impact ?
7. **Apres la formation** — Comment etendre votre configuration Copilot

</v-clicks>

---
layout: section
---

# Bilan de la semaine

---

# Les 5 primitives — Tout est en place

| # | Primitive | Role | Declenchement |
|---|-----------|------|--------------|
| 1 | **Always-On Instructions** | Standards universels du projet | Automatique — chaque session |
| 2 | **File-Based Instructions** | Regles par couche applicative | Automatique — selon `applyTo` |
| 3 | **Prompt Files** | Workflows encodes en commandes `/` | Manuel — vous tapez `/commande` |
| 4 | **Agent Skills** | Workflows proceduraux par intention | Automatique — Copilot choisit |
| 5 | **Custom Agents** | Personas expertes multi-tours | Manuel — `@nom-de-lagent` |

<br>

<v-click>

> Aujourd'hui : ces 5 primitives travaillent **ensemble**, chacune au bon moment.

</v-click>

---

# Un environnement Copilot complet

```
.github/
├── copilot-instructions.md                    ← Primitive 1
├── instructions/
│   ├── tests.instructions.md                  ← Primitive 2
│   ├── handlers.instructions.md               ← Primitive 2
│   └── migrations.instructions.md             ← Primitive 2
├── prompts/
│   ├── review-code.prompt.md                  ← Primitive 3
│   ├── generate-feature.prompt.md             ← Primitive 3
│   └── explain-architecture.prompt.md         ← Primitive 3
├── skills/
│   ├── run-and-fix-tests/SKILL.md             ← Primitive 4
│   └── ef-core-migration/SKILL.md             ← Primitive 4
└── agents/
    ├── clean-architecture-refactor-expert.agent.md  ← Primitive 5
    └── dotnet-upgrade-expert.agent.md               ← Primitive 5
```

---
layout: section
---

# La feature du jour

---

# Le user story

> **"En tant que RH, je veux rechercher les employes par departement afin de trouver rapidement tous les membres d'une equipe."**

<br>

<v-clicks>

**Ce que cela implique techniquement :**
- Nouvel endpoint : `GET /api/employees/search?department=Engineering`
- Retourne une liste de `EmployeeResponse`
- Suit le pattern CQRS existant (`GetEmployeesByDepartmentQuery`)
- Valide que le departement n'est pas vide
- Retourne une liste vide si aucun resultat (pas une erreur)
- Logs avec `[LoggerMessage]` au niveau Information

</v-clicks>

---

# Pourquoi cette feature ?

<v-clicks>

- Elle touche **toutes les couches** : Controller → Query → Handler → Repository → DTO
- Elle est **realiste** — pas trop simple, pas trop complexe
- Elle permet de valider chaque primitive en conditions reelles
- Elle genere naturellement des tests (cas valide, vide, validation echec)

</v-clicks>

<br>

<v-click>

> C'est exactement le type de feature qu'un developpeur livre plusieurs fois par semaine. L'objectif : livrer avec **zero correction manuelle** des violations de conventions.

</v-click>

---
layout: section
---

# Le workflow en 6 phases

---

# Vue d'ensemble du workflow

| Phase | Action | Primitive |
|-------|--------|-----------|
| 1 | Comprendre l'architecture existante | Always-On + `/explain-architecture` |
| 2 | Implementer la feature | Always-On + File-Based (actifs en silence) |
| 3 | Generer les tests | `/generate-feature` + File-Based tests |
| 4 | Lancer et corriger les tests | Skill `run-and-fix-tests` |
| 5 | Refactoring | `@clean-architecture-refactor-expert` |
| 6 | Revue de code finale | `/review-code` |

<br>

<v-click>

> Observez : certaines primitives sont **invoquees explicitement**, d'autres s'activent **en silence**. Les deux sont necessaires.

</v-click>

---

# Phase 1 — Comprendre avant d'agir (10 min)

**Primitive : Always-On Instructions + Prompt `/explain-architecture`**

<v-clicks>

**Dans Copilot Chat (mode Ask) :**
```
/explain-architecture
```
Quand demande le scope, entrer : `the CQRS query layer`

**Ce que vous apprenez :**
- Ou ajouter `GetEmployeesByDepartmentQuery` dans Application
- Ou ajouter le handler et le validator
- Ce que `IEmployeeRepository` doit exposer
- Ce que `EmployeeResponse` contient deja

**Ensuite, explorer le pattern existant :**
```
Montre-moi comment GetEmployeeByIdQuery est implementé —
du controller jusqu'au repository. Explique le pattern a suivre.
```

</v-clicks>

---

# Phase 2 — Implementer la feature (20 min)

**Primitive : Always-On Instructions + File-Based Instructions (actives en silence)**

```
Implemente un endpoint GET /api/employees/search?department=Engineering
qui retourne une liste de EmployeeResponse en suivant le pattern CQRS.
Valide que department n'est pas vide. Retourne une liste vide si aucun match.
Logue la requete avec [LoggerMessage] au niveau Information.
```

<v-clicks>

**Copilot cree automatiquement :**
- `GetEmployeesByDepartmentQuery.cs`
- `GetEmployeesByDepartmentHandler.cs`
- `GetEmployeesByDepartmentValidator.cs`
- Signature de methode dans `IEmployeeRepository`

**Signes que les instructions fonctionnent :**
- Constructeur primaire (pas de `private readonly` + corps)
- `EmployeeResponse` retourne (pas l'entite)
- `[LoggerMessage]` (pas d'interpolation)
- `BaseResponse` pour l'erreur de validation

</v-clicks>

---

# Phase 3 — Generer les tests (10 min)

**Primitive : Prompt `/generate-feature` + File-Based Instructions tests**

```
/generate-feature
```

Variables : `entityName = Employee` · `featureType = Query` · `operation = GetByDepartment`

<v-clicks>

**Tests attendus :**
- `GetEmployeesByDepartment_ValidDepartment_ReturnsMatchingEmployees`
- `GetEmployeesByDepartment_EmptyDepartment_ReturnsFailureResponse`
- `GetEmployeesByDepartment_NoMatch_ReturnsEmptyList`

**Signes que `tests.instructions.md` a fonctionne :**
- Methodes nommees en `MethodName_StateUnderTest_ExpectedBehaviour`
- `[Fact]` xUnit, pas `[Test]`
- Assertions FluentAssertions (`.Should().Be()`)
- `IEmployeeRepository` mocke — pas de vraie base de donnees

</v-clicks>

---

# Phase 4 — Lancer et corriger les tests (10 min)

**Primitive : Skill `run-and-fix-tests` (auto-charge sur intention)**

```
run the tests and fix any failures
```

<v-clicks>

**Ce que Copilot fait automatiquement :**
1. Detecte l'intention → charge le skill `run-and-fix-tests`
2. Lance `dotnet test tests/LeaveManagement.Application.UnitTests`
3. Parse la sortie — identifie les echecs
4. Diagnostique la cause racine via la table d'erreurs
5. Propose les corrections ciblees

**Objectif :** Tous les tests passent avant de passer a la phase 5.

</v-clicks>

---

# Phase 5 — Refactoring (10 min)

**Primitive : Custom Agent `@clean-architecture-refactor-expert`**

Basculer vers l'agent, ouvrir `GetEmployeesByDepartmentHandler.cs` :

```
Review le handler que je viens d'ajouter et refactorise-le si necessaire.
```

<v-clicks>

**L'agent produit :**
1. **Tableau de violations** — verifie : `ApplicationContext`, mapping inline, interpolation logging, `CancellationToken` manquant
2. **Diffs avant/apres** pour chaque probleme trouve
3. **Handoff** : "Lancez `/run-and-fix-tests` pour verifier que le refactoring n'a rien casse"

**Suivre le handoff** — relancer les tests pour confirmer.

</v-clicks>

---

# Phase 6 — Revue de code finale (10 min)

**Primitive : Prompt `/review-code`**

Ouvrir `EmployeesController.cs`, focus sur le nouvel endpoint `search` :

```
/review-code
```

<v-clicks>

**Ce que `/review-code` verifie :**
- `[CRITICAL]` Controller appelle seulement `_mediator.Send()` — pas de logique metier
- `[MAJOR]` Parametre `department` valide dans le handler, pas dans le controller
- `[MAJOR]` Pas de `_logger.LogInformation($"...")` avec des donnees employee (PII)
- `[MINOR]` `BaseResponse` retourne de facon coherente sur tous les endpoints

**Si des problemes sont trouves :** corriger et relancer `/review-code` jusqu'a zero Major/Critical.

</v-clicks>

---
layout: section
---

# Carte complete des primitives

---

# Ce qui s'est active — et quand

```
Phase 1 — /explain-architecture invoque
    └── Prompt File (invocation explicite)
    └── Always-On Instructions (contexte architectural toujours present)

Phase 2 — Implementation
    └── Always-On Instructions (silent — conventions enforced)
    └── handlers.instructions.md (silent — fichier Handler.cs ouvert)

Phase 3 — /generate-feature invoque
    └── Prompt File (invocation explicite)
    └── tests.instructions.md (silent — fichier *Tests.cs genere)

Phase 4 — "run the tests and fix failures"
    └── Skill run-and-fix-tests (auto-detecte sur intention)

Phase 5 — @clean-architecture-refactor-expert
    └── Custom Agent (invocation explicite par persona)
    └── Handoff → Skill run-and-fix-tests

Phase 6 — /review-code invoque
    └── Prompt File (invocation explicite)
```

---

# L'observation cle

<v-clicks>

**Primitives passives** (Jours 2) — actives en silence, zero effort :
- `copilot-instructions.md` — present sur chaque requete
- `handlers.instructions.md` — charge quand un handler est ouvert
- `tests.instructions.md` — charge quand un test est genere

**Primitives actives** (Jours 3-5) — invoquees au bon moment :
- `/explain-architecture` → comprendre avant d'agir
- `/generate-feature` → scaffolding fiable et complet
- `run-and-fix-tests` → validation automatique (sans `/`)
- `@clean-architecture-refactor-expert` → expertise focusee
- `/review-code` → porte de qualite finale

</v-clicks>

<br>

<v-click>

> **Aucune primitive ne fait tout seule.** C'est leur **combinaison** qui produit un workflow fiable.

</v-click>

---
layout: section
---

# Debrief collectif

---

# Les questions du debrief

Repondez ensemble :

<v-clicks>

1. **Ou avez-vous tape le moins de mots pour le plus de resultat ?** Pourquoi ?
2. **Quelle primitive a economise le plus de temps** par rapport a ne pas l'avoir ?
3. **Quelle regle de `copilot-instructions.md` a ete enforced automatiquement** sans que vous le demandiez ?
4. **Que se serait-il passe** si `tests.instructions.md` n'avait pas existe ?
5. **Quelle regle ajouteriez-vous** aux instructions apres ce que vous avez observe aujourd'hui ?

</v-clicks>

---

# Metriques — Ce qui change avec 5 primitives

| Metrique | Sans config | Avec 5 primitives |
|----------|-------------|-------------------|
| Suggestions acceptees sans modification | ~30% | ~85% |
| Violations d'architecture detectees avant PR | Rares | Systematiques |
| Temps de correction post-suggestion | Eleve | Minimal |
| Coherence entre developpeurs | Variable | Uniforme |
| Onboarding d'un nouveau dev | Semaines | Jours |

<br>

<v-click>

> La configuration Copilot n'est pas un luxe — c'est un **multiplicateur de productivite** pour toute l'equipe.

</v-click>

---
layout: section
---

# Apres la formation

---

# Comment etendre votre configuration

<v-clicks>

**Semaine 1 apres la formation :**
- Committer `.github/copilot-instructions.md` dans votre vrai projet
- Ajouter un premier fichier file-based pour vos tests
- Tester `/review-code` sur un vrai PR

**Semaine 2-3 :**
- Creer `/generate-feature` adapte a votre stack
- Configurer le skill `run-and-fix-tests` pour votre runner de tests
- Identifier les cas ou un Custom Agent apporterait de la valeur

**Sur le long terme :**
- Revue trimestrielle des instructions
- Ajouter une regle a chaque fois que Copilot repete la meme erreur
- Partager vos prompts entre equipes (inner-source des configurations)

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

Vous avez maintenant les outils pour faire cet onboarding **une fois** et en beneficier **indefiniment**.

</v-click>

---
layout: section
---

# Recapitulatif de la semaine

---

# Les 6 jours en un tableau

| Jour | Sujet | Ce que vous avez construit |
|------|-------|---------------------------|
| 1 | Fondamentaux | Modele mental, contexte, tokens, modes |
| 2 | Instructions | `copilot-instructions.md` + 3 fichiers file-based |
| 3 | Prompt Files | `/review-code`, `/generate-feature`, `/explain-architecture` |
| 4 | Skills | `run-and-fix-tests`, `ef-core-migration`, `setup-local-dev` |
| 5 | Custom Agents | Refactoring Expert, Upgrade Expert, Security Reviewer |
| **6** | **End-to-End** | **Feature complete avec les 5 primitives** |

---

# Ce que vous emportez

<v-clicks>

- La **metaphore fondatrice** : Copilot = nouveau dev talentueux a onboarder
- Les **tokens et le contexte** : pourquoi la concision des instructions compte
- **5 primitives** qui se complementent — passives + actives
- Un **workflow reproductible** : comprendre → implementer → tester → refactorer → reviewer
- Un **framework d'evaluation** pour mesurer la qualite des suggestions
- Un **environnement `.github/` complet** pret a etre adapte a votre projet

</v-clicks>

---
layout: center
---

# Merci
