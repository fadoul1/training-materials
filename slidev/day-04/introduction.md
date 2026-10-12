---
title: "Jour 4 — MCP et Hooks"
description: "Donner a Copilot de la portee sur des systemes externes avec MCP, puis imposer une regle de maniere deterministe avec les hooks"
author: Accenture
theme: default
highlighter: shiki
transition: slide-left
---

# GitHub Copilot in Practice

## Jour 4 — MCP et Hooks

<br>


<!--
Aujourd'hui on sort de l'editeur dans les deux sens.
MCP donne a Copilot acces a des systemes externes. Les hooks nous donnent, a nous, un moyen de reprendre le controle sur ce que Copilot a le droit de faire.
-->

---
layout: section
---

# Programme du jour

---

# Ce que nous allons couvrir

<v-clicks>

**Partie 1 — MCP**

1. **Rappel** — Les 5 primitives acquises, deux nouvelles aujourd'hui
2. **Qu'est-ce que MCP ?** — Donner de la portee, pas du savoir-faire
3. **Anatomie de `mcp.json`** — `servers`, `type: http` vs `stdio`, les secrets
4. **Le serveur GitHub** — OAuth automatique, aucune installation
5. **Configure Tools** — pourquoi n'activer que ce dont vous avez besoin
6. **Demo** — transformer un finding de revue en issue GitHub
7. **Atelier guide** — vous creez l'issue vous-meme

</v-clicks>

---

# Ce que nous allons couvrir (suite)

<v-clicks>

**Partie 2 — Hooks**

8. **Pourquoi les instructions ne suffisent pas toujours**
9. **Le cycle `PreToolUse` / `PostToolUse`**
10. **Anatomie d'un hook** — stdin, stdout, `permissionDecision`
11. **L'exemple de reference** — `protect-migrations`
12. **Demo** — tenter de casser la regle, et echouer
13. **Atelier guide** — tester le hook en dehors de Copilot

</v-clicks>

<!--
Pas de lab separe aujourd'hui : chaque atelier guide est integre directement dans la session.
-->

---
layout: section
---

# Rappel — Ou on en est

---

# Les 7 primitives — Feuille de route

| # | Primitive | Statut |
|---|-----------|--------|
| 1 | Always-On Instructions | ✅ Acquis |
| 2 | File-Based Instructions | ✅ Acquis |
| 3 | Prompt Files | ✅ Acquis |
| 4 | Agent Skills | ✅ Acquis |
| 5 | Custom Agents | ✅ Acquis |
| **6** | **MCP** | 🔵 **Aujourd'hui** |
| **7** | **Hooks** | 🔵 **Aujourd'hui** |

<br>

<v-click>

> Jusqu'ici, tout ce que Copilot pouvait faire restait **dans l'editeur** : lire des fichiers, en ecrire, lancer un terminal. Aujourd'hui, on ouvre la porte vers l'exterieur — et on pose une serrure dessus.

</v-click>

---
layout: section
---

# Primitive 6 — MCP

---

# Qu'est-ce que le Model Context Protocol ?

> **MCP** ajoute les outils d'un serveur externe a la liste des outils que le modele peut choisir, au moment de l'action. Un serveur MCP donne a Copilot de la **portee** sur des systemes hors de l'editeur (GitHub, une base de donnees, une API).

<br>

<v-clicks>

**Skill vs. MCP — ne pas confondre :**

| Skill | MCP |
|-------|-----|
| Donne un **savoir-faire** procedural | Donne une **portee** sur un systeme externe |
| S'execute avec les outils deja disponibles (terminal, fichiers) | Ajoute de **nouveaux** outils au modele |
| "Comment lancer et diagnostiquer les tests" | "Lire et creer des issues sur GitHub" |

</v-clicks>

---

# Anatomie de `.vscode/mcp.json`

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

<v-clicks>

- `servers` — une entree par serveur (dans un plugin, la cle devient `mcpServers` — Jour 5)
- `type: http` — un serveur **distant**, rien a installer ; `type: stdio` demarre un processus local via `command` / `args`
- Pas de token visible — VS Code authentifie avec OAuth au premier demarrage
- Fichier **committe** — toute l'equipe utilise les memes serveurs

</v-clicks>

<br>

<v-click>

> Pour un serveur qui a besoin d'une cle, ne jamais la coder en dur : declarer un `inputs` avec `"password": true` et la referencer via `${input:api-key}` — VS Code la demande une fois et la stocke de maniere securisee.

</v-click>

---

# Quand utiliser MCP — et quand ne pas l'utiliser

| Utiliser MCP | Utiliser autre chose |
|--------------|------------------------|
| Copilot doit **lire ou modifier** un systeme externe (issues, donnees, une API en cours d'execution) | Copilot doit savoir **comment** faire quelque chose → **Skill** |
| Un CLI ne suffit pas, ou il faut des resultats structures | L'information est deja dans le repo → rien a ajouter |

<br>

<v-click>

**Anti-patterns :**
- **Tous les outils actives** — chaque outil est envoye au modele a chaque requete. Le serveur GitHub en expose des dizaines : dans **Configure Tools**, ne garder que ce dont la tache a besoin
- **Approuver un appel d'outil sans le lire** — un `create_issue` ou un push s'execute avec **vos** identifiants
- **Secrets en clair dans le fichier** — toujours `inputs` ou OAuth

</v-click>

---
layout: section
---

# Demo — Du finding a l'issue GitHub

---

# Demo — Transformer une revue en ticket

**Contexte :** `/review-code` (Jour 1) a trouve qu'un controller logue une donnee personnelle (`request.getEmail()` / un email en clair dans un log C#).

<v-clicks>

**Etape 1 :** Demarrer le serveur `github` (Command Palette → **MCP: List Servers** → **Start**), s'authentifier

**Etape 2 :** **Configure Tools** → ne garder actifs que les outils lies aux issues

**Etape 3 :** En mode Agent :
```
Cree une issue GitHub dans <owner>/<repo>.
Titre : "Donnee personnelle loguee dans le controller Employee"
Corps : la methode concernee logue l'email en clair — a corriger
pour loguer l'identifiant plutot que la donnee personnelle.
```

**Observer :** Copilot choisit l'outil `create_issue`, une boite de dialogue montre **exactement** le owner, le repo, le titre et le corps — **verifier avant d'approuver**.

</v-clicks>

---

# Atelier guide — a vous de jouer

<v-clicks>

1. Demarrer le serveur MCP `github` et vous authentifier
2. Ouvrir **Configure Tools**, limiter aux outils d'issues
3. Creer l'issue decrivant le probleme de donnee personnelle loguee trouve en Jour 1
4. Verifier la creation en listant les issues ouvertes dont le titre mentionne le probleme
5. Noter le numero de l'issue — vous la fermerez au Jour 5

</v-clicks>

<br>

<v-click>

> **A retenir :** la revue de code a trouve le bug ; MCP l'a place la ou l'equipe suit son travail, sans quitter l'editeur.

</v-click>

---
layout: section
---

# Primitive 7 — Hooks

---

# Pourquoi une instruction ne suffit pas toujours

<v-clicks>

`copilot-instructions.md` dit : *"Ne jamais modifier un fichier de migration existant."*

La plupart du temps, Copilot obeit. Mais :
- Editer une migration Flyway deja appliquee **casse les checksums** dans chaque environnement ou elle a deja tourne
- Editer une migration EF Core deja appliquee **corrompt** l'historique de schema

</v-clicks>

<br>

<v-click>

Pour une regle ou **une seule** violation coute cher, une instruction (probabiliste) ne suffit pas. Il faut un **hook** (deterministe).

</v-click>

---

# Ou le hook s'insere dans la boucle

```
 le modele decide d'appeler un outil
          │
   [PreToolUse] ── deny ──► l'outil n'est PAS execute, la raison est renvoyee au modele
          │ allow / ask / pas de sortie
   l'outil s'execute (edition de fichier, terminal, MCP…)
          │
   [PostToolUse] ──► retour optionnel vers le modele
```

<v-clicks>

- `PreToolUse` — le **seul** evenement qui peut bloquer un appel d'outil, avant qu'il s'execute
- Autres evenements : `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`
- Hooks disponibles en VS Code (agent mode, preview), Copilot CLI et le coding agent (branche par defaut uniquement)

</v-clicks>

---

# Anatomie de `.github/hooks/security.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "bash .github/hooks/scripts/protect-migrations.sh",
        "windows": "powershell -NoProfile -ExecutionPolicy Bypass -File .github/hooks/scripts/protect-migrations.ps1",
        "timeout": 15
      }
    ]
  }
}
```

<v-clicks>

- `command` / `windows` — la commande selon l'OS ; `timeout` en secondes
- Le script recoit l'appel d'outil en **JSON sur stdin** (`tool_name`, `tool_input.filePath`…)
- En sortie : `permissionDecision` — `deny` + raison (Copilot lit pourquoi), `ask`, `allow`, ou **rien** = comportement normal
- **Fail open** — une entree invalide doit toujours finir par `exit 0`, pour qu'un payload casse ne bloque jamais tout le travail

</v-clicks>

---

# L'exemple de reference — `protect-migrations`

Le hook bloque l'edition d'un fichier de migration **deja applique**, et autorise la creation d'une **nouvelle** migration :

| Stack | Pattern protege | Nouvelle migration (autorisee) |
|-------|------------------|-------------------------------|
| Java / Flyway | `db/migration/V{n}__*.sql` existant | `V{n+1}__description.sql` |
| .NET / EF Core | `*.cs` existant sous `Migrations/` | `dotnet ef migrations add {Nom}` |

<br>

<v-clicks>

- Le script parcourt recursivement l'entree JSON pour trouver tous les chemins de fichiers touches (`filePath`, `file_path`, `path`, ou le format `apply_patch`)
- Il ne refuse **que** si le fichier correspond au pattern **et** existe deja sur disque
- Meme logique en PowerShell (`protect-migrations.ps1`) et en bash + `jq` (`protect-migrations.sh`) — un hook est juste un programme qui lit stdin

</v-clicks>

---
layout: section
---

# Demo — Essayer de casser la regle

---

# Demo — Le prompt demande explicitement l'interdit

```
La recherche par departement est lente. Ajoute un index sur la colonne
department directement dans le fichier de migration initial.
```

<v-clicks>

**Ce qui se passe :**
1. Copilot tente d'editer le fichier de migration existant
2. Le hook renvoie `deny` — l'edition **n'est pas appliquee** ; la raison apparait dans le chat et dans la sortie **GitHub Copilot Chat Hooks**
3. Copilot change de strategie et **cree une nouvelle migration** a la place

</v-clicks>

<br>

<v-click>

> **Discussion :** le prompt demandait **explicitement** de modifier le fichier existant. Avec une simple instruction, Copilot aurait pu obeir a l'utilisateur. Avec le hook, la regle gagne — peu importe qui insiste.

</v-click>

---

# Atelier guide — tester le hook sans Copilot

Un hook n'est qu'un programme qui lit stdin :

```powershell
'{"tool_name":"editFiles","tool_input":{"filePath":"<migration-existante>"}}' |
  powershell -NoProfile -ExecutionPolicy Bypass -File .github/hooks/scripts/protect-migrations.ps1
# Attendu : {"hookSpecificOutput":{..."permissionDecision":"deny"...}}

'{"tool_name":"createFile","tool_input":{"filePath":"<nouvelle-migration>"}}' |
  powershell -NoProfile -ExecutionPolicy Bypass -File .github/hooks/scripts/protect-migrations.ps1
# Attendu : aucune sortie (autorise)
```

<v-click>

> **Toujours tester un hook avec deux payloads :** un qu'il doit **refuser**, un qu'il doit **laisser passer**. Une regex trop large bloquerait aussi la creation d'une nouvelle migration.

</v-click>

---

# Instructions vs. Hooks — Le recapitulatif

| | Instruction | Hook |
|-|-------------|------|
| Nature | Texte dans le prompt | Un programme en dehors du modele |
| Garantie | Probabiliste | Deterministe |
| Peut bloquer une action | Non | Oui |
| Cout | Tokens a chaque requete | Un processus court par evenement — zero token |

<br>

<v-click>

> Utilisez un hook quand une **mauvaise action** coute plus cher qu'une mauvaise reponse : fichiers proteges, commandes dangereuses, audit. Gardez la regle **aussi** dans les instructions, pour que Copilot planifie correctement des le premier coup.

</v-click>

---

# Anti-patterns

<v-clicks>

- **Un hook lent** (reseau, build complet) — il s'execute a chaque appel d'outil, il doit rester de l'ordre de la milliseconde
- **Supposer que l'absence de sortie signifie un refus** — l'absence de sortie signifie **autoriser**
- **Un hook comme seule barriere de securite** — c'est un fil-piege ; la protection de branche et la CI restent necessaires. Ne jamais laisser l'agent modifier lui-meme son propre script de hook

</v-clicks>

---
layout: section
---

# Recapitulatif

---

# Ce que vous savez maintenant

<v-clicks>

- **MCP** ajoute des outils externes au modele — il donne de la **portee**, la ou un skill donne un savoir-faire
- Un serveur MCP se declare dans `mcp.json` (`servers`), avec OAuth ou un `inputs` secret — jamais de cle en clair
- **Configure Tools** limite les outils actifs a ce dont la tache a besoin
- Un **hook** `PreToolUse` est le seul point qui peut **bloquer** un appel d'outil, de maniere deterministe
- `protect-migrations` refuse l'edition d'une migration deja appliquee, et laisse passer la creation d'une nouvelle
- Instructions = probabiliste · Hooks = deterministe — gardez la regle dans les deux

</v-clicks>

---

# Demain — Jour 5

## Agent Plugins et Capstone

<v-clicks>

- Packager le skill, l'agent, le hook et le serveur MCP de la semaine dans **un seul plugin**
- Installer ce plugin et prouver qu'il fonctionne dans un repository qui n'a **aucun** `.github/`
- Partager le plugin en securite — la checklist avant d'installer un plugin tiers
- **Capstone** : fermer la boucle ouverte aujourd'hui, en mobilisant les 7 primitives de la semaine

</v-clicks>

<br>

<v-click>

**Pas de lab separe demain non plus : la construction du plugin et le capstone sont l'atelier du jour.**

</v-click>

---
layout: center
---

# Questions ?
