---
title: "Jour 2 — Custom Instructions : Always-On et File-Based"
description: "Construire un copilot-instructions.md efficace et des instructions contextuelles par couche applicative"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 2 — Custom Instructions : Always-On et File-Based

<br>


<!--
Bienvenue dans le Jour 2.
Aujourd'hui on passe a la pratique : vous allez ecrire vos premieres instructions et voir leur impact en direct.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

1. **Rappel** — Les 5 primitives et ou on en est
2. **Primitive 1 : Always-On Instructions** — `copilot-instructions.md`, structure, bonnes pratiques
3. **Le bootstrap `/init`** — Generer un premier fichier d'instructions automatiquement
4. **Primitive 2 : File-Based Instructions** — `*.instructions.md` + `applyTo` glob patterns
5. **Strategie multicouche** — Combiner always-on et file-based intelligemment
6. **Demo avant/apres** — Voir l'impact des deux primitives en direct
7. **Labs 01 et 02** — Vous construisez vos propres fichiers d'instructions

</v-clicks>

<!--
Ce module est le plus fondamental de la semaine.
Les instructions sont le socle sur lequel tout le reste s'appuie.
-->

---
layout: section
---

# Rappel — La semaine en un coup d'oeil

---

# Les 5 primitives — Feuille de route

| # | Primitive | Ce qu'elle fait | Jour |
|---|-----------|-----------------|------|
| **1** | **Always-On Instructions** | Standards et architecture du projet | **Aujourd'hui** |
| **2** | **File-Based Instructions** | Regles specifiques par type de fichier | **Aujourd'hui** |
| 3 | Prompt Files | Commandes slash reutilisables | Jour 3 |
| 4 | Skills | Workflows multi-etapes avec scripts | Jour 4 |
| 5 | Custom Agents | Personas IA specialisees | Jour 5 |

<br>

<v-click>

> Aujourd'hui, nous posons les **fondations passives** : les instructions qui chargent automatiquement, sans que vous ayez besoin de taper quoi que ce soit.

</v-click>

---
layout: section
---

# Primitive 1 — Always-On Instructions

---

# `copilot-instructions.md` — Le fichier de base

```
.github/copilot-instructions.md
```

<v-clicks>

- Charge **automatiquement** au debut de chaque session Copilot Chat
- Visible par **toute l'equipe** (committe dans Git)
- S'applique a **tout le projet**, toutes les conversations
- Fonctionne avec le Chat, l'Agent et le mode Plan — **pas** les suggestions inline

</v-clicks>

<br>

<v-click>

> **Analogie :** C'est le brief d'onboarding que vous donneriez a un nouveau developpeur le jour 1. Copilot le relit a chaque session.

</v-click>

<!--
Ce fichier est la fondation. Tout le reste s'y superpose.
Sans ce fichier, Copilot ne sait rien de votre projet.
-->

---

# Sans vs. Avec `copilot-instructions.md`

| Sans | Avec |
|------|------|
| Copilot choisit n'importe quel framework | Copilot utilise **vos** libraries |
| Injection par `@Autowired` champ / field injection | Injection par **constructeur** enforced |
| Exceptions levees directement | **BaseResponse** / **ApiResponse** retourne |
| Tests generiques sans convention | Tests en **`MethodName_StateUnderTest_ExpectedBehaviour`** |
| Logging avec interpolation de chaines | **`[LoggerMessage]`** / **`@Slf4j`** enforced |
| Entites retournees directement | **DTO / Response** via MapStruct / AutoMapper |

<br>

<v-click>

> Chaque ligne de ce tableau correspond a une regle dans votre fichier d'instructions.

</v-click>

---

# Structure d'un bon fichier d'instructions

<v-clicks>

```markdown
## Vue d'ensemble du projet
Contexte, domaine metier, objectif de l'application

## Stack technique
Langage, framework, versions, libraries principales

## Architecture et couches
Dependances autorisees, couches interdites de se croiser

## Conventions de code
Nommage, patterns, idiomes du langage

## Gestion des erreurs
Comment retourner les erreurs (pas d'exceptions non gerees)

## Logging
Format, niveau, ce qu'on ne logue PAS (PII)

## Securite
Secrets, validation, CORS, SQL injection

## Tests
Framework, nommage, pattern AAA, assertions

## Ce qu'il ne faut PAS faire
Anti-patterns explicites avec exemples ❌
```

</v-clicks>

---

# Regles d'or pour un fichier efficace

<v-clicks>

1. **Inclure le "pourquoi"** — Copilot fait de meilleures decisions sur les cas limites avec du contexte
2. **Utiliser des exemples ✅ / ❌** — Les patterns concrets surpassent les regles abstraites
3. **Rester sous ~2000 mots** — Un fichier trop long dilue les regles importantes
4. **Etre specifique** — "Utiliser MapStruct pour la conversion" > "Utiliser des mappers"
5. **Reviser regulierement** — Les instructions derivent de la realite si on ne les maintient pas

</v-clicks>

<br>

<v-click>

> **Piege courant :** Ecrire des regles trop vagues. "Ecrire du bon code" ne dit rien a Copilot. "Retourner `BaseResponse { success: false }` quand l'entite n'est pas trouvee — ne jamais lever `EntityNotFoundException`" est utile.

</v-click>

---

# Le bootstrap `/init`

Au lieu d'ecrire le fichier de zero, utilisez la commande `/init` :

```
/init
```

<v-clicks>

- Copilot **analyse votre codebase** — structure, dependencies, patterns existants
- Genere un premier draft de `copilot-instructions.md`
- Couvre automatiquement : stack, architecture, conventions detectees
- **Point de depart** — a affiner, pas a accepter aveuglément

</v-clicks>

<br>

<v-click>

> **Workflow recommande :** `/init` → relire → corriger les regles incorrectes → ajouter les regles manquantes → committer avec l'equipe.

</v-click>

<!--
/init est un accelerateur, pas un remplacement.
Copilot ne peut detecter que ce qui est deja dans le code.
Les regles "a ne pas faire" doivent etre ajoutees manuellement.
-->

---

# Verifier que les instructions chargent

<v-clicks>

**Test simple en Copilot Chat :**

```
Quels sont les standards de code de ce projet ?
```

**Resultat attendu :** Copilot liste vos conventions — constructeur primaire, `[LoggerMessage]`, soft-delete, nommage des tests, etc.

**Si ca ne marche pas, verifier :**

- Le fichier s'appelle exactement `copilot-instructions.md`
- Il est dans `.github/` a la **racine du workspace**
- Le parametre VS Code `chat.includeApplyingInstructions` est `true` (defaut)

</v-clicks>

---
layout: section
---

# Primitive 2 — File-Based Instructions

---

# File-Based Instructions — Le probleme qu'elles resolvent

<v-clicks>

Imaginez que vos instructions always-on contiennent :
- Regles pour les **tests** (xUnit, FluentAssertions, AAA pattern)
- Regles pour les **handlers** MediatR (constructeur primaire, validation-first)
- Regles pour les **migrations** EF Core (nommage, ne pas editer manuellement)

</v-clicks>

<br>

<v-clicks>

**Probleme :** Quand vous ecrivez un handler, les regles de test **polluent le contexte**.
Quand vous ecrivez un test, les regles de migration ne servent a rien.

</v-clicks>

<br>

<v-click>

**Solution :** Les **File-Based Instructions** — des regles qui ne chargent que quand le fichier actif correspond a un pattern.

</v-click>

---

# Anatomie d'un fichier `.instructions.md`

```
.github/
└── instructions/
    └── tests.instructions.md    ← doit finir par .instructions.md
```

<br>

```yaml
---
applyTo: "**/*Tests.cs"          ← glob pattern (obligatoire)
---
```

<br>

<v-clicks>

- Le **frontmatter** `applyTo` est la cle — c'est lui qui decide du declenchement
- Le **corps** du fichier est identique a `copilot-instructions.md` (Markdown libre)
- Les regles **s'ajoutent** aux always-on instructions — elles ne les remplacent pas

</v-clicks>

---

# Always-On vs. File-Based — La comparaison

| | Always-On | File-Based |
|-|-----------|-----------|
| **Declenchement** | Chaque session | Fichier actif correspond au pattern |
| **Portee** | Tout le projet | Couche / type de fichier specifique |
| **Fichier** | `copilot-instructions.md` | `*.instructions.md` |
| **Nombre** | Un seul | Autant que necessaire |
| **Cumul** | — | Se superpose aux always-on |

<br>

<v-click>

> **Regle pratique :** Si la regle s'applique a **tout le code**, mettez-la dans always-on. Si elle ne concerne qu'une **couche specifique**, creez un fichier file-based.

</v-click>

---

# Glob patterns — Les plus utiles

| Pattern | Fichiers cibles |
|---------|----------------|
| `**/*Tests.cs` | Tous les fichiers de test C# |
| `**/Features/**/*Handler.cs` | Tous les handlers MediatR |
| `**/Migrations/**/*.cs` | Toutes les migrations EF Core |
| `**/*Service.java` | Tous les services Java |
| `**/*Test.java` | Tous les tests JUnit |
| `**/controller/**/*.java` | Tous les controllers Spring |
| `**/*.spec.ts` | Tous les tests TypeScript |

<br>

<v-click>

> Les patterns suivent la syntaxe **glob standard** — `**` = n'importe quel repertoire, `*` = n'importe quel nom de fichier.

</v-click>

---

# Strategie multicouche — Architecture en instructions

```
.github/
├── copilot-instructions.md              ← Regles universelles
└── instructions/
    ├── tests.instructions.md            ← applyTo: **/*Tests.cs
    ├── handlers.instructions.md         ← applyTo: **/Features/**/*Handler.cs
    └── migrations.instructions.md       ← applyTo: **/Migrations/**/*.cs
```

<v-clicks>

**Quand vous editez `CreateEmployeeHandler.cs` :**
→ `copilot-instructions.md` + `handlers.instructions.md` chargent

**Quand vous editez `CreateEmployeeHandlerTests.cs` :**
→ `copilot-instructions.md` + `tests.instructions.md` chargent

**Quand vous editez une migration :**
→ `copilot-instructions.md` + `migrations.instructions.md` chargent

</v-clicks>

---

# Exemple — `tests.instructions.md` en detail

```yaml
---
applyTo: "**/*Tests.cs,**/*Test.cs"
---
```

```markdown
## Conventions de test

- Framework : xUnit — utiliser `[Fact]` et `[Theory]`, jamais `[Test]`
- Nommage : `MethodName_StateUnderTest_ExpectedBehaviour`
- Pattern : AAA — commenter `// Arrange / // Act / // Assert`
- Assertions : FluentAssertions uniquement — jamais `Assert.*` raw
- Mocks : Moq — jamais de base de donnees reelle dans les tests unitaires

❌ Interdit :
- `Assert.Equal(expected, actual)` → utiliser `.Should().Be()`
- Nom de test : `TestGetEmployee` → utiliser `GetEmployee_ValidId_ReturnsEmployee`
```

---

# Quand activer les file-based instructions ?

<v-clicks>

**Cas typiques qui justifient un nouveau fichier :**

- Votre couche controllers a des regles differentes des handlers (`RouteController`, `[HttpGet]` patterns)
- Vos tests d'integration ont des conventions differentes des tests unitaires
- Les validators FluentValidation / Bean Validation ont leur propre structure
- Les DTOs / Request / Response suivent des regles de serialisation specifiques

</v-clicks>

<br>

<v-click>

**Signal d'alarme :** Si votre `copilot-instructions.md` fait plus de 3000 mots → il y a probablement des sections qui devraient devenir des fichiers file-based.

</v-click>

---
layout: section
---

# Demo : Les deux primitives en action

---

# Demo — Scenario complet

**Contexte :** Le projet est configure avec :
- `copilot-instructions.md` — regles universelles
- `handlers.instructions.md` — regles MediatR (`applyTo: **/Features/**/*Handler.cs`)
- `tests.instructions.md` — regles test (`applyTo: **/*Tests.cs`)

<br>

<v-clicks>

**Etape 1** — Ouvrir un handler, demander a Copilot d'ajouter une methode

**Resultat attendu :** Constructeur primaire, `[LoggerMessage]`, BaseResponse, pas d'exception

**Etape 2** — Ouvrir le fichier de test correspondant, demander d'ecrire un test

**Resultat attendu :** `MethodName_StateUnderTest_ExpectedBehaviour`, `[Fact]`, FluentAssertions, AAA

</v-clicks>

---

# Ce qu'on observe pendant la demo

<v-clicks>

**Sans les instructions (avant) :**
- Handler : `private readonly IRepository _repo; public Handler(IRepository repo) { _repo = repo; }`
- Test : `Assert.Equal(expected, actual)` + nom `TestGetEmployee`
- Log : `_logger.LogInformation($"Getting employee {id}")`

**Avec les instructions (apres) :**
- Handler : constructeur primaire, `[LoggerMessage]` partial method, `BaseResponse`
- Test : `GetEmployee_ValidId_ReturnsEmployeeResponse` + `.Should().Be()` + AAA
- Log : source-generated, pas d'interpolation, pas de PII

</v-clicks>

<br>

<v-click>

> La qualite n'est plus aleatoire — elle est **systematique**.

</v-click>

---
layout: section
---

# Bonnes pratiques de maintenance

---

# Faire vivre vos instructions

<v-clicks>

**Le cycle de vie des instructions :**

1. **Creation** — `/init` + ajustements manuels
2. **Validation** — Tester avec des prompts intentionnellement ambigus
3. **Iteration** — Ajouter des regles quand Copilot fait une erreur recurrente
4. **Review trimestrielle** — Les regles doivent suivre les evolutions du projet

</v-clicks>

<br>

<v-click>

**Signe que vos instructions sont saines :**
- Copilot refuse quand vous lui demandez de violer une regle
- Les nouveaux membres de l'equipe n'ont pas besoin d'expliquer les conventions a Copilot
- Le pourcentage de suggestions acceptees sans modification augmente

</v-click>

---

# Quand ajouter une regle

<v-clicks>

**Declencheurs typiques :**

- Copilot a genere le meme anti-pattern deux fois → **ajoutez un `❌ Interdit`**
- Un nouveau reviewer a rejete du code Copilot → **c'est une regle manquante**
- Vous avez adopte une nouvelle convention → **mettez a jour les instructions**
- Une librairie a ete remplacee → **mettez a jour la stack technique**

</v-clicks>

<br>

<v-click>

> Les instructions sont un **actif d'equipe** — traitez-les comme du code : PR, review, historique Git.

</v-click>

---
layout: section
---

# Recapitulatif

---

# Ce que vous savez maintenant

<v-clicks>

- **`copilot-instructions.md`** charge automatiquement a chaque session Chat
- Il doit contenir : stack, architecture, conventions, anti-patterns avec exemples
- **`/init`** permet de bootstrapper un premier draft a partir du codebase existant
- **`*.instructions.md`** + `applyTo` ciblent des couches specifiques
- Les regles file-based **s'ajoutent** aux always-on — elles ne les remplacent pas
- La strategie optimale : **1 fichier always-on** + **N fichiers file-based par couche**

</v-clicks>

---

# Decision guide — Ou mettre une regle ?

| La regle s'applique a... | Ou la mettre |
|--------------------------|-------------|
| Tout le code du projet | `copilot-instructions.md` |
| Les fichiers de test uniquement | `tests.instructions.md` (`applyTo: **/*Tests.cs`) |
| Les handlers MediatR | `handlers.instructions.md` (`applyTo: **/Features/**/*Handler.cs`) |
| Les migrations EF Core | `migrations.instructions.md` (`applyTo: **/Migrations/**/*.cs`) |
| Les validators | `validators.instructions.md` (`applyTo: **/Features/**/*Validator.cs`) |

---

# Demain — Jour 3

## Prompt Files : commandes slash reutilisables

<v-clicks>

- Creer `/review-code` — revue de code structuree et reproductible
- Creer `/generate-feature` — scaffolding complet d'un feature CQRS
- Utiliser `${input:variable}` pour des prompts parametres
- Choisir le bon mode d'execution : `ask` vs. `agent`

</v-clicks>

<br>

<v-click>

**Labs : vous allez encoder vos workflows d'equipe en commandes reutilisables.**

</v-click>

---
layout: center
---

# Questions ?