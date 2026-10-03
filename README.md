# learn-cmd

Interactive Windows CMD trainer with a live filesystem visualizer, free sandbox, and leveled challenges with command golf. Inspired by [learnGitBranching](https://github.com/pcottle/learnGitBranching).

**Live:** https://alisadeghiaghili.github.io/learn-cmd/

Windows 11 Fluent UI, Segoe UI Variable + Cascadia Code, multi-language support (EN, FA, DE).

## What it is

learnGitBranching teaches git by drawing the commit graph while you type. learn-cmd applies the same idea to `cmd.exe`: the main stage displays a live map of a virtual `C:` drive and a virtual command prompt, while an always-on learning dock tracks objectives, learning outcomes, and command golf pars. Every command updates the tree immediately.

Nothing touches your real disk. The whole machine is an in-memory tree, so `del /s` and `rd /s /q` are safe.

## Features

- **Sandbox** — free exploration with `undo` and `reset`
- **Levels** — sequenced lessons across packs (Intro, Files & Paths, Pipes & Filters, Advanced scripting)
- **Command golf** — each level has a par; your best score is stored across sessions via synchronized `localStorage` and `cookie` persistence
- **Learning dock** — dedicated right-hand dock with level objectives, learning outcomes, production field notes, and interactive step checklists
- **Ghost text terminal** — autocomplete suggestions as you type, Tab completion with word cycling, inline next-command cues, and command history
- **Celebration** — full-screen Canvas confetti particles and procedural WebAudio victory fanfare on level solve
- **Social sharing** — pre-composed achievement cards with custom links for LinkedIn, X (Twitter), Facebook, and clipboard copy
- **Interactive UI tour** — `tour` and `help ui` commands with visual region highlighting
- **Terminal quiz** — interactive `quiz` command testing CMD grammar and switches
- **Curriculum outcomes** — `curriculum` command summarizing mastered concepts
- **Multi-language** — complete UI and lesson dialog localization for English, Persian (فارسی), and German (Deutsch)
- **Visitor telemetry** — live deduplicated visitor counter in the toolbar
- **Real-ish CMD** — `dir`, `cd`, `md`, `rd`, `del`, `copy`, `move`, `ren`, `type`, `more`, `tree`, `find`, `findstr`, `sort`, `fc`, `attrib`, `set`, `path`, `where`, redirection (`>` `>>` `<`), pipes (`|`), chaining (`&` `&&` `||`)

## Run

Open `index.html` in a modern browser (native ES modules), or serve the folder:

```bash
node scripts/serve.js
# http://localhost:4173/
```

## Tests

```bash
npm test
```

Covers the virtual filesystem, command layer, parser, persistence, visitor counter, social share builder, i18n dictionaries, and ensures every published `solutionCommand` reaches its level goal.

## Project layout

```
index.html              UI shell (toolbar, tree board, terminal, guide dock, modals)
css/main.css            design tokens, fluent theme, animations, responsive layout
js/vfs.js               virtual filesystem (in-memory C: drive tree)
js/commands.js          CMD built-in implementations
js/shell.js             command line parser (quotes, redirection, pipes, chaining)
js/tree.js              live filesystem tree visualization
js/terminal.js          terminal component with ghost autocomplete and history
js/levels.js            lesson sequences, goals, and dialogs
js/i18n.js              internationalization (EN, FA, DE) and terminal quiz
js/confetti.js          canvas particle confetti burst and procedural audio fanfare
js/progress.js          dual cookie/localStorage persistence and curriculum stats
js/share.js             social share target generators (LinkedIn, X, Facebook)
js/ui-help.js           UI region guide and live element highlighter
js/visitor-counter.js   visitor telemetry client with SVG parsing and caching
js/app.js               application controller wiring state, UI, and events
tests/cmd.test.js       node:test unit test suite
scripts/serve.js        local preview server
```

## Commands inside the app

| Command | Meaning |
| --- | --- |
| `levels` | open the level browser |
| `level <id>` | load a specific level |
| `sandbox` | back to free exploration mode |
| `hint` | display the level hint |
| `steps` / `goal` | pulse and focus the learning guide dock |
| `show solution` | open the reference solution dialog |
| `reset` | restart the level or sandbox |
| `undo` | revert the last filesystem state change |
| `help` / `?` | display command summary |
| `help ui` / `tour` | start visual on-screen element guide |
| `curriculum` | list curriculum learning outcomes |
| `quiz` | start terminal quiz for command knowledge check |
| `share` | open social sharing card |
| `clear` / `cls` | clear terminal output log |

## License

MIT
