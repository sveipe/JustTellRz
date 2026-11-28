#!/usr/bin/env node
/**
 * Checks the docs/ Open Knowledge Format (OKF v0.3) bundle. Run: npm run docs:check
 * Spec: https://github.com/open-knowledge-format/open-knowledge-format
 *
 * Errors (exit code 1):
 *   - a concept page (any .md except index.md / log.md) without a YAML frontmatter mapping
 *     or without a non-empty `type`
 *   - frontmatter on a subdirectory index.md or on log.md
 *   - the root index.md not declaring okf_version "0.3"
 *   - an index bullet not in the form `* [Title](link) - description`
 *   - log.md headings not `## YYYY-MM-DD`, or not newest first
 *   - an internal link that doesn't resolve inside the bundle
 *   - a concept page missing from its folder's index.md, or a folder missing from its parent index
 * Warnings: a concept page without `title` or `description`.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'docs'));
const errors = [];
const warnings = [];

/** All .md files and directories under the bundle root, skipping dot-names (not part of a bundle). */
function walk(dir, files, dirs) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      dirs.push(full);
      walk(full, files, dirs);
    } else if (name.endsWith('.md')) {
      files.push(full);
    }
  }
}

function relPath(file) {
  return '/' + path.relative(root, file).split(path.sep).join('/');
}

/** Parses a leading `---` frontmatter block. Returns null when absent. */
function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end < 0) return { error: 'frontmatter has no closing ---' };
  try {
    const data = yaml.load(lines.slice(1, end).join('\n'), { schema: yaml.CORE_SCHEMA });
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { error: 'frontmatter is not a YAML mapping' };
    }
    return { data, body: lines.slice(end + 1).join('\n') };
  } catch (e) {
    return { error: `frontmatter YAML: ${e.message.split('\n')[0]}` };
  }
}

/** Resolves a markdown link target per OKF: `/` = bundle root, otherwise relative to the file. */
function resolveLink(file, target) {
  return target.startsWith('/') ? path.join(root, target) : path.join(path.dirname(file), target);
}

/** Targets of `* [Title](target) - …` bullets in an index.md, resolved to absolute paths. */
function indexTargets(indexFile) {
  if (!fs.existsSync(indexFile)) return null;
  const text = fs.readFileSync(indexFile, 'utf8');
  const targets = new Set();
  for (const m of text.matchAll(/^\* \[[^\]]+\]\(([^)\s]+)\)/gm)) {
    targets.add(path.normalize(resolveLink(indexFile, m[1].split('#')[0])).replace(/[\\/]$/, ''));
  }
  return targets;
}

if (!fs.existsSync(root)) {
  console.error(`No docs bundle at ${root}`);
  process.exit(1);
}

const files = [];
const dirs = [];
walk(root, files, dirs);
let concepts = 0;

for (const file of files) {
  const rel = relPath(file);
  const text = fs.readFileSync(file, 'utf8');
  const base = path.basename(file);
  const fm = parseFrontmatter(text);

  if (base === 'index.md') {
    const isRoot = path.dirname(file) === root;
    if (fm && fm.error) errors.push(`${rel}: ${fm.error}`);
    else if (fm && !isRoot) errors.push(`${rel}: only the root index.md may have frontmatter`);
    if (isRoot && (!fm || !fm.data || fm.data.okf_version !== '0.3')) {
      errors.push(`${rel}: root index.md must declare okf_version: "0.3" (quoted)`);
    }
    const body = fm && fm.body !== undefined ? fm.body : text;
    for (const line of body.split(/\r?\n/)) {
      if (line.startsWith('* ') && !/^\* \[[^\]]+\]\([^)\s]+\) - \S/.test(line)) {
        errors.push(`${rel}: index entry must be "* [Title](link) - description": ${line}`);
      }
    }
  } else if (base === 'log.md') {
    if (fm) errors.push(`${rel}: log.md must not have frontmatter`);
    const dates = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    for (const d of dates) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errors.push(`${rel}: log heading must be ## YYYY-MM-DD, got "${d}"`);
    }
    if (dates.join() !== [...dates].sort().reverse().join()) errors.push(`${rel}: log dates must be newest first`);
  } else {
    if (!fm) {
      errors.push(`${rel}: concept page needs YAML frontmatter with a type`);
      continue;
    }
    if (fm.error) {
      errors.push(`${rel}: ${fm.error}`);
      continue;
    }
    concepts++;
    if (typeof fm.data.type !== 'string' || !fm.data.type.trim()) errors.push(`${rel}: missing non-empty type`);
    if (!fm.data.title) warnings.push(`${rel}: no title`);
    if (!fm.data.description) warnings.push(`${rel}: no description`);
    const listed = indexTargets(path.join(path.dirname(file), 'index.md'));
    if (listed && !listed.has(path.normalize(file))) {
      errors.push(`${rel}: not listed in ${relPath(path.join(path.dirname(file), 'index.md'))}`);
    }
  }

  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // absolute URL or mailto:
    if (!fs.existsSync(resolveLink(file, target))) errors.push(`${rel}: broken link ${m[1]}`);
  }
}

for (const dir of dirs) {
  const listed = indexTargets(path.join(path.dirname(dir), 'index.md'));
  if (listed && !listed.has(path.normalize(dir))) {
    errors.push(`${relPath(dir)}/: folder not listed in ${relPath(path.join(path.dirname(dir), 'index.md'))}`);
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
console.log(`${files.length} markdown files, ${concepts} concepts, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
