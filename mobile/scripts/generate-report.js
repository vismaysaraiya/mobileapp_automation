/**
 * Merges the full 110-case Testcases.xlsx catalog with curated scope/notes
 * (mobile/src/data/automationStatus.json) and the latest real pass/fail data
 * written by JsonResultsReporter (mobile/reports/results/*.json) into a single
 * self-contained HTML dashboard at mobile/reports/index.html.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const catalog = require(path.join(ROOT, 'mobile', 'src', 'data', 'testCaseCatalog.json'));
const automationStatus = require(path.join(ROOT, 'mobile', 'src', 'data', 'automationStatus.json'));
const resultsDir = path.join(ROOT, 'mobile', 'reports', 'results');

function loadLatestResultsByTcId() {
  const latest = {};
  if (!fs.existsSync(resultsDir)) return latest;
  for (const file of fs.readdirSync(resultsDir)) {
    if (!file.endsWith('.json')) continue;
    const entries = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
    for (const entry of entries) {
      if (!entry.tcId) continue;
      const existing = latest[entry.tcId];
      if (!existing || entry.timestamp > existing.timestamp) {
        latest[entry.tcId] = entry;
      }
    }
  }
  return latest;
}

function classify(tc, curated, result) {
  if (result?.state === 'passed') {
    return { key: 'pass', label: curated?.scope === 'partial' ? 'Partial Pass' : 'Pass' };
  }
  if (result?.state === 'failed') {
    return { key: 'failing', label: 'Failing' };
  }
  if (curated?.scope === 'deferred') {
    return { key: 'deferred', label: 'Deferred' };
  }
  if (curated) {
    // Curated entry exists but no run has recorded a result yet for it.
    return { key: 'deferred', label: 'Awaiting run' };
  }
  return { key: 'not-started', label: 'Not started' };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildRows() {
  const results = loadLatestResultsByTcId();
  return catalog.map((tc) => {
    const curated = automationStatus[tc.id];
    const result = results[tc.id];
    const status = classify(tc, curated, result);
    return {
      ...tc,
      status: status.key,
      statusLabel: status.label,
      note: curated?.note ?? '',
      specFile: curated?.specFile ?? '',
      lastRun: result?.timestamp ?? null,
    };
  });
}

function renderHtml(rows) {
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    { pass: 0, deferred: 0, failing: 0, 'not-started': 0 },
  );
  const generatedAt = new Date().toISOString();

  const rowsHtml = rows
    .map(
      (r) => `
        <tr data-status="${r.status}" data-search="${escapeHtml((r.id + ' ' + r.module + ' ' + r.description).toLowerCase())}">
          <td class="tc-id">${r.id}</td>
          <td class="tc-module">${escapeHtml(r.module)}</td>
          <td class="tc-desc">${escapeHtml(r.description)}</td>
          <td><span class="badge badge-${r.status}">${escapeHtml(r.statusLabel)}</span></td>
          <td class="tc-note">${escapeHtml(r.note) || '<span class="muted">&mdash;</span>'}</td>
          <td class="tc-spec">${r.specFile ? `<code>${escapeHtml(r.specFile)}</code>` : '<span class="muted">&mdash;</span>'}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>NMMT Mobile Automation Report</title>
<style>
  :root {
    --surface-1: #fcfcfb;
    --page-plane: #f9f9f7;
    --text-primary: #0b0b0b;
    --text-secondary: #52514e;
    --text-muted: #898781;
    --gridline: #e1e0d9;
    --border: rgba(11,11,11,0.10);
    --good: #0ca30c;
    --good-bg: #e7f7e7;
    --warning: #a3720c;
    --warning-bg: #fdf1d6;
    --critical: #d03b3b;
    --critical-bg: #fbe6e6;
    --neutral-bg: #eeede9;
    --series-1: #2a78d6;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --surface-1: #1a1a19;
      --page-plane: #0d0d0d;
      --text-primary: #ffffff;
      --text-secondary: #c3c2b7;
      --text-muted: #898781;
      --gridline: #2c2c2a;
      --border: rgba(255,255,255,0.10);
      --good: #199e70;
      --good-bg: rgba(25,158,112,0.16);
      --warning: #c98500;
      --warning-bg: rgba(201,133,0,0.16);
      --critical: #e66767;
      --critical-bg: rgba(230,103,103,0.16);
      --neutral-bg: rgba(255,255,255,0.08);
      --series-1: #3987e5;
    }
  }
  :root[data-theme="dark"] {
    --surface-1: #1a1a19; --page-plane: #0d0d0d; --text-primary: #ffffff; --text-secondary: #c3c2b7;
    --text-muted: #898781; --gridline: #2c2c2a; --border: rgba(255,255,255,0.10);
    --good: #199e70; --good-bg: rgba(25,158,112,0.16); --warning: #c98500; --warning-bg: rgba(201,133,0,0.16);
    --critical: #e66767; --critical-bg: rgba(230,103,103,0.16); --neutral-bg: rgba(255,255,255,0.08); --series-1: #3987e5;
  }
  :root[data-theme="light"] {
    --surface-1: #fcfcfb; --page-plane: #f9f9f7; --text-primary: #0b0b0b; --text-secondary: #52514e;
    --text-muted: #898781; --gridline: #e1e0d9; --border: rgba(11,11,11,0.10);
    --good: #0ca30c; --good-bg: #e7f7e7; --warning: #a3720c; --warning-bg: #fdf1d6;
    --critical: #d03b3b; --critical-bg: #fbe6e6; --neutral-bg: #eeede9; --series-1: #2a78d6;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: var(--page-plane);
    color: var(--text-primary);
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 40px 24px 80px; }
  header { margin-bottom: 32px; }
  h1 { font-size: 26px; font-weight: 700; margin: 0 0 6px; }
  .subtitle { color: var(--text-secondary); font-size: 14px; }
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin: 28px 0 32px;
  }
  .stat-tile {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
  }
  .stat-tile .value { font-size: 32px; font-weight: 700; line-height: 1.1; font-variant-numeric: proportional-nums; }
  .stat-tile .label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
  .stat-tile.total .value { color: var(--text-primary); }
  .stat-tile.pass .value { color: var(--good); }
  .stat-tile.deferred .value { color: var(--warning); }
  .stat-tile.failing .value { color: var(--critical); }
  .stat-tile.not-started .value { color: var(--text-muted); }
  .progress-track {
    height: 8px;
    border-radius: 999px;
    background: var(--neutral-bg);
    overflow: hidden;
    display: flex;
    margin-bottom: 32px;
  }
  .progress-seg.pass { background: var(--good); }
  .progress-seg.deferred { background: var(--warning); }
  .progress-seg.failing { background: var(--critical); }
  .controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .controls input[type="search"] {
    flex: 1;
    min-width: 200px;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface-1);
    color: var(--text-primary);
    font-size: 14px;
  }
  .filter-btn {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface-1);
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
  }
  .filter-btn.active { background: var(--series-1); color: white; border-color: var(--series-1); }
  table { width: 100%; border-collapse: collapse; background: var(--surface-1); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
  thead th {
    text-align: left;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-muted);
    padding: 12px 16px;
    border-bottom: 1px solid var(--gridline);
  }
  tbody td { padding: 12px 16px; border-bottom: 1px solid var(--gridline); font-size: 14px; vertical-align: top; }
  tbody tr:last-child td { border-bottom: none; }
  .tc-id { font-weight: 600; white-space: nowrap; }
  .tc-module { color: var(--text-secondary); white-space: nowrap; }
  .tc-desc { color: var(--text-primary); max-width: 320px; }
  .tc-note { color: var(--text-secondary); max-width: 320px; }
  .tc-spec code { font-size: 12px; color: var(--text-secondary); }
  .muted { color: var(--text-muted); }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .badge-pass { background: var(--good-bg); color: var(--good); }
  .badge-deferred { background: var(--warning-bg); color: var(--warning); }
  .badge-failing { background: var(--critical-bg); color: var(--critical); }
  .badge-not-started { background: var(--neutral-bg); color: var(--text-muted); }
  footer { margin-top: 24px; font-size: 12px; color: var(--text-muted); text-align: center; }
  tr[hidden] { display: none; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>NMMT Mobile Automation Report</h1>
    <div class="subtitle">आपली NMMT commuter app · Appium + WebdriverIO · generated ${generatedAt}</div>
  </header>

  <div class="stat-grid">
    <div class="stat-tile total"><div class="value">${rows.length}</div><div class="label">Total test cases</div></div>
    <div class="stat-tile pass"><div class="value">${counts.pass}</div><div class="label">Passing</div></div>
    <div class="stat-tile deferred"><div class="value">${counts.deferred}</div><div class="label">Deferred / awaiting run</div></div>
    <div class="stat-tile failing"><div class="value">${counts.failing}</div><div class="label">Failing</div></div>
    <div class="stat-tile not-started"><div class="value">${counts['not-started']}</div><div class="label">Not started</div></div>
  </div>

  <div class="progress-track">
    <div class="progress-seg pass" style="width:${(counts.pass / rows.length) * 100}%"></div>
    <div class="progress-seg deferred" style="width:${(counts.deferred / rows.length) * 100}%"></div>
    <div class="progress-seg failing" style="width:${(counts.failing / rows.length) * 100}%"></div>
  </div>

  <div class="controls">
    <input type="search" id="search" placeholder="Search by TC ID, module, or description…" />
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="pass">Passing</button>
    <button class="filter-btn" data-filter="deferred">Deferred</button>
    <button class="filter-btn" data-filter="failing">Failing</button>
    <button class="filter-btn" data-filter="not-started">Not started</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>TC ID</th>
        <th>Module</th>
        <th>Description</th>
        <th>Status</th>
        <th>Notes</th>
        <th>Spec file</th>
      </tr>
    </thead>
    <tbody id="rows">
      ${rowsHtml}
    </tbody>
  </table>

  <footer>Generated by mobile/scripts/generate-report.js</footer>
</div>
<script>
  const search = document.getElementById('search');
  const rows = Array.from(document.querySelectorAll('#rows tr'));
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  let activeFilter = 'all';

  function applyFilters() {
    const q = search.value.trim().toLowerCase();
    for (const row of rows) {
      const matchesFilter = activeFilter === 'all' || row.dataset.status === activeFilter;
      const matchesSearch = !q || row.dataset.search.includes(q);
      row.hidden = !(matchesFilter && matchesSearch);
    }
  }

  search.addEventListener('input', applyFilters);
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });
</script>
</body>
</html>`;
}

function main() {
  const rows = buildRows();
  const html = renderHtml(rows);
  const outDir = path.join(ROOT, 'mobile', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html);
  console.log(`Report written to ${outFile}`);
}

main();
