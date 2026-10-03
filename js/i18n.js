/**
 * Persian lesson dialogs for learn-cmd.
 *
 * Keys are level ids. Shape matches `startDialog.en_US` in levels.js.
 */

'use strict';

/** @typedef {import('./levels.js').DialogView} DialogView */

/** @type {Record<string, { childViews: DialogView[] }>} */
export const dialogsFa = {
  'intro-echo': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## به learn-cmd خوش آمدید',
            '',
            'پردازنده فرمان ویندوز (`cmd.exe`) یک رابط متنی برای کامپیوتر است. به‌جای کلیک روی آیکون‌ها، دستور می‌نویسید و شل جواب می‌دهد.',
            '',
            'در **سمت چپ** نقشه زنده‌ی فایل‌سیستم مجازی را می‌بینید. در **سمت راست** ترمینال است. هر دستوری که اجرا کنید بلافاصله نقشه را به‌روز می‌کند — درست مثل learnGitBranching که گراف کامیت را به‌روز می‌کند.',
            '',
            'اولین دستور شما `echo` است. فقط متن را برمی‌گرداند.',
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
          beforeMarkdowns: ['همین حالا امتحان کن. دکمه زیر را بزن تا `echo hello` اجرا شود.'],
          afterMarkdowns: [
            'ترمینال `hello` چاپ کرد. تمام کار `echo` همین است — پژواک می‌دهد.',
            '',
            'در درس‌های بعدی `echo` را برای نوشتن فایل به کار می‌گیریم.',
          ],
          command: 'echo hello',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['حالا برای تمام کردن مرحله، `echo hello` را در ترمینال تایپ کن.'],
        },
      },
    ],
  },

  'intro-dir': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## DIR — ببین اینجا چی هست',
            '',
            'پوشه جاری شما `C:\\Users\\student` است. چند مورد دارد:',
            '',
            '- `notes.txt` — یک فایل',
            '- `Documents` — یک پوشه',
            '- `Desktop` — یک پوشه',
            '- `Downloads` — یک پوشه',
            '',
            'دستور `dir` همه‌چیزِ پوشه جاری را فهرست می‌کند. پوشه‌ها با `<DIR>` مشخص می‌شوند.',
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
          beforeMarkdowns: ['دکمه را بزن تا `dir` اجرا شود و خروجی را ببینی.'],
          afterMarkdowns: [
            'فهرست کلاسیک ویندوز: تاریخ، زمان، `<DIR>` یا اندازه فایل، بعد نام.',
            '',
            '`dir /b` را هم امتحان کن برای فهرست خالصِ نام‌ها.',
          ],
          command: 'dir',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['خودت `dir` را اجرا کن تا مرحله تمام شود.'],
        },
      },
    ],
  },

  'intro-cd': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## CD — جابجایی بین پوشه‌ها',
            '',
            'پرامپت نشان می‌دهد کجا هستید. برای رفتن به زیرپوشه:',
            '',
            '```',
            'cd Documents',
            '```',
            '',
            'برای برگشتن یک سطح بالاتر: `cd ..`',
            'برای پرش به مسیر کامل: `cd C:\\Users\\student`',
            '',
            'هنگام جابجایی، پوشه هایلایت‌شده در درخت سمت چپ را دنبال کن.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['`cd Documents` را اجرا کن و تغییر مسیر پرامپت را ببین.'],
          afterMarkdowns: [
            'حالا داخل `Documents` هستید. درخت، محل جدید شما را هایلایت می‌کند.',
          ],
          command: 'cd Documents',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['با `cd` وارد `Documents` شو تا مرحله تمام شود.'],
        },
      },
    ],
  },

  'intro-md': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## MD — ساخت پوشه',
            '',
            'پوشه‌ها از آسمان نمی‌افتند. با `md` (یا `mkdir`) بسازید:',
            '',
            '```',
            'md projects',
            '```',
            '',
            'می‌توانید مسیر تو در تو را یکجا بسازید: `md projects\\src\\app`',
            '',
            'به درخت سمت چپ نگاه کن — پوشه جدید با یک درخشش ظاهر می‌شود.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['یک پوشه `demo` بساز و ببین در درخت ظاهر می‌شود.'],
          afterMarkdowns: ['یک گره پوشه جدید زیر پوشه خانگی شما پیدا شد.'],
          command: 'md demo',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['برای قبول شدن، یک پوشه به نام `projects` بساز.'],
        },
      },
    ],
  },

  'intro-files': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## بازتخصیص خروجی و ساخت فایل',
            '',
            'اپراتور `>` هر چیزی را که یک دستور چاپ می‌کند در یک فایل می‌نویسد:',
            '',
            '```',
            'echo hello world>readme.txt',
            '```',
            '',
            'از `>>` برای **الحاق** به‌جای بازنویسی استفاده کنید.',
            '',
            'راه دیگر برای فایل خالی:',
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
          beforeMarkdowns: ['یک `demo.txt` با یک سلام بساز.'],
          afterMarkdowns: [
            'یک فایل جدید در درخت پیدا شد. بعداً با `type` می‌توانید محتوایش را ببینید.',
          ],
          command: 'echo hi there>demo.txt',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '`readme.txt` را با محتوای دقیق `hello world` بساز.',
            '',
            '*نکته: `echo hello world>readme.txt` خط `hello world` را ذخیره می‌کند.*',
          ],
        },
      },
    ],
  },

  'intro-type': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## TYPE — خواندن فایل',
            '',
            'برای چاپ یک فایل متنی در ترمینال:',
            '',
            '```',
            'type notes.txt',
            '```',
            '',
            'این همان `cat` در دنیای CMD است. بعداً با پایپ ترکیبش کن: `type notes.txt | sort`.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['`notes.txt` را چاپ کن.'],
          afterMarkdowns: ['محتوای فایل خط‌به‌خط نمایش داده شد.'],
          command: 'type notes.txt',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['با `type notes.txt` این مرحله را تمام کن.'],
        },
      },
    ],
  },

  'intro-copy': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## COPY — تکثیر فایل',
            '',
            '```',
            'copy source destination',
            '```',
            '',
            'اگر مقصد یک پوشه باشد، فایل نامش را حفظ می‌کند. اگر مسیر با نام جدید باشد، با آن نام کپی می‌شود.',
            '',
            'به درخت نگاه کن: کپی به‌صورت یک گره فایل دوم ظاهر می‌شود.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['`notes.txt` را داخل `Documents` کپی کن.'],
          afterMarkdowns: ['هر دو فایل حالا وجود دارند. فایل اصلی دست‌نخورده است.'],
          command: 'copy notes.txt Documents',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`notes.txt` را داخل `Documents` کپی کن تا تمام شود.'],
        },
      },
    ],
  },

  'intro-move': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## MOVE — جابجایی به‌جای کپی',
            '',
            '```',
            'move source destination',
            '```',
            '',
            'برخلاف `copy`، مبدا ناپدید می‌شود. درخت نشان می‌دهد گره فایل از یک پوشه می‌رود و در پوشه دیگر می‌نشیند.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['یک فایل را از `Downloads` به `Documents` جابه‌جا کن.'],
          afterMarkdowns: ['یک گره رفت، یک گره رسید. محتوا یکسان است.'],
          command: 'move Downloads\\report.txt Documents',
          beforeCommand: 'echo Q1 numbers>Downloads\\report.txt',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`Downloads\\report.txt` را به `Documents` منتقل کن.'],
        },
      },
    ],
  },

  'intro-ren': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## REN — تغییر نام',
            '',
            '```',
            'ren oldname newname',
            '```',
            '',
            'آرگومان دوم یک **نام** است، نه مسیر. برای جابجایی همراه با تغییر نام از `move` استفاده کن.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['نام یک فایل موقت را عوض کن.'],
          afterMarkdowns: ['همان گره، برچسب جدید در درخت.'],
          command: 'ren demo.txt demo2.txt',
          beforeCommand: 'echo x>demo.txt',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`notes.txt` را به `mynotes.txt` تغییر نام بده.'],
        },
      },
    ],
  },

  'intro-del': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## DEL — حذف فایل',
            '',
            '```',
            'del secret.txt',
            '```',
            '',
            'کاراکترهای جایگزین کار می‌کنند: `del *.tmp`. در CMD سبد بازیافتی نیست — حذف یعنی حذف (اینجا هنوز `undo` دارید).',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['یک فایل موقت را حذف کن.'],
          afterMarkdowns: ['گره فایل از درخت محو شد.'],
          command: 'del temp.txt',
          beforeCommand: 'echo junk>temp.txt',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`secret.txt` را حذف کن تا مرحله قبول شود.'],
        },
      },
    ],
  },

  'intro-rd': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## RD — حذف پوشه',
            '',
            'یک پوشه خالی با `rd name` ساده پاک می‌شود.',
            '',
            'پوشه‌ای که هنوز فرزند دارد به `/s` (حذف درخت) و معمولاً `/q` (بی‌صدا) نیاز دارد:',
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
          beforeMarkdowns: ['یک درخت پوشه کوچک را حذف کن.'],
          afterMarkdowns: ['کل زیردرخت ناپدید شد.'],
          command: 'rd /s /q scratch',
          beforeCommand: 'md scratch\\inner & echo z>scratch\\inner\\z.txt',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['پوشه `oldstuff` و همه محتوایش را حذف کن.'],
        },
      },
    ],
  },

  'intro-tree': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## TREE — نقشه ASCII کلاسیک',
            '',
            '```',
            'tree',
            'tree /f',
            '```',
            '',
            '`tree` ساده فقط پوشه‌ها را نشان می‌دهد. `/f` فایل‌ها را هم اضافه می‌کند. این عموزاده‌ی دهه ۸۰ پنل زنده سمت چپ است.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['درخت را از پوشه خانگی چاپ کن.'],
          afterMarkdowns: ['پوشه‌های تو در تو به‌صورت شاخه نمایش داده شدند.'],
          command: 'tree',
          beforeCommand: '',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`tree` (با یا بدون `/f`) را اجرا کن تا مرحله تمام شود.'],
        },
      },
    ],
  },

  'files-wildcard': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## کاراکترهای جایگزین',
            '',
            '- `*` هر رشته‌ای از کاراکترها را می‌پذیرد',
            '- `?` دقیقاً یک کاراکتر',
            '',
            '```',
            'del *.tmp',
            'dir note*',
            'dir ?otes.txt',
            '```',
            '',
            'یک دستور می‌تواند روی چند فایل اثر بگذارد. چند گره را همزمان ناپدیدشده ببین.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['همه فایل‌های `.tmp` را حذف کن، اما `keep.txt` را نگه دار.'],
        },
      },
    ],
  },

  'files-paths': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## مسیرها',
            '',
            '| شکل | معنی |',
            '| --- | --- |',
            '| `C:\\Users\\student` | مطلق |',
            '| `\\Users\\student` | از ریشه درایو |',
            '| `Documents` | نسبت به cwd |',
            '| `..\\..\\Windows` | نسبی با پرش به والد |',
            '',
            '`md work\\app` پوشه‌های میانی را یکجا می‌سازد.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '`work\\app\\main.js` را بساز که محتوایش `console.log(1)` باشد.',
            '',
            'یک راه: `md work\\app` بعد `echo console.log(1)>work\\app\\main.js`.',
          ],
        },
      },
    ],
  },

  'files-append': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## بازنویسی در برابر الحاق',
            '',
            '```',
            'echo one>log.txt    :: فایل را جایگزین می‌کند',
            'echo two>>log.txt   :: خط جدید به انتها اضافه می‌کند',
            '```',
            '',
            '`log.txt` را طوری بساز که دقیقاً دو خط `one` و `two` داشته باشد.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`one` را بنویس، بعد `two` را الحاق کن.'],
        },
      },
    ],
  },

  'files-fc': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## FC — مقایسه فایل',
            '',
            '```',
            'fc a.txt b.txt',
            '```',
            '',
            'FC خط‌های متفاوت را جفت‌جفت چاپ می‌کند. جد `diff` در دنیای CMD است.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['`a.txt` و `b.txt` را مقایسه کن تا تمام شود.'],
        },
      },
    ],
  },

  'pipes-find': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## FIND — جستجوی متن',
            '',
            '```',
            'find "string" file',
            'find /i "string" file    :: بدون توجه به بزرگی حروف',
            'find /n "string" file    :: شماره خطوط',
            'find /v "string" file    :: خطوطی که منطبق نیستند',
            '```',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['هر خطی از `notes.txt` را که `todo` دارد پیدا کن.'],
        },
      },
    ],
  },

  'pipes-pipe': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## پایپ‌ها',
            '',
            'اپراتور `|` خروجی یک دستور را ورودی دستور بعدی می‌کند:',
            '',
            '```',
            'type names.txt | sort',
            'type names.txt | sort | find "m"',
            '```',
            '',
            'با بازتخصیص ترکیبش کن تا نتیجه ذخیره شود.',
          ],
        },
      },
      {
        type: 'CmdDemonstrationView',
        options: {
          beforeMarkdowns: ['یک فهرست کوتاه نام را زنده مرتب کن.'],
          afterMarkdowns: ['ترتیب خروجی عوض شد. همان سه خط.'],
          command: 'type names.txt | sort',
          beforeCommand:
            'echo zoe>names.txt & echo amy>>names.txt & echo mike>>names.txt',
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            'نام‌های مرتب‌شده را در `sorted.txt` بنویس (یک نام در هر خط: amy, mike, zoe).',
          ],
        },
      },
    ],
  },

  'pipes-findstr': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## FINDSTR',
            '',
            '```',
            'findstr pattern file',
            'findstr /i pattern file   :: بدون توجه به بزرگی حروف',
            'findstr /n pattern file   :: شماره خطوط',
            'findstr /r pattern file   · regex',
            '```',
            '',
            'هر خطی را که `error` دارد صرف‌نظر از بزرگی حروف منطبق کن.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['در `app.log` دنبال `error` بدون توجه به بزرگی حروف بگرد.'],
        },
      },
    ],
  },

  'adv-chain': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## && || &',
            '',
            '| اپراتور | معنی |',
            '| --- | --- |',
            '| `a & b` | هر دو اجرا شوند |',
            '| `a && b` | b فقط اگر a موفق بود |',
            '| `a \\|\\| b` | b فقط اگر a شکست خورد |',
            '',
            '`backup\\copy.txt` با محتوای `data` بساز، با هر تعداد دستور که دوست داری.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['مثال: `md backup && echo data>backup\\copy.txt`'],
        },
      },
    ],
  },

  'adv-env': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## متغیرهای محیطی',
            '',
            '```',
            'set                 :: فهرست همه',
            'set NAME=value      :: تعریف',
            'set NAME            · پرس‌وجو',
            'echo %NAME%         :: بسط',
            '```',
            '',
            '`MSG` را با مقدار `salam learn-cmd` تعریف کن و در `greeting.txt` بنویس.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['فایل هدف `greeting.txt` باید دقیقاً `salam learn-cmd` داشته باشد.'],
        },
      },
    ],
  },

  'adv-mixed': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## چالش نهایی',
            '',
            'این چیدمان دقیق را زیر پوشه خانگی بساز:',
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
            'هدف گلف: **۴ دستور**. دکمه Reset دوست شماست.',
          ],
        },
      },
      {
        type: 'ModalAlert',
        options: {
          markdowns: ['وقتی درخت با هدف یکی شد، قبول می‌شوی. موفق باشی.'],
        },
      },
    ],
  },
};

/**
 * @param {string} levelId
 * @returns {{ childViews: DialogView[] } | null}
 */
export function getDialogFa(levelId) {
  return dialogsFa[levelId] || null;
}

export const LOCALES = ['en', 'fa', 'de'];

let currentLocale = 'en';

export function getLocale() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('learn-cmd.lang');
    if (saved === 'fa' || saved === 'en' || saved === 'de') {
      currentLocale = saved;
    }
  }
  return currentLocale;
}

export function setLocale(loc) {
  if (LOCALES.includes(loc)) {
    currentLocale = loc;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('learn-cmd.lang', loc);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = loc === 'fa' ? 'fa' : loc === 'de' ? 'de' : 'en';
      document.documentElement.dir = loc === 'fa' ? 'rtl' : 'ltr';
    }
  }
}

export const UI_STRINGS = {
  en: {
    language: 'Language',
    menuLabel: 'Navigation menu',
    levels: 'Levels',
    lesson: 'Lesson',
    lessonTitle: 'Replay lesson dialog',
    guide: 'Guide',
    hint: 'Hint',
    solution: 'Solution',
    undo: 'Undo',
    reset: 'Reset',
    sandboxBtn: 'Sandbox',
    help: 'Help',
    uiGuideTitle: 'UI Layout Guide',
    visitorsTitle: 'Total unique visitors',
    githubTitle: 'View repository on GitHub',
    support: 'Buy me a coffee',
    supportTitle: 'Support the publisher',
    learningGuide: 'Learning guide',
    guideAlwaysOn:
      'Always-on panel. In a level it shows concepts, field notes, and the solution checklist.',
    startHere: 'Start here',
    startHereItems: [
      'Open **Levels** and begin with Basics → Echo Hello',
      'Type `help ui` for a map of this page',
      'Type `curriculum` for outcomes you will own',
      'Type `help` for full list of CMD commands',
    ],
    sandboxTip: 'Sandbox tip',
    sandboxTipItems: [
      'Board: Virtual C:\\ filesystem tree',
      'Terminal: Tab completes word-by-word; ↑/↓ is history',
      'Progress saves in this browser (cookie + localStorage)',
    ],
    noActiveLevel: 'No active level',
    noActiveLevelDetail: 'levels → pick a challenge to see the checklist here',
    guideFlashNote:
      'Toolbar <code>Guide</code> flashes this panel. It stays open at full page height.',
    youAreLearning: 'YOU ARE LEARNING',
    fieldNotesTitle: 'IN PRODUCTION (FIELD NOTES)',
    typeNextTitle: 'TYPE NEXT — HIGHLIGHTED IN ORANGE',
    remainingLabel: '○ remaining',
    wrongCommandNote: 'Wrong command? You stay here — progress is kept. History: ↑ / ↓',
    nowChip: 'now',
    stateNotes: 'State notes:',
    allSolutionMet: '✓ Goal criteria reached! Press Enter to finalize or move on.',
    bestSoFar: (best, par) => `Best so far: ${best} commands · ideal: ${par}`,
    idealSolution: (par) => `Best so far: 0 commands · ideal: ${par}`,
    levelSolvedBanner: 'LEVEL CLEARED',
    partyMode: 'Press Next Level to proceed, or share your golf score!',
    cheers: [
      'Outstanding command execution!',
      'Clean syntax, zero friction.',
      'Command line mastery in progress.',
      'Flawless execution!',
    ],
    shareTitle: 'Share your achievement',
    copyPost: 'Copy Post',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    startLevel: 'Start Level',
    runSolution: 'Run Solution',
    cancel: 'Cancel',
    pickChallenge: 'Choose a level sequence. Command golf scores are saved automatically.',
    howToRead: 'Legend & Score Card',
    difficultyLegend: 'Difficulty rating (1-5 dots)',
    idealLegend: 'Target command golf par',
    solvedLegend: 'Solved badge with best command count',
    difficultyOf: (n) => `Difficulty: ${n}/5`,
    solvedLabel: 'Solved',
    levelsTitle: 'Command Sequences',
    aboutTitle: 'About learn-cmd',
    levelMeta: (id, name) => `Level: ${name || id} [${id}]`,
    titleLine: (id, name, par) => `${id} · ${name} · expected ${par} commands`,
    sandboxTitle: 'sandbox mode',
    unknownLevel: (id) => `Unknown level id: ${id}`,
    noHintSandbox: 'You are in Sandbox mode. Type `levels` to choose a challenge.',
    noGoalSandbox: 'Sandbox mode has no goal. Type `levels` to load a lesson.',
    allStepsMet: 'All goal criteria already reached.',
    guideAlwaysRight: 'Guide dock is docked on the right.',
    nothingToUndo: 'Nothing to undo.',
    undoMeta: 'Last state change reverted.',
    noSolutionSandbox: 'Solutions are only available inside levels.',
    solutionTitle: (id) => `Solution for ${id}`,
    solutionCommands: 'Reference command sequence:',
    solutionWarn: 'Running the solution will mark this level as "solution seen" in golf tracking.',
    resetLevel: (id) => `Level ${id} reset to starting filesystem.`,
    resetSandbox: 'Sandbox filesystem reset.',
    lessonReplayed: 'Lesson dialog reopened.',
    helpLinks: 'levels · sandbox · hint · steps · goal · solution · undo · reset · quiz · share',
    curriculumOutcomes: 'Curriculum & Learning Outcomes:',
    progressLevels: (solved, total) => `Progress: ${solved}/${total} levels completed (${total ? Math.round((solved / total) * 100) : 0}%).`,
    quizHeader: (num, total) => `Question ${num} of ${total}`,
    quizAnswerUsage: 'Answer with: quiz A, quiz B, or quiz C',
    correct: '✓ Correct! Well done.',
    quizFinished: 'Quiz finished! You have completed all questions.',
    linkedin: 'LinkedIn',
    xTwitter: 'X / Twitter',
    facebook: 'Facebook',
    copyOk: 'Copied to clipboard!',
    copyFail: 'Could not copy automatically.',
    shareCopied: 'Share text copied to clipboard.',
    shareOpened: 'Share window opened.',
    baskInIt: 'Stay Here',
    celebrateOn: (nextId) => `Next Level: ${nextId}`,
    browseLevels: 'Browse Levels',
    levelComplete: 'Level Cleared!',
    termAriaLabel: 'Command line prompt',
  },
  fa: {
    language: 'زبان',
    menuLabel: 'منوی ناوبری',
    levels: 'مراحل',
    lesson: 'درس',
    lessonTitle: 'نمایش مجدد دیالوگ درس',
    guide: 'راهنما',
    hint: 'نکته',
    solution: 'پاسخ',
    undo: 'لغو',
    reset: 'شروع مجدد',
    sandboxBtn: 'آزاد',
    help: 'راهنما',
    uiGuideTitle: 'راهنمای رابط کاربری',
    visitorsTitle: 'مجموع بازدیدکنندگان یکتا',
    githubTitle: 'مشاهده مخزن در گیت‌هاب',
    support: 'حمایت',
    supportTitle: 'حمایت مالی (خرید قهوه)',
    learningGuide: 'راهنمای یادگیری',
    guideAlwaysOn: 'داک راهنما و بررسی وضعیت اهداف',
    startHere: 'از اینجا شروع کن',
    startHereItems: [
      'با تایپ `levels` یا کلیک روی **مراحل** در نوار بالا، درس‌ها را به ترتیب پیش ببر.',
      'با دستور `dir` محتویات پوشه کاری فعلی را بررسی کن.',
      'با دستور `cd Documents` وارد پوشه‌ها شو.',
      'برای مشاهده فهرست کامل دستورات ویندوز، `help` را تایپ کن.',
    ],
    sandboxTip: 'دستورات حالت آزاد',
    sandboxTipItems: [
      '`undo` — لغو آخرین تغییر در دیسک مجازی',
      '`reset` — بازگردانی دیسک به حالت اولیه',
      '`tree /f` — ترسیم نموداری ساختار پوشه‌ها و فایل‌ها',
      '`help ui` — نمایش راهنما و هایلایت اجزای صفحه',
    ],
    noActiveLevel: 'حالت آزاد (Sandbox)',
    noActiveLevelDetail: 'کاوش آزادانه در شل ویندوز. برای شروع چالش دستور `levels` را بزنید.',
    guideFlashNote: 'برای بررسی هدف مرحله در ترمینال `steps` یا `goal` را تایپ کن.',
    youAreLearning: 'در حال یادگیری',
    fieldNotesTitle: 'در تولید (یادداشت میدانی)',
    typeNextTitle: 'بعدی را تایپ کن — با هایلایت نارنجی',
    remainingLabel: '○ باقی‌مانده',
    wrongCommandNote: 'فرمان اشتباه؟ همین‌جا می‌مانید — پیشرفت حفظ می‌شود. تاریخچه: ↑ / ↓',
    nowChip: 'اکنون',
    stateNotes: 'یادداشت وضعیت:',
    allSolutionMet: '✓ هدف مرحله محقق شد! برای رفتن به مرحله بعد کلید را بزنید.',
    bestSoFar: (best, par) => `بهترین تا اینجا: ${best} فرمان · ایده‌آل: ${par}`,
    idealSolution: (par) => `بهترین تا اینجا: ۰ فرمان · ایده‌آل: ${par}`,
    levelSolvedBanner: 'مرحله حل شد',
    partyMode: 'دکمه Next Level را برای ادامه بزن یا امتیازت را به اشتراک بگذار!',
    cheers: [
      'اجرای دقیق و بی‌نقص!',
      'عالی بود؛ دستورات کاملاً تمیز اجرا شدند.',
      'مهارت خط فرمان در حال رشد است.',
      'تسلط کامل بر سینتکس ویندوز!',
    ],
    shareTitle: 'اشتراک‌گذاری پیشرفت',
    copyPost: 'کپی متن',
    close: 'بستن',
    back: 'قبلی',
    next: 'بعدی',
    startLevel: 'شروع مرحله',
    runSolution: 'اجرای راه‌حل',
    cancel: 'انصراف',
    pickChallenge: 'سری مراحل را انتخاب کنید. رکوردهای Command Golf به‌طور خودکار ذخیره می‌شوند.',
    howToRead: 'راهنمای علائم و نشان‌ها',
    difficultyLegend: 'درجه سختی (۱ تا ۵ نقطه)',
    idealLegend: 'تعداد دستور ایده‌آل (Par)',
    solvedLegend: 'نشان حل‌شده به همراه بهترین رکورد',
    difficultyOf: (n) => `سختی: ${n} از ۵`,
    solvedLabel: 'حل شد',
    levelsTitle: 'توالی مراحل آموزشی',
    aboutTitle: 'درباره learn-cmd',
    levelMeta: (id, name) => `مرحله: ${name || id} [${id}]`,
    titleLine: (id, name, par) => `${name} (${id}) · هدف ${par}`,
    sandboxTitle: 'محیط آزاد — درایو مجازی :C',
    unknownLevel: (id) => `مرحله‌ای با این شناسه یافت نشد: ${id}`,
    noHintSandbox: 'در حالت آزاد هستید. با دستور `levels` یک مرحله را انتخاب کنید.',
    noGoalSandbox: 'حالت آزاد هدفی ندارد. برای ورود به درس دستور `levels` را بزنید.',
    allStepsMet: 'تمامی مراحل با موفقیت انجام شده‌اند.',
    guideAlwaysRight: 'پنل راهنما در ستون سمت راست قرار دارد.',
    nothingToUndo: 'تغییری برای لغو وجود ندارد.',
    undoMeta: 'آخرین وضعیت فایل‌سیستم بازیابی شد.',
    noSolutionSandbox: 'مشاهده راه‌حل فقط در داخل مراحل فعال است.',
    solutionTitle: (id) => `راه‌حل مرحله ${id}`,
    solutionCommands: 'توالی دستورات مرجع:',
    solutionWarn: 'اجرای خودکار راه‌حل، این مرحله را به عنوان "راه‌حل دیده‌شده" ثبت می‌کند.',
    resetLevel: (id) => `مرحله ${id} به حالت اولیه برگشت.`,
    resetSandbox: 'سیستم‌فایل مجازی ریست شد.',
    lessonReplayed: 'دیالوگ درس مجدداً باز شد.',
    helpLinks: 'levels · sandbox · hint · steps · goal · solution · undo · reset · quiz · share',
    curriculumOutcomes: 'سرفصل‌ها و مهارت‌های کسب‌شده:',
    progressLevels: (solved, total) => `پیشرفت: ${solved} از ${total} مرحله حل شد (${total ? Math.round((solved / total) * 100) : 0}٪).`,
    quizHeader: (num, total) => `سوال ${num} از ${total}`,
    quizAnswerUsage: 'پاسخ با دستور: quiz A یا quiz B یا quiz C',
    correct: '✓ کاملاً درست است.',
    quizFinished: 'آزمون به پایان رسید! تمامی سوالات را پاسخ دادید.',
    linkedin: 'لینکدین',
    xTwitter: 'توییتر / X',
    facebook: 'فیس‌بوک',
    copyOk: 'متن در کلیپ‌بورد کپی شد!',
    copyFail: 'کپی خودکار با خطا مواجه شد.',
    shareCopied: 'متن پست در حافظه کپی شد.',
    shareOpened: 'پنجره اشتراک‌گذاری باز شد.',
    baskInIt: 'همینجا بمان',
    celebrateOn: (nextId) => `مرحله بعدی: ${nextId}`,
    browseLevels: 'مشاهده مراحل',
    levelComplete: 'تبریک! مرحله تکمیل شد',
    termAriaLabel: 'خط فرمان شبیه‌ساز',
  },
  de: {
    language: 'Sprache',
    menuLabel: 'Navigationsmenü',
    levels: 'Level',
    lesson: 'Lektion',
    lessonTitle: 'Lektionsdialog wiederholen',
    guide: 'Anleitung',
    hint: 'Tipp',
    solution: 'Lösung',
    undo: 'Rückgängig',
    reset: 'Neustart',
    sandboxBtn: 'Sandbox',
    help: 'Hilfe',
    uiGuideTitle: 'Oberflächen-Handbuch',
    visitorsTitle: 'Gesamte eindeutige Besucher',
    githubTitle: 'Repository auf GitHub ansehen',
    support: 'Unterstützen',
    supportTitle: 'Kaffee spendieren',
    learningGuide: 'Lernleitfaden',
    guideAlwaysOn: 'Interaktiver Leitfaden & Zielanzeige',
    startHere: 'Hier beginnen',
    startHereItems: [
      'Tippe `levels` oder klicke oben auf **Level**, um strukturierte Übungen zu starten.',
      'Tippe `dir`, um das aktuelle Arbeitsverzeichnis aufzulisten.',
      'Tippe `cd Documents`, um in Ordner zu wechseln.',
      'Tippe `help` für alle verfügbaren Windows-Befehle.',
    ],
    sandboxTip: 'Sandbox-Befehle',
    sandboxTipItems: [
      '`undo` — letzten Befehl rückgängig machen',
      '`reset` — virtuelles Dateisystem zurücksetzen',
      '`tree /f` — visuelle Verzeichnisstruktur anzeigen',
      '`help ui` — Oberflächen-Bereiche hervorheben',
    ],
    noActiveLevel: 'Sandbox-Modus',
    noActiveLevelDetail: 'Freies Erkunden. Tippe `levels`, um eine Übung zu wählen.',
    guideFlashNote: 'Tippe `steps` oder `goal` im Terminal, um das Ziel zu sehen.',
    youAreLearning: 'DU LERNST',
    fieldNotesTitle: 'IN PRODUKTION (FIELD NOTES)',
    typeNextTitle: 'ALS NÄCHSTES TIPPEN — ORANGE MARKIERT',
    remainingLabel: '○ offen',
    wrongCommandNote: 'Falscher Befehl? Du bleibst hier — Fortschritt bleibt. History: ↑ / ↓',
    nowChip: 'jetzt',
    stateNotes: 'Statusnotizen:',
    allSolutionMet: '✓ Zielkriterien erreicht!',
    bestSoFar: (best, par) => `Bisher am besten: ${best} Befehle · Ideal: ${par}`,
    idealSolution: (par) => `Bisher am besten: 0 Befehle · Ideal: ${par}`,
    levelSolvedBanner: 'LEVEL GELÖST',
    partyMode: 'Klicke auf Nächstes Level oder teile deinen Erfolg!',
    cheers: [
      'Hervorragend ausgeführt!',
      'Saubere Syntax, direkter Treffer.',
      'Befehlszeilen-Kompetenz wächst stetig.',
      'Perfekte Ausführung!',
    ],
    shareTitle: 'Erfolg teilen',
    copyPost: 'Kopieren',
    close: 'Schließen',
    back: 'Zurück',
    next: 'Weiter',
    startLevel: 'Level starten',
    runSolution: 'Lösung ausführen',
    cancel: 'Abbrechen',
    pickChallenge: 'Wähle eine Sequenz. Rekorde werden automatisch im Browser gespeichert.',
    howToRead: 'Legende',
    difficultyLegend: 'Schwierigkeit (1 bis 5 Punkte)',
    idealLegend: 'Ideale Befehlsanzahl (Par)',
    solvedLegend: 'Abzeichen für gelöste Level',
    difficultyOf: (n) => `Schwierigkeit: ${n}/5`,
    solvedLabel: 'Gelöst',
    levelsTitle: 'Lernsequenzen',
    aboutTitle: 'Über learn-cmd',
    levelMeta: (id, name) => `Level: ${name || id} [${id}]`,
    titleLine: (id, name, par) => `${name} (${id}) · Par ${par}`,
    sandboxTitle: 'Freie Sandbox — Virtuelles Laufwerk C:',
    unknownLevel: (id) => `Unbekannte Level-ID: ${id}`,
    noHintSandbox: 'Du bist im Sandbox-Modus. Tippe `levels`, um zu starten.',
    noGoalSandbox: 'Die Sandbox hat kein festes Ziel. Starte mit `levels`.',
    allStepsMet: 'Alle Kriterien bereits erfüllt.',
    guideAlwaysRight: 'Das Anleitungs-Dock befindet sich auf der rechten Seite.',
    nothingToUndo: 'Nichts zum Rückgängigmachen vorhanden.',
    undoMeta: 'Vorheriger Zustand wiederhergestellt.',
    noSolutionSandbox: 'Lösungen sind nur innerhalb von Leveln verfügbar.',
    solutionTitle: (id) => `Lösung für ${id}`,
    solutionCommands: 'Referenz-Befehle:',
    solutionWarn: 'Das Ausführen der Lösung markiert das Level als "Lösung eingesehen".',
    resetLevel: (id) => `Level ${id} wurde zurückgesetzt.`,
    resetSandbox: 'Sandbox-Dateisystem zurückgesetzt.',
    lessonReplayed: 'Lektionsdialog erneut geöffnet.',
    helpLinks: 'levels · sandbox · hint · steps · goal · solution · undo · reset · quiz · share',
    curriculumOutcomes: 'Lernplan & Lernergebnisse:',
    progressLevels: (solved, total) => `Fortschritt: ${solved}/${total} Level abgeschlossen (${total ? Math.round((solved / total) * 100) : 0}%).`,
    quizHeader: (num, total) => `Frage ${num} von ${total}`,
    quizAnswerUsage: 'Antworte mit: quiz A, quiz B oder quiz C',
    correct: '✓ Richtig!',
    quizFinished: 'Quiz beendet! Alle Fragen wurden beantwortet.',
    linkedin: 'LinkedIn',
    xTwitter: 'X / Twitter',
    facebook: 'Facebook',
    copyOk: 'In die Zwischenablage kopiert!',
    copyFail: 'Kopieren fehlgeschlagen.',
    shareCopied: 'Text kopiert.',
    shareOpened: 'Teilen-Fenster geöffnet.',
    baskInIt: 'Hier bleiben',
    celebrateOn: (nextId) => `Nächstes Level: ${nextId}`,
    browseLevels: 'Level ansehen',
    levelComplete: 'Glückwunsch! Level gemeistert',
    termAriaLabel: 'Befehlseingabe',
  },
};

export const QUIZ_ITEMS = {
  en: [
    {
      q: 'Which switch makes `dir` display only bare file and directory names?',
      a: ['/S', '/B', '/W'],
      correct: 1,
    },
    {
      q: 'Which operator appends text to an existing file instead of overwriting it?',
      a: ['>', '>>', '|'],
      correct: 1,
    },
    {
      q: 'How do you remove a non-empty directory tree silently in Windows CMD?',
      a: ['del /all', 'rd /s /q dirname', 'erase /force dirname'],
      correct: 1,
    },
    {
      q: 'What operator chains two commands so the second runs ONLY if the first succeeds?',
      a: ['&', '&&', '||'],
      correct: 1,
    },
    {
      q: 'How do you refer to an environment variable named "PATH" in CMD?',
      a: ['$PATH', '%PATH%', '{PATH}'],
      correct: 1,
    },
  ],
  fa: [
    {
      q: 'کدام سوییچ باعث می‌شود خروجی `dir` فقط شامل نام خالص فایل‌ها و پوشه‌ها باشد؟',
      a: ['/S', '/B', '/W'],
      correct: 1,
    },
    {
      q: 'کدام عملگر متن را به انتهای یک فایل اضافه می‌کند (بدون پاک کردن محتوای قبلی)؟',
      a: ['>', '>>', '|'],
      correct: 1,
    },
    {
      q: 'برای حذف کامل یک پوشه غیرخالی و زیرشاخه‌های آن بدون سوال تایید کدام صحیح است؟',
      a: ['del /all', 'rd /s /q dirname', 'erase /force dirname'],
      correct: 1,
    },
    {
      q: 'کدام عملگر دو دستور را متصل می‌کند تا دستور دوم تنها در صورت موفقیت اولی اجرا شود؟',
      a: ['&', '&&', '||'],
      correct: 1,
    },
    {
      q: 'نحوه ارجاع به متغیر محیطی PATH در محیط CMD چگونه است؟',
      a: ['$PATH', '%PATH%', '{PATH}'],
      correct: 1,
    },
  ],
  de: [
    {
      q: 'Welcher Schalter sorgt bei `dir` für eine reine Namensauflistung ohne Metadaten?',
      a: ['/S', '/B', '/W'],
      correct: 1,
    },
    {
      q: 'Welcher Operator hängt Text an eine Datei an, anstatt sie zu überschreiben?',
      a: ['>', '>>', '|'],
      correct: 1,
    },
    {
      q: 'Wie löscht man ein nicht-leeres Verzeichnis samt Unterordnern ohne Nachfrage?',
      a: ['del /all', 'rd /s /q dirname', 'erase /force dirname'],
      correct: 1,
    },
    {
      q: 'Welcher Operator führt den zweiten Befehl nur bei Erfolg des ersten aus?',
      a: ['&', '&&', '||'],
      correct: 1,
    },
    {
      q: 'Wie greift man in der CMD auf die Umgebungsvariable PATH zu?',
      a: ['$PATH', '%PATH%', '{PATH}'],
      correct: 1,
    },
  ],
};

/**
 * Return UI dictionary for current or specified locale.
 *
 * @param {'en' | 'fa' | 'de'} [loc]
 * @returns {typeof UI_STRINGS.en}
 */
export function ui(loc) {
  const code = loc || getLocale();
  const base = UI_STRINGS.en;
  const target = UI_STRINGS[code] || base;
  return {
    ...base,
    ...target,
    quiz: QUIZ_ITEMS[code] || QUIZ_ITEMS.en,
  };
}

/**
 * Localize a level definition for display in the right dock and UI dialogs.
 *
 * @param {import('./levels.js').Level} level
 * @param {'en' | 'fa' | 'de'} [loc]
 * @returns {import('./levels.js').Level & { objective: string, learning: string[], fieldNotes: string[] }}
 */
export function localizeLevel(level, loc) {
  const code = loc || getLocale();
  const name =
    (level.name && (level.name[code] || level.name.en_US || Object.values(level.name)[0])) ||
    level.id;
  const hint =
    (level.hint && (level.hint[code] || level.hint.en_US || Object.values(level.hint)[0])) || '';
  const about =
    (level.about && (level.about[code] || level.about.en_US || Object.values(level.about)[0])) || '';

  /** @type {Record<string, { objective: string, learning: string[], fieldNotes: string[] }>} */
  const metadata = {
    'intro-echo': {
      objective: 'Run `echo hello` to print your first greeting on the command line.',
      learning: ['Understanding standard output', 'Basic command grammar in CMD', 'Echoing text'],
      fieldNotes: ['`echo.` prints an empty blank line in real batch scripts.'],
    },
    'intro-dir': {
      objective: 'Run `dir` to inspect directories, file sizes, and dates in your user folder.',
      learning: ['Reading directory listings', 'Recognizing <DIR> tags', 'File byte sizes'],
      fieldNotes: ['`dir /b` produces a bare listing without headers, great for piping.'],
    },
    'intro-cd': {
      objective: 'Change your working directory into `Documents`.',
      learning: ['Navigating folder hierarchies', 'Using relative and absolute paths', '`cd ..` back navigation'],
      fieldNotes: ['`cd \\` jumps directly to the root of the current drive.'],
    },
    'intro-md': {
      objective: 'Create a new directory named `projects`.',
      learning: ['Creating directories with `md` or `mkdir`', 'Auto-creating nested parent folders'],
      fieldNotes: ['`md a\\b\\c` creates all intermediate subdirectories in one shot.'],
    },
    'intro-files': {
      objective: 'Create a file named `hello.txt` with content `hello world` using `>`.',
      learning: ['Output redirection with `>`', 'Writing file streams without text editors'],
      fieldNotes: ['`>` truncates existing content, while `>>` appends to the end.'],
    },
  };

  const extra = metadata[level.id] || {
    objective: about || hint || 'Reach the target filesystem state.',
    learning: ['Windows CMD syntax', 'Command line filesystem navigation'],
    fieldNotes: ['Use `hint` or `show solution` if you get stuck.'],
  };

  return {
    ...level,
    name: { [code]: name, en_US: level.name?.en_US || name },
    hint: { [code]: hint, en_US: level.hint?.en_US || hint },
    about: { [code]: about, en_US: level.about?.en_US || about },
    objective: extra.objective,
    learning: extra.learning,
    fieldNotes: extra.fieldNotes,
  };
}

