# learn-cmd

Interactive Windows CMD trainer with a live filesystem visualizer, free sandbox, and leveled challenges with command golf. Inspired by [learnGitBranching](https://github.com/pcottle/learnGitBranching).

Windows 11 Fluent UI, Segoe UI Variable + Cascadia Code, EN/FA lesson dialogs.

## What it is

learnGitBranching teaches git by drawing the commit graph while you type. learn-cmd applies the same idea to `cmd.exe`: the left panel is a live map of a virtual `C:` drive, the right panel is a virtual command prompt. Every command updates the tree immediately.

Nothing touches your real disk. The whole machine is an in-memory tree, so `del /s` and `rd /s /q` are safe.

## Features

- **Sandbox** — free exploration with `undo` and `reset`
- **Levels** — sequenced lessons (intro, files & paths, pipes, advanced)
- **Command golf** — each level has a par; your best score is stored in `localStorage`
- **Lesson dialogs** — markdown explanations and runnable demos, like LGB (English + Persian)
- **Level builder** — `build level` captures start/goal trees and exports JSON
- **Import level** — `import level` plays a shared JSON blob
- **Real-ish CMD** — `dir`, `cd`, `md`, `rd`, `del`, `copy`, `move`, `ren`, `type`, `tree`, `find`, `findstr`, `sort`, `fc`, `attrib`, `set`, `path`, `where`, redirection (`>` `>>` `<`), pipes (`|`), chaining (`&` `&&` `||`)
- **Permalinks** — `?level=intro-echo` opens a level; `Share` copies a link

## Run

Open `index.html` in a modern browser (ES modules), or serve the folder:

```bash
node scripts/serve.js
# http://localhost:4173/
```

## Tests

```bash
npm test
```

Covers the virtual filesystem, command layer, and that every published `solutionCommand` actually reaches its level goal.

## Project layout

```
index.html          UI shell
css/main.css        CRT / Windows Terminal theme
js/vfs.js           virtual filesystem (in-memory C: tree)
js/commands.js      CMD built-ins
js/shell.js         parser: quotes, redirection, pipes, chaining
js/tree.js          live tree renderer
js/levels.js        lesson sequences and dialogs
js/i18n.js          Persian lesson dialogs
js/app.js           terminal UI, dialogs, golf, builder, persistence
tests/cmd.test.js   node:test suite
scripts/serve.js    static preview server
```

## Meta commands

| Command | Meaning |
| --- | --- |
| `levels` | open the level browser |
| `level <id>` | load a level |
| `sandbox` | back to free play |
| `hint` | show the level hint |
| `show solution` | print the reference solution (marks golf) |
| `reset` | restart the level or sandbox |
| `undo` | revert the last state change |
| `goal` | print the goal tree |
| `next` / `prev` | move between levels |
| `progress` | golf scoreboard |
| `share` | copy a permalink |
| `build` | open the level builder |
| `import level` | paste a level JSON blob |

## License

MIT
