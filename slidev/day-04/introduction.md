---
title: "Jour 4 — Agent Skills : automatisation par intention"
description: "Packager des workflows multi-etapes qui se declenchent automatiquement selon l'intention de l'utilisateur"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 4 — Agent Skills : automatisation par intention

<br>


<!--
Aujourd'hui on explore la primitive la plus "magique" de Copilot.
Les Skills se declenchent sans que vous tapiez de commande — Copilot reconnait votre intention et charge le bon workflow tout seul.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

1. **Rappel** — Les 4 primitives vues jusqu'ici
2. **Qu'est-ce qu'un Skill ?** — La difference avec les prompts
3. **Le mecanisme de decouverte** — Comment Copilot choisit un skill
4. **L'art de la description** — La cle qui fait tout
5. **Les skills du projet** — `run-and-fix-tests` et `ef-core-migration`
6. **Anatomie d'un `SKILL.md`** — Structure et contenu
7. **Demo** — Skills en action, sans taper `/`
8. **Lab 04** — Vous creez `setup-local-dev` de zero

</v-clicks>

---
layout: section
---

# Rappel — La progression

---

# Les 5 primitives — Bilan a mi-parcours

| # | Primitive | Statut |
|---|-----------|--------|
| 1 | Always-On Instructions | ✅ Acquis |
| 2 | File-Based Instructions | ✅ Acquis |
| 3 | Prompt Files | ✅ Acquis |
| **4** | **Agent Skills** | 🔵 **Aujourd'hui** |
| 5 | Custom Agents | ⏳ Demain |

<br>

<v-click>

> Rappel de la hierarchie :
> - Instructions = **regles passives** (toujours actives)
> - Prompts = **taches explicites** (vous tapez `/`)
> - Skills = **workflows automatiques** (Copilot decide)
> - Agents = **personas specialisees** (Jour 5)

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
| "J'ai besoin d'un expert securite pour toute la session" | Custom Agent (Jour 5) |
| "Le skill necessite un template ou un script annexe" | **Skill** (avec dossier) |

---
layout: section
---

# Recapitulatif

---

# Ce que vous savez maintenant

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

# Demain — Jour 5

## Custom Agents : personas IA specialisees

<v-clicks>

- Creer un agent **Clean Architecture Refactor Expert** avec sa propre methodologie
- Comprendre la formule : Qui / Comment je pense / Comment je reponds / Ce que je fais toujours / Ce que je ne fais jamais
- Utiliser les **handoffs** pour chaîner des agents entre eux
- Creer un agent **Security Reviewer** de zero

</v-clicks>

<br>

<v-click>

**Labs : vous construisez deux agents specialises et les combinez en workflow.**

</v-click>

---
layout: center
---

# Questions ?
