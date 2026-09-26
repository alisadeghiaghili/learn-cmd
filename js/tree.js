/**
 * Live filesystem tree visualization.
 *
 * Renders the virtual filesystem as an indented tree with connectors,
 * highlighting the current working directory and flashing new nodes.
 */

'use strict';

/**
 * @typedef {import('./vfs.js').VfsNode} VfsNode
 */

/**
 * @param {HTMLElement} container
 * @param {import('./vfs.js').VirtualFileSystem} fs
 * @param {{ flashPaths?: Set<string>, selectedPath?: string | null }} [opts]
 */
export function renderTree(container, fs, opts = {}) {
  const flashPaths = opts.flashPaths || new Set();
  const selectedPath = opts.selectedPath || null;
  container.innerHTML = '';

  const rootWrap = document.createElement('div');
  rootWrap.className = 'tree-root';

  const title = document.createElement('div');
  title.className = 'tree-title';
  title.innerHTML = `<span class="tree-drive">C:</span> <span class="tree-hint">volume OS</span>`;
  rootWrap.appendChild(title);

  const rootNode = fs.root;
  const body = document.createElement('div');
  body.className = 'tree-body';
  renderNode(body, rootNode, fs, '', true, flashPaths, selectedPath);
  rootWrap.appendChild(body);
  container.appendChild(rootWrap);
}

/**
 * @param {HTMLElement} parent
 * @param {VfsNode} node
 * @param {import('./vfs.js').VirtualFileSystem} fs
 * @param {string} path
 * @param {boolean} isRoot
 * @param {Set<string>} flashPaths
 * @param {string | null} selectedPath
 */
function renderNode(parent, node, fs, path, isRoot, flashPaths, selectedPath) {
  const currentPath = isRoot ? 'C:\\' : path;
  const children = [...(node.children?.values() || [])].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  children.forEach((child, index) => {
    const childPath =
      currentPath === 'C:\\' ? 'C:\\' + child.name : currentPath + '\\' + child.name;
    const isLast = index === children.length - 1;
    const row = document.createElement('div');
    row.className = 'tree-row';
    row.dataset.path = childPath;

    const isCwd = childPath.toLowerCase() === fs.cwd.toLowerCase();
    const isAncestor =
      fs.cwd.toLowerCase().startsWith(childPath.toLowerCase() + '\\') ||
      childPath.toLowerCase() + '\\' === fs.cwd.toLowerCase().slice(0, childPath.length + 1);
    const isSelected = selectedPath && selectedPath.toLowerCase() === childPath.toLowerCase();

    if (isCwd) row.classList.add('is-cwd');
    if (isAncestor && child.type === 'dir') row.classList.add('is-ancestor');
    if (isSelected) row.classList.add('is-selected');
    if (flashPaths.has(childPath) || flashPaths.has(childPath.toLowerCase())) {
      row.classList.add('is-flash');
    }

    // connector glyphs
    const guide = document.createElement('span');
    guide.className = 'tree-guide';
    guide.textContent = isLast ? '└─ ' : '├─ ';
    row.appendChild(guide);

    const icon = document.createElement('span');
    icon.className = child.type === 'dir' ? 'tree-icon dir' : 'tree-icon file';
    icon.textContent = child.type === 'dir' ? '■' : '▪';
    row.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'tree-label' + (child.type === 'dir' ? ' dir' : ' file');
    label.textContent = child.name;
    row.appendChild(label);

    if (child.type === 'file') {
      const meta = document.createElement('span');
      meta.className = 'tree-meta';
      const size = child.content ? String(child.content.length) + ' B' : '0 B';
      meta.textContent = size;
      row.appendChild(meta);
    }

    if (isCwd) {
      const badge = document.createElement('span');
      badge.className = 'tree-cwd-badge';
      badge.textContent = 'cwd';
      row.appendChild(badge);
    }

    parent.appendChild(row);

    if (child.type === 'dir' && child.children && child.children.size > 0) {
      const sub = document.createElement('div');
      sub.className = 'tree-children';
      parent.appendChild(sub);
      renderNode(sub, child, fs, childPath, false, flashPaths, selectedPath);
    } else if (child.type === 'dir') {
      const empty = document.createElement('div');
      empty.className = 'tree-children tree-empty';
      empty.innerHTML = `<span class="tree-guide">   </span><span class="tree-empty-label">(empty)</span>`;
      parent.appendChild(empty);
    }
  });

  if (children.length === 0 && isRoot) {
    const empty = document.createElement('div');
    empty.className = 'tree-empty-label';
    empty.textContent = '(empty drive)';
    parent.appendChild(empty);
  }
}

/**
 * Diff two serialized trees and return paths that appeared in `next`.
 *
 * @param {Record<string, unknown>} prev
 * @param {Record<string, unknown>} next
 * @returns {Set<string>}
 */
export function diffNewPaths(prev, next) {
  /** @param {Record<string, unknown>} spec @param {string} prefix @returns {Map<string, string>} */
  const flat = (spec, prefix) => {
    /** @type {Map<string, string>} */
    const map = new Map();
    for (const [name, value] of Object.entries(spec)) {
      const path = prefix ? prefix + '\\' + name : name;
      map.set(path.toLowerCase(), typeof value === 'string' ? 'file' : 'dir');
      if (typeof value === 'object' && value) {
        for (const [k, v] of flat(/** @type {Record<string, unknown>} */ (value), path)) {
          map.set(k, v);
        }
      }
    }
    return map;
  };
  const a = flat(prev, '');
  const b = flat(next, '');
  const added = new Set();
  for (const [key, val] of b) {
    if (!a.has(key) || a.get(key) !== val) {
      // recover original casing from next tree walk
      added.add(key);
    }
  }
  // Also produce display-case paths
  /** @type {Set<string>} */
  const display = new Set();
  /** @param {Record<string, unknown>} spec @param {string} prefix */
  const walk = (spec, prefix) => {
    for (const [name, value] of Object.entries(spec)) {
      const path = prefix ? prefix + '\\' + name : name;
      if (added.has(path.toLowerCase())) display.add(path);
      if (typeof value === 'object' && value) {
        walk(/** @type {Record<string, unknown>} */ (value), path);
      }
    }
  };
  walk(next, '');
  return display;
}
