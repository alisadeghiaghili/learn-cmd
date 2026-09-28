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
