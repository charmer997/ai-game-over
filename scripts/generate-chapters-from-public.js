#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

// Config
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'chapters');
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'chapters');
const VALID_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

function pad(num, size = 3) {
  return String(num).padStart(size, '0');
}

function extractNumberFromName(name) {
  // Return both numeric value (for sorting) and raw matched string (for id formatting)
  const m = name.match(/(\d+(?:\.\d+)?)/);
  if (!m) return { num: null, raw: null };
  const raw = m[1];
  const n = Number(raw);
  return { num: Number.isNaN(n) ? null : n, raw };
}

function naturalFileSort(a, b) {
  // try numeric prefix
  const na = a.match(/^(\d+)/);
  const nb = b.match(/^(\d+)/);
  if (na && nb) {
    return Number(na[1]) - Number(nb[1]);
  }
  if (na) return -1;
  if (nb) return 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function run(dryRun = false) {
  console.log(`Scanning: ${IMAGES_DIR}`);
  const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(d => d.name);
  if (dirs.length === 0) {
    console.log('No chapter folders found under public/images/chapters.');
    return;
  }

  // Map folders to numeric keys (if possible)
  const mapped = dirs.map(name => {
    const r = extractNumberFromName(name);
    return { name, num: r.num, raw: r.raw };
  });

  // Sort: numeric ascending if available, else by name
  mapped.sort((a, b) => {
    if (a.num != null && b.num != null) return a.num - b.num;
    if (a.num != null) return -1;
    if (b.num != null) return 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  await ensureDir(CONTENT_DIR);

  const today = new Date().toISOString().slice(0, 10);
  const created = [];
  const warnings = [];

  for (let i = 0; i < mapped.length; i++) {
    const folder = mapped[i];

    // Build chapter ID. If folder.raw contains a decimal like '20.2', produce chapter-020-2.
    let chapterId;
    if (folder.raw != null) {
      if (folder.raw.includes('.')) {
        const parts = folder.raw.split('.');
        const major = parseInt(parts[0], 10);
        const minor = parts.slice(1).join('-');
        chapterId = `chapter-${pad(major)}-${minor}`;
      } else {
        // integer numeric
        const major = parseInt(folder.raw, 10);
        chapterId = `chapter-${pad(major)}`;
      }
    } else {
      // No numeric part; fall back to sequential index
      const seq = i + 1;
      chapterId = `chapter-${pad(seq)}`;
      warnings.push(`Folder ${folder.name} has no numeric part; using sequential index ${seq} for id (${chapterId}).`);
    }

    const folderPath = path.join(IMAGES_DIR, folder.name);
    const files = await fs.readdir(folderPath);
    const images = files.filter(f => VALID_EXT.includes(path.extname(f).toLowerCase()))
      .sort(naturalFileSort);

    if (images.length === 0) {
      warnings.push(`跳过 ${folder.name}：没有发现图片文件`);
      continue;
    }

    const thumbCandidate = images.find(f => f.toLowerCase().startsWith('thumbnail')) || images[0];
    const pages = images.map(f => `/images/chapters/${folder.name}/${f}`);
    const thumbnail = `/images/chapters/${folder.name}/${thumbCandidate}`;

    const title = folder.name; // keep folder name as title (e.g., 第01话)

    const json = {
      id: chapterId,
      title: title,
      publishDate: today,
      description: '',
      thumbnail: thumbnail,
      pages: pages,
    };

    const outPath = path.join(CONTENT_DIR, `${chapterId}.json`);

    if (dryRun) {
      console.log(`[dry-run] would create: ${outPath} (pages: ${pages.length})`);
      created.push(outPath);
      continue;
    }

    await fs.writeFile(outPath, JSON.stringify(json, null, 2), 'utf8');
    created.push(outPath);
    console.log(`Created: ${outPath} (${pages.length} pages)`);
  }

  console.log('\nSummary:');
  console.log(`  folders scanned: ${mapped.length}`);
  console.log(`  files created: ${created.length}`);
  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log('  -', w));
  }
  console.log('\nDone.');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run') || args.includes('-n');
  run(dry).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { run };

