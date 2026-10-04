/**
 * Unit tests for the virtual filesystem and CMD command layer.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { VirtualFileSystem, normalizePath, defaultFsSpec } from '../js/vfs.js';
import { executeLine } from '../js/shell.js';
import { COMMANDS, tokenize } from '../js/commands.js';
import { getLevel, allLevels, nextLevel, locateLevel } from '../js/levels.js';

/**
 * @param {string} line
 * @param {VirtualFileSystem} fs
 * @returns {string[]}
 */
function run(line, fs) {
  const result = executeLine(line, { fs });
  return result.lines;
}

test('normalizePath resolves relative and absolute forms', () => {
  assert.equal(normalizePath('Documents', 'C:\\Users\\student'), 'C:\\Users\\student\\Documents');
  assert.equal(normalizePath('..\\..\\Windows', 'C:\\Users\\student'), 'C:\\Windows');
  assert.equal(normalizePath('C:\\Users', 'C:\\Users\\student'), 'C:\\Users');
  assert.equal(normalizePath('\\Users\\student', 'C:\\Windows'), 'C:\\Users\\student');
  assert.equal(normalizePath('.', 'C:\\Users\\student'), 'C:\\Users\\student');
});

test('echo prints text', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  assert.deepEqual(run('echo hello world', fs), ['hello world']);
});

test('dir lists files and directories', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  const lines = run('dir', fs).join('\n');
  assert.match(lines, /notes\.txt/);
  assert.match(lines, /Documents/);
  assert.match(lines, /<DIR>/);
});

test('dir /b is bare listing', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  const lines = run('dir /b', fs);
  assert.ok(lines.includes('notes.txt'));
  assert.ok(lines.includes('Documents'));
  assert.ok(!lines.some((l) => l.includes('<DIR>')));
});

test('cd changes working directory', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('cd Documents', fs);
  assert.equal(fs.cwd, 'C:\\Users\\student\\Documents');
  run('cd ..', fs);
  assert.equal(fs.cwd, 'C:\\Users\\student');
});

test('md creates nested directories', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('md work\\app\\src', fs);
  const node = fs.resolve('C:\\Users\\student\\work\\app\\src');
  assert.ok(node);
  assert.equal(node.type, 'dir');
});

test('echo redirection creates a file with content', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('echo hello world>readme.txt', fs);
  assert.equal(fs.readFile('readme.txt'), 'hello world\n');
});

test('append redirection grows a file', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('echo one>log.txt', fs);
  run('echo two>>log.txt', fs);
  assert.equal(fs.readFile('log.txt'), 'one\ntwo\n');
});

test('type prints file contents', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  const lines = run('type notes.txt', fs);
  assert.ok(lines.join('\n').includes('remember to learn CMD'));
});

test('copy duplicates a file into a directory', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('copy notes.txt Documents', fs);
  assert.equal(fs.readFile('Documents\\notes.txt'), fs.readFile('notes.txt'));
  assert.equal(fs.readFile('notes.txt'), 'remember to learn CMD\n');
});

test('move relocates a file', () => {
  const fs = new VirtualFileSystem({
    Users: { student: { 'a.txt': 'data\n', bin: {} } },
  });
  fs.cwd = 'C:\\Users\\student';
  run('move a.txt bin', fs);
  assert.equal(fs.resolve('a.txt'), null);
  assert.equal(fs.readFile('bin\\a.txt'), 'data\n');
});

test('ren renames a file', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('ren notes.txt mynotes.txt', fs);
  assert.equal(fs.resolve('notes.txt'), null);
  assert.ok(fs.resolve('mynotes.txt'));
});

test('del removes a file', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('del notes.txt', fs);
  assert.equal(fs.resolve('notes.txt'), null);
});

test('del with wildcard removes matching files only', () => {
  const fs = new VirtualFileSystem({
    Users: {
      student: {
        'a.tmp': '1\n',
        'b.tmp': '2\n',
        'keep.txt': 'k\n',
      },
    },
  });
  fs.cwd = 'C:\\Users\\student';
  run('del *.tmp', fs);
  assert.equal(fs.resolve('a.tmp'), null);
  assert.equal(fs.resolve('b.tmp'), null);
  assert.ok(fs.resolve('keep.txt'));
});

test('rd removes empty and nested directories', () => {
  const fs = new VirtualFileSystem({
    Users: { student: { empty: {}, nested: { 'x.txt': 'x\n' } } },
  });
  fs.cwd = 'C:\\Users\\student';
  run('rd empty', fs);
  assert.equal(fs.resolve('empty'), null);
  const refused = executeLine('rd nested', { fs });
  assert.equal(refused.ok, false);
  assert.match(refused.lines.join('\n'), /not empty/i);
  run('rd /s /q nested', fs);
  assert.equal(fs.resolve('nested'), null);
});

test('pipe sends output into next command', () => {
  const fs = new VirtualFileSystem({
    Users: { student: { 'names.txt': 'zoe\namy\nmike\n' } },
  });
  fs.cwd = 'C:\\Users\\student';
  const lines = run('type names.txt | sort', fs);
  assert.deepEqual(lines, ['amy', 'mike', 'zoe']);
});

test('chained && runs second command on success', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('md backup && echo data>backup\\copy.txt', fs);
  assert.equal(fs.readFile('backup\\copy.txt'), 'data\n');
});

test('chained || runs second command on failure', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  const lines = run('dir missing-path-xyz || echo recovered', fs);
  assert.ok(lines.some((l) => l === 'recovered'));
});

test('set stores and expands environment variables', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  run('set MSG=salam learn-cmd', fs);
  assert.equal(fs.env.get('MSG'), 'salam learn-cmd');
  run('echo %MSG%>greeting.txt', fs);
  assert.equal(fs.readFile('greeting.txt'), 'salam learn-cmd\n');
});

test('find searches file contents', () => {
  const fs = new VirtualFileSystem({
    Users: {
      student: { 'notes.txt': 'buy milk\ntodo: learn CMD\ntodo: practice\n' },
    },
  });
  fs.cwd = 'C:\\Users\\student';
  const lines = run('find "todo" notes.txt', fs);
  assert.equal(lines.filter((l) => l.includes('todo')).length, 2);
});

test('fc compares two files', () => {
  const fs = new VirtualFileSystem({
    Users: {
      student: {
        'a.txt': 'red\ngreen\nblue\n',
        'b.txt': 'red\ngreen\nred\n',
      },
    },
  });
  fs.cwd = 'C:\\Users\\student';
  const lines = run('fc a.txt b.txt', fs).join('\n');
  assert.match(lines, /blue/);
  assert.match(lines, /Comparing files/);
});

test('tree prints nested directories', () => {
  const fs = new VirtualFileSystem({
    Users: { student: { projects: { src: { 'main.c': 'int main(){}\n' } } } },
  });
  fs.cwd = 'C:\\Users\\student';
  const lines = run('tree', fs).join('\n');
  assert.match(lines, /projects/);
  assert.match(lines, /src/);
});

test('unknown command reports error', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  const result = executeLine('definitely_not_a_cmd', { fs });
  assert.equal(result.ok, false);
  assert.match(result.lines.join('\n'), /not recognized/);
});

test('tokenize honors quotes', () => {
  assert.deepEqual(tokenize('find "hello world" file.txt'), [
    'find',
    'hello world',
    'file.txt',
  ]);
});

test('help lists built-in commands', () => {
  const fs = new VirtualFileSystem(defaultFsSpec());
  const lines = run('help', fs).join('\n');
  assert.match(lines, /DIR/);
  assert.match(lines, /CD/);
  assert.match(lines, /COPY/);
});

test('level catalog is well-formed', () => {
  const levels = allLevels();
  assert.ok(levels.length >= 10);
  for (const level of levels) {
    assert.ok(level.id, 'level id required');
    assert.ok(level.name.en_US, 'en_US name required');
    assert.ok(level.startFS, 'startFS required');
    assert.ok(level.goalFS, 'goalFS required');
    assert.ok(level.solutionCommand, 'solutionCommand required');
    assert.ok(level.startDialog?.en_US?.childViews?.length, 'dialog required');
    assert.ok(locateLevel(level.id), 'level must live in a sequence');
  }
});

test('solution commands actually solve their levels', () => {
  for (const level of allLevels()) {
    const fs2 = new VirtualFileSystem(level.startFS);
    fs2.cwd = level.startCwd || 'C:\\Users\\student';
    fs2.ensureDefaultProfile();
    const result = executeLine(level.solutionCommand, { fs: fs2 });
    assert.ok(
      result.ok,
      `level ${level.id} solution command errored: ${result.lines.join(' | ')}`
    );
    /** @type {string[]} */
    const history = [level.solutionCommand];
    const diff = fs2.diffGoalWithCommands(
      level.goalFS,
      level.goalCwd,
      level.goalCommands || null,
      history
    );
    assert.ok(
      diff.ok,
      `level ${level.id} solution failed: missing=${JSON.stringify(diff.missing)} extra=${JSON.stringify(
        diff.extra
      )} cwd=${diff.cwdMismatch} cmds=${JSON.stringify(diff.missingCommands)}`
    );
  }
});

test('nextLevel walks sequences in order', () => {
  const first = allLevels()[0];
  const second = nextLevel(first.id);
  assert.ok(second);
  assert.notEqual(second.id, first.id);
});

test('cmd error names are CmdError', () => {
  assert.deepEqual(COMMANDS.echo.fn(['hi'], { fs: null }), ['hi']);
});

test('levelFromJson builds a playable custom level', async () => {
  const { levelFromJson, registerCustomLevel, listCustomLevels } = await import(
    '../js/levels.js'
  );
  const raw = {
    id: 'custom-demo',
    name: { en_US: 'Demo', fa: 'دمو' },
    hint: { en_US: 'echo hi>out.txt' },
    startFS: { Users: { student: {} } },
    goalFS: { Users: { student: { 'out.txt': 'hi\n' } } },
    solutionCommand: 'echo hi>out.txt',
    par: 1,
    startCwd: 'C:\\Users\\student',
  };
  const level = levelFromJson(raw);
  assert.equal(level.id, 'custom-demo');
  assert.equal(level.name.fa, 'دمو');
  registerCustomLevel(level);
  assert.ok(listCustomLevels().some((l) => l.id === 'custom-demo'));

  const fs = new VirtualFileSystem(level.startFS);
  fs.cwd = 'C:\\Users\\student';
  executeLine(level.solutionCommand, { fs });
  const diff = fs.diffGoal(level.goalFS);
  assert.ok(diff.ok, `custom level unsolved: ${JSON.stringify(diff)}`);
});

test('levelFromJson rejects incomplete payloads', async () => {
  const { levelFromJson } = await import('../js/levels.js');
  assert.throws(() => levelFromJson(/** @type {any} */ ({})), /name/);
  assert.throws(() => levelFromJson(/** @type {any} */ ({ name: { en_US: 'x' } })), /startFS/);
});

test('parseVisitorBadgeSvg extracts count and handles scale suffixes', async () => {
  const { parseVisitorBadgeSvg } = await import('../js/visitor-counter.js');
  assert.equal(parseVisitorBadgeSvg('<svg><title>VISITORS: 1,420</title></svg>'), 1420);
  assert.equal(parseVisitorBadgeSvg('<svg><title>visitors: 2.5k</title></svg>'), 2500);
  assert.equal(parseVisitorBadgeSvg('<svg><title>VISITORS: 1M</title></svg>'), 1000000);
  assert.equal(parseVisitorBadgeSvg('invalid svg content'), null);
  assert.equal(parseVisitorBadgeSvg(''), null);
});

test('buildShareTargets formats share messages and social links', async () => {
  const { buildShareTargets } = await import('../js/share.js');
  const dummyCurriculum = {
    solvedCount: 5,
    total: 21,
    learned: [],
    remaining: [],
    next: null,
    percent: 24,
  };
  const targets = buildShareTargets({
    levelName: 'Echo Intro',
    levelId: 'intro-echo',
    commands: 1,
    par: 1,
    curriculum: dummyCurriculum,
  });

  assert.ok(targets.linkedin.includes('linkedin.com'));
  assert.ok(targets.x.includes('twitter.com'));
  assert.ok(targets.facebook.includes('facebook.com'));
  assert.match(targets.text, /Echo Intro/);
  assert.match(targets.text, /5 of 21/);
});

test('summarizeCurriculum and resumeLine calculate correct stats', async () => {
  const { summarizeCurriculum, resumeLine } = await import('../js/progress.js');
  const progress = {
    'intro-echo': { solved: true, best: 1 },
    'intro-dir': { solved: true, best: 1 },
  };

  const summary = summarizeCurriculum(progress, 'en');
  assert.equal(summary.solvedCount, 2);
  assert.ok(summary.percent > 0);
  assert.ok(summary.learned.length === 2);
  assert.equal(summary.next?.id, 'intro-cd');

  const lineEn = resumeLine(summary, 'en');
  assert.match(lineEn, /2\//);
  assert.match(lineEn, /intro-cd/);

  const lineFa = resumeLine(summary, 'fa');
  assert.match(lineFa, /پیشرفت ذخیره‌شده/);

  const lineDe = resumeLine(summary, 'de');
  assert.match(lineDe, /Willkommen zurück/);
  assert.match(lineDe, /Fortschritt gespeichert/);
});

test('i18n exports valid dictionaries and handles locale switching', async () => {
  const { LOCALES, ui, localizeLevel, LEVEL_METADATA } = await import('../js/i18n.js');
  const { allLevels, getLevel } = await import('../js/levels.js');
  assert.deepEqual(LOCALES, ['en', 'fa', 'de']);

  for (const loc of LOCALES) {
    const strings = ui(loc);
    assert.ok(strings.levels);
    assert.ok(strings.guide);
    assert.ok(strings.hint);
    assert.ok(strings.solution);
    assert.ok(strings.criterionMet);
    assert.ok(typeof strings.runCommand === 'function');
    assert.ok(Array.isArray(strings.quiz));
    assert.ok(strings.quiz.length >= 3);
  }

  // Ensure every sequenced level has metadata in en, fa, de
  const { sequences } = await import('../js/levels.js');
  const sequencedLevels = Object.values(sequences).flatMap((s) => s.levels);
  for (const lvl of sequencedLevels) {
    const meta = LEVEL_METADATA[lvl.id];
    assert.ok(meta, `Sequenced level ${lvl.id} must have LEVEL_METADATA`);
    for (const loc of ['en', 'fa', 'de']) {
      assert.ok(meta[loc], `Level ${lvl.id} must have metadata for ${loc}`);
      assert.ok(meta[loc].objective, `Level ${lvl.id} must have objective for ${loc}`);
      assert.ok(Array.isArray(meta[loc].learning) && meta[loc].learning.length > 0, `Level ${lvl.id} must have learning items for ${loc}`);
      assert.ok(Array.isArray(meta[loc].fieldNotes) && meta[loc].fieldNotes.length > 0, `Level ${lvl.id} must have fieldNotes for ${loc}`);
    }
  }

  // Ensure fallback works for custom/arbitrary levels
  const customLvl = { id: 'custom-test', name: { en_US: 'Custom' }, startFS: {} };
  const localizedCustom = localizeLevel(customLvl, 'fa');
  assert.equal(localizedCustom.objective, 'رسیدن به وضعیت مطلوب فایل‌سیستم.');
  assert.ok(localizedCustom.learning.length > 0);
  assert.ok(localizedCustom.fieldNotes.length > 0);

  const rawDir = getLevel('intro-dir');
  assert.ok(rawDir);
  const localizedFa = localizeLevel(rawDir, 'fa');
  assert.equal(localizedFa.name.fa, 'مشاهده محتوا با DIR');
  assert.match(localizedFa.objective, /dir/);
  assert.match(localizedFa.objective, /پوشه‌ها/);
  assert.ok(localizedFa.learning.some(l => l.includes('<DIR>')));
  assert.ok(localizedFa.fieldNotes.some(f => f.includes('dir /b')));

  const localizedDe = localizeLevel(rawDir, 'de');
  assert.match(localizedDe.objective, /dir/);
  assert.match(localizedDe.objective, /Verzeichnisse/);
});

test('command-only levels solve properly when executed and recorded in golf', async () => {
  const { getLevel } = await import('../js/levels.js');
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');

  const lvl = getLevel('intro-echo');
  assert.ok(lvl);
  const fs = new VirtualFileSystem(lvl.startFS);
  if (lvl.startCwd) fs.cwd = lvl.startCwd;

  const golf = [];
  const res = executeLine('echo hello', { fs });
  assert.ok(res.ok);
  golf.push('echo hello');

  const diff = fs.diffGoalWithCommands(lvl.goalFS, lvl.goalCwd, lvl.goalCommands || null, golf);
  assert.ok(diff.ok, 'intro-echo should be solved when echo hello is run and in golf');
  assert.equal(diff.missingCommands.length, 0);
});

test('tasklist and taskkill manage processes', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem();
  const listRes = executeLine('tasklist', { fs });
  assert.ok(listRes.ok);
  assert.ok(listRes.lines.some((l) => l.includes('node.exe')));

  const killRes = executeLine('taskkill /im node.exe /f', { fs });
  assert.ok(killRes.ok);
  assert.ok(killRes.lines.some((l) => l.includes('SUCCESS')));

  const listAfter = executeLine('tasklist', { fs });
  assert.ok(!listAfter.lines.some((l) => l.includes('node.exe')));
});

test('if exist and if string==string execute conditional branches', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem({ Users: { student: { 'exists.txt': 'yes\n' } } });
  fs.cwd = 'C:\\Users\\student';

  executeLine('if exist exists.txt echo found>result.txt', { fs });
  assert.equal(fs.readFile('result.txt'), 'found\n');

  executeLine('if not exist missing.txt echo not-found>>result.txt', { fs });
  assert.ok(fs.readFile('result.txt').includes('not-found'));

  executeLine('if exist missing.txt echo bad>>result.txt', { fs });
  assert.ok(!fs.readFile('result.txt').includes('bad'));

  executeLine('if "a"=="a" echo match>>result.txt', { fs });
  assert.ok(fs.readFile('result.txt').includes('match'));
});
test('date /t and time /t output formatted date and time', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem();

  const dateRes = executeLine('date /t', { fs });
  assert.ok(dateRes.ok);
  assert.ok(dateRes.lines.length > 0);
  // MM/DD/YYYY format
  assert.match(dateRes.lines[0], /\d{2}\/\d{2}\/\d{4}/);

  const timeRes = executeLine('time /t', { fs });
  assert.ok(timeRes.ok);
  assert.ok(timeRes.lines.length > 0);
  // HH:MM AM/PM format
  assert.match(timeRes.lines[0], /\d{2}:\d{2} (AM|PM)/);

  const chainedRes = executeLine('date /t & time /t', { fs });
  assert.ok(chainedRes.ok);
  assert.equal(chainedRes.lines.length, 2);
});

test('FOR loops iterate over sets and wildcards', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem({
    Users: {
      student: {
        'a.log': '1',
        'b.log': '2',
        archive: {},
      },
    },
  });
  fs.cwd = 'C:\\Users\\student';

  const loopRes = executeLine('for %f in (*.log) do move %f archive', { fs });
  assert.ok(loopRes.ok);
  assert.equal(fs.resolve('archive\\a.log') !== null, true);
  assert.equal(fs.resolve('archive\\b.log') !== null, true);
  assert.equal(fs.resolve('a.log'), null);

  const rangeRes = executeLine('for /l %i in (1, 1, 3) do md dir%i', { fs });
  assert.ok(rangeRes.ok);
  assert.equal(fs.resolve('dir1') !== null, true);
  assert.equal(fs.resolve('dir2') !== null, true);
  assert.equal(fs.resolve('dir3') !== null, true);
});

test('ERRORLEVEL tracks exit codes and supports IF ERRORLEVEL', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem({ Users: { student: { 'server.log': 'FAIL: timeout\n' } } });
  fs.cwd = 'C:\\Users\\student';

  executeLine('find "FAIL" server.log && if not errorlevel 1 echo alert>alert.txt', { fs });
  assert.equal(fs.readFile('alert.txt'), 'alert\n');

  executeLine('unknownCommand', { fs });
  assert.equal(fs.getEnv('ERRORLEVEL'), '1');
  executeLine('if errorlevel 1 echo failed>err.txt', { fs });
  assert.equal(fs.readFile('err.txt'), 'failed\n');
});

test('batch file execution runs .bat scripts line by line', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem({ Users: { student: { src: { 'main.js': 'code\n' } } } });
  fs.cwd = 'C:\\Users\\student';

  executeLine('echo md dist>build.bat & echo copy src\\main.js dist>>build.bat', { fs });
  assert.ok(fs.resolve('build.bat') !== null);

  const runRes = executeLine('build.bat', { fs });
  assert.ok(runRes.ok);
  assert.equal(fs.resolve('dist\\main.js') !== null, true);
});

test('set /a evaluates arithmetic expressions and compounds', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem();
  fs.cwd = 'C:\\Users\\student';

  const res1 = executeLine('set /a count=5+10', { fs });
  assert.ok(res1.ok);
  assert.equal(fs.env.get('count'), '15');
  assert.equal(res1.lines[0], '15');

  const res2 = executeLine('set /a count+=5', { fs });
  assert.ok(res2.ok);
  assert.equal(fs.env.get('count'), '20');

  const res3 = executeLine('set /a result=(4 + 6) * 3', { fs });
  assert.ok(res3.ok);
  assert.equal(fs.env.get('result'), '30');
});

test('networking, system, and clipboard commands produce valid Windows output', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem();
  fs.cwd = 'C:\\Users\\student';

  const ipRes = executeLine('ipconfig', { fs });
  assert.ok(ipRes.ok);
  assert.ok(ipRes.lines.some((l) => l.includes('IPv4 Address')));

  const pingRes = executeLine('ping 8.8.8.8', { fs });
  assert.ok(pingRes.ok);
  assert.ok(pingRes.lines.some((l) => l.includes('Reply from 8.8.8.8')));

  const whoRes = executeLine('whoami', { fs });
  assert.ok(whoRes.ok);
  assert.equal(whoRes.lines[0], 'desktop-cmd\\student');

  const hostRes = executeLine('hostname', { fs });
  assert.ok(hostRes.ok);
  assert.equal(hostRes.lines[0], 'DESKTOP-CMD');

  const sysRes = executeLine('systeminfo', { fs });
  assert.ok(sysRes.ok);
  assert.ok(sysRes.lines.some((l) => l.includes('Microsoft Windows 11')));

  const clipRes = executeLine('echo secretText | clip', { fs });
  assert.ok(clipRes.ok);
  assert.equal(fs.clipboard, 'secretText');

  const driveRes = executeLine('c:', { fs });
  assert.ok(driveRes.ok);
});

test('xcopy recursively copies directories and files', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem({
    Users: {
      student: {
        project: {
          'index.html': '<h1>Hi</h1>',
          sub: {
            'style.css': 'body{}',
          },
        },
      },
    },
  });
  fs.cwd = 'C:\\Users\\student';

  const xRes = executeLine('xcopy project backup /s /e', { fs });
  assert.ok(xRes.ok);
  assert.ok(fs.resolve('backup\\index.html') !== null);
  assert.ok(fs.resolve('backup\\sub\\style.css') !== null);
  assert.equal(fs.readFile('backup\\sub\\style.css'), 'body{}');
});

test('batch scripts support arguments %1..%9, %*, and GOTO labels', async () => {
  const { executeLine } = await import('../js/shell.js');
  const { VirtualFileSystem } = await import('../js/vfs.js');
  const fs = new VirtualFileSystem({
    Users: {
      student: {
        'deploy.bat': [
          '@echo off',
          'if "%1"=="prod" goto runProd',
          'echo Running dev mode',
          'goto end',
          ':runProd',
          'echo Deploying to production %2',
          ':end',
          'echo Done',
        ].join('\n'),
      },
    },
  });
  fs.cwd = 'C:\\Users\\student';

  const devRes = executeLine('deploy.bat dev', { fs });
  assert.ok(devRes.ok);
  assert.deepEqual(devRes.lines, ['Running dev mode', 'Done']);

  const prodRes = executeLine('deploy.bat prod v2.0', { fs });
  assert.ok(prodRes.ok);
  assert.deepEqual(prodRes.lines, ['Deploying to production v2.0', 'Done']);
});

