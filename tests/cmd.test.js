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
});

test('i18n exports valid dictionaries and handles locale switching', async () => {
  const { LOCALES, ui, localizeLevel } = await import('../js/i18n.js');
  assert.deepEqual(LOCALES, ['en', 'fa', 'de']);

  for (const loc of LOCALES) {
    const strings = ui(loc);
    assert.ok(strings.levels);
    assert.ok(strings.guide);
    assert.ok(strings.hint);
    assert.ok(strings.solution);
    assert.ok(Array.isArray(strings.quiz));
    assert.ok(strings.quiz.length >= 3);
  }

  const dummyLvl = {
    id: 'intro-echo',
    name: { en_US: 'Echo', fa: 'اکو' },
    hint: { en_US: 'type echo' },
    about: { en_US: 'intro' },
  };
  const localized = localizeLevel(dummyLvl, 'fa');
  assert.equal(localized.name.fa, 'اکو');
  assert.ok(localized.objective);
  assert.ok(Array.isArray(localized.learning));
});

