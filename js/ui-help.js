/**
 * Interactive UI guide and visual tour highlighting.
 *
 * Outlines live regions on demand so learners immediately connect
 * documentation concepts to on-screen controls.
 */

'use strict';

/**
 * @typedef {Object} UiElementDoc
 * @property {string} selector
 * @property {string} id
 * @property {string} title
 * @property {string} what
 * @property {string} how
 */

/**
 * @param {'en' | 'fa' | 'de'} [lang='en']
 * @returns {UiElementDoc[]}
 */
export function uiElements(lang = 'en') {
  if (lang === 'fa') {
    return [
      {
        id: 'brand',
        selector: '.brand',
        title: 'نشان برنامه',
        what: 'نام پروژه learn-cmd و وضعیت شبیه‌ساز خط فرمان ویندوز.',
        how: 'با کلیک روی نام برنامه می‌توانید به حالت آزاد برگردید.',
      },
      {
        id: 'toolbar',
        selector: '.toolbar-actions',
        title: 'نوار ابزار اصلی',
        what: 'دسترسی سریع به مراحل، دیالوگ درس، راهنمای اهداف، راهنمایی متنی، لغو آخرین دستور و راه‌اندازی مجدد.',
        how: 'روی هر دکمه کلیک کنید یا معادل متنی آن مانند `levels`، `hint` یا `undo` را در ترمینال تایپ کنید.',
      },
      {
        id: 'tree',
        selector: '#fs-tree',
        title: 'نقشه زنده فایل‌سیستم',
        what: 'نمایش گرافیکی درخت پوشه‌ها و فایل‌های درایو C: مجازی در حافظه مرورگر. پوشه کاری جاری (cwd) با برچسب مشخص می‌شود.',
        how: 'با هر دستور نظیر `md`، `cd`، `del`، `copy`، این درخت بلادرنگ تغییر می‌کند.',
      },
      {
        id: 'dock',
        selector: '#dock',
        title: 'داک راهنما و اهداف مرحله',
        what: 'داک همواره باز در سمت راست که هدف مرحله، سرفصل‌های یادگیری، نکات عملیاتی و چک‌لیست گام‌ها را نشان می‌دهد.',
        how: 'با کلیک روی دکمه Guide در نوار ابزار یا اجرای دستور `steps` در ترمینال، این پنل هایلایت و متمرکز می‌شود.',
      },
      {
        id: 'terminal',
        selector: '#terminal',
        title: 'شبیه‌ساز کنسول cmd.exe',
        what: 'محیط اجرای دستورات با تاریخچه، پیش‌بینی هوشمند (Ghost text)، لاگ خروجی و پشتیبانی از پایپ و ریدایرکت.',
        how: 'دستورات را تایپ کنید و برای تکمیل خودکار کلید Tab را بزنید.',
      },
      {
        id: 'links',
        selector: '.tb-stat, .tb-link',
        title: 'شمارنده و پیوندهای خارجی',
        what: 'شمارنده لحظه‌ای بازدیدکنندگان یکتای وب‌سایت، سورس کد گیت‌هاب و حمایت مالی.',
        how: 'روی آیکون گیت‌هاب کلیک کنید تا مخزن پروژه باز شود.',
      },
    ];
  }

  if (lang === 'de') {
    return [
      {
        id: 'brand',
        selector: '.brand',
        title: 'Marke & Status',
        what: 'Der learn-cmd Projektname und Windows CMD Terminal-Emulator.',
        how: 'Klicke auf den Titel, um zur Sandbox zurückzukehren.',
      },
      {
        id: 'toolbar',
        selector: '.toolbar-actions',
        title: 'Haupt-Symbolleiste',
        what: 'Schnellzugriff auf Level, Lektion, Anleitung, Tipp, Rückgängig und Neustart.',
        how: 'Klicke auf Schaltflächen oder tippe Befehle wie `levels` oder `hint` im Terminal.',
      },
      {
        id: 'tree',
        selector: '#fs-tree',
        title: 'Dateisystem-Visualisierer',
        what: 'Live-Baumstruktur des virtuellen C:-Laufwerks mit Arbeitsverzeichnis (cwd).',
        how: 'Aktualisiert sich sofort bei Befehlen wie `md`, `cd`, `del` oder `copy`.',
      },
      {
        id: 'dock',
        selector: '#dock',
        title: 'Lernhilfe & Ziel-Dock',
        what: 'Rechtes Dock mit Zielen, Lerninhalten, Praxistipps und Befehls-Checkliste.',
        how: 'Klicke auf Anleitung oder tippe `steps` im Terminal.',
      },
      {
        id: 'terminal',
        selector: '#terminal',
        title: 'cmd.exe Terminal',
        what: 'Virtuelle Befehlszeile mit Verlauf, Ghost-Text-Vorschlägen und Tab-Vervollständigung.',
        how: 'Tippe Befehle ein und nutze Tab zur Autovervollständigung.',
      },
      {
        id: 'links',
        selector: '.tb-stat, .tb-link',
        title: 'Zähler & Links',
        what: 'Echtzeit-Besucherzähler, GitHub-Repository und Kaffeespende.',
        how: 'Klicke auf das GitHub-Symbol für den Quellcode.',
      },
    ];
  }

  return [
    {
      id: 'brand',
      selector: '.brand',
      title: 'Brand & Mode',
      what: 'The learn-cmd title, active challenge badge, and Windows 11 fluent theme.',
      how: 'Clicking the title or pressing Escape returns you to free exploration.',
    },
    {
      id: 'toolbar',
      selector: '.toolbar-actions',
      title: 'Action Toolbar',
      what: 'Quick-access buttons for level selection, lesson intro, guide dock, hints, solution, undo, and reset.',
      how: 'Click any button or type its terminal counterpart like `levels`, `hint`, or `undo`.',
    },
    {
      id: 'tree',
      selector: '#fs-tree',
      title: 'Live Filesystem Tree',
      what: 'In-memory map of the virtual C: drive showing directories, files, byte sizes, and current working directory.',
      how: 'Updates immediately on every disk-mutating command (`md`, `cd`, `del`, `copy`, `ren`).',
    },
    {
      id: 'dock',
      selector: '#dock',
      title: 'Learning Guide Dock',
      what: 'Always-open right panel showing objectives, learning outcomes, field notes, and interactive step checklists.',
      how: 'Click Guide in the toolbar or type `steps` to pulse and focus this panel.',
    },
    {
      id: 'terminal',
      selector: '#terminal',
      title: 'CMD.EXE Terminal',
      what: 'Virtual command prompt with history navigation, ghost text autocomplete, and inline next-step hints.',
      how: 'Type commands and press Tab to complete words or accept suggestions.',
    },
    {
      id: 'links',
      selector: '.tb-stat, .tb-link',
      title: 'Visitor Counter & Links',
      what: 'Live deduplicated visitor stats, open-source GitHub repository link, and developer support.',
      how: 'Click the GitHub icon to view repository source code or star the project.',
    },
  ];
}

/**
 * Format plain text help for terminal printing.
 *
 * @param {'en' | 'fa' | 'de'} [lang='en']
 * @returns {string}
 */
export function formatUiHelpText(lang = 'en') {
  const elements = uiElements(lang);
  const title =
    lang === 'fa'
      ? 'راهنمای اجزای صفحه'
      : lang === 'de'
        ? 'Übersicht der Benutzeroberfläche'
        : 'UI Layout Guide';
  return [
    title,
    '='.repeat(title.length),
    '',
    ...elements.map((e, i) => `${i + 1}. ${e.title}\n   ${e.what}\n   -> ${e.how}`),
  ].join('\n');
}

/**
 * HTML content for the UI Help modal dialog.
 *
 * @param {'en' | 'fa' | 'de'} [lang='en']
 * @returns {string}
 */
export function uiHelpModalHtml(lang = 'en') {
  const elements = uiElements(lang);
  const btnLabel = lang === 'fa' ? 'نمایش این بخش' : lang === 'de' ? 'Hervorheben' : 'Highlight';
  const howLabel = lang === 'fa' ? 'نحوه استفاده:' : lang === 'de' ? 'Verwendung:' : 'How to use:';

  const sections = elements
    .map(
      (e) => `
      <section class="ui-help-item" data-help-id="${e.id}">
        <div class="ui-help-head">
          <h3>${e.title}</h3>
          <button type="button" class="btn ui-help-focus" data-focus-id="${e.id}">${btnLabel}</button>
        </div>
        <div class="ui-help-what"><p>${e.what}</p></div>
        <div class="ui-help-how"><p><strong>${howLabel}</strong> ${e.how}</p></div>
      </section>
    `
    )
    .join('');

  return `<div class="ui-help">${sections}</div>`;
}

/**
 * Outline live regions on the screen so learners see where each element is.
 *
 * @param {ParentNode} root
 * @param {string} [focusId]
 * @param {number} [durationMs=3500]
 * @returns {() => void}
 */
export function startUiTour(root, focusId, durationMs = 3500) {
  root.querySelectorAll('.ui-tour-on').forEach((el) => el.classList.remove('ui-tour-on'));
  const elements = uiElements().filter((e) => !focusId || e.id === focusId);
  const nodes = elements
    .map((e) => root.querySelector(e.selector))
    .filter(Boolean);

  nodes.forEach((n) => n.classList.add('ui-tour-on'));
  const stop = () => {
    nodes.forEach((n) => n.classList.remove('ui-tour-on'));
  };
  window.setTimeout(stop, durationMs);
  return stop;
}
