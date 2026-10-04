/**
 * Level sequences and individual CMD lessons.
 *
 * Mirrors learnGitBranching's schema: declarative start/goal trees,
 * i18n dialogs with runnable demos, hints, and command-golf pars.
 */

'use strict';

/**
 * @typedef {Object} DialogView
 * @property {'ModalAlert' | 'CmdDemonstrationView'} type
 * @property {{ markdowns?: string[], beforeMarkdowns?: string[], afterMarkdowns?: string[], command?: string, beforeCommand?: string }} options
 */

/**
 * @typedef {Object} Level
 * @property {string} id
 * @property {Record<string, string>} name
 * @property {Record<string, string>} hint
 * @property {Record<string, string>} about
 * @property {Record<string, unknown>} startFS
 * @property {Record<string, unknown>} goalFS
 * @property {string} [startCwd]
 * @property {string} [goalCwd]
 * @property {string} solutionCommand
 * @property {number} [par]
 * @property {string[]} [goalCommands]
 * @property {Record<string, boolean>} [disabledMap]
 * @property {Record<string, { childViews: DialogView[] }>} startDialog
 */

/**
 * Base sandbox tree used by several levels.
 *
 * @returns {Record<string, unknown>}
 */
function baseTree() {
  return {
    Users: {
      student: {
        'notes.txt': 'remember to learn CMD\n',
        Documents: {
          'todo.txt': '1. practice dir\n2. practice cd\n',
        },
        Desktop: {},
        Downloads: {},
      },
    },
    Windows: {
      System32: {
        'cmd.exe': 'binary',
      },
    },
    'Program Files': {},
  };
}

/**
 * @param {Record<string, unknown>} overrides
 * @returns {Record<string, unknown>}
 */
function withHome(overrides) {
  const tree = baseTree();
  Object.assign(tree.Users.student, overrides);
  return tree;
}

/** @type {Record<string, { displayName: Record<string, string>, about: Record<string, string>, levels: Level[] }>} */
export const sequences = {
  intro: {
    displayName: {
      en_US: 'Introduction Sequence',
      fa: 'سری مقدماتی',
    },
    about: {
      en_US: 'A nicely paced introduction to the majority of CMD commands',
      fa: 'مقدمه‌ای با سرعت مناسب بر اکثر دستورات CMD',
    },
    levels: [
      {
        id: 'intro-echo',
        name: {
          en_US: 'Introduction to CMD',
          fa: 'آشنایی با CMD',
        },
        hint: {
          en_US: 'Type `echo hello` and press Enter.',
          fa: 'دستور `echo hello` را تایپ کن و Enter بزن.',
        },
        about: {
          en_US: 'Meet the Windows command interpreter',
          fa: 'آشنایی با مفسر خط فرمان ویندوز',
        },
        startFS: withHome({}),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'echo hello',
        goalCommands: ['echo hello'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## welcome to learn <span class="brand-cmd">CMD</span>',
                    '',
                    'The Windows Command Processor (`cmd.exe`) is a text interface for your computer. Instead of clicking icons, you type commands and the shell answers.',
                    '',
                    '### Why is CMD important and what is it used for?',
                    '- **Speed & Automation:** Bulk file operations, backups, and repetitive tasks that take 10 minutes with mouse clicks run in 1 second in CMD.',
                    '- **Servers, Docker & CI/CD:** In cloud instances, containers, and deployment runners, there is no graphical desktop. Command line is the only interface.',
                    '- **Deep System Diagnostics:** When Windows fails to boot, explorer crashes, or networks misbehave, the command line is the primary diagnostic and recovery tool.',
                    '- **Developer Ecosystem:** Core tools like Git, Python, Node, and build scripts run directly on top of the command line.',
                    '',
                    'On the **left** you see a live map of the virtual file system. On the **right** is the terminal. Every command you run updates the map immediately.',
                    '',
                    'Your first command is `echo`. It simply prints text back at you.',
                    '',
                    '```',
                    'echo hello',
                    '```',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: [
                    'Try it now. Hit the button below to run `echo hello`.',
                  ],
                  afterMarkdowns: [
                    'The terminal printed `hello`. That is all `echo` does — it echoes.',
                    '',
                    'In later levels we will bend `echo` to write files.',
                  ],
                  command: 'echo hello',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    'Now type `echo hello` in the terminal to finish this level.',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-dir',
        name: {
          en_US: 'Looking Around with DIR',
          fa: 'مشاهده محتوا با DIR',
        },
        hint: {
          en_US: 'Run `dir` to list the current directory.',
          fa: 'دستور `dir` را اجرا کن تا فهرست پوشه فعلی را ببینی.',
        },
        about: {
          en_US: 'List files and folders',
          fa: 'فهرست فایل‌ها و پوشه‌ها',
        },
        startFS: withHome({}),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'dir',
        goalCommands: ['dir'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## DIR — see what is here',
                    '',
                    'Your current directory is `C:\\Users\\student`. It already contains a few items:',
                    '',
                    '- `notes.txt` — a file',
                    '- `Documents` — a directory',
                    '- `Desktop` — a directory',
                    '- `Downloads` — a directory',
                    '',
                    'The `dir` command lists everything in the current directory. Directories are marked with `<DIR>`.',
                    '',
                    '```',
                    'dir',
                    '```',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Press the button to run `dir` and watch the output.'],
                  afterMarkdowns: [
                    'Classic Windows listing: date, time, `<DIR>` or file size, then the name.',
                    '',
                    'Try `dir /b` for a bare name list.',
                  ],
                  command: 'dir',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Run `dir` yourself to complete the level.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-cd',
        name: {
          en_US: 'Navigating with CD',
          fa: 'جابجایی با CD',
        },
        hint: {
          en_US: 'Type `cd Documents` to enter that folder.',
          fa: 'دستور `cd Documents` را بزن تا وارد آن پوشه شوی.',
        },
        about: {
          en_US: 'Change the current directory',
          fa: 'تغییر پوشه جاری',
        },
        startFS: withHome({}),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        goalCwd: 'C:\\Users\\student\\Documents',
        solutionCommand: 'cd Documents',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## CD — move between directories',
                    '',
                    'The prompt shows where you are. To move into a subdirectory:',
                    '',
                    '```',
                    'cd Documents',
                    '```',
                    '',
                    'To go up one level: `cd ..`',
                    'To jump to a full path: `cd C:\\Users\\student`',
                    '',
                    'Watch the highlighted folder in the tree on the left as you move.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Run `cd Documents` and notice the prompt path change.'],
                  afterMarkdowns: [
                    'You are now inside `Documents`. The tree highlights your new location.',
                  ],
                  command: 'cd Documents',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Move into `Documents` with `cd` to finish.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-md',
        name: {
          en_US: 'Creating Directories',
          fa: 'ساخت پوشه با MD',
        },
        hint: {
          en_US: 'Use `md projects` to create a folder named projects.',
          fa: 'با `md projects` یک پوشه به نام projects بساز.',
        },
        about: {
          en_US: 'Make directories',
          fa: 'ایجاد پوشه',
        },
        startFS: withHome({}),
        goalFS: withHome({ projects: {} }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'md projects',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## MD — make a directory',
                    '',
                    'Folders do not appear by magic. Create one with `md` (or `mkdir`):',
                    '',
                    '```',
                    'md projects',
                    '```',
                    '',
                    'You can create nested paths in one go: `md projects\\src\\app`',
                    '',
                    'Watch the tree on the left — the new folder flashes in.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Create a `demo` folder and see it appear in the tree.'],
                  afterMarkdowns: ['A new directory node appeared under your home folder.'],
                  command: 'md demo',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Create a directory named `projects` to pass.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-files',
        name: {
          en_US: 'Creating Files with ECHO',
          fa: 'ساخت فایل با ECHO',
        },
        hint: {
          en_US: 'Redirect echo into a file: `echo hello>readme.txt`',
          fa: 'خروجی echo را به فایل بده: `echo hello>readme.txt`',
        },
        about: {
          en_US: 'Write text files using redirection',
          fa: 'نوشتن فایل متنی با بازتخصیص خروجی',
        },
        startFS: withHome({}),
        goalFS: withHome({ 'readme.txt': 'hello world\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'echo hello world>readme.txt',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Redirecting output to create files',
                    '',
                    'The `>` operator takes whatever a command prints and writes it into a file:',
                    '',
                    '```',
                    'echo hello world>readme.txt',
                    '```',
                    '',
                    'Use `>>` to **append** instead of overwrite.',
                    '',
                    'Another way to make an empty file:',
                    '',
                    '```',
                    'type nul>empty.txt',
                    '```',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Create `demo.txt` with a greeting.'],
                  afterMarkdowns: ['A new file appeared in the tree. Select it to peek at contents later with `type`.'],
                  command: 'echo hi there>demo.txt',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    'Create `readme.txt` containing exactly `hello world`.',
                    '',
                    '*Tip: `echo hello world>readme.txt` stores the line `hello world`.*',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-type',
        name: {
          en_US: 'Reading Files with TYPE',
          fa: 'خواندن فایل با TYPE',
        },
        hint: {
          en_US: 'Type `type notes.txt`.',
          fa: 'دستور `type notes.txt` را اجرا کن.',
        },
        about: {
          en_US: 'Print file contents',
          fa: 'نمایش محتوای فایل',
        },
        startFS: withHome({}),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'type notes.txt',
        goalCommands: ['type notes.txt'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## TYPE — read a file',
                    '',
                    'To print a text file in the terminal:',
                    '',
                    '```',
                    'type notes.txt',
                    '```',
                    '',
                    'This is the CMD way of `cat`. Combine it with pipes later: `type notes.txt | sort`.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Print `notes.txt`.'],
                  afterMarkdowns: ['The file contents are listed line by line.'],
                  command: 'type notes.txt',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Use `type notes.txt` to complete this level.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-copy',
        name: {
          en_US: 'Copying with COPY',
          fa: 'کپی با COPY',
        },
        hint: {
          en_US: 'Try `copy notes.txt Documents\\notes.txt` or `copy notes.txt Documents`.',
          fa: '`copy notes.txt Documents` را امتحان کن.',
        },
        about: {
          en_US: 'Duplicate files',
          fa: 'تکثیر فایل‌ها',
        },
        startFS: withHome({}),
        goalFS: withHome({
          'notes.txt': 'remember to learn CMD\n',
          Documents: {
            'todo.txt': '1. practice dir\n2. practice cd\n',
            'notes.txt': 'remember to learn CMD\n',
          },
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'copy notes.txt Documents',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## COPY — duplicate a file',
                    '',
                    '```',
                    'copy source destination',
                    '```',
                    '',
                    'If the destination is a directory, the file keeps its name. If it is a path with a new name, the file is copied under that name.',
                    '',
                    'Watch the tree: the copy appears as a second file node.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Copy `notes.txt` into `Documents`.'],
                  afterMarkdowns: ['Both files now exist. The original is untouched.'],
                  command: 'copy notes.txt Documents',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Copy `notes.txt` into `Documents` to finish.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-move',
        name: {
          en_US: 'Moving with MOVE',
          fa: 'جابجایی با MOVE',
        },
        hint: {
          en_US: 'Use `move Downloads\\report.txt Documents`.',
          fa: 'با `move` فایل را به Documents منتقل کن.',
        },
        about: {
          en_US: 'Relocate files and folders',
          fa: 'جابجایی فایل و پوشه',
        },
        startFS: withHome({
          Downloads: {
            'report.txt': 'Q1 numbers\n',
          },
        }),
        goalFS: withHome({
          Documents: {
            'todo.txt': '1. practice dir\n2. practice cd\n',
            'report.txt': 'Q1 numbers\n',
          },
          Downloads: {},
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'move Downloads\\report.txt Documents',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## MOVE — relocate instead of copy',
                    '',
                    '```',
                    'move source destination',
                    '```',
                    '',
                    'Unlike `copy`, the source disappears. The tree will show the file node leave one folder and land in another.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Move a file from `Downloads` to `Documents`.'],
                  afterMarkdowns: ['One node left, one node arrived. Same content.'],
                  command: 'move Downloads\\report.txt Documents',
                  beforeCommand: 'echo Q1 numbers>Downloads\\report.txt',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Move `Downloads\\report.txt` into `Documents`.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-ren',
        name: {
          en_US: 'Renaming with REN',
          fa: 'تغییر نام با REN',
        },
        hint: {
          en_US: 'Try `ren notes.txt mynotes.txt`.',
          fa: '`ren notes.txt mynotes.txt` را امتحان کن.',
        },
        about: {
          en_US: 'Rename files and directories',
          fa: 'تغییر نام فایل و پوشه',
        },
        startFS: withHome({}),
        goalFS: (() => {
          const tree = withHome({ 'mynotes.txt': 'remember to learn CMD\n' });
          delete tree.Users.student['notes.txt'];
          return tree;
        })(),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'ren notes.txt mynotes.txt',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## REN — rename',
                    '',
                    '```',
                    'ren oldname newname',
                    '```',
                    '',
                    'The second argument is a **name**, not a path. To move and rename at once, use `move`.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Rename a scratch file.'],
                  afterMarkdowns: ['Same node, new label in the tree.'],
                  command: 'ren demo.txt demo2.txt',
                  beforeCommand: 'echo x>demo.txt',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Rename `notes.txt` to `mynotes.txt`.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-del',
        name: {
          en_US: 'Deleting Files with DEL',
          fa: 'حذف فایل با DEL',
        },
        hint: {
          en_US: 'Run `del secret.txt`.',
          fa: 'با `del secret.txt` فایل را حذف کن.',
        },
        about: {
          en_US: 'Remove files',
          fa: 'حذف فایل‌ها',
        },
        startFS: withHome({ 'secret.txt': 'delete me\n' }),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'del secret.txt',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## DEL — delete files',
                    '',
                    '```',
                    'del secret.txt',
                    '```',
                    '',
                    'Wildcards work: `del *.tmp`. There is no trash can in CMD — deleted means gone from this sandbox (you can still `undo` here).',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Delete a temporary file.'],
                  afterMarkdowns: ['The file node vanishes from the tree.'],
                  command: 'del temp.txt',
                  beforeCommand: 'echo junk>temp.txt',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Delete `secret.txt` to pass the level.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-rd',
        name: {
          en_US: 'Removing Directories with RD',
          fa: 'حذف پوشه با RD',
        },
        hint: {
          en_US: 'Use `rd /s /q oldstuff` to remove a folder tree.',
          fa: 'برای حذف پوشه با محتوا: `rd /s /q oldstuff`',
        },
        about: {
          en_US: 'Remove directories',
          fa: 'حذف پوشه‌ها',
        },
        startFS: withHome({ oldstuff: { 'junk.txt': 'x\n', nested: { 'a.txt': 'a\n' } } }),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'rd /s /q oldstuff',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## RD — remove directories',
                    '',
                    'An empty directory goes away with plain `rd name`.',
                    '',
                    'A directory that still has children needs `/s` (remove tree) and usually `/q` (quiet, no prompt):',
                    '',
                    '```',
                    'rd /s /q oldstuff',
                    '```',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Remove a small folder tree.'],
                  afterMarkdowns: ['The whole subtree disappears.'],
                  command: 'rd /s /q scratch',
                  beforeCommand: 'md scratch\\inner & echo z>scratch\\inner\\z.txt',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Delete the `oldstuff` directory and everything inside it.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'intro-tree',
        name: {
          en_US: 'The TREE Command',
          fa: 'دستور TREE',
        },
        hint: {
          en_US: 'Run `tree` (or `tree /f` to include files).',
          fa: 'دستور `tree` را اجرا کن.',
        },
        about: {
          en_US: 'Print an ASCII tree of the filesystem',
          fa: 'نمایش درختی ساختار پوشه‌ها',
        },
        startFS: withHome({ projects: { src: { 'main.c': 'int main(){}\n' } } }),
        goalFS: withHome({ projects: { src: { 'main.c': 'int main(){}\n' } } }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'tree',
        goalCommands: ['tree'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## TREE — the classic ASCII map',
                    '',
                    '```',
                    'tree',
                    'tree /f',
                    '```',
                    '',
                    'Plain `tree` shows directories. `/f` also lists files. This is the 1980s cousin of the live panel on the left.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Print the tree from your home folder.'],
                  afterMarkdowns: ['Nested folders appear as branches.'],
                  command: 'tree',
                  beforeCommand: '',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Run `tree` (with or without `/f`) to complete this level.'],
                },
              },
            ],
          },
        },
      },
    ],
  },

  files: {
    displayName: {
      en_US: 'Files & Paths',
      fa: 'فایل‌ها و مسیرها',
    },
    about: {
      en_US: 'Wildcards, absolute paths, and content editing',
      fa: 'کاراکترهای جایگزین، مسیرهای مطلق و ویرایش محتوا',
    },
    levels: [
      {
        id: 'files-wildcard',
        name: {
          en_US: 'Wildcards',
          fa: 'کاراکترهای جایگزین',
        },
        hint: {
          en_US: 'Delete all `.tmp` files with `del *.tmp`.',
          fa: 'همه فایل‌های .tmp را با `del *.tmp` حذف کن.',
        },
        about: {
          en_US: 'Use * and ? to match many names',
          fa: 'استفاده از * و ? برای تطبیق چند نام',
        },
        startFS: withHome({
          'a.tmp': '1\n',
          'b.tmp': '2\n',
          'keep.txt': 'keep\n',
        }),
        goalFS: withHome({ 'keep.txt': 'keep\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'del *.tmp',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Wildcards',
                    '',
                    '- `*` matches any run of characters',
                    '- `?` matches a single character',
                    '',
                    '```',
                    'del *.tmp',
                    'dir note*',
                    'dir ?otes.txt',
                    '```',
                    '',
                    'One command can act on many files. Watch several nodes disappear at once.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Delete every `.tmp` file, but keep `keep.txt`.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'files-paths',
        name: {
          en_US: 'Absolute vs Relative Paths',
          fa: 'مسیر مطلق و نسبی',
        },
        hint: {
          en_US: 'Create `C:\\Users\\student\\work\\app\\main.js` with nested md and echo.',
          fa: 'با md تو در تو و echo، فایل main.js را در مسیر work\\app بساز.',
        },
        about: {
          en_US: 'Navigate and create across deep paths',
          fa: 'ساخت و جابجایی در مسیرهای عمیق',
        },
        startFS: withHome({}),
        goalFS: withHome({
          work: {
            app: {
              'main.js': 'console.log(1)\n',
            },
          },
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'md work\\app & echo console.log(1)>work\\app\\main.js',
        par: 2,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Paths',
                    '',
                    '| Form | Meaning |',
                    '| --- | --- |',
                    '| `C:\\Users\\student` | absolute |',
                    '| `\\Users\\student` | from drive root |',
                    '| `Documents` | relative to cwd |',
                    '| `..\\..\\Windows` | relative with parent hops |',
                    '',
                    '`md work\\app` creates intermediate folders in one shot.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    'Build `work\\app\\main.js` whose content is `console.log(1)`.',
                    '',
                    'One approach: `md work\\app` then `echo console.log(1)>work\\app\\main.js`.',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'files-append',
        name: {
          en_US: 'Appending with >>',
          fa: 'الحاق با >>',
        },
        hint: {
          en_US: 'Use `echo line>>log.txt` to append, `echo line>log.txt` to overwrite.',
          fa: 'برای الحاق از `>>` و برای بازنویسی از `>` استفاده کن.',
        },
        about: {
          en_US: 'Grow a log file line by line',
          fa: 'افزایش تدریجی یک فایل گزارش',
        },
        startFS: withHome({ 'log.txt': '' }),
        goalFS: withHome({ 'log.txt': 'one\ntwo\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'echo one>log.txt & echo two>>log.txt',
        par: 2,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Overwrite vs append',
                    '',
                    '```',
                    'echo one>log.txt    :: replaces the file',
                    'echo two>>log.txt   :: adds a new line at the end',
                    '```',
                    '',
                    'Build `log.txt` so it contains exactly the two lines `one` and `two`.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Write `one`, then append `two`.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'files-fc',
        name: {
          en_US: 'Comparing with FC',
          fa: 'مقایسه با FC',
        },
        hint: {
          en_US: 'Run `fc a.txt b.txt`.',
          fa: 'دستور `fc a.txt b.txt` را اجرا کن.',
        },
        about: {
          en_US: 'Diff two text files',
          fa: 'مقایسه دو فایل متنی',
        },
        startFS: withHome({
          'a.txt': 'red\ngreen\nblue\n',
          'b.txt': 'red\ngreen\nred\n',
        }),
        goalFS: withHome({
          'a.txt': 'red\ngreen\nblue\n',
          'b.txt': 'red\ngreen\nred\n',
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'fc a.txt b.txt',
        goalCommands: ['fc a.txt b.txt'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## FC — file compare',
                    '',
                    '```',
                    'fc a.txt b.txt',
                    '```',
                    '',
                    'FC prints the differing lines in pairs. It is the CMD ancestor of `diff`.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Compare `a.txt` and `b.txt` to finish.'],
                },
              },
            ],
          },
        },
      },
    ],
  },

  pipes: {
    displayName: {
      en_US: 'Pipes & Filters',
      fa: 'پایپ‌ها و فیلترها',
    },
    about: {
      en_US: 'Compose commands with | and filter with FIND',
      fa: 'ترکیب دستورها با | و فیلتر با FIND',
    },
    levels: [
      {
        id: 'pipes-find',
        name: {
          en_US: 'Searching with FIND',
          fa: 'جستجو با FIND',
        },
        hint: {
          en_US: 'Try `find "todo" notes.txt` or `find /i "todo" notes.txt`.',
          fa: '`find "todo" notes.txt` را امتحان کن.',
        },
        about: {
          en_US: 'Search inside files',
          fa: 'جستجو در محتوای فایل‌ها',
        },
        startFS: withHome({
          'notes.txt': 'buy milk\ntodo: learn CMD\ntodo: practice pipes\n',
        }),
        goalFS: withHome({
          'notes.txt': 'buy milk\ntodo: learn CMD\ntodo: practice pipes\n',
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'find "todo" notes.txt',
        goalCommands: ['find "todo" notes.txt'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## FIND — search text',
                    '',
                    '```',
                    'find "string" file',
                    'find /i "string" file    :: case-insensitive',
                    'find /n "string" file    :: show line numbers',
                    'find /v "string" file    :: lines that do NOT match',
                    '```',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Find every line containing `todo` in `notes.txt`.'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'pipes-pipe',
        name: {
          en_US: 'Piping with |',
          fa: 'لوله‌کشی با |',
        },
        hint: {
          en_US: 'Pipe type into sort: `type names.txt | sort`.',
          fa: 'خروجی type را به sort بده: `type names.txt | sort`',
        },
        about: {
          en_US: 'Chain commands so output becomes the next input',
          fa: 'زنجیره کردن دستورها با لوله',
        },
        startFS: withHome({
          'names.txt': 'zoe\namy\nmike\n',
          'sorted.txt': '',
        }),
        goalFS: withHome({
          'names.txt': 'zoe\namy\nmike\n',
          'sorted.txt': 'amy\nmike\nzoe\n',
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'type names.txt | sort>sorted.txt',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Pipes',
                    '',
                    'The pipe operator `|` feeds stdout of one command into stdin of the next:',
                    '',
                    '```',
                    'type names.txt | sort',
                    'type names.txt | sort | find "m"',
                    '```',
                    '',
                    'Combine with redirection to save the result.',
                  ],
                },
              },
              {
                type: 'CmdDemonstrationView',
                options: {
                  beforeMarkdowns: ['Sort a small name list live.'],
                  afterMarkdowns: ['Output order changed. Same three lines.'],
                  command: 'type names.txt | sort',
                  beforeCommand: 'echo zoe>names.txt & echo amy>>names.txt & echo mike>>names.txt',
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    'Write the sorted names into `sorted.txt` (one name per line: amy, mike, zoe).',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'pipes-findstr',
        name: {
          en_US: 'FINDSTR Power',
          fa: 'قدرت FINDSTR',
        },
        hint: {
          en_US: 'Try `findstr /i error app.log`.',
          fa: '`findstr /i error app.log` را امتحان کن.',
        },
        about: {
          en_US: 'A stronger search tool',
          fa: 'ابزار جستجوی قوی‌تر',
        },
        startFS: withHome({
          'app.log': 'INFO start\nERROR disk full\nINFO ok\nerror timeout\n',
        }),
        goalFS: withHome({
          'app.log': 'INFO start\nERROR disk full\nINFO ok\nerror timeout\n',
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'findstr /i error app.log',
        goalCommands: ['findstr /i error app.log'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## FINDSTR',
                    '',
                    '```',
                    'findstr pattern file',
                    'findstr /i pattern file   :: ignore case',
                    'findstr /n pattern file   :: line numbers',
                    'findstr /r pattern file   :: regex',
                    '```',
                    '',
                    'Match every line mentioning `error` regardless of case.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Search `app.log` for `error` case-insensitively.'],
                },
              },
            ],
          },
        },
      },
    ],
  },

  advanced: {
    displayName: {
      en_US: 'Advanced Topics',
      fa: 'مباحث پیشرفته',
    },
    about: {
      en_US: 'Chaining, environment variables, and mixed challenges',
      fa: 'زنجیره دستورها، متغیرهای محیطی و چالش‌های ترکیبی',
    },
    levels: [
      {
        id: 'adv-chain',
        name: {
          en_US: 'Conditional Chaining',
          fa: 'زنجیره شرطی',
        },
        hint: {
          en_US: 'Use `md backup || echo failed` style with `&&` and `||`.',
          fa: 'از `&&` و `||` برای زنجیره شرطی استفاده کن.',
        },
        about: {
          en_US: 'Run commands only on success or failure',
          fa: 'اجرای دستورها بر اساس موفقیت یا شکست',
        },
        startFS: withHome({}),
        goalFS: withHome({
          backup: { 'copy.txt': 'data\n' },
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'md backup && echo data>backup\\copy.txt',
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## && || &',
                    '',
                    '| Operator | Meaning |',
                    '| --- | --- |',
                    '| `a & b` | run both |',
                    '| `a && b` | run b only if a succeeds |',
                    '| `a \\|\\| b` | run b only if a fails |',
                    '',
                    'Create `backup\\copy.txt` containing `data` in as few commands as you like.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['Example: `md backup && echo data>backup\\copy.txt`'],
                },
              },
            ],
          },
        },
      },
      {
        id: 'adv-env',
        name: {
          en_US: 'Environment Variables',
          fa: 'متغیرهای محیطی',
        },
        hint: {
          en_US: 'Set a var with `set NAME=value`, expand with `%NAME%`.',
          fa: 'با `set` مقدار بده و با `%NAME%` استفاده کن.',
        },
        about: {
          en_US: 'Store and expand variables',
          fa: 'ذخیره و بسط متغیرها',
        },
        startFS: withHome({}),
        goalFS: withHome({ 'greeting.txt': 'salam learn-cmd\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'set MSG=salam learn-cmd & echo %MSG%>greeting.txt',
        par: 2,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Environment variables',
                    '',
                    '```',
                    'set                 :: list all',
                    'set NAME=value      :: define',
                    'set NAME            :: query',
                    'echo %NAME%         :: expand',
                    '```',
                    '',
                    'Define `MSG` with the value `salam learn-cmd` and write it into `greeting.txt`.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    'Goal file `greeting.txt` must contain exactly `salam learn-cmd`.',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'adv-mixed',
        name: {
          en_US: 'Mixed Challenge',
          fa: 'چالش ترکیبی',
        },
        hint: {
          en_US: 'Plan the tree first, then create folders and files. `tree /f` helps.',
          fa: 'اول ساختار را طراحی کن، بعد بساز. `tree /f` کمک می‌کند.',
        },
        about: {
          en_US: 'Build a small project layout',
          fa: 'ساخت یک چیدمان پروژه کوچک',
        },
        startFS: withHome({}),
        goalFS: withHome({
          project: {
            'README.md': '# demo\n',
            src: {
              'app.js': 'export default 1\n',
            },
            logs: {
              'run.txt': 'ok\n',
            },
          },
        }),
        startCwd: 'C:\\Users\\student',
        solutionCommand:
          'md project\\src project\\logs & echo # demo>project\\README.md & echo export default 1>project\\src\\app.js & echo ok>project\\logs\\run.txt',
        par: 4,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Final challenge',
                    '',
                    'Create this exact layout under your home folder:',
                    '',
                    '```',
                    'project\\',
                    '  README.md      -> "# demo"',
                    '  src\\',
                    '    app.js       -> "export default 1"',
                    '  logs\\',
                    '    run.txt      -> "ok"',
                    '```',
                    '',
                    'Golf target: **4 commands**. Reset is your friend.',
                  ],
                },
              },
              {
                type: 'ModalAlert',
                options: {
                  markdowns: ['When the tree matches the goal, you pass. Good luck.'],
                },
              },
            ],
          },
        },
      },
    ],
  },

  sys: {
    displayName: {
      en_US: 'System & File Attributes',
      fa: 'سیستم و مشخصات فایل',
      de: 'System & Dateiattribute',
    },
    about: {
      en_US: 'File attributes, PATH resolution, directory stack, and process monitoring',
      fa: 'صفات فایل، پیمایش مسیرها، استک دایرکتوری و مدیریت پردازش‌ها',
      de: 'Dateiattribute, PATH-Suche, Verzeichnis-Stack und Prozessüberwachung',
    },
    levels: [
      {
        id: 'sys-attrib',
        name: {
          en_US: 'File Attributes (ATTRIB)',
          fa: 'صفات فایل (ATTRIB)',
          de: 'Dateiattribute (ATTRIB)',
        },
        hint: {
          en_US: 'Run `attrib +r config.ini` to protect the settings file.',
          fa: 'دستور `attrib +r config.ini` را اجرا کن تا فایل فقط‌خواندنی شود.',
          de: 'Führe `attrib +r config.ini` aus, um die Datei zu schützen.',
        },
        about: {
          en_US: 'Set read-only, hidden, or system flags on critical files',
          fa: 'تنظیم نشان‌های فقط‌خواندنی، مخفی یا سیستمی برای فایل‌های حساس',
          de: 'Schreibschutz- oder versteckte Attribute setzen',
        },
        startFS: withHome({ 'config.ini': '[settings]\nmode=production\n' }),
        goalFS: withHome({ 'config.ini': '[settings]\nmode=production\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'attrib +r config.ini',
        goalCommands: ['attrib +r config.ini'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## File Attributes (`ATTRIB`)',
                    '',
                    'Windows files carry metadata flags such as **R** (Read-Only), **H** (Hidden), **A** (Archive), and **S** (System).',
                    '',
                    'Use `attrib +r <file>` to lock a configuration file against accidental modification or deletion.',
                    '',
                    '```',
                    'attrib +r config.ini',
                    '```',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'sys-where',
        name: {
          en_US: 'Finding Programs (WHERE)',
          fa: 'یافتن برنامه‌ها (WHERE)',
          de: 'Programme finden (WHERE)',
        },
        hint: {
          en_US: 'Run `where cmd > cmd_path.txt` to save the executable path.',
          fa: 'دستور `where cmd > cmd_path.txt` را اجرا کن تا مسیر ذخیره شود.',
          de: 'Führe `where cmd > cmd_path.txt` aus.',
        },
        about: {
          en_US: 'Locate executable files across system PATH directories',
          fa: 'یافتن فایل‌های اجرایی در دایرکتوری‌های متغیر PATH',
          de: 'Ausführbare Dateien im PATH suchen',
        },
        startFS: withHome({}),
        goalFS: withHome({ 'cmd_path.txt': 'C:\\Windows\\System32\\cmd.exe\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'where cmd > cmd_path.txt',
        goalCommands: ['where cmd > cmd_path.txt'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Program Discovery (`WHERE`)',
                    '',
                    'The `where` command scans every folder listed in the `%PATH%` environment variable to locate where an executable actually lives.',
                    '',
                    'Save the path of `cmd` into `cmd_path.txt` using redirection.',
                    '',
                    '```',
                    'where cmd > cmd_path.txt',
                    '```',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'sys-pushpop',
        name: {
          en_US: 'Directory Stack (PUSHD / POPD)',
          fa: 'استک دایرکتوری (PUSHD / POPD)',
          de: 'Verzeichnis-Stack (PUSHD / POPD)',
        },
        hint: {
          en_US: 'Run `pushd Documents && echo backup>bk.txt && popd`.',
          fa: 'دستور `pushd Documents && echo backup>bk.txt && popd` را اجرا کن.',
          de: 'Führe `pushd Documents && echo backup>bk.txt && popd` aus.',
        },
        about: {
          en_US: 'Navigate folders using a LIFO directory stack',
          fa: 'پیمایش پوشه‌ها با استفاده از پشته دایرکتوری (LIFO)',
          de: 'Ordner mit dem Verzeichnis-Stack wechseln',
        },
        startFS: withHome({}),
        goalFS: withHome({ Documents: { 'todo.txt': '1. practice dir\n2. practice cd\n', 'bk.txt': 'backup\n' } }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'pushd Documents && echo backup>bk.txt && popd',
        goalCommands: ['pushd Documents && echo backup>bk.txt && popd'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Directory Stack (`PUSHD` / `POPD`)',
                    '',
                    'Instead of remembering your previous path when jumping to another folder, `pushd <dir>` stores your current directory on a stack, and `popd` returns you back instantly.',
                    '',
                    'Enter `Documents`, write `backup` into `bk.txt`, and pop back to your starting folder.',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'sys-tasks',
        name: {
          en_US: 'Process Management (TASKKILL)',
          fa: 'مدیریت پردازش‌ها (TASKKILL)',
          de: 'Prozessverwaltung (TASKKILL)',
        },
        hint: {
          en_US: 'Inspect with `tasklist` and terminate with `taskkill /im node.exe /f`.',
          fa: 'با `tasklist` پردازش‌ها را ببین و با `taskkill /im node.exe /f` پردازش معلق را ببند.',
          de: 'Prüfe mit `tasklist` und beende mit `taskkill /im node.exe /f`.',
        },
        about: {
          en_US: 'Inspect running tasks and terminate misbehaving processes',
          fa: 'مشاهده پردازش‌های سیستم و بستن فرآیندهای قفل‌شده با نام یا PID',
          de: 'Laufende Prozesse überwachen und beenden',
        },
        startFS: withHome({}),
        goalFS: withHome({}),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'taskkill /im node.exe /f',
        goalCommands: ['taskkill /im node.exe /f'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Managing Processes (`TASKLIST` & `TASKKILL`)',
                    '',
                    'When a process stops responding or consumes resources in production, you inspect it with `tasklist` and terminate it forcefully with `taskkill /im <name> /f`.',
                    '',
                    'Run `taskkill /im node.exe /f` to terminate the rogue node process.',
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  },

  batch: {
    displayName: {
      en_US: 'Scripting & Automation',
      fa: 'اسکریپت‌نویسی و اتوماسیون',
      de: 'Skripterstellung & Automatisierung',
    },
    about: {
      en_US: 'Conditional branches, data stream sorting, and capstone deployment',
      fa: 'شروط منطقی، مرتب‌سازی داده‌ها و پروژه استقرار نهایی',
      de: 'Bedingte Logik, Daten-Sortierung und Produktions-Deployment',
    },
    levels: [
      {
        id: 'batch-if',
        name: {
          en_US: 'Conditional Logic (IF EXIST)',
          fa: 'منطق شرطی (IF EXIST)',
          de: 'Bedingte Logik (IF EXIST)',
        },
        hint: {
          en_US: 'Run `if exist lock.tmp del lock.tmp`.',
          fa: 'دستور `if exist lock.tmp del lock.tmp` را اجرا کن.',
          de: 'Führe `if exist lock.tmp del lock.tmp` aus.',
        },
        about: {
          en_US: 'Execute commands conditionally based on file presence',
          fa: 'اجرای شرطی فرامین بر اساس وجود یا عدم وجود فایل در سیستم',
          de: 'Befehle bedingt nach Existenz einer Datei ausführen',
        },
        startFS: withHome({ 'lock.tmp': 'locked\n', 'app.log': 'system ready\n' }),
        goalFS: withHome({ 'app.log': 'system ready\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'if exist lock.tmp del lock.tmp',
        goalCommands: ['if exist lock.tmp del lock.tmp'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Conditional Processing (`IF EXIST`)',
                    '',
                    'Robust batch scripts must never fail when a file is absent. The `if exist <file> <command>` statement guards actions dynamically.',
                    '',
                    'Check for `lock.tmp` and delete it safely if present.',
                    '',
                    '```',
                    'if exist lock.tmp del lock.tmp',
                    '```',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'batch-sort',
        name: {
          en_US: 'Sorting Data Streams (SORT)',
          fa: 'مرتب‌سازی جریان داده (SORT)',
          de: 'Datenströme sortieren (SORT)',
        },
        hint: {
          en_US: 'Run `sort /r scores.txt > ranking.txt`.',
          fa: 'دستور `sort /r scores.txt > ranking.txt` را اجرا کن.',
          de: 'Führe `sort /r scores.txt > ranking.txt` aus.',
        },
        about: {
          en_US: 'Sort lines in reverse order and pipe processed output',
          fa: 'مرتب‌سازی خطوط داده به صورت معکوس و هدایت خروجی به فایل',
          de: 'Zeilen absteigend sortieren und weiterleiten',
        },
        startFS: withHome({ 'scores.txt': '10\n45\n90\n20\n' }),
        goalFS: withHome({ 'scores.txt': '10\n45\n90\n20\n', 'ranking.txt': '90\n45\n20\n10\n' }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'sort /r scores.txt > ranking.txt',
        goalCommands: ['sort /r scores.txt > ranking.txt'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Stream Sorting (`SORT /R`)',
                    '',
                    'The `sort` command arranges textual data alphabetically or numerically. The `/r` switch reverses the sort order.',
                    '',
                    'Sort `scores.txt` in descending order into `ranking.txt`.',
                    '',
                    '```',
                    'sort /r scores.txt > ranking.txt',
                    '```',
                  ],
                },
              },
            ],
          },
        },
      },
      {
        id: 'batch-master',
        name: {
          en_US: 'Capstone: Production Deployment',
          fa: 'چالش نهایی: استقرار پروداکشن',
          de: 'Capstone: Produktions-Deployment',
        },
        hint: {
          en_US: 'Run `md release && copy app.js release && attrib +r release\\app.js && if exist cache.tmp del cache.tmp`.',
          fa: 'دستور `md release && copy app.js release && attrib +r release\\app.js && if exist cache.tmp del cache.tmp` را اجرا کن.',
          de: 'Führe den vollständigen Deployment-Befehl aus.',
        },
        about: {
          en_US: 'Full production workflow: directory creation, copying, attribute locking, and conditional cleanup',
          fa: 'سناریوی کامل استقرار پروداکشن: ساخت پوشه، کپی فایل، قفل ویژگی‌ها و پاک‌سازی شرطی',
          de: 'Vollständiger automatisierter Bereitstellungsworkflow',
        },
        startFS: withHome({ 'app.js': 'console.log("ready");\n', 'cache.tmp': 'cache\n' }),
        goalFS: withHome({ 'app.js': 'console.log("ready");\n', release: { 'app.js': 'console.log("ready");\n' } }),
        startCwd: 'C:\\Users\\student',
        solutionCommand: 'md release && copy app.js release && attrib +r release\\app.js && if exist cache.tmp del cache.tmp',
        goalCommands: ['md release && copy app.js release && attrib +r release\\app.js && if exist cache.tmp del cache.tmp'],
        par: 1,
        startDialog: {
          en_US: {
            childViews: [
              {
                type: 'ModalAlert',
                options: {
                  markdowns: [
                    '## Capstone: Production Deployment',
                    '',
                    'You are now operating at **full expert level**. Chain the final production release steps together:',
                    '',
                    '1. Create the `release` folder (`md release`)',
                    '2. Copy `app.js` into `release` (`copy app.js release`)',
                    '3. Lock `release\\app.js` as read-only (`attrib +r release\\app.js`)',
                    '4. Conditionally clean temporary cache files (`if exist cache.tmp del cache.tmp`)',
                    '',
                    'Chain the entire sequence with `&&` or execute each step cleanly.',
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  },
};

/**
 * Flatten levels in sequence order.
 *
 * @returns {Level[]}
 */
export function allLevels() {
  return [...Object.values(sequences).flatMap((s) => s.levels), ...customLevels];
}

/** @type {Level[]} */
const customLevels = [];

/**
 * Register a user-built level (level builder / import).
 *
 * @param {Level} level
 * @returns {Level}
 */
export function registerCustomLevel(level) {
  const existing = customLevels.findIndex((l) => l.id === level.id);
  if (existing >= 0) customLevels[existing] = level;
  else customLevels.push(level);
  return level;
}

/**
 * @returns {Level[]}
 */
export function listCustomLevels() {
  return [...customLevels];
}

/**
 * Build a playable Level object from a JSON blob (import level).
 *
 * @param {Record<string, unknown>} raw
 * @returns {Level}
 */
export function levelFromJson(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Level JSON must be an object.');
  }
  const name = raw.name;
  const startFS = raw.startFS;
  const goalFS = raw.goalFS;
  if (!name || typeof name !== 'object') throw new Error('Level JSON requires name.');
  if (!startFS || typeof startFS !== 'object') throw new Error('Level JSON requires startFS.');
  if (!goalFS || typeof goalFS !== 'object') throw new Error('Level JSON requires goalFS.');

  /** @type {Level} */
  const level = {
    id: String(raw.id || 'custom-' + Date.now()),
    name: /** @type {Record<string, string>} */ (name),
    hint: /** @type {Record<string, string>} */ (raw.hint || { en_US: '' }),
    about: /** @type {Record<string, string>} */ (raw.about || { en_US: 'Custom level' }),
    startFS: /** @type {Record<string, unknown>} */ (startFS),
    goalFS: /** @type {Record<string, unknown>} */ (goalFS),
    solutionCommand: String(raw.solutionCommand || ''),
    par: raw.par != null ? Number(raw.par) : undefined,
    goalCommands: Array.isArray(raw.goalCommands) ? raw.goalCommands.map(String) : undefined,
    startCwd: raw.startCwd ? String(raw.startCwd) : 'C:\\Users\\student',
    goalCwd: raw.goalCwd ? String(raw.goalCwd) : undefined,
    startDialog: {
      en_US: {
        childViews: [
          {
            type: 'ModalAlert',
            options: {
              markdowns: [
                `## ${String(/** @type {Record<string, string>} */ (name).en_US || 'Custom level')}`,
                '',
                String(raw.intro || 'Reach the goal tree using CMD commands.'),
                '',
                `**Hint:** ${String(/** @type {Record<string, string>} */ (raw.hint || { en_US: '' }).en_US || '')}`,
              ],
            },
          },
        ],
      },
    },
  };
  return level;
}

/**
 * @param {string} id
 * @returns {Level | null}
 */
export function getLevel(id) {
  return allLevels().find((l) => l.id === id) || null;
}

/**
 * @param {string} id
 * @returns {{ sequenceKey: string, index: number, level: Level } | null}
 */
export function locateLevel(id) {
  for (const [sequenceKey, seq] of Object.entries(sequences)) {
    const index = seq.levels.findIndex((l) => l.id === id);
    if (index >= 0) return { sequenceKey, index, level: seq.levels[index] };
  }
  return null;
}

/**
 * @param {string} id
 * @returns {Level | null}
 */
export function nextLevel(id) {
  const loc = locateLevel(id);
  if (!loc) return null;
  const seq = sequences[loc.sequenceKey];
  if (loc.index + 1 < seq.levels.length) return seq.levels[loc.index + 1];
  const keys = Object.keys(sequences);
  const ki = keys.indexOf(loc.sequenceKey);
  for (let i = ki + 1; i < keys.length; i += 1) {
    if (sequences[keys[i]].levels.length) return sequences[keys[i]].levels[0];
  }
  return null;
}

/**
 * @param {string} id
 * @returns {Level | null}
 */
export function prevLevel(id) {
  const loc = locateLevel(id);
  if (!loc) return null;
  const seq = sequences[loc.sequenceKey];
  if (loc.index - 1 >= 0) return seq.levels[loc.index - 1];
  return null;
}

export { baseTree };
