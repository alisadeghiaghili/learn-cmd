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
            '## <img src="assets/favicon.svg" alt="CMD" class="welcome-brand-icon" /> welcome to learn <span class="brand-cmd">CMD</span>',
            '',
            'پردازنده فرمان ویندوز (`cmd.exe`) رابط متنی و مستقیم برای کنترل کامپیوتر است. به‌جای کلیک‌های مداوم روی آیکون‌ها، دستور می‌نویسید و شل آن را فوراً اجرا می‌کند.',
            '',
            '### چرا یادگیری خط فرمان (CMD) مهم است و به چه درد می‌خورد؟',
            '- **اتوماسیون کارهای سنگین:** انتقال، کپی یا تغییر نام ۱۰۰۰ فایل با ماوس دقایق زیادی وقت می‌گیرد، اما با یک دستور CMD در ۱ ثانیه انجام می‌شود.',
            '- **محیط‌های سروری، ابری و DevOps:** در سرورهای ابری ویندوز، کانتینرهای Docker و پایپ‌لاین‌های CI/CD هیچ پنجره گرافیکی وجود ندارد؛ همه‌چیز متکی بر خط فرمان است.',
            '- **عیب‌یابی عمیق و نجات سیستم:** وقتی ویندوز کرش می‌کند یا رابط گرافیکی از کار می‌افتد، تنها ابزار بررسی شبکه، پروسه‌ها و نجات سیستم، ترمینال است.',
            '- **ستون فقرات ابزارهای توسعه:** تمام ابزارهای استاندارد مهندسی نرم‌افزار مانند Git، Python، Node.js و Docker بر بستر ترمینال کار می‌کنند.',
            '',
            'در **سمت چپ** نقشه زنده‌ی فایل‌سیستم مجازی را می‌بینید. در **سمت راست** ترمینال است. هر دستوری که اجرا کنید بلافاصله نقشه را به‌روز می‌کند.',
            '',
            'اولین دستور شما `echo` است. متن را دریافت کرده و مستقیماً روی صفحه چاپ می‌کند.',
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

  'sys-datetime': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## تاریخ و زمان سیستم (`DATE` / `TIME`)',
            '',
            'در اسکریپت‌های اتوماسیون و لاگ‌گیری استقرار، ثبت زمان دقیق انجام عملیات برای ممیزی و پیگیری خطاها ضروری است.',
            '',
            'دستور `date /t` تاریخ جاری سیستم را بدون انتظار برای ورودی جدید چاپ می‌کند، و دستور `time /t` ساعت جاری سیستم را نمایش می‌دهد.',
            '',
            'با ترکیب عملگر `&` هر دو را در یک خط اجرا کن.',
            '',
            '```',
            'date /t & time /t',
            '```',
          ],
        },
      },
    ],
  },

  'sys-attrib': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## صفات فایل (`ATTRIB`)',
            '',
            'فایل‌های ویندوز دارای صفات متاداده هستند: **R** (فقط‌خواندنی)، **H** (مخفی)، **A** (آرشیو) و **S** (سیستمی).',
            '',
            'با `attrib +r <file>` می‌توانید یک فایل پیکربندی حیاتی را قفل کنید تا به اشتباه پاک یا بازنویسی نشود.',
            '',
            '```',
            'attrib +r config.ini',
            '```',
          ],
        },
      },
    ],
  },

  'sys-where': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## یافتن برنامه‌ها (`WHERE`)',
            '',
            'دستور `where` تمام مسیرهای تعریف‌شده در متغیر محیطی `%PATH%` را اسکن می‌کند تا محل واقعی یک برنامه اجرایی را پیدا کند.',
            '',
            'مسیر فایل اجرایی `cmd` را با ریدایرکشن در `cmd_path.txt` ذخیره کن.',
            '',
            '```',
            'where cmd > cmd_path.txt',
            '```',
          ],
        },
      },
    ],
  },

  'sys-pushpop': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## استک دایرکتوری (`PUSHD` / `POPD`)',
            '',
            'به‌جای به خاطر سپردن مسیر قبلی هنگام رفتن به پوشه‌های تودرتو، دستور `pushd <dir>` پوشه فعلی را در یک پشته (Stack) ذخیره کرده و به پوشه مقصد می‌رود. سپس `popd` شما را فوراً به مبدأ برمی‌گرداند.',
            '',
            'وارد پوشه `Documents` شو، فایل `bk.txt` را بنویس و با `popd` به پوشه اول بازگرد.',
          ],
        },
      },
    ],
  },

  'sys-tasks': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## مدیریت پردازش‌ها (`TASKLIST` و `TASKKILL`)',
            '',
            'در محیط‌های واقعی و سرورها، هنگامی که برنامه‌ای هنگ می‌کند یا بیش از حد منابع مصرف می‌کند، با `tasklist` آن را شناسایی کرده و با `taskkill /im <name> /f` فوراً به آن خاتمه می‌دهیم.',
            '',
            'با دستور `taskkill /im node.exe /f` پردازش معلق را ببند.',
          ],
        },
      },
    ],
  },

  'batch-if': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## منطق شرطی در اسکریپت‌ها (`IF EXIST`)',
            '',
            'اسکریپت‌های اتوماسیون پروداکشن نباید به خاطر عدم وجود یک فایل خطا بدهند. دستور `if exist <file> <command>` عملیات را مشروط به وجود فایل می‌کند.',
            '',
            'بررسی کن اگر فایل `lock.tmp` وجود دارد، آن را حذف کن.',
            '',
            '```',
            'if exist lock.tmp del lock.tmp',
            '```',
          ],
        },
      },
    ],
  },

  'batch-sort': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## مرتب‌سازی داده‌ها (`SORT /R`)',
            '',
            'دستور `sort` سطرهای متنی یا خروجی دستورات را به ترتیب الفبایی یا عددی مرتب می‌کند. سوییچ `/r` ترتیب را معکوس (نزولی) می‌کند.',
            '',
            'محتوای `scores.txt` را به صورت نزولی در `ranking.txt` ذخیره کن.',
            '',
            '```',
            'sort /r scores.txt > ranking.txt',
            '```',
          ],
        },
      },
    ],
  },

  'batch-errorlevel': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## کدهای بازگشتی و خطایابی (`IF ERRORLEVEL`)',
            '',
            'در اتوماسیون‌های حرفه‌ای و خطوط لوله CI/CD، کنترل موفقیت یا شکست دستورات الزامی است. هر برنامه در ویندوز یک کد خروجی برمی‌گرداند؛ مقدار `0` به معنی موفقیت و مقادیر بزرگتر (مانند `1`) به معنی خطا یا عدم انطباق است.',
            '',
            'دستور `IF ERRORLEVEL n` بررسی می‌کند که آیا کد خروجی بزرگتر مساوی `n` است یا خیر. دستور `IF NOT ERRORLEVEL 1` تضمین می‌کند که دستور بدون خطا پایان یافته است.',
            '',
            'وجود خطا را در لاگ بررسی کن و در صورت وجود، هشدار را ثبت کن:',
            '',
            '```',
            'find "FAIL" server.log && if not errorlevel 1 echo alert>alert.txt',
            '```',
          ],
        },
      },
    ],
  },

  'batch-for': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## حلقه و تکرار در خط فرمان (`FOR` / `DO`)',
            '',
            'تکرار دستی یک دستور برای ده‌ها فایل، کند و پرخطاست. دستور `FOR` به شما امکان می‌دهد روی فایل‌ها یا لیست داده‌ها حلقه بزنید:',
            '',
            '`FOR %f IN (*.log) DO move %f archive`',
            '',
            'متغیر `%f` به نوبت نام هر فایل را می‌گیرد و دستور بعد از `DO` را برای آن اجرا می‌کند.',
            '',
            'تمام فایل‌های `.log` را در یک حرکت به پوشه `archive` منتقل کن.',
            '',
            '```',
            'for %f in (*.log) do move %f archive',
            '```',
          ],
        },
      },
    ],
  },

  'batch-script': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## اسکریپت‌نویسی فایل‌های بچ (`.BAT` / `.CMD`)',
            '',
            'یک متخصص خط فرمان برای کارهای روزمره، مراحل را داخل یک فایل متنی با پسوند `.bat` ذخیره می‌کند تا با یک دستور ساده اجرا شود.',
            '',
            'با دستور `echo` مراحل بیلد را داخل فایل `build.bat` بنویس و سپس با تایپ نام آن، اسکریپت را مستقیماً اجرا کن:',
            '',
            '```',
            'echo md dist>build.bat & echo copy src\\index.js dist>>build.bat & build.bat',
            '```',
          ],
        },
      },
    ],
  },

  'batch-master': {
    childViews: [
      {
        type: 'ModalAlert',
        options: {
          markdowns: [
            '## چالش نهایی: استقرار پروداکشن (Capstone)',
            '',
            'اکنون در **سطح اکسپرت کامل** هستید. یک خط لوله کامل استقرار نرم‌افزار را اجرا کنید:',
            '',
            '۱. ایجاد پوشه انتشار: `md release`',
            '۲. کپی فایل کد: `copy app.js release`',
            '۳. قفل امنیتی فایل کد: `attrib +r release\\app.js`',
            '۴. پاک‌سازی شرطی فایل‌های موقت: `if exist cache.tmp del cache.tmp`',
            '',
            'این عملیات را با عملگر `&&` به صورت یکپارچه اجرا کن.',
          ],
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
      return currentLocale;
    }
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('fa')) {
      currentLocale = 'fa';
      return currentLocale;
    }
    if (nav.startsWith('de')) {
      currentLocale = 'de';
      return currentLocale;
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
    wrongCommandNote: 'Explore and test commands freely — once the goal is achieved, the level clears. History: ↑ / ↓',
    nowChip: 'now',
    stateNotes: 'State notes:',
    criterionMet: 'Criterion met',
    runCommand: (cmd) => `run '${cmd}'`,
    allSolutionMet: '✓ Goal criteria reached! Press Enter to finalize or move on.',
    bestSoFar: (best, par) => `Best so far: ${best} commands · target: ${par} commands`,
    idealSolution: (par) => `Best so far: 0 commands · target: ${par} commands`,
    levelSolvedBanner: 'LEVEL CLEARED',
    partyMode: 'Press Next Level to proceed, or share your score!',
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
    pickChallenge: 'Choose a level sequence. Best command counts are saved automatically.',
    howToRead: 'Legend & Score Card',
    difficultyLegend: 'Difficulty rating (1-5 dots)',
    idealLegend: 'Target command count',
    solvedLegend: 'Solved badge with best command count',
    difficultyOf: (n) => `Difficulty: ${n}/5`,
    solvedLabel: 'Solved',
    levelsTitle: 'Command Sequences',
    aboutTitle: '<img src="assets/favicon.svg" alt="CMD" class="welcome-brand-icon" /> welcome to learn <span class="brand-cmd">CMD</span>',
    levelMeta: (id, name) => `Level: ${name || id} [${id}]`,
    titleLine: (id, name, par) => `${name} (${id}) · ${par} ${par === 1 ? 'command' : 'commands'}`,
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
    solutionWarn: 'Running the solution will mark this level as "solution seen" in scoring.',
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
    idealForLevel: (par) => `Optimal target: ${par} ${par === 1 ? 'command' : 'commands'}`,
    idealForLevelShort: (par) => `— at or under target (${par} ${par === 1 ? 'command' : 'commands'}). Clean run.`,
    styleList: 'What you mastered:',
    shareGroupLabel: 'Share to social media',
    solveMoreLevels: 'Solve more levels to populate this list',
    nextCelebration: (id, name) => `Next challenge: **${id}** — ${name}`,
    lastInPack: 'Last challenge in this track! Open **Levels** to explore more tracks.',
    solvedCountLabel: (n, total) => `${n} / ${total} levels solved · progress saved in this browser`,
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
    wrongCommandNote: 'دستورات را آزادانه آزمایش و کاوش کنید — هرزمان هدف محقق شود، مرحله حل می‌شود. تاریخچه: ↑ / ↓',
    nowChip: 'اکنون',
    stateNotes: 'یادداشت وضعیت:',
    criterionMet: 'شرط محقق شد',
    runCommand: (cmd) => `اجرای '${cmd}'`,
    allSolutionMet: '✓ هدف مرحله محقق شد! برای رفتن به مرحله بعد کلید را بزنید.',
    bestSoFar: (best, par) => `بهترین رکورد: ${best} کامند · هدف: ${par} کامند`,
    idealSolution: (par) => `بهترین رکورد: ۰ کامند · هدف: ${par} کامند`,
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
    pickChallenge: 'سری مراحل را انتخاب کنید. رکوردهای کامند به‌طور خودکار ذخیره می‌شوند.',
    howToRead: 'راهنمای علائم و نشان‌ها',
    difficultyLegend: 'درجه سختی (۱ تا ۵ نقطه)',
    idealLegend: 'تعداد کامند هدف',
    solvedLegend: 'نشان حل‌شده به همراه بهترین رکورد',
    difficultyOf: (n) => `سختی: ${n} از ۵`,
    solvedLabel: 'حل شد',
    levelsTitle: 'توالی مراحل آموزشی',
    aboutTitle: '<img src="assets/favicon.svg" alt="CMD" class="welcome-brand-icon" /> welcome to learn <span class="brand-cmd">CMD</span>',
    levelMeta: (id, name) => `مرحله: ${name || id} [${id}]`,
    titleLine: (id, name, par) => `${name} (${id}) · ${par} کامند`,
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
    solutionWarn: 'اجرای خودکار راه‌حل، این مرحله را به عنوان "راه‌حل دیده‌شده" در رکوردها ثبت می‌کند.',
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
    idealForLevel: (par) => `هدف بهینه این مرحله: ${par} کامند`,
    idealForLevelShort: (par) => `— در محدوده هدف (${par} کامند). اجرای تمیز.`,
    styleList: 'فهرست مهارت‌های تسلط‌یافته:',
    shareGroupLabel: 'اشتراک در شبکه‌های اجتماعی',
    solveMoreLevels: 'مراحل بیشتری را حل کنید تا این فهرست تکمیل شود',
    nextCelebration: (id, name) => `مرحله بعدی: **${id}** — ${name}`,
    lastInPack: 'آخرین مرحله این بخش! برای ادامه **فهرست مراحل** را باز کنید.',
    solvedCountLabel: (n, total) => `${n} / ${total} مرحله حل شد · پیشرفت در همین مرورگر ذخیره شده است`,
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
    wrongCommandNote: 'Befehle frei testen und erkunden — sobald das Ziel erreicht ist, ist das Level gelöst. History: ↑ / ↓',
    nowChip: 'jetzt',
    stateNotes: 'Statusnotizen:',
    criterionMet: 'Kriterium erfüllt',
    runCommand: (cmd) => `'${cmd}' ausführen`,
    allSolutionMet: '✓ Zielkriterien erreicht!',
    bestSoFar: (best, par) => `Bisher am besten: ${best} Befehle · Ziel: ${par} Befehle`,
    idealSolution: (par) => `Bisher am besten: 0 Befehle · Ziel: ${par} Befehle`,
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
    idealLegend: 'Ziel-Befehlsanzahl',
    solvedLegend: 'Abzeichen für gelöste Level',
    difficultyOf: (n) => `Schwierigkeit: ${n}/5`,
    solvedLabel: 'Gelöst',
    levelsTitle: 'Lernsequenzen',
    aboutTitle: '<img src="assets/favicon.svg" alt="CMD" class="welcome-brand-icon" /> welcome to learn <span class="brand-cmd">CMD</span>',
    levelMeta: (id, name) => `Level: ${name || id} [${id}]`,
    titleLine: (id, name, par) => `${name} (${id}) · ${par} ${par === 1 ? 'Befehl' : 'Befehle'}`,
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
    idealForLevel: (par) => `Optimales Ziel: ${par} ${par === 1 ? 'Befehl' : 'Befehle'}`,
    idealForLevelShort: (par) => `— im Zielbereich (${par} ${par === 1 ? 'Befehl' : 'Befehle'}). Sauberer Lauf.`,
    styleList: 'Was du gemeistert hast:',
    shareGroupLabel: 'In sozialen Netzwerken teilen',
    solveMoreLevels: 'Löse weitere Level, um diese Liste zu füllen',
    nextCelebration: (id, name) => `Nächstes Level: **${id}** — ${name}`,
    lastInPack: 'Letztes Level dieser Reihe! Öffne **Level**, um fortzufahren.',
    solvedCountLabel: (n, total) => `${n} / ${total} Level gelöst · Fortschritt im Browser gespeichert`,
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

export const LEVEL_METADATA = {
  'intro-echo': {
    en: {
      objective: 'Run `echo hello` to print your first greeting on the command line.',
      learning: ['Understanding standard output (stdout)', 'Basic command grammar in CMD', 'Echoing text with `echo`'],
      fieldNotes: ['`echo.` prints an empty blank line in real batch scripts.'],
    },
    fa: {
      objective: 'دستور `echo hello` را تایپ کن تا اولین پیام خود را در خط فرمان چاپ کنی.',
      learning: ['آشنایی با خروجی استاندارد (stdout)', 'قواعد پایه‌ای دستورات CMD', 'چاپ متن با دستور `echo`'],
      fieldNotes: ['دستور `echo.` در اسکریپت‌های واقعی Batch یک سطر کاملاً خالی چاپ می‌کند.'],
    },
    de: {
      objective: 'Führe `echo hello` aus, um deine erste Nachricht auf der Befehlszeile auszugeben.',
      learning: ['Standardausgabe (stdout) verstehen', 'Grundlegende CMD-Befehlsgrammatik', 'Textausgabe mit `echo`'],
      fieldNotes: ['`echo.` gibt in echten Batch-Skripten eine leere Zeile aus.'],
    },
  },
  'intro-dir': {
    en: {
      objective: 'Run `dir` to inspect directories, file sizes, and dates in your user folder.',
      learning: ['Reading directory listings', 'Recognizing <DIR> tags', 'File byte sizes'],
      fieldNotes: ['`dir /b` produces a bare listing without headers, great for piping.'],
    },
    fa: {
      objective: 'دستور `dir` را اجرا کن تا پوشه‌ها، اندازه فایل‌ها و تاریخ‌ها را بررسی کنی.',
      learning: ['خواندن فهرست فایل‌ها و پوشه‌ها', 'تشخیص تگ‌های `<DIR>` برای پوشه‌ها', 'بررسی اندازه فایل‌ها بر حسب بایت'],
      fieldNotes: ['سوییچ `dir /b` خروجی ساده و بدون سربرگ تولید می‌کند که برای اتصال به دستورات دیگر عالی است.'],
    },
    de: {
      objective: 'Führe `dir` aus, um Verzeichnisse, Dateigrößen und Datumsangaben zu prüfen.',
      learning: ['Verzeichnisauflistungen lesen', '<DIR>-Tags erkennen', 'Dateigrößen in Bytes prüfen'],
      fieldNotes: ['`dir /b` erzeugt eine reine Namensliste ohne Kopfzeilen, ideal für Pipes.'],
    },
  },
  'intro-cd': {
    en: {
      objective: 'Change your working directory into `Documents` with `cd Documents`.',
      learning: ['Navigating folder hierarchies', 'Using relative and absolute paths', '`cd ..` back navigation'],
      fieldNotes: ['`cd \\` jumps directly to the root of the current drive.'],
    },
    fa: {
      objective: 'مسیر کاری خود را با دستور `cd Documents` به پوشه `Documents` تغییر بده.',
      learning: ['پیمایش در ساختار سلسله‌مراتبی پوشه‌ها', 'استفاده از مسیرهای نسبی و مطلق', 'بازگشت به پوشه والد با `cd ..`'],
      fieldNotes: ['دستور `cd \\` مستقیماً به ریشه درایو جاری پرش می‌کند.'],
    },
    de: {
      objective: 'Wechsle dein Arbeitsverzeichnis mit `cd Documents` in den Ordner `Documents`.',
      learning: ['Navigation in Verzeichnishierarchien', 'Relative und absolute Pfade nutzen', 'Rückwärts navigieren mit `cd ..`'],
      fieldNotes: ['`cd \\` springt direkt in das Stammverzeichnis des aktuellen Laufwerks.'],
    },
  },
  'intro-md': {
    en: {
      objective: 'Create a new directory named `projects` using `md projects`.',
      learning: ['Creating directories with `md` or `mkdir`', 'Auto-creating nested parent folders'],
      fieldNotes: ['`md a\\b\\c` creates all intermediate subdirectories in one shot.'],
    },
    fa: {
      objective: 'یک پوشه جدید با نام `projects` با دستور `md projects` ایجاد کن.',
      learning: ['ایجاد پوشه جدید با دستور `md` یا `mkdir`', 'ساخت خودکار ساختارهای شاخه‌ای در ویندوز'],
      fieldNotes: ['دستور `md a\\b\\c` تمام زیرپوشه‌های میانی را به صورت یک‌جا ایجاد می‌کند.'],
    },
    de: {
      objective: 'Erstelle ein neues Verzeichnis namens `projects` mit `md projects`.',
      learning: ['Verzeichnisse mit `md` oder `mkdir` erstellen', 'Automatische Erstellung verschachtelter Ordner'],
      fieldNotes: ['`md a\\b\\c` erstellt alle Zwischenverzeichnisse in einem einzigen Schritt.'],
    },
  },
  'intro-files': {
    en: {
      objective: 'Create `readme.txt` with content `hello world` using `echo hello world>readme.txt`.',
      learning: ['Output redirection with `>`', 'Writing file streams without text editors'],
      fieldNotes: ['`>` truncates existing content, while `>>` appends to the end.'],
    },
    fa: {
      objective: 'فایل `readme.txt` را با محتوای `hello world` با دستور `echo hello world>readme.txt` بساز.',
      learning: ['هدایت خروجی با علامت `>` به فایل', 'نوشتن فایل‌های متنی بدون نیاز به ویرایشگر گرافیکی'],
      fieldNotes: ['عملگر `>` فایل را از نو می‌نویسد، در حالی که `>>` به انتهای آن اضافه می‌کند.'],
    },
    de: {
      objective: 'Erstelle `readme.txt` mit dem Inhalt `hello world` mittels `echo hello world>readme.txt`.',
      learning: ['Ausgabeumleitung mit `>`', 'Erstellen von Textdateien ohne grafischen Editor'],
      fieldNotes: ['`>` überschreibt die Zieldatei, während `>>` neuen Text anhängt.'],
    },
  },
  'intro-type': {
    en: {
      objective: 'Display the contents of `notes.txt` in terminal using `type notes.txt`.',
      learning: ['Inspecting text files directly in CMD', 'Equivalent of Unix `cat` command'],
      fieldNotes: ['`type nul > file.txt` creates a quick empty file in Windows.'],
    },
    fa: {
      objective: 'محتوای فایل `notes.txt` را با دستور `type notes.txt` در ترمینال نمایش بده.',
      learning: ['مشاهده سریع محتوای فایل‌های متنی در ترمینال', 'آشنایی با معادل دستور `cat` لینوکس در ویندوز'],
      fieldNotes: ['دستور `type nul > file.txt` یک فایل متنی کاملاً خالی ایجاد می‌کند.'],
    },
    de: {
      objective: 'Zeige den Inhalt von `notes.txt` mit `type notes.txt` im Terminal an.',
      learning: ['Textdateien direkt im Terminal einsehen', 'Windows-Pendant zum Unix-Befehl `cat`'],
      fieldNotes: ['`type nul > datei.txt` erstellt eine leere Datei unter Windows.'],
    },
  },
  'intro-copy': {
    en: {
      objective: 'Copy `notes.txt` into the `Documents` directory with `copy notes.txt Documents`.',
      learning: ['Duplicating files across folders', 'Preserving source file during duplication'],
      fieldNotes: ['`copy /y` suppresses the overwrite confirmation prompt.'],
    },
    fa: {
      objective: 'فایل `notes.txt` را با دستور `copy notes.txt Documents` به پوشه `Documents` کپی کن.',
      learning: ['تکثیر و کپی فایل‌ها بین مسیرها', 'حفظ فایل مبدأ در عملیات کپی'],
      fieldNotes: ['سوییچ `copy /y` درخواست تأیید جایگزینی فایل در مقصد را غیرفعال می‌کند.'],
    },
    de: {
      objective: 'Kopiere `notes.txt` mit `copy notes.txt Documents` in das Verzeichnis `Documents`.',
      learning: ['Dateien zwischen Verzeichnissen duplizieren', 'Quelldateien beim Kopieren beibehalten'],
      fieldNotes: ['`copy /y` unterdrückt die Bestätigungsabfrage beim Überschreiben.'],
    },
  },
  'intro-move': {
    en: {
      objective: 'Move `Downloads\\report.txt` into `Documents` with `move Downloads\\report.txt Documents`.',
      learning: ['Relocating files between directories', 'Atomic movement across paths'],
      fieldNotes: ['`move` can relocate and rename a file in a single step.'],
    },
    fa: {
      objective: 'فایل `Downloads\\report.txt` را با دستور `move Downloads\\report.txt Documents` منتقل کن.',
      learning: ['انتقال فایل‌ها بین پوشه‌ها با `move`', 'جابه‌جایی ساختاری فایل‌ها روی دیسک'],
      fieldNotes: ['دستور `move` می‌تواند فایل را هنگام انتقال هم‌زمان تغییر نام نیز بدهد.'],
    },
    de: {
      objective: 'Verschiebe `Downloads\\report.txt` mit `move Downloads\\report.txt Documents` nach `Documents`.',
      learning: ['Dateien zwischen Verzeichnissen verschieben', 'Effiziente Verlagerung auf Dateisystemebene'],
      fieldNotes: ['`move` kann Dateien beim Verschieben gleichzeitig umbenennen.'],
    },
  },
  'intro-ren': {
    en: {
      objective: 'Rename `notes.txt` to `mynotes.txt` using `ren notes.txt mynotes.txt`.',
      learning: ['In-place renaming with `ren` or `rename`', 'Target argument cannot be a path'],
      fieldNotes: ['You cannot specify a new directory path in the second argument of `ren`.'],
    },
    fa: {
      objective: 'نام فایل `notes.txt` را با دستور `ren notes.txt mynotes.txt` به `mynotes.txt` تغییر بده.',
      learning: ['تغییر نام فایل با دستور `ren` یا `rename`', 'توجه به اینکه مقصد نباید مسیر پوشه باشد'],
      fieldNotes: ['در دستور `ren` آرگومان دوم فقط باید نام جدید باشد و نباید شامل مسیر پوشه باشد.'],
    },
    de: {
      objective: 'Benenne `notes.txt` mit `ren notes.txt mynotes.txt` in `mynotes.txt` um.',
      learning: ['Dateien direkt umbenennen mit `ren` oder `rename`', 'Zweites Argument darf kein Pfad sein'],
      fieldNotes: ['Das zweite Argument von `ren` darf kein Verzeichnis enthalten, nur den Namen.'],
    },
  },
  'intro-del': {
    en: {
      objective: 'Delete `secret.txt` using `del secret.txt`.',
      learning: ['Permanently removing files with `del`', 'CMD file deletion mechanics'],
      fieldNotes: ['Files deleted via `del` bypass the Windows Recycle Bin.'],
    },
    fa: {
      objective: 'فایل `secret.txt` را با دستور `del secret.txt` حذف کن.',
      learning: ['حذف قطعی فایل‌ها با `del` یا `erase`', 'مکانیسم حذف فایل در خط فرمان'],
      fieldNotes: ['فایل‌هایی که با `del` در خط فرمان حذف می‌شوند به سطل بازیافت نمی‌روند.'],
    },
    de: {
      objective: 'Lösche `secret.txt` mit `del secret.txt`.',
      learning: ['Endgültiges Löschen von Dateien mit `del`', 'Löschmechanismen der CMD verstehen'],
      fieldNotes: ['Mit `del` gelöschte Dateien umgehen den Windows-Papierkorb.'],
    },
  },
  'intro-rd': {
    en: {
      objective: 'Remove directory `oldstuff` recursively and quietly: `rd /s /q oldstuff`.',
      learning: ['Directory removal with `rd` or `rmdir`', 'Recursive `/s` and quiet `/q` flags'],
      fieldNotes: ['`rd` without `/s` only removes empty directories.'],
    },
    fa: {
      objective: 'پوشه `oldstuff` را همراه با محتویات بدون سؤال پاک کن: `rd /s /q oldstuff`.',
      learning: ['حذف پوشه‌ها با دستور `rd` یا `rmdir`', 'استفاده از سوییچ بازگشتی `/s` و سوییچ بی‌صدا `/q`'],
      fieldNotes: ['دستور `rd` بدون سوییچ `/s` فقط می‌تواند پوشه‌های کاملاً خالی را حذف کند.'],
    },
    de: {
      objective: 'Lösche den Ordner `oldstuff` rekursiv und ohne Nachfrage: `rd /s /q oldstuff`.',
      learning: ['Verzeichnisse mit `rd` oder `rmdir` löschen', 'Die Schalter `/s` (rekursiv) und `/q` (still)'],
      fieldNotes: ['`rd` ohne `/s` kann nur vollkommen leere Verzeichnisse löschen.'],
    },
  },
  'intro-tree': {
    en: {
      objective: 'Inspect the filesystem structure with `tree`.',
      learning: ['Visualizing nested directory structures', 'Understanding branch depth'],
      fieldNotes: ['`tree /f` lists all files inside directories as well.'],
    },
    fa: {
      objective: 'ساختار پوشه‌ها و فایل‌های دیسک را با دستور `tree` بررسی کن.',
      learning: ['مشاهده نموداری سلسله‌مراتب پوشه‌ها', 'درک عمق شاخه‌های دایرکتوری'],
      fieldNotes: ['سوییچ `tree /f` علاوه بر ساختار پوشه‌ها، فایل‌های موجود را نیز نشان می‌دهد.'],
    },
    de: {
      objective: 'Untersuche die Verzeichnisstruktur mit `tree`.',
      learning: ['Visualisierung verschachtelter Ordnerbäume', 'Hierarchietiefen verstehen'],
      fieldNotes: ['`tree /f` listet zusätzlich zu den Ordnern auch alle Dateien auf.'],
    },
  },
  'files-wildcard': {
    en: {
      objective: 'Delete all `.tmp` files using wildcards: `del *.tmp`.',
      learning: ['Pattern matching with `*` and `?` wildcards', 'Batch file operations'],
      fieldNotes: ['`*.*` targets all files in the current folder.'],
    },
    fa: {
      objective: 'تمام فایل‌های دارای پسوند `.tmp` را با دستور `del *.tmp` پاک کن.',
      learning: ['تطبیق الگو با نویسه‌های عمومی `*` و `?`', 'عملیات دسته‌جمعی روی فایل‌ها'],
      fieldNotes: ['الگوی `*.*` تمام فایل‌های موجود در پوشه کاری جاری را انتخاب می‌کند.'],
    },
    de: {
      objective: 'Lösche alle `.tmp`-Dateien mit Platzhaltern: `del *.tmp`.',
      learning: ['Musterabgleich mit den Platzhaltern `*` und `?`', 'Stapelverarbeitung von Dateien'],
      fieldNotes: ['`*.*` wählt alle Dateien im aktuellen Verzeichnis aus.'],
    },
  },
  'files-paths': {
    en: {
      objective: 'Create nested path `work\\app` and write `work\\app\\main.js`.',
      learning: ['Deep path creation in CMD', 'Chaining directory creation and file writing'],
      fieldNotes: ['Windows supports long and deep relative paths separated by backslashes `\\`.'],
    },
    fa: {
      objective: 'مسیر تو در توی `work\\app` را ایجاد کن و فایل `work\\app\\main.js` را در آن بنویس.',
      learning: ['کار با مسیرهای عمیق در CMD', 'زنجیره کردن ساخت پوشه و نوشتن فایل'],
      fieldNotes: ['در ویندوز مسیرها با علامت بک‌اسلش `\\` از یکدیگر تفکیک می‌شوند.'],
    },
    de: {
      objective: 'Erstelle den Pfad `work\\app` und schreibe `work\\app\\main.js`.',
      learning: ['Tiefe Pfadstrukturen in der CMD anlegen', 'Befehle zur Ordner- und Dateierstellung kombinieren'],
      fieldNotes: ['Windows verwendet den Backslash `\\` als primäres Pfadtrennzeichen.'],
    },
  },
  'files-append': {
    en: {
      objective: 'Append lines to `log.txt` using redirection operators `>` and `>>`.',
      learning: ['Single `>` replaces content; double `>>` appends', 'Building log files progressively'],
      fieldNotes: ['Appending is thread-safe for simple CMD batch append workflows.'],
    },
    fa: {
      objective: 'خطوط جدید را با عملگرهای `>` و `>>` به فایل `log.txt` اضافه کن.',
      learning: ['عملگر `>` فایل را بازنویسی می‌کند و عملگر `>>` به انتهای آن می‌افزاید', 'ساخت تدریجی فایل‌های لاگ'],
      fieldNotes: ['عملگر `>>` اگر فایل وجود نداشته باشد، آن را به طور خودکار ایجاد می‌کند.'],
    },
    de: {
      objective: 'Hänge Zeilen mit `>` und `>>` an die Datei `log.txt` an.',
      learning: ['`>` überschreibt die Datei, während `>>` Zeilen anhängt', 'Schrittweiser Aufbau von Protokolldateien'],
      fieldNotes: ['`>>` erstellt die Zieldatei automatisch, falls sie noch nicht existiert.'],
    },
  },
  'files-fc': {
    en: {
      objective: 'Compare differences between `a.txt` and `b.txt` with `fc a.txt b.txt`.',
      learning: ['Comparing files with `fc` (File Compare)', 'Interpreting terminal diff output'],
      fieldNotes: ['`fc /b` performs a binary byte-by-byte comparison instead of text.'],
    },
    fa: {
      objective: 'تفاوت‌های دو فایل `a.txt` و `b.txt` را با دستور `fc a.txt b.txt` بررسی کن.',
      learning: ['مقایسه فایل‌ها با ابزار `fc`', 'خواندن خروجی تفاوت‌ها (diff) در ترمینال'],
      fieldNotes: ['سوییچ `fc /b` مقایسه باینری و بایت به بایت فایل‌ها را به جای متن انجام می‌دهد.'],
    },
    de: {
      objective: 'Vergleiche `a.txt` und `b.txt` mit `fc a.txt b.txt`.',
      learning: ['Dateivergleich mit dem Werkzeug `fc`', 'Diff-Ausgaben im Terminal interpretieren'],
      fieldNotes: ['`fc /b` führt einen binären Byte-Vergleich statt eines Textvergleichs durch.'],
    },
  },
  'pipes-find': {
    en: {
      objective: 'Search for string "todo" inside `notes.txt` with `find "todo" notes.txt`.',
      learning: ['Searching string occurrences inside text files', 'Case-sensitive exact matching'],
      fieldNotes: ['`find /v` prints lines that do NOT match the searched string.'],
    },
    fa: {
      objective: 'کلمه "todo" را با دستور `find "todo" notes.txt` در فایل `notes.txt` پیدا کن.',
      learning: ['جستجوی رشته‌ها در فایل‌های متنی با `find`', 'دقت به حساسیت حروف در جستجو'],
      fieldNotes: ['سوییچ `find /v` خطوطی را نمایش می‌دهد که شامل عبارت جستجوشده نیستند.'],
    },
    de: {
      objective: 'Suche nach "todo" in `notes.txt` mit `find "todo" notes.txt`.',
      learning: ['Textstellen in Dateien mit `find` durchsuchen', 'Groß-/Kleinschreibung bei der Suche'],
      fieldNotes: ['`find /v` invertiert die Suche und gibt alle nicht passenden Zeilen aus.'],
    },
  },
  'pipes-pipe': {
    en: {
      objective: 'Pipe output of `type names.txt` into `sort` and redirect: `type names.txt | sort>sorted.txt`.',
      learning: ['Using pipe `|` to connect stdout to stdin', 'Composing CLI processing pipelines'],
      fieldNotes: ['Piping does not require intermediate temporary files on disk.'],
    },
    fa: {
      objective: 'خروجی `type names.txt` را با پایپ به `sort` بفرست و در `sorted.txt` ذخیره کن.',
      learning: ['اتصال دستورات با علامت پایپ `|`', 'ساخت خطوط لوله پردازشی در خط فرمان'],
      fieldNotes: ['پایپ کردن داده‌ها نیاز به ایجاد فایل‌های واسط روی دیسک را از بین می‌برد.'],
    },
    de: {
      objective: 'Leite `type names.txt` mit einer Pipe an `sort` weiter: `type names.txt | sort>sorted.txt`.',
      learning: ['Den Pipe-Operator `|` zur Datenübergabe nutzen', 'Zusammensetzen modularer Datenströme'],
      fieldNotes: ['Pipes leiten Daten im Speicher weiter, ohne temporäre Zwischendateien anzulegen.'],
    },
  },
  'pipes-findstr': {
    en: {
      objective: 'Search case-insensitively for "error" in `app.log` with `findstr /i error app.log`.',
      learning: ['Advanced regex search with `findstr`', 'Case-insensitive `/i` search flag'],
      fieldNotes: ['`findstr /r` enables regular expression syntax support.'],
    },
    fa: {
      objective: 'کلمه "error" را بدون حساسیت به حروف در `app.log` بیاب: `findstr /i error app.log`.',
      learning: ['جستجوی پیشرفته با `findstr`', 'استفاده از سوییچ `/i` برای نادیده‌گرفتن بزرگی و کوچکی حروف'],
      fieldNotes: ['سوییچ `findstr /r` امکان استفاده از الگوهای عبارات منظم (Regex) را فعال می‌کند.'],
    },
    de: {
      objective: 'Suche ohne Beachtung der Groß-/Kleinschreibung nach "error": `findstr /i error app.log`.',
      learning: ['Erweiterte Suche mit `findstr`', 'Der Schalter `/i` für case-insensitive Suche'],
      fieldNotes: ['`findstr /r` ermöglicht die Verwendung regulärer Ausdrücke.'],
    },
  },
  'adv-chain': {
    en: {
      objective: 'Conditionally create directory and file: `md backup && echo data>backup\\copy.txt`.',
      learning: ['Conditional execution with `&&`', 'Preventing second command on initial failure'],
      fieldNotes: ['`command1 || command2` executes command2 only if command1 failed.'],
    },
    fa: {
      objective: 'پوشه و فایل را مشروط به موفقیت بساز: `md backup && echo data>backup\\copy.txt`.',
      learning: ['اجرای مشروط دستورات با عملگر `&&`', 'جلوگیری از اجرای دستور دوم در صورت شکست دستور اول'],
      fieldNotes: ['عملگر `command1 || command2` دستور دوم را تنها در صورت شکست اولی اجرا می‌کند.'],
    },
    de: {
      objective: 'Erstelle Ordner und Datei bedingt: `md backup && echo data>backup\\copy.txt`.',
      learning: ['Bedingte Befehlsausführung mit `&&`', 'Abbruch bei Fehlern im ersten Befehl'],
      fieldNotes: ['`command1 || command2` führt command2 nur aus, falls command1 fehlschlägt.'],
    },
  },
  'adv-env': {
    en: {
      objective: 'Store variable and expand it: `set MSG=salam learn-cmd & echo %MSG%>greeting.txt`.',
      learning: ['Environment variable syntax `%VAR%`', 'Combining variable assignment and usage'],
      fieldNotes: ['Variables defined with `set` persist across the active CMD session.'],
    },
    fa: {
      objective: 'متغیر را مقداردهی و در فایل بنویس: `set MSG=salam learn-cmd & echo %MSG%>greeting.txt`.',
      learning: ['سینتکس متغیرهای محیطی با علامت `%VAR%`', 'ترکیب مقداردهی متغیر و فراخوانی آن'],
      fieldNotes: ['متغیرهایی که با دستور `set` تعریف می‌شوند در طول همان نشست CMD باقی می‌مانند.'],
    },
    de: {
      objective: 'Variable setzen und verwenden: `set MSG=salam learn-cmd & echo %MSG%>greeting.txt`.',
      learning: ['Syntax für Umgebungsvariablen `%VAR%`', 'Zuweisung und Nutzung von Variablen kombinieren'],
      fieldNotes: ['Mit `set` definierte Variablen bleiben für die gesamte Sitzung erhalten.'],
    },
  },
  'adv-mixed': {
    en: {
      objective: 'Build an entire structured project layout with chained commands.',
      learning: ['Mastering multi-step CMD automation', 'Real-world deployment file scaffolding'],
      fieldNotes: ['Combining `&`, `&&`, and paths enables complete project scaffolding in CMD.'],
    },
    fa: {
      objective: 'ساختار کامل پروژه را با ترکیب دستورات زنجیره‌ای در یک خط پیاده‌سازی کن.',
      learning: ['تسلط بر اتوماسیون چندمرحله‌ای در خط فرمان CMD', 'ساخت چیدمان استاندارد پروژه‌های واقعی'],
      fieldNotes: ['ترکیب عملگرهای `&` و `&&` امکان ساخت کامل ساختار پروژه را در یک خط فراهم می‌کند.'],
    },
    de: {
      objective: 'Erstelle eine vollständige Projektstruktur mit verketteten Befehlen.',
      learning: ['Beherrschung mehrstufiger CMD-Automatisierung', 'Praxisnaher Aufbau von Projektstrukturen'],
      fieldNotes: ['Die Kombination von `&`, `&&` und Pfaden ermöglicht vollständige Projekterstellung.'],
    },
  },
  'sys-datetime': {
    en: {
      objective: 'Run `date /t & time /t` to query the system date and time stamps.',
      learning: ['Displaying current system date with DATE /T', 'Displaying current system clock with TIME /T'],
      fieldNotes: ['The `/t` switch suppresses the prompt to enter a new date or time.'],
    },
    fa: {
      objective: 'دستور `date /t & time /t` را برای مشاهده تاریخ و زمان جاری سیستم اجرا کن.',
      learning: ['مشاهده تاریخ جاری سیستم با DATE /T', 'مشاهده ساعت سیستم با TIME /T'],
      fieldNotes: ['سوییچ `/t` مانع از توقف ترمینال برای دریافت تاریخ یا زمان جدید می‌شود.'],
    },
    de: {
      objective: 'Führe `date /t & time /t` aus, um Systemdatum und Uhrzeit abzufragen.',
      learning: ['Systemdatum mit DATE /T anzeigen', 'Uhrzeit mit TIME /T abfragen'],
      fieldNotes: ['Der Schalter `/t` unterdrückt die Aufforderung zur Eingabe eines neuen Datums.'],
    },
  },
  'sys-attrib': {
    en: {
      objective: 'Run `attrib +r config.ini` to protect your configuration file.',
      learning: ['Understanding Windows file attributes (R, H, S, A)', 'Protecting critical files with ATTRIB +R'],
      fieldNotes: ['`attrib -r` strips the read-only flag when files need editing.'],
    },
    fa: {
      objective: 'دستور `attrib +r config.ini` را اجرا کن تا فایل پیکربندی فقط‌خواندنی شود.',
      learning: ['شناخت صفات فایل در ویندوز (R، H، S، A)', 'محافظت از فایل‌های حیاتی با ATTRIB +R'],
      fieldNotes: ['با دستور `attrib -r` می‌توان قفل فقط‌خواندنی فایل را باز کرد.'],
    },
    de: {
      objective: 'Führe `attrib +r config.ini` aus, um die Datei zu schützen.',
      learning: ['Dateiattribute in Windows verstehen', 'Dateischutz mit ATTRIB +R'],
      fieldNotes: ['Mit `attrib -r` wird der Schreibschutz wieder entfernt.'],
    },
  },
  'sys-where': {
    en: {
      objective: 'Run `where cmd > cmd_path.txt` to find and record executable locations.',
      learning: ['Locating system binaries via %PATH%', 'Redirecting WHERE discovery output'],
      fieldNotes: ['`where` is the CMD equivalent of UNIX `which`, searching all PATH folders.'],
    },
    fa: {
      objective: 'دستور `where cmd > cmd_path.txt` را اجرا کن تا مسیر فایل اجرایی ثبت شود.',
      learning: ['یافتن فایل‌های اجرایی از طریق متغیر محیطی %PATH%', 'ریدایرکت کردن خروجی دستور WHERE به فایل'],
      fieldNotes: ['دستور `where` معادل دستور `which` در لینوکس است و کل دایرکتوری‌های PATH را می‌گردد.'],
    },
    de: {
      objective: 'Führe `where cmd > cmd_path.txt` aus, um den Pfad zu ermitteln.',
      learning: ['Programme über %PATH% finden', 'Ausgabe von WHERE weiterleiten'],
      fieldNotes: ['`where` entspricht dem Linux-Befehl `which`.'],
    },
  },
  'sys-pushpop': {
    en: {
      objective: 'Run `pushd Documents && echo backup>bk.txt && popd` to use directory stack.',
      learning: ['Using directory stack (PUSHD/POPD)', 'Safe folder traversal and instant return'],
      fieldNotes: ['`pushd` automatically maps network shares to temporary drive letters on Windows.'],
    },
    fa: {
      objective: 'دستور `pushd Documents && echo backup>bk.txt && popd` را برای استفاده از استک پوشه‌ها اجرا کن.',
      learning: ['کار با پشته دایرکتوری (PUSHD و POPD)', 'پیمایش مطمئن پوشه‌ها و بازگشت آنی به مبدأ'],
      fieldNotes: ['دستور `pushd` در ویندوزهای واقعی حتی مسیرهای شبکه را به یک درایو موقت متصل می‌کند.'],
    },
    de: {
      objective: 'Führe `pushd Documents && echo backup>bk.txt && popd` aus.',
      learning: ['Verzeichnis-Stack nutzen (PUSHD/POPD)', 'Sicheres Wechseln und Zurückspringen'],
      fieldNotes: ['`pushd` speichert den aktuellen Pfad auf einem Stack.'],
    },
  },
  'sys-tasks': {
    en: {
      objective: 'Inspect active tasks and terminate the rogue process: `taskkill /im node.exe /f`.',
      learning: ['Process inspection with TASKLIST', 'Forced task termination with TASKKILL /F'],
      fieldNotes: ['`taskkill /f /im process.exe` forcefully ends stuck processes in production.'],
    },
    fa: {
      objective: 'پردازش‌ها را بررسی کرده و پروسه معلق را متوقف کن: `taskkill /im node.exe /f`.',
      learning: ['مشاهده لیست پردازش‌های ویندوز با TASKLIST', 'بستن اجباری پردازش‌ها با سوییچ /F در TASKKILL'],
      fieldNotes: ['سوییچ `/f` در دستور `taskkill` پردازش‌های قفل‌شده یا بدون پاسخ را بلافاصله می‌بندد.'],
    },
    de: {
      objective: 'Beende den blockierten Prozess mit `taskkill /im node.exe /f`.',
      learning: ['Prozesse mit TASKLIST anzeigen', 'Prozesse mit TASKKILL /F beenden'],
      fieldNotes: ['`taskkill /f /im prozess.exe` beendet blockierte Aufgaben sofort.'],
    },
  },
  'batch-if': {
    en: {
      objective: 'Run `if exist lock.tmp del lock.tmp` for safe conditional file deletion.',
      learning: ['Guarding batch operations with IF EXIST', 'Preventing script errors when files are absent'],
      fieldNotes: ['`if not exist` is equally useful for bootstrapping missing config files.'],
    },
    fa: {
      objective: 'دستور `if exist lock.tmp del lock.tmp` را برای حذف شرطی و ایمن فایل اجرا کن.',
      learning: ['محافظت از عملیات اسکریپت با شرط IF EXIST', 'جلوگیری از بروز خطای توقف در اسکریپت‌های Batch'],
      fieldNotes: ['ترکیب `if not exist` برای ایجاد فایل‌های تنظیمات در صورت عدم وجود کاربرد زیادی دارد.'],
    },
    de: {
      objective: 'Führe `if exist lock.tmp del lock.tmp` für sicheres bedingtes Löschen aus.',
      learning: ['Bedingte Logik mit IF EXIST', 'Fehlervermeidung in Skripten'],
      fieldNotes: ['`if not exist` eignet sich hervorragend zur Initialisierung fehlender Dateien.'],
    },
  },
  'batch-sort': {
    en: {
      objective: 'Run `sort /r scores.txt > ranking.txt` to sort records in reverse order.',
      learning: ['Stream sorting with SORT', 'Descending order with /R flag and file output'],
      fieldNotes: ['`sort` works seamlessly with both files and stdin pipes.'],
    },
    fa: {
      objective: 'دستور `sort /r scores.txt > ranking.txt` را برای مرتب‌سازی معکوس رکوردها اجرا کن.',
      learning: ['مرتب‌سازی جریان‌های متنی با دستور SORT', 'تنظیم ترتیب نزولی با سوییچ /R و ذخیره در فایل'],
      fieldNotes: ['دستور `sort` هم مستقیماً روی فایل‌ها و هم در امتداد پایپ‌لاین‌ها بدون نقص کار می‌کند.'],
    },
    de: {
      objective: 'Führe `sort /r scores.txt > ranking.txt` aus.',
      learning: ['Sortieren von Datenströmen mit SORT', 'Absteigende Reihenfolge mit /R'],
      fieldNotes: ['`sort` verarbeitet Dateien ebenso wie Pipes aus stdin.'],
    },
  },
  'batch-errorlevel': {
    en: {
      objective: 'Run `find "FAIL" server.log && if not errorlevel 1 echo alert>alert.txt` to trigger on error status.',
      learning: ['Exit codes and status inspection', 'Using IF ERRORLEVEL and IF NOT ERRORLEVEL in automation'],
      fieldNotes: ['`0` indicates success; non-zero exit codes represent errors or missing search matches.'],
    },
    fa: {
      objective: 'دستور `find "FAIL" server.log && if not errorlevel 1 echo alert>alert.txt` را برای ثبت خطا بر اساس کد بازگشتی اجرا کن.',
      learning: ['کدهای بازگشتی و وضعیت خروجی دستورات', 'استفاده از IF ERRORLEVEL و IF NOT ERRORLEVEL در اتوماسیون'],
      fieldNotes: ['کد `0` نشان‌دهنده موفقیت و کدهای غیرصفر نشان‌دهنده خطا یا نیافتن تطابق هستند.'],
    },
    de: {
      objective: 'Führe `find "FAIL" server.log && if not errorlevel 1 echo alert>alert.txt` aus.',
      learning: ['Exit-Codes und Statusabfragen', 'Einsatz von IF ERRORLEVEL und IF NOT ERRORLEVEL in der Automatisierung'],
      fieldNotes: ['`0` signalisiert Erfolg, während Werte ungleich 0 Fehler oder fehlende Treffer anzeigen.'],
    },
  },
  'batch-for': {
    en: {
      objective: 'Run `for %f in (*.log) do move %f archive` to move all log files in a single pass.',
      learning: ['Command-line loops with FOR', 'Wildcard iteration and bulk file automation'],
      fieldNotes: ['In interactive CMD use `%f`, whereas inside batch files use `%%f`.'],
    },
    fa: {
      objective: 'دستور `for %f in (*.log) do move %f archive` را برای انتقال کلیه لاگ‌ها در یک گام اجرا کن.',
      learning: ['حلقه‌ها در خط فرمان با دستور FOR', 'پیمایش الگوهای عمومی و اتوماسیون دسته‌جمعی فایل‌ها'],
      fieldNotes: ['در خط فرمان مستقیم از `%f` و در داخل اسکریپت‌های بچ از `%%f` استفاده می‌شود.'],
    },
    de: {
      objective: 'Führe `for %f in (*.log) do move %f archive` aus.',
      learning: ['Befehlszeilen-Schleifen mit FOR', 'Wildcard-Iterationen und Massenverarbeitung'],
      fieldNotes: ['In der interaktiven Konsole `%f`, in Batch-Skripten `%%f` verwenden.'],
    },
  },
  'batch-script': {
    en: {
      objective: 'Create `build.bat` with build commands and run `build.bat` to automate the build pipeline.',
      learning: ['Authoring reusable .BAT files', 'Executing batch automation workflows'],
      fieldNotes: ['.BAT files bundle multiple commands for seamless CI/CD and deployment tasks.'],
    },
    fa: {
      objective: 'اسکریپت `build.bat` را با دستورات ساخت بساز و برای اجرای خودکار پایپ‌لاین `build.bat` را اجرا کن.',
      learning: ['نوشتن فایل‌های اسکریپت با پسوند BAT', 'اجرای پایپ‌لاین‌های اتوماسیون با فایل‌های بچ'],
      fieldNotes: ['فایل‌های BAT چندین دستور را برای اجرای بدون دخالت دست در فرآیندهای CI/CD بسته‌بندی می‌کنند.'],
    },
    de: {
      objective: 'Erstelle `build.bat` und führe das Skript aus.',
      learning: ['Wiederverwendbare .BAT-Skripte schreiben', 'Batch-Pipelines automatisieren'],
      fieldNotes: ['.BAT-Dateien fassen mehrere Befehle für reibungslose CI/CD-Abläufe zusammen.'],
    },
  },
  'batch-master': {
    en: {
      objective: 'Execute the full multi-step production release workflow.',
      learning: ['Capstone deployment chaining', 'Integrating directories, files, attributes, and conditions'],
      fieldNotes: ['Production batch automation relies on robust chaining, attribute locks, and guarded cleanup.'],
    },
    fa: {
      objective: 'خط لوله کامل استقرار پروداکشن را با دستورات زنجیره‌ای پیاده‌سازی کن.',
      learning: ['اتوماسیون استقرار پروداکشن در سطح اکسپرت', 'ترکیب پوشه‌ها، کپی داده، قفل صفات و پاک‌سازی شرطی'],
      fieldNotes: ['اسکریپت‌های انتشار پروداکشن بر زنجیره دستورات ایمن، قفل صفات و پاک‌سازی مشروط تکیه دارند.'],
    },
    de: {
      objective: 'Führe den vollständigen Bereitstellungs-Workflow aus.',
      learning: ['Experten-Deployment mit Skripten', 'Kombination von Ordnern, Attributen und Bedingungen'],
      fieldNotes: ['Produktionsskripte erfordern sichere Verknüpfung, Schreibschutz und bedingte Bereinigung.'],
    },
  },
};

export const FALLBACK_METADATA = {
  en: {
    objective: 'Reach the target filesystem state.',
    learning: ['Windows CMD syntax', 'Command line filesystem navigation'],
    fieldNotes: ['Use `hint` or `show solution` if you get stuck.'],
  },
  fa: {
    objective: 'رسیدن به وضعیت مطلوب فایل‌سیستم.',
    learning: ['سینتکس ویندوز CMD', 'پیمایش فایل‌سیستم در خط فرمان'],
    fieldNotes: ['اگر گیر افتادید، از `hint` یا `show solution` استفاده کنید.'],
  },
  de: {
    objective: 'Erreiche den Zielzustand des Dateisystems.',
    learning: ['Windows CMD-Syntax', 'Dateisystem-Navigation auf der Befehlszeile'],
    fieldNotes: ['Nutze `hint` oder `show solution`, falls du Hilfe brauchst.'],
  },
};

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

  const metaForLevel = LEVEL_METADATA[level.id];
  const extra =
    (metaForLevel && (metaForLevel[code] || metaForLevel.en)) ||
    (FALLBACK_METADATA[code] || FALLBACK_METADATA.en);

  return {
    ...level,
    name: { ...(level.name || {}), [code]: name, en_US: level.name?.en_US || name },
    hint: { ...(level.hint || {}), [code]: hint, en_US: level.hint?.en_US || hint },
    about: { ...(level.about || {}), [code]: about, en_US: level.about?.en_US || about },
    objective: extra.objective || about || hint,
    learning: extra.learning || [],
    fieldNotes: extra.fieldNotes || [],
  };
}

