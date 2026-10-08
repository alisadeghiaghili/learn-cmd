/**
 * Multi-depth cognitive explanation system (ELI5, ELI10, ELI15, ELI20, ELIPHD) for learn-cmd.
 *
 * Provides tailored explanations across 5 tiers:
 * - ELI5 (5yo): Playful, visual metaphors, zero technical jargon.
 * - ELI10 (10yo): Physical world rules, everyday intuition, cause-and-effect.
 * - ELI15 (15yo): Standard developer mechanics, arguments, streams, return codes.
 * - ELI20 (20yo): Systems engineering, OS process models, CI/CD, and production patterns.
 * - ELIPHD (PhD): Windows NT kernel internals, cmd.exe tokenizer state machine, AST & syscalls.
 */

'use strict';

/**
 * @typedef {'eli5' | 'eli10' | 'eli15' | 'eli20' | 'eliphd'} EliDepth
 */

export const ELI_DEPTHS = [
  {
    id: 'eli5',
    label: 'ELI5',
    icon: '🧒',
    tag: '5yo',
    name: {
      en: '5 Years Old',
      fa: '۵ ساله (کودکانه)',
      de: '5 Jahre alt',
    },
    tagline: {
      en: 'Playful metaphors & stories',
      fa: 'داستان‌ها و مدل‌های بازیگوشانه',
      de: 'Spielerische Metaphern & Geschichten',
    },
  },
  {
    id: 'eli10',
    label: 'ELI10',
    icon: '👦',
    tag: '10yo',
    name: {
      en: '10 Years Old',
      fa: '۱۰ ساله (مدرسه‌ای)',
      de: '10 Jahre alt',
    },
    tagline: {
      en: 'Everyday physical analogies',
      fa: 'قواعد دنیای واقعی و شهود عملی',
      de: 'Alltägliche Anschauungen',
    },
  },
  {
    id: 'eli15',
    label: 'ELI15',
    icon: '🧑',
    tag: '15yo',
    name: {
      en: '15 Years Old',
      fa: '۱۵ ساله (کدنویس)',
      de: '15 Jahre alt',
    },
    tagline: {
      en: 'Programming & terminal mechanics',
      fa: 'سینتکس برنامه‌نویسی و رفتار شل',
      de: 'Entwickler-Mechanik & Terminal-Syntax',
    },
  },
  {
    id: 'eli20',
    label: 'ELI20',
    icon: '🎓',
    tag: '20yo',
    name: {
      en: '20 Years Old',
      fa: '۲۰ ساله (دانشگاهی/دواپس)',
      de: '20 Jahre alt',
    },
    tagline: {
      en: 'OS architecture & production ops',
      fa: 'معماری سیستم‌عامل و عملیات سرور',
      de: 'Betriebssystem-Architektur & DevOps',
    },
  },
  {
    id: 'eliphd',
    label: 'PhD',
    icon: '🔬',
    tag: 'PhD',
    name: {
      en: 'Kernel PhD',
      fa: 'دکتری معماری کرنل',
      de: 'Kernel & Shell PhD',
    },
    tagline: {
      en: 'cmd.exe AST & Win32 NT internals',
      fa: 'پارسرهای cmd.exe، توکن‌ها و کرنل NT',
      de: 'cmd.exe Parser-AST & Win32-Interna',
    },
  },
];

/**
 * Detailed level explanations across the 5 depths and 3 locales.
 * @type {Record<string, Record<EliDepth, Record<'en' | 'fa' | 'de', { title: string, metaphor: string, text: string, tip: string }>>>}
 */
export const ELI_LEVEL_EXPLANATIONS = {
  'intro-echo': {
    eli5: {
      en: {
        title: 'Echo: Shouting in a Big Canyon',
        metaphor: 'You yell "hello" in a cave, and the cave calls back "hello"!',
        text: 'The computer is a friendly robot that repeats whatever word you give it onto the glass screen.',
        tip: 'Whenever you want to see words appear, tell the robot to echo them.',
      },
      fa: {
        title: 'اکو: فریاد زدن در دره بزرگ',
        metaphor: 'وقتی در غار داد می‌زنی «سلام!»، کوه هم دقیقاً همان «سلام!» را برایت پس می‌فرستد.',
        text: 'کامپیوتر مثل یک ربات مهربان است که هر کلمه‌ای را به او بدهی، فوراً روی صفحه برایت تکرار می‌کند.',
        tip: 'هر زمان خواستی متنی روی صفحه ظاهر شود، از اکو بخواه آن را برایت تکرار کند.',
      },
      de: {
        title: 'Echo: Rufen in eine Schlucht',
        metaphor: 'Du rufst "Hallo" in eine Höhle, und die Höhle antwortet "Hallo"!',
        text: 'Der Computer ist wie ein Roboter, der jedes Wort genau so auf dem Bildschirm wiederholt.',
        tip: 'Nutze echo immer, wenn ein Text direkt angezeigt werden soll.',
      },
    },
    eli10: {
      en: {
        title: 'Echo: Writing on the Chalkboard',
        metaphor: 'A student reading flashcards out loud in front of the class.',
        text: 'CMD prints plain text lines to your terminal screen. It does not open any files; it just displays your message directly.',
        tip: 'You can use echo later to send sentences directly into files.',
      },
      fa: {
        title: 'اکو: نوشتن روی تخته سیاه',
        metaphor: 'مثل دانش‌آموزی که کارتی را با صدای بلند جلوی کلاس می‌خواند.',
        text: 'دستور echo متن شما را دریافت کرده و در پنجره خط فرمان چاپ می‌کند. این دستور فایلی را باز نمی‌کند، فقط متن را نمایش می‌دهد.',
        tip: 'بعداً از echo برای ریختن متن به درون فایل‌ها هم استفاده خواهیم کرد.',
      },
      de: {
        title: 'Echo: Schreiben auf der Tafel',
        metaphor: 'Ein Schüler liest Karteikarten laut vor.',
        text: 'CMD gibt einfachen Text direkt in der Konsole aus. Es werden keine Dateien geöffnet, nur Text angezeigt.',
        tip: 'Später leiten wir echo-Ausgaben direkt in Dateien weiter.',
      },
    },
    eli15: {
      en: {
        title: 'Standard Output Stream (STDOUT)',
        metaphor: 'Writing characters to standard output descriptor 1.',
        text: '`echo` sends its trailing arguments to the process STDOUT stream followed by a newline (CRLF). Unlike Bash, quotes in Windows CMD echo are printed literally unless stripped.',
        tip: 'Use `echo.` (with a dot) to emit an empty line.',
      },
      fa: {
        title: 'جریان خروجی استاندارد (STDOUT)',
        metaphor: 'ارسال بایت‌ها به توصیف‌گر خروجی استاندارد ۱.',
        text: 'دستور `echo` آرگومان‌های خود را به همراه یک کاراکتر خط جدید (CRLF) به خروجی STDOUT می‌فرستد. برعکس لینوکس، در ویندوز کوتیشن‌ها به صورت تحت‌اللفظی چاپ می‌شوند مگر اینکه حذف شوند.',
        tip: 'برای چاپ یک سطر خالی از `echo.` (با نقطه چسبیده) استفاده کن.',
      },
      de: {
        title: 'Standard-Ausgabestrom (STDOUT)',
        metaphor: 'Zeichenausgabe auf Deskriptor 1.',
        text: '`echo` leitet Argumente an STDOUT gefolgt von CRLF. Anführungszeichen werden unter Windows standardmäßig mit ausgegeben.',
        tip: '`echo.` erzeugt eine saubere Leerzeile.',
      },
    },
    eli20: {
      en: {
        title: 'Process Console I/O Buffer',
        metaphor: 'Direct write to ConHost / ConPTY screen buffer.',
        text: 'In batch scripts, `@echo off` suppresses command echoing to prevent log clutter in CI/CD pipelines. Echo forms the backbone of status reporting and build telemetry.',
        tip: 'Verify line endings (CRLF vs LF) when echoing into files destined for Unix containers.',
      },
      fa: {
        title: 'بافر کنسول و خروجی لاگ پروسه‌ها',
        metaphor: 'نوشتن مستقیم در بافر صفحه ConHost / ConPTY.',
        text: 'در اسکریپت‌های سروری، عبارت `@echo off` مانع از تکرار خود فرامین در لاگ‌های CI/CD می‌شود. دستور echo پایپ‌لاین‌های اتوماسیون را برای گزارش وضعیت زنده شفاف نگه می‌دارد.',
        tip: 'هنگام نوشتن متن در فایل‌ها برای کانتینرهای لینوکسی به تفاوت CRLF با LF دقت کنید.',
      },
      de: {
        title: 'Prozess-Konsolen-Puffer',
        metaphor: 'Direktschreiben in den ConHost-Bildschirmpuffer.',
        text: 'In Produktionsskripten unterdrückt `@echo off` die Befehlsausgabe für saubere CI/CD-Logs. Echo bildet das Fundament für Build-Telemetrie.',
        tip: 'Achte auf CRLF-Zeilenumbrüche bei Dateien für Linux-Container.',
      },
    },
    eliphd: {
      en: {
        title: 'Win32 WriteFile Dispatch & Parser State',
        metaphor: 'Direct invocation of KERNELBASE!WriteFile on the console handle.',
        text: '`echo` is a CMD.EXE internal command. The command processor parses the token, bypasses executable PATH resolution, evaluates variable expansions, and invokes `WriteConsoleW` or `WriteFile` targeting `GetStdHandle(STD_OUTPUT_HANDLE)`. Special character tokens (`&`, `|`, `>`) require caret escaping (`^`) before evaluation.',
        tip: 'Trailing spaces after the argument are preserved by the tokenizer and written to the output stream.',
      },
      fa: {
        title: 'فراخوانی WriteFile در هسته Win32 و تحلیل لغوی',
        metaphor: 'فراخوانی مستقیم تابع KERNELBASE!WriteFile روی هندل کنسول.',
        text: 'دستور `echo` یک دستور داخلی در مفسر `cmd.exe` است. پردازنده فرمان بدون جستجوی فایل اجرایی در متغیر PATH، توکن‌ها را تحلیل کرده، متغیرها را بسط می‌دهد و از طریق `WriteConsoleW` یا `WriteFile` روی هندل `STD_OUTPUT_HANDLE` خروجی می‌دهد. کاراکترهای رزرو شده شل (`&`, `|`, `>`) برای چاپ به کاراکتر گریز (`^`) نیاز دارند.',
        tip: 'فاصله‌های انتهای دستور توسط توکنایزر CMD بریده نمی‌شوند و مستقیماً در خروجی نوشته می‌شوند.',
      },
      de: {
        title: 'Win32 WriteFile Dispatch & Tokenizer-Zustand',
        metaphor: 'KERNELBASE!WriteFile auf den aktiven Konsolen-Handle.',
        text: '`echo` ist ein interner Befehl von `cmd.exe`. Der Parser umgeht PATH-Lookups, expandiert Variablen und ruft `WriteConsoleW` auf `STD_OUTPUT_HANDLE` auf. Steuerzeichen wie `&`, `|`, `>` müssen mit `^` escaped werden.',
        tip: 'Nachfolgende Leerzeichen vor dem Zeilenende werden vom Tokenizer beibehalten.',
      },
    },
  },

  'intro-dir': {
    eli5: {
      en: {
        title: 'Dir: Opening Your Toy Box',
        metaphor: 'Looking inside your toy chest to see every toy you have.',
        text: '`dir` lists all the files and folders around you so you know what is in the room.',
        tip: 'Whenever you feel lost, type `dir` to see what is there.',
      },
      fa: {
        title: 'دایرکتوری: باز کردن جعبه اسباب‌بازی‌ها',
        metaphor: 'سرک کشیدن داخل کمد اسباب‌بازی‌ها برای اینکه ببینی چه چیزهایی داری.',
        text: 'دستور `dir` تمام فایل‌ها و پوشه‌هایی که کنارت هستند را نشان می‌دهد تا بدانی چه چیزهایی در اتاقت هست.',
        tip: 'هر وقت حس کردی گم شدی، `dir` بزن تا ببینی چه چیزهایی اطرافت هست.',
      },
      de: {
        title: 'Dir: Die Spielzeugkiste öffnen',
        metaphor: 'In deine Spielzeugkiste schauen, um jedes Spielzeug zu sehen.',
        text: '`dir` zeigt alle Dateien und Ordner an deinem aktuellen Standort.',
        tip: 'Tippe `dir`, wenn du wissen willst, was da ist.',
      },
    },
    eli10: {
      en: {
        title: 'Dir: Checking the Table of Contents',
        metaphor: 'Opening a book index or room inventory.',
        text: '`dir` displays files, folders (`<DIR>`), their file sizes in bytes, and last modified timestamps.',
        tip: 'Use `dir /b` if you just want bare names without timestamps or header details.',
      },
      fa: {
        title: 'دایرکتوری: بررسی فهرست کتاب',
        metaphor: 'باز کردن صفحه فهرست یک کتاب یا فهرست موجودی انبار.',
        text: 'دستور `dir` نام فایل‌ها، پوشه‌ها (`<DIR>`)، حجم بایت‌ها و تاریخ آخرین تغییرات را نمایش می‌دهد.',
        tip: 'سوییچ `dir /b` فقط نام‌های خالص را بدون اطلاعات اضافی و تاریخ نشان می‌دهد.',
      },
      de: {
        title: 'Dir: Das Inhaltsverzeichnis prüfen',
        metaphor: 'Das Register eines Buchs oder einer Inventarliste.',
        text: '`dir` zeigt Dateien, Ordner (`<DIR>`), Dateigrößen und Änderungsdaten.',
        tip: '`dir /b` liefert eine reine Namensliste ohne Zusatzangaben.',
      },
    },
    eli15: {
      en: {
        title: 'Directory Enumeration & Attributes',
        metaphor: 'Scanning directory entry records on disk.',
        text: '`dir` traverses the current working directory. Flags like `/a:h` reveal hidden files, `/o:n` sorts alphabetically, and `/s` performs recursive tree exploration.',
        tip: 'Pipe `dir /b` into tools like `find` or `sort` for rapid pipeline filtering.',
      },
      fa: {
        title: 'پیمایش رکوردها و صفات دایرکتوری',
        metaphor: 'اسکن کردن رکوردهای دایرکتوری روی بلاک‌های دیسک.',
        text: 'دستور `dir` دایرکتوری جاری را پیمایش می‌کند. سوییچ‌های `/a:h` فایل‌های مخفی را نشان می‌دهند، `/o:n` الفبایی مرتب می‌کند و `/s` به صورت بازگشتی زیرپوشه‌ها را جستجو می‌کند.',
        tip: 'خروجی `dir /b` را می‌توان با پایپ به دستورات `find` یا `sort` متصل کرد.',
      },
      de: {
        title: 'Verzeichnis-Enumeration & Attribute',
        metaphor: 'Scannen von Verzeichniseinträgen auf der Festplatte.',
        text: '`dir` liest das aktuelle Arbeitsverzeichnis aus. `/a:h` zeigt versteckte Dateien, `/s` durchsucht Unterverzeichnisse rekursiv.',
        tip: '`dir /b` eignet sich ideal für Pipelines mit `find` oder `sort`.',
      },
    },
    eli20: {
      en: {
        title: 'Filesystem Metadata & Storage Auditing',
        metaphor: 'Querying NTFS Master File Table ($MFT) records.',
        text: 'In systems operations, directory listings evaluate cluster allocations, directory volume metrics, and free disk space summaries printed at the bottom of the DIR output block.',
        tip: 'Check for volume serial numbers and free bytes to verify healthy disk margins.',
      },
      fa: {
        title: 'متادیتای سیستم‌فایل و ممیزی فضای ذخیره‌سازی',
        metaphor: 'کوئری گرفتن از رکوردهای جدول $MFT در سیستم فایل NTFS.',
        text: 'در مدیریت سرور، خروجی DIR به مدیران امکان ارزیابی فضای اشغال‌شده کلاسترها، حجم پوشه‌ها و بایت‌های آزاد باقی‌مانده در انتهای گزارش را می‌دهد.',
        tip: 'به شماره سریال دیسک و بایت‌های آزاد در پایین خروجی برای اطمینان از سلامت ذخیره‌سازی دقت کنید.',
      },
      de: {
        title: 'Dateisystem-Metadaten & Speicherprüfung',
        metaphor: 'Abfrage der NTFS Master File Table ($MFT).',
        text: 'In der Serveradministration prüft DIR Cluster-Größen, Verzeichnisstrukturen und den verbleibenden freien Festplattenspeicher.',
        tip: 'Achte auf die Seriennummer des Datenträgers und den freien Speicherplatz.',
      },
    },
    eliphd: {
      en: {
        title: 'NtQueryDirectoryFile Syscall & Win32 FindFirstFile',
        metaphor: 'Kernel I/O subsystem directory stream cursor traversal.',
        text: 'Under the hood, `cmd.exe` calls `FindFirstFileW` and `FindNextFileW`, which translate via ntdll to the kernel syscall `NtQueryDirectoryFile` using `FileBothDirectoryInformation`. It retrieves 64-bit creation, modification, and access timestamps from the NTFS $MFT attribute $STANDARD_INFORMATION and $FILE_NAME records.',
        tip: 'On SMB network shares, `dir /s` causes high metadata RPC roundtrips; avoid deep recursive sweeps without indexed search services.',
      },
      fa: {
        title: 'سیستم‌کال NtQueryDirectoryFile و توابع FindFirstFile',
        metaphor: 'پیمایش مکان‌نمای جریان دایرکتوری در لایه I/O هسته سیستم‌عامل.',
        text: 'در لایه‌های زیرین، پردازنده `cmd.exe` توابع `FindFirstFileW` و `FindNextFileW` از Win32 API را فراخوانی می‌کند که از طریق `ntdll.dll` به سیستم‌کال `NtQueryDirectoryFile` در کرنل تبدیل می‌شوند. این فراخوانی اطلاعات زمان‌بندی ۶۴ بیتی و حجم را از رکورد $MFT واکشی می‌کند.',
        tip: 'در اشتراک‌های شبکه SMB، دستور `dir /s` باعث تبادل بسته‌های RPC متعدد می‌شود؛ از اجرای آن در پوشه‌های بسیار عمیق بدون ایندکس خودداری کنید.',
      },
      de: {
        title: 'Syscall NtQueryDirectoryFile & Win32 FindFirstFile',
        metaphor: 'Verzeichnis-Stream-Cursor im Kernel-I/O-Subsystem.',
        text: '`cmd.exe` ruft `FindFirstFileW`/`FindNextFileW` auf, was über ntdll den Syscall `NtQueryDirectoryFile` mit `FileBothDirectoryInformation` triggert. Ausgelesen werden 64-Bit-Zeitstempel aus der NTFS $MFT.',
        tip: 'Auf SMB-Netzwerkfreigaben erzeugt `dir /s` erhebliche RPC-Latenzen.',
      },
    },
  },

  'pipes-stderr': {
    eli5: {
      en: {
        title: 'Two Ears, Two Mouths: Good Words vs Oops Words',
        metaphor: 'One speaker sings nice music, while another speaker beeps when something spills.',
        text: 'Commands have two voices: voice 1 says happy results, and voice 2 shouts when there is an oops! `2>` sends the oops into a timeout notebook.',
        tip: '`2> error.log` catches the oops words so your room stays quiet.',
      },
      fa: {
        title: 'دو دهان کامپیوتر: حرف‌های قشنگ و فریادهای خطا',
        metaphor: 'یک بلندگو آهنگ قشنگ پخش می‌کند و بلندگوی دوم فقط وقتی چیزی خراب شد بوق می‌زند!',
        text: 'دستورات دوتا صدا دارند: صدای شماره ۱ نتایج خوب را می‌گوید، و صدای شماره ۲ وقتی مشکلی پیش آمد فریاد می‌زند. عملگر `2>` فریادها را داخل یک دفترچه ثبت می‌کند.',
        tip: 'با دستور `2> error.log` خطاها در یک دفترچه یادداشت ضبط می‌شوند تا صفحه تمیز بماند.',
      },
      de: {
        title: 'Zwei Münder: Schöne Worte vs. Hoppla-Rufe',
        metaphor: 'Ein Lautsprecher spielt Musik, der andere piept bei Fehlern.',
        text: 'Befehle haben zwei Ausgänge: Kanal 1 für normale Ergebnisse, Kanal 2 für Fehler. `2>` leitet die Fehler in eine separate Datei.',
        tip: '`2> error.log` fängt Fehlermeldungen sauber ab.',
      },
    },
    eli10: {
      en: {
        title: 'Separating Normal Mail from Problem Mail',
        metaphor: 'A school mailbox with two slots: one for homework and one for missing permission slips.',
        text: 'Normally errors mix into your screen. Using `2> file.txt` redirects only the error messages away from the screen into a file.',
        tip: '`>nul 2>&1` is the secret trick to make any command completely silent!',
      },
      fa: {
        title: 'جداسازی نامه‌های عادی از نامه‌های خطا',
        metaphor: 'صندوق نامه‌ای با دو شکاف: یکی برای تکالیف خوب و دیگری برای تذکرهای انضباطی.',
        text: 'به طور معمول خطاها و نتایج با هم روی صفحه قاطی می‌شوند. با استفاده از `2> error.log` فقط پیام‌های خطا به فایل منتقل می‌شوند.',
        tip: 'ترفند طلایی `>nul 2>&1` باعث می‌شود هر دستوری بدون هیچ صدایی در پس‌زمینه اجرا شود!',
      },
      de: {
        title: 'Normale Post von Fehlermeldungen trennen',
        metaphor: 'Zwei Postfächer: eines für Hausaufgaben, eines für Fehlermeldungen.',
        text: 'Standardmäßig landen Fehler auf dem Bildschirm. `2> datei.txt` leitet ausschließlich Fehlermeldungen in eine Datei um.',
        tip: '`>nul 2>&1` lässt Befehle vollkommen lautlos im Hintergrund arbeiten.',
      },
    },
    eli15: {
      en: {
        title: 'File Descriptors 1 (STDOUT) and 2 (STDERR)',
        metaphor: 'Two distinct output pipelines connected to every process.',
        text: 'Operating systems provide File Descriptor 1 for standard output and File Descriptor 2 for standard error. Redirection syntax `2> err.log` intercepts descriptor 2, while `2>&1` merges descriptor 2 into descriptor 1.',
        tip: 'Place `2>&1` at the END of your line after the primary redirection target.',
      },
      fa: {
        title: 'توصیف‌گرهای فایل ۱ (STDOUT) و ۲ (STDERR)',
        metaphor: 'دو لوله جریان مجزا متصل به هر پردازش ویندوز.',
        text: 'سیستم‌عامل دو توصیف‌گر فایل در اختیار هر پروسه می‌گذارد: شماره ۱ برای خروجی استاندارد و شماره ۲ برای خطاهای استاندارد. سینتکس `2> err.log` خطاهای شماره ۲ را هدایت می‌کند و `2>&1` خطاهای ۲ را به درون کانال ۱ می‌ریزد.',
        tip: 'همیشه عبارت `2>&1` را در انتهای دستور بعد از مشخص کردن مقصد اول بنویسید.',
      },
      de: {
        title: 'Dateideskriptoren 1 (STDOUT) und 2 (STDERR)',
        metaphor: 'Zwei getrennte Datenkanäle für jeden Prozess.',
        text: 'Betriebssysteme stellen Deskriptor 1 für normale Ausgaben und 2 für Fehler bereit. `2> err.log` fängt Fehler ab, während `2>&1` beide Kanäle bündelt.',
        tip: '`2>&1` gehört immer an das Ende der Befehlszeile nach dem primären Ziel.',
      },
    },
    eli20: {
      en: {
        title: 'Stream Demultiplexing in CI/CD Automation',
        metaphor: 'Automated telemetry ingestion routing errors to Datadog/Sentry while metrics flow to Prometheus.',
        text: 'In production automation, scripts fail if stderr pollution corrupts machine-readable JSON/CSV streams. Redirecting stderr separates debug triage logs from data artifacts.',
        tip: 'Use `command >nul 2>&1` to suppress banner noise before querying %ERRORLEVEL%.',
      },
      fa: {
        title: 'جداسازی جریان‌های داده در پایپ‌لاین‌های CI/CD',
        metaphor: 'هدایت لاگ‌های خطای سرور به دیتاداگ بدون مخدوش شدن داده‌های اصلی.',
        text: 'در اسکریپت‌های سروری و داکر، ترکیب شدن متن خطا با خروجی‌های ساختاریافته JSON باعث کرش پایپ‌لاین می‌شود. جداسازی جریان شماره ۲ مانع خراب شدن خروجی اصلی برنامه‌ها می‌شود.',
        tip: 'با دستور `command >nul 2>&1` پیام‌های بنر را محو کنید و سپس وضعیت را از %ERRORLEVEL% استخراج نمایید.',
      },
      de: {
        title: 'Stream-Trennung in CI/CD-Pipelines',
        metaphor: 'Fehler an Logging-Dienste leiten, während Nutzdaten unverfälscht bleiben.',
        text: 'In der Produktionsautomatisierung zerstören Fehlermeldungen in STDOUT maschinenlesbare JSON-Daten. Die Trennung über Deskriptor 2 sichert robuste Schnittstellen.',
        tip: 'Nutze `command >nul 2>&1` für lautlose Statusabfragen via %ERRORLEVEL%.',
      },
    },
    eliphd: {
      en: {
        title: 'Win32 Handle Table Inheritance & Duplication',
        metaphor: 'DuplicateHandle syscall modifying standard handle slots in the process PEB.',
        text: 'When launching child processes via `CreateProcessW`, CMD sets `STARTUPINFO.hStdError` to a file handle opened with `GENERIC_WRITE`. The syntax `2>&1` duplicates `hStdOutput` into the `hStdError` slot via `DuplicateHandle(GetCurrentProcess(), hStdOutput, ...)`. Writing to `NUL` utilizes the Win32 `\\Device\\Null` driver for instantaneous kernel discards.',
        tip: 'The order of redirection evaluation in cmd.exe is left-to-right; `>out 2>&1` works, but `2>&1 >out` sends stderr to console and stdout to file.',
      },
      fa: {
        title: 'جدول هندل‌های Win32، کپی هندل و درایور \\Device\\Null',
        metaphor: 'فراخوانی DuplicateHandle در ساختار PEB پروسه برای جابجایی اسلات‌های هندل.',
        text: 'هنگام ایجاد پروسه فرزند از طریق `CreateProcessW`، پارامتر `hStdError` در ساختار `STARTUPINFO` به هندل فایل هدف متصل می‌شود. عبارت `2>&1` با تابع `DuplicateHandle` هندل خروجی را در اسلات خطا کپی می‌کند. نوشتن در `NUL` مستقیماً بایت‌ها را به درایور کرنل `\\Device\\Null` می‌سپارد تا بدون مصرف دیسک حذف شوند.',
        tip: 'پارس کردن ریدایرکت در CMD از چپ به راست است؛ ترکیب `>out 2>&1` هر دو را به فایل می‌برد، اما `2>&1 >out` خطاها را در ترمینال باقی می‌گذارد!',
      },
      de: {
        title: 'Win32 Handle-Tabelle & DuplicateHandle Syscall',
        metaphor: 'Manipulation der Standard-Handles in der Prozess-PEB.',
        text: 'CMD konfiguriert `STARTUPINFO.hStdError` bei `CreateProcessW`. `2>&1` dupliziert `hStdOutput` mittels `DuplicateHandle` in den Deskriptor 2. `NUL` leitet Daten an den NT-Treiber `\\Device\\Null`.',
        tip: 'Die Auswertungsreihenfolge ist von links nach rechts: `>out 2>&1` bündelt in die Datei, `2>&1 >out` trennt sie.',
      },
    },
  },

  'sys-net': {
    eli5: {
      en: {
        title: 'Ping: Tapping the Telephone Wire',
        metaphor: 'Ringing your doorbell to see if someone is home to say "Hello!".',
        text: '`ping` sends a tiny postcard to another computer and measures how many seconds it takes for them to say "I got it!".',
        tip: '`ping 127.0.0.1` talks to yourself to make sure your own computer is awake.',
      },
      fa: {
        title: 'پینگ: زنگ در خانه دوستان',
        metaphor: 'زنگ زدن به آیفون خانه برای اینکه ببینی آیا کسی خانه هست که بگوید «بله»؟',
        text: 'دستور `ping` یک کارت‌پستال خیلی کوچک به کامپیوتر مقصد می‌فرستد و زمان می‌گیرد تا ببیند چقدر طول می‌کشد تا جواب بدهد «دریافت شد!».',
        tip: 'دستور `ping 127.0.0.1` با خودِ کامپیوترت صحبت می‌کند تا مطمئن شوی کارت شبکه‌ات بیدار است.',
      },
      de: {
        title: 'Ping: Klingeln an der Haustür',
        metaphor: 'An der Tür klingeln, um zu prüfen, ob jemand "Hallo" sagt.',
        text: '`ping` sendet eine winzige Nachricht an einen anderen Rechner und misst die Zeit bis zur Antwort.',
        tip: '`ping 127.0.0.1` testet die eigene Netzwerkkarte im Rechner.',
      },
    },
    eli10: {
      en: {
        title: 'Network Detective: Finding Your IP and Testing Speed',
        metaphor: 'Checking your home postal address and sending a test letter.',
        text: '`ipconfig` shows your computer\'s home address on the network (IPv4). `ping` tests if you can reach a website or server.',
        tip: 'If internet fails, always ping your default gateway first.',
      },
      fa: {
        title: 'کارآگاه شبکه: یافتن آدرس آی‌پی و تست اتصال',
        metaphor: 'بررسی آدرس پستی خانه و فرستادن یک نامه تستی با پست پیشتاز.',
        text: 'دستور `ipconfig` آدرس خانه کامپیوتر شما در شبکه (IPv4) را نشان می‌دهد. دستور `ping` بررسی می‌کند که آیا سرور مقصد پاسخ می‌دهد یا خیر.',
        tip: 'اگر اینترنت قطع شد، همیشه اول گیت‌وی (مودم) خود را پینگ کنید.',
      },
      de: {
        title: 'Netzwerk-Detektiv: IP-Adresse & Verbindungstest',
        metaphor: 'Die eigene Postadresse ablesen und einen Testbrief verschicken.',
        text: '`ipconfig` zeigt die IPv4-Adresse deines PCs. `ping` prüft, ob ein entfernter Server antwortet.',
        tip: 'Prüfe bei Ausfällen zuerst die Verbindung zum Standardgateway (Router).',
      },
    },
    eli15: {
      en: {
        title: 'TCP/IP Stack Verification & ICMP Echo',
        metaphor: 'Validating network adapters and measuring round-trip latency.',
        text: '`ipconfig /all` dumps network interface cards (NICs), MAC addresses, DHCP status, and DNS resolvers. `ping` sends ICMP Echo Request packets and calculates latency (RTT) and packet loss.',
        tip: 'A timeout on ping usually signals firewall blocking (ICMP drop) or routing breakdown.',
      },
      fa: {
        title: 'بررسی پشته TCP/IP و بسته‌های اکو ICMP',
        metaphor: 'اعتبارسنجی کارت شبکه و محاسبه تاخیر رفت و برگشت داده‌ها (RTT).',
        text: 'دستور `ipconfig /all` مشخصات کارت‌های شبکه (NIC)، مک‌آدرس، وضعیت DHCP و سرورهای DNS را گزارش می‌دهد. دستور `ping` بسته‌های ICMP ارسال کرده و درصد افت پکت و تاخیر به میلی‌ثانیه را می‌سنجد.',
        tip: 'خطای Request Timed Out معمولاً نشان‌دهنده فایروال یا قطع ارتباط در مسیر است.',
      },
      de: {
        title: 'TCP/IP-Stack-Prüfung & ICMP-Echo',
        metaphor: 'Validierung von Netzwerkkarten und Messung der Umlaufzeit.',
        text: '`ipconfig /all` listet Schnittstellen, MAC-Adressen, DHCP und DNS auf. `ping` nutzt ICMP-Echo-Requests zur Latenz- und Paketverlustmessung.',
        tip: 'Ein Timeout deutet häufig auf blockierte ICMP-Pakete in der Firewall hin.',
      },
    },
    eli20: {
      en: {
        title: 'Network Triage & Site Reliability Engineering',
        metaphor: 'Probing infrastructure health across distributed microservices.',
        text: 'In DevOps, network commands determine whether deployment failures stem from DNS misconfiguration (`ipconfig /flushdns`), bad routes, or offline upstream gateways.',
        tip: 'Automate health checks by checking if %ERRORLEVEL% is 0 after pinging internal API gateways.',
      },
      fa: {
        title: 'عیب‌یابی زیرساخت شبکه و پایداری سرویس‌ها (SRE)',
        metaphor: 'سنجش سلامت ارتباطی سرورها و میکروسرویس‌های توزیع‌شده.',
        text: 'در عملیات دواپس، مهندسان با این ابزارها بررسی می‌کنند که آیا خطای استقرار ناشی از کش DNS اشتباه است (`ipconfig /flushdns`)، یا روتینگ قطع است، یا گیت‌وی پاسخ نمی‌دهد.',
        tip: 'با بررسی مقدار صفر در %ERRORLEVEL% بعد از پینگ، اسکریپت‌های سلامت‌سنجی خودکار بسازید.',
      },
      de: {
        title: 'Netzwerk-Fehlerbehebung in Rechenzentren (SRE)',
        metaphor: 'Verfügbarkeitsprüfung verteilter Dienste und Server.',
        text: 'Netzwerk-Triage klärt, ob Fehler an veralteten DNS-Einträgen (`ipconfig /flushdns`), fehlerhaftem Routing oder ausgefallenen Gateways liegen.',
        tip: 'Nutze %ERRORLEVEL% nach einem Ping für automatisierte Verfügbarkeits-Prüfungen.',
      },
    },
    eliphd: {
      en: {
        title: 'NDIS Drivers, Winsock API & Raw ICMP Sockets',
        metaphor: 'Direct interaction with TCP/IP kernel driver (tcpip.sys) and ARP resolution cache.',
        text: '`ipconfig` interfaces with the IP Helper API (`iphlpapi.dll`) querying NDIS miniport adapter bindings via IOCTL calls to `\\Device\\Tcp`. `ping.exe` uses `IcmpSendEcho2` from `iphlpapi.dll` to construct raw IPv4 ICMP type 8 code 0 datagrams, traversing the local routing table and ARP cache before transmitting down the physical frame.',
        tip: 'Windows loopback (127.0.0.1) bypasses the physical hardware layer and is routed purely within the kernel TCP/IP stack.',
      },
      fa: {
        title: 'درایورهای NDIS، توابع Winsock و سوکت‌های خام ICMP در tcpip.sys',
        metaphor: 'ارتباط مستقیم با درایور هسته tcpip.sys و جدول تفکیک آدرس‌های ARP.',
        text: 'دستور `ipconfig` از کتابخانه `iphlpapi.dll` و فراخوانی‌های IOCTL برای خواندن تنظیمات درایورهای NDIS ویندوز استفاده می‌کند. دستور `ping.exe` از تابع `IcmpSendEcho2` برای ساخت بسته‌های خام ICMP تایپ ۸ بهره می‌برد که پس از بررسی جدول مسیریابی و کش ARP ارسال می‌شوند.',
        tip: 'ارتباط با لوپ‌بک (127.0.0.1) از لایه سخت‌افزار رد نمی‌شود و کاملاً درون حافظه پشته TCP/IP کرنل پردازش می‌گردد.',
      },
      de: {
        title: 'NDIS-Treiber, IP Helper API & ICMP-Kernel-Sockets',
        metaphor: 'Kommunikation mit dem NT-Netzwerktreiber tcpip.sys.',
        text: '`ipconfig` nutzt die IP Helper API (`iphlpapi.dll`) und IOCTLs an `\\Device\\Tcp`. `ping.exe` ruft `IcmpSendEcho2` auf, erzeugt ICMP-Typ-8-Pakete und prüft Routingtabelle sowie ARP-Cache.',
        tip: 'Pakete an 127.0.0.1 verlassen die CPU-Register nie in Richtung physikalischer Hardware.',
      },
    },
  },

  'adv-escape': {
    eli5: {
      en: {
        title: 'The Magic Shield Hat (^)',
        metaphor: 'Putting a tiny umbrella over a word so the computer doesn\'t think it is a magic spell.',
        text: 'Some symbols like `&` do magic tricks. If you put the little hat `^` in front, the computer treats it like a normal letter.',
        tip: '`^&` lets you print the and sign safely.',
      },
      fa: {
        title: 'کلاه جادویی محافظ (^)',
        metaphor: 'گذاشتن یک چتر کوچک روی سر کاراکترها تا کامپیوتر فکر نکند ورد جادویی است!',
        text: 'علامت‌هایی مثل `&` کارهای جادویی می‌کنند (دستورات را به هم می‌چسبانند). اگر علامت کلاه `^` را قبل از آنها بگذاری، کامپیوتر آن را به عنوان یک حرف معمولی چاپ می‌کند.',
        tip: 'ترکیب `^&` اجازه می‌دهد علامت & بدون ایجاد دستور جدید چاپ شود.',
      },
      de: {
        title: 'Der Zauberhut (^)',
        metaphor: 'Ein kleiner Schutzschirm über einem Zeichen, damit kein Zauberspruch ausgelöst wird.',
        text: 'Zeichen wie `&` haben Sonderfunktionen. Ein `^` davor sagt dem Computer: "Das ist nur ein ganz normaler Buchstabe!"',
        tip: '`^&` gibt das Und-Zeichen als normalen Text aus.',
      },
    },
    eli10: {
      en: {
        title: 'Escape Characters: The Windows Caret',
        metaphor: 'Using air quotes when telling a story so people know you are quoting.',
        text: 'In Windows CMD, the caret `^` is the escape key. It neutralizes operators like `&`, `|`, `>`, and `<` so they become plain text.',
        tip: 'Unlike Linux which uses backslash `\\`, Windows CMD always uses the caret `^`.',
      },
      fa: {
        title: 'کاراکتر گریز: علامت هشتک کوچک (^)',
        metaphor: 'گذاشتن علامت نقل‌قول در زبان فارسی برای اینکه بگویی این کلمه یک اسم خاص است.',
        text: 'در خط فرمان ویندوز، علامت هشتک یا کلاه `^` کاراکتر گریز (Escape) است. این علامت قدرت نمادهایی مثل `&`، `|` و `>` را خنثی می‌کند تا مثل متن معمولی رفتار کنند.',
        tip: 'برخلاف لینوکس که از بک‌اسلش `\\` استفاده می‌کند، در ویندوز همیشه از کلاهک `^` استفاده می‌شود.',
      },
      de: {
        title: 'Escape-Zeichen: Das Windows-Caret (^)',
        metaphor: 'Anführungszeichen zur Kennzeichnung wörtlicher Rede.',
        text: 'Unter Windows CMD ist das Caret `^` das offizielle Escape-Zeichen. Es neutralisiert Operatoren wie `&`, `|`, `>` und `<`.',
        tip: 'Anders als Linux mit Backslash `\\` nutzt CMD immer das Zirkumflex `^`.',
      },
    },
    eli15: {
      en: {
        title: 'Disabling Shell Operator Evaluation',
        metaphor: 'Bypassing compiler syntax tokens to emit literal tokens.',
        text: 'The CMD command parser scans for control operators (`&`, `&&`, `|`, `||`, `>`, `<`) before invoking commands. Placing `^` in front instructs the lexical scanner to emit the literal byte.',
        tip: 'To print a literal caret itself, type two carets: `^^`.',
      },
      fa: {
        title: 'غیرفعال‌سازی ارزیابی عملگرهای رزرو شده شل',
        metaphor: 'عبور دادن توکن از کامپایلر بدون تبدیل شدن به گره‌های دستوری.',
        text: 'پردازنده CMD خط فرمان را قبل از اجرا برای یافتن عملگرهای کنترل زنجیره‌ای (`&`, `&&`, `|`, `||`, `>`, `<`) اسکن می‌کند. قرار دادن `^` باعث می‌شود تحلیل‌گر لغوی آن کاراکتر را به عنوان بایت متنی عادی در نظر بگیرد.',
        tip: 'برای چاپ خود علامت کلاه، باید دوتا کلاه پشت سر هم تایپ کنی: `^^`.',
      },
      de: {
        title: 'Deaktivierung von Shell-Operatoren',
        metaphor: 'Übergehen von Syntax-Tokens im Tokenizer.',
        text: 'Der CMD-Parser sucht vor der Ausführung nach Steuerzeichen (`&`, `|`, `>`). Ein vorangestelltes `^` zwingt den Scanner zur literalen Ausgabe.',
        tip: 'Ein echtes Caret-Zeichen erzeugst du durch Verdopplung: `^^`.',
      },
    },
    eli20: {
      en: {
        title: 'Batch Script Sanitization & Command Injection Defense',
        metaphor: 'Sanitizing SQL query strings against injection attacks.',
        text: 'In production scripts accepting user inputs or dynamic filenames containing ampersands (e.g. `AT&T Report.pdf`), failure to escape causes unintended command execution and security vulnerabilities.',
        tip: 'Wrap dynamic paths in double quotes or escape variables to defend against injection attacks.',
      },
      fa: {
        title: 'پاک‌سازی ورودی‌ها و جلوگیری از تزریق دستورات (Command Injection)',
        metaphor: 'ایمن‌سازی کوئری‌های دیتابیس در برابر حملات تزریق کد SQL.',
        text: 'در اسکریپت‌های سروری که نام فایل‌های داینامیک را پردازش می‌کنند (مثل `AT&T.pdf`)، نبود کاراکتر گریز باعث شکسته شدن دستور و اجرای ناخواسته کدهای مخرب توسط شل می‌شود.',
        tip: 'همیشه متغیرهای نامشخص را درون دابل کوتیشن بگذارید یا آنها را با caret محافظت کنید.',
      },
      de: {
        title: 'Skript-Bereinigung & Schutz vor Command Injection',
        metaphor: 'Sanitizing von Nutzereingaben gegen Injection-Angriffe.',
        text: 'In Produktionsskripten führen Dateinamen mit `&` (z. B. `F&E_Report.txt`) ohne Escaping zur Ausführung unbeabsichtigter Befehle.',
        tip: 'Setze dynamische Pfade stets in Anführungszeichen, um Injection-Lücken zu schließen.',
      },
    },
    eliphd: {
      en: {
        title: 'cmd.exe Multi-Phase Parser & Tokenizer Lookahead',
        metaphor: 'Recursive descent lexical analyzer consuming escape prefixes in Phase 2.',
        text: 'Windows CMD processes commands in distinct phases: Phase 1 replaces percent variables; Phase 2 performs lexical analysis where `^` consumes the immediate next byte and strips itself; Phase 3 splits compound statements (`&`, `|`). If delayed expansion is active, exclamation marks (`!`) require double escaping (`^^^^`) inside complex macro expansions.',
        tip: 'A trailing caret at the end of a line acts as a line-continuation character in CMD scripts.',
      },
      fa: {
        title: 'مراحل چندگانه پارسر cmd.exe و پیش‌بینی توکن‌ها (Lookahead)',
        metaphor: 'تحلیل‌گر لغوی با فرود بازگشتی که در فاز دوم پیشوندهای گریز را مصرف می‌کند.',
        text: 'شل `cmd.exe` خط فرمان را در فازهای مجزا ارزیابی می‌کند: فاز ۱ متغیرهای درصدی را جایگزین می‌کند؛ فاز ۲ با اسکن لغوی کاراکتر `^` را مصرف کرده و بایت بعدی را تثبیت می‌کند؛ فاز ۳ عملگرهای زنجیره‌ای را تفکیک می‌کند. در صورت فعال بودن گسترش تاخیری، کاراکتر `!` به گریز چندگانه (`^^^^`) نیاز دارد.',
        tip: 'قرار دادن یک کاراکتر `^` در انتهای خط، به عنوان ادامه‌دهنده خط (Line Continuation) در اسکریپت‌های ویندوز عمل می‌کند.',
      },
      de: {
        title: 'cmd.exe Mehrphasen-Parser & Tokenizer-Lookahead',
        metaphor: 'Lexikalischer Parser verarbeitet Escape-Präfixe in Phase 2.',
        text: 'CMD verarbeitet Befehle mehrphasig: Phase 1 expandiert `%VAR%`, Phase 2 verarbeitet `^` und entfernt es aus dem Stream, Phase 3 teilt Verknüpfungen (`&`). Bei aktiver verzögerter Erweiterung erfordern Ausrufezeichen mehrfaches Escaping (`^^^^`).',
        tip: 'Ein Caret am Zeilenende dient in Batch-Dateien als Zeilenfortsetzungszeichen.',
      },
    },
  },

  'sys-reg': {
    eli5: {
      en: {
        title: 'Registry: The Computer\'s Giant Brain Notebook',
        metaphor: 'A giant master diary where the computer writes all its favorite settings and secrets.',
        text: 'The Registry is where Windows remembers everything: your wallpaper, installed programs, and colors. `reg query` opens this notebook to take a peek.',
        tip: 'Think of the Registry as the central brain library of your computer.',
      },
      fa: {
        title: 'رجیستری: دفترچه خاطرات بزرگ مغز کامپیوتر',
        metaphor: 'یک دفترچه رمز بزرگ که کامپیوتر تمام تنظیمات مخفی و علایقش را درون آن یادداشت کرده است.',
        text: 'رجیستری جایی است که ویندوز تمام جزییات را به یاد می‌سپارد: برنامه‌های نصب شده، رنگ‌ها و تنظیمات دیسک. دستور `reg query` این دفترچه را باز می‌کند تا به آن نگاهی بیندازیم.',
        tip: 'رجیستری را مثل کتابخانه مرکزی حافظه ویندوز تصور کن.',
      },
      de: {
        title: 'Registry: Das riesige Notizbuch des Computers',
        metaphor: 'Ein großes Haupttagebuch, in dem alle Einstellungen gespeichert sind.',
        text: 'In der Registry speichert Windows alles: Hintergrundbilder, Programme und Einstellungen. `reg query` liest darin nach.',
        tip: 'Die Registry ist das zentrale Gehirn des Windows-Betriebssystems.',
      },
    },
    eli10: {
      en: {
        title: 'Reading the Master Configuration Database',
        metaphor: 'Looking up a phone number in the city telephone directory.',
        text: 'Windows stores system settings inside keys and values in the Registry. `reg query` looks up a specific folder (key) to see what numbers and words are stored inside.',
        tip: '`HKLM` stands for HKEY_LOCAL_MACHINE, storing settings for the entire computer.',
      },
      fa: {
        title: 'خواندن پایگاه‌داده تنظیمات سراسری ویندوز',
        metaphor: 'پیدا کردن شماره تلفن در دفترچه راهنمای بزرگ شهر.',
        text: 'ویندوز تنظیمات سیستمی را در قالب کلیدها (Keys) و مقادیر (Values) در رجیستری ذخیره می‌کند. دستور `reg query` یک کلید را جستجو می‌کند تا مقادیر داخل آن را ببینید.',
        tip: 'عبارت `HKLM` مخفف HKEY_LOCAL_MACHINE است و تنظیمات کل کامپیوتر را نگه می‌دارد.',
      },
      de: {
        title: 'Die zentrale Konfigurationsdatenbank abfragen',
        metaphor: 'Im Telefonbuch der Stadt nach einer Nummer suchen.',
        text: 'Windows speichert Konfigurationen in Schlüsseln und Werten. `reg query` liest diese Schlüssel aus.',
        tip: '`HKLM` steht für HKEY_LOCAL_MACHINE und enthält globale Rechnereinstellungen.',
      },
    },
    eli15: {
      en: {
        title: 'Registry Hive Navigation & Data Types',
        metaphor: 'Querying a hierarchical NoSQL key-value database built directly into the OS.',
        text: 'The Registry organizes data hierarchically (Hives -> Keys -> Values). Value types include `REG_SZ` (string), `REG_DWORD` (32-bit integer), and `REG_BINARY`. `reg query` retrieves values for configuration management.',
        tip: 'Use `/v ValueName` to query an individual value instead of the entire key tree.',
      },
      fa: {
        title: 'پیمایش هایوهای رجیستری و انواع داده‌ها',
        metaphor: 'کوئری گرفتن از یک پایگاه‌داده کلید-مقدار سلسله‌مراتبی درون هسته سیستم‌عامل.',
        text: 'رجیستری داده‌ها را به شکل درختی دسته‌بندی می‌کند (Hive -> Key -> Value). انواع داده‌ها شامل `REG_SZ` (رشته متنی)، `REG_DWORD` (عدد صحیح ۳۲ بیتی) و `REG_BINARY` هستند. دستور `reg query` این مقادیر را استخراج می‌کند.',
        tip: 'با سوییچ `/v ValueName` می‌توانید به جای تمام کلید، فقط یک مقدار خاص را کوئری بگیرید.',
      },
      de: {
        title: 'Registry-Hives & Datentypen abfragen',
        metaphor: 'Abfrage einer hierarchischen Key-Value-Datenbank im Betriebssystem.',
        text: 'Die Registry strukturiert Daten in Hives, Schlüsseln und Werten (`REG_SZ`, `REG_DWORD`, `REG_BINARY`). `reg query` liest diese Konfigurationswerte aus.',
        tip: 'Mit `/v WertName` fragst du gezielt einzelne Werte ab.',
      },
    },
    eli20: {
      en: {
        title: 'Enterprise Policy & Configuration Auditing',
        metaphor: 'Reading infrastructure state files to enforce compliance and security baselines.',
        text: 'System administrators and DevOps engineers query the registry to verify security baselines, check software installations, validate Group Policies, and detect unauthorized configuration drift.',
        tip: 'Combine `reg query` with `findstr` in automated release scripts to verify prerequisite registry keys.',
      },
      fa: {
        title: 'ممیزی خط‌مشی‌های سازمانی و امنیت سرورها',
        metaphor: 'بررسی فایل‌های وضعیت سیستم برای اطمینان از اعمال الزامات امنیتی.',
        text: 'مدیران سیستم و مهندسان امنیت با دستور `reg query` بررسی می‌کنند که آیا خط‌مشی‌های امنیتی گروپ‌پالیسی، نسخه‌های نرم‌افزاری و تنظیمات فایروال به درستی اعمال شده‌اند یا خیر.',
        tip: 'دستور `reg query` را در اسکریپت‌ها با `findstr` ترکیب کنید تا وجود پیش‌نیازهای سیستمی را بررسی کنید.',
      },
      de: {
        title: 'Unternehmens-Compliance & Richtlinien-Auditing',
        metaphor: 'Prüfung von Systemzuständen gegen Sicherheitsrichtlinien.',
        text: 'Administratoren nutzen die Registry-Abfrage zur Validierung von Gruppenrichtlinien (GPO), Softwareversionen und Konfigurations-Drift.',
        tip: 'Kombiniere `reg query` mit `findstr`, um Voraussetzungen vor Software-Deployments zu prüfen.',
      },
    },
    eliphd: {
      en: {
        title: 'NT Executive Configuration Manager & Hive Cell Storage',
        metaphor: 'Kernel subsystem managing on-disk hive files mapped into pool memory.',
        text: 'The Windows NT Configuration Manager (`Cmp`) implements the registry. Hives correspond to physical binary files (e.g. `\\SystemRoot\\System32\\config\\SYSTEM`). `reg.exe` communicates via `RegOpenKeyExW` and `RegQueryValueExW`, issuing the native kernel syscall `NtQueryValueKey`. Data cells (`hbin`) are managed via free-lists and mapped directly into System Paged Pool memory.',
        tip: 'Registry writes are transacted via Common Log File System (CLFS) transaction logs to prevent corruption upon power interruption.',
      },
      fa: {
        title: 'مدیر پیکربندی کرنل NT (Configuration Manager) و سلول‌های هایو',
        metaphor: 'زیرسیستم هسته ویندوز که فایل‌های دیسک را در استخر حافظه پیج‌شده مپ می‌کند.',
        text: 'مدیریت رجیستری توسط زیرسیستم `Cmp` در کرنل NT انجام می‌شود. هایوها به فایل‌های باینری فیزیکی در مسیر `config` دیسک متصل هستند. ابزار `reg.exe` از طریق `RegQueryValueExW` و سیستم‌کال `NtQueryValueKey` داده‌ها را از ساختار باینری سلول‌های حافظه (`hbin`) در استخر حافظه استخراج می‌کند.',
        tip: 'تغییرات رجیستری از طریق لاگ‌های تراکنشی CLFS انجام می‌شود تا قطع برق ناگهانی باعث تخریب رجیستری نشود.',
      },
      de: {
        title: 'NT Configuration Manager & Hive-Zellenspeicher',
        metaphor: 'Kernel-Subsystem zur Abbildung von Binär-Hives im Paged Pool.',
        text: 'Der NT Configuration Manager (`Cmp`) verwaltet Hives als physische Binärdateien im Systemverzeichnis. `reg.exe` greift über `NtQueryValueKey` auf Zellblöcke (`hbin`) im gepagten Speicher zu.',
        tip: 'Transaktionale Registry-Schreibvorgänge über CLFS verhindern Datenkorruption bei Stromausfällen.',
      },
    },
  },
};

export const ELI_DEPTH_MAP = Object.fromEntries(ELI_DEPTHS.map((d) => [d.id, d]));

/**
 * Universal explanation generator for any level across the 5 depths.
 * Provides high-fidelity explanations with contextual metaphors.
 * Supports both (levelId, depth, locale) and (levelId, locale, depth).
 *
 * @param {string} levelId
 * @param {string} [arg1]
 * @param {string} [arg2]
 * @returns {{ title: string, metaphor: string, text: string, tip: string, explanation: string, takeaway: string, icon: string, label: string, depthLabel: string, depthName: string }}
 */
export function getEliForLevel(levelId, arg1 = 'eli15', arg2 = 'en') {
  let depth = 'eli15';
  let locale = 'en';

  if (['eli5', 'eli10', 'eli15', 'eli20', 'eliphd'].includes(arg1)) {
    depth = arg1;
    locale = arg2 || 'en';
  } else if (['en', 'fa', 'de'].includes(arg1)) {
    locale = arg1;
    depth = arg2 || 'eli15';
  } else {
    depth = arg2 || 'eli15';
    locale = arg1 || 'en';
  }

  const depthMeta = ELI_DEPTHS.find((d) => d.id === depth) || ELI_DEPTHS[2];
  const depthName = (depthMeta.name && depthMeta.name[locale]) || depthMeta.name.en;

  // Check custom override dictionary
  let res;
  const custom = ELI_LEVEL_EXPLANATIONS[levelId]?.[depth]?.[locale];
  if (custom) {
    res = {
      ...custom,
      icon: depthMeta.icon,
      label: depthMeta.label,
      depthName,
    };
  } else {
    res = synthesizeEliFallback(levelId, depth, locale, depthMeta, depthName);
  }

  return {
    ...res,
    explanation: res.explanation || res.text || '',
    takeaway: res.takeaway || res.tip || '',
    depthLabel: depthMeta.label,
  };
}

/**
 * @param {string} levelId
 * @returns {EliDepth}
 */
export function getPrimaryEliTierForLevel(levelId) {
  if (levelId.startsWith('intro-')) return 'eli5';
  if (levelId.startsWith('files-') || levelId === 'pipes-find' || levelId === 'pipes-pipe') return 'eli10';
  if (levelId.startsWith('adv-') || levelId.startsWith('pipes-') || levelId === 'sys-datetime' || levelId === 'sys-where') return 'eli15';
  if (levelId.startsWith('sys-') || levelId === 'batch-if' || levelId === 'batch-sort' || levelId === 'batch-errorlevel' || levelId === 'batch-for' || levelId === 'batch-script') return 'eli20';
  return 'eliphd';
}

/**
 * Synthetic fallback explanation generator ensuring 100% coverage.
 *
 * @param {string} levelId
 * @param {EliDepth} depth
 * @param {'en' | 'fa' | 'de'} loc
 * @param {typeof ELI_DEPTHS[0]} depthMeta
 * @param {string} depthName
 */
function synthesizeEliFallback(levelId, depth, loc, depthMeta, depthName) {
  const baseName = levelId.replace(/^[^_-]+[_-]/, '').toUpperCase();

  const fallbacks = {
    eli5: {
      en: {
        title: `Playing with ${baseName}`,
        metaphor: 'Like building a house out of colorful toy blocks.',
        text: `Here we ask the computer to help us arrange our toys and check what is inside our boxes using ${baseName}.`,
        tip: 'Try typing the letters and watch what changes on the screen!',
      },
      fa: {
        title: `بازی و آشنایی با ${baseName}`,
        metaphor: 'مثل ساختن یک خانه زیبا با لگوهای اسباب‌بازی رنگارنگ.',
        text: `در این مرحله به کامپیوتر می‌گوییم چطور وسایلمان را مرتب کند و چه کارهایی برایمان انجام دهد.`,
        tip: 'دستور را تایپ کن و تغییرات نقشه را در سمت چپ تماشا کن!',
      },
      de: {
        title: `Spielen mit ${baseName}`,
        metaphor: 'Wie das Bauen eines Hauses mit bunten Bauklötzen.',
        text: `Wir sagen dem Computer, wie er unsere Dateien und Ordner organisieren soll.`,
        tip: 'Tippe den Befehl ein und beobachte die Änderungen im Dateibaum!',
      },
    },
    eli10: {
      en: {
        title: `Practical Tools: ${baseName}`,
        metaphor: 'A Swiss Army knife with dedicated blades for every task.',
        text: `This command acts as a precise tool for handling computer files, directories, and data streams.`,
        tip: 'Pay attention to parameters and spaces between words.',
      },
      fa: {
        title: `ابزارهای کاربردی: ${baseName}`,
        metaphor: 'مثل یک چاقوی همه‌کاره سوئیسی که برای هر کاری یک ابزار مخصوص دارد.',
        text: `این دستور یک ابزار دقیق برای سازماندهی فایل‌ها، پوشه‌ها و اطلاعات سیستم است.`,
        tip: 'به فاصله‌ها و حروف دقت کن تا دستور دقیق اجرا شود.',
      },
      de: {
        title: `Praktische Werkzeuge: ${baseName}`,
        metaphor: 'Ein Schweizer Taschenmesser mit Klingen für jede Aufgabe.',
        text: `Dieser Befehl dient als präzises Werkzeug für Dateien, Ordner und Datenströme.`,
        tip: 'Achte auf Leerzeichen und Parameter.',
      },
    },
    eli15: {
      en: {
        title: `CLI Syntax & Stream Controls: ${baseName}`,
        metaphor: 'Executing functions with positional arguments and return status codes.',
        text: `Windows Command Interpreter evaluates ${baseName} with runtime arguments, modifying the filesystem state or standard I/O streams.`,
        tip: 'Check command exit codes (%ERRORLEVEL%) to verify success.',
      },
      fa: {
        title: `سینتکس خط فرمان و جریان‌ها: ${baseName}`,
        metaphor: 'فراخوانی توابع با آرگومان‌های موقعیتی و ارزیابی کدهای بازگشتی.',
        text: `مفسر خط فرمان ویندوز دستور ${baseName} را با آرگومان‌ها اجرا کرده و فایل‌سیستم یا جریان‌های ورودی/خروجی را تغییر می‌دهد.`,
        tip: 'کد خروجی (%ERRORLEVEL%) نشان‌دهنده موفقیت یا خطای عملیات است.',
      },
      de: {
        title: `CLI-Syntax & Stream-Steuerung: ${baseName}`,
        metaphor: 'Funktionsaufruf mit Positionsargumenten und Rückgabewerten.',
        text: `Der Befehlsinterpreter verarbeitet ${baseName} und aktualisiert den Dateisystemzustand.`,
        tip: 'Prüfe %ERRORLEVEL% auf erfolgreiche Ausführung.',
      },
    },
    eli20: {
      en: {
        title: `Systems Architecture & Automation: ${baseName}`,
        metaphor: 'Production orchestration worker thread executing idempotent state transitions.',
        text: `In enterprise infrastructure, ${baseName} is integrated into unattended automation pipelines, managing resources with deterministic exit guarantees.`,
        tip: 'Guard batch operations against missing target paths or concurrency locks.',
      },
      fa: {
        title: `معماری سیستم‌ها و اتوماسیون سازمانی: ${baseName}`,
        metaphor: 'ترد پردازشی در پایپ‌لاین‌های سرور برای تغییرات وضعیت پایدار و قطعی.',
        text: `در سرورها و محیط‌های ابری، دستور ${baseName} برای مدیریت اتوماتیک منابع و اجرای پایپ‌لاین‌های انتشار استفاده می‌شود.`,
        tip: 'عملیات بچ را در برابر قفل‌های همزمانی و عدم وجود فایل ایمن‌سازی کنید.',
      },
      de: {
        title: 'Systemarchitektur & Automatisierung: ' + baseName,
        metaphor: 'Idempotente Zustandsübergänge in automatisierten Pipelines.',
        text: 'In der Unternehmens-IT wird ' + baseName + ' für zuverlässige Batch-Verarbeitung eingesetzt.',
        tip: 'Sichere Batch-Skripte gegen fehlende Pfade und Race Conditions ab.',
      },
    },
    eliphd: {
      en: {
        title: `NT Kernel Execution Model: ${baseName}`,
        metaphor: 'Native Win32 subsystem dispatch through NT Executive system service tables.',
        text: `Command execution initiates through cmd.exe AST parsing, handle allocation, security token validation, and I/O Manager dispatch to the underlying filesystem driver.`,
        tip: 'Monitor file system filter drivers and asynchronous I/O completion packets for bottlenecks.',
      },
      fa: {
        title: `مدل اجرایی هسته NT و پشته توکن‌ها: ${baseName}`,
        metaphor: 'توزیع فرامین در زیرسیستم Win32 از طریق جداول سرویس هسته سیستم‌عامل.',
        text: `اجرای این عملیات شامل تحلیل AST در شل، تخصیص هندل، اعتبارسنجی توکن‌های امنیتی و فراخوانی I/O Manager برای دسترسی به دیسک است.`,
        tip: 'فیلتر درایورهای فایل‌سیستم و بسته‌های تکمیل ورودی/خروجی غیرهمگام را در نظر داشته باشید.',
      },
      de: {
        title: 'NT-Kernel-Ausführungsmodell: ' + baseName,
        metaphor: 'Win32-Subsystem-Dispatch über NT-Systemdiensttabellen.',
        text: 'Die Befehlsausführung umfasst AST-Parsing, Handle-Zuweisung und I/O-Manager-Aufrufe an den Dateisystemtreiber.',
        tip: 'Beachte Dateisystem-Filtertreiber und asynchrone I/O-Pakete.',
      },
    },
  };

  const selected = fallbacks[depth]?.[loc] || fallbacks.eli15.en;
  return {
    ...selected,
    icon: depthMeta.icon,
    label: depthMeta.label,
    depthName,
  };
}
