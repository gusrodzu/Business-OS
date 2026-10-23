import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync, appendFileSync} from 'node:fs';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const order = {critical:0,high:1,moderate:2,low:3,info:4};
const clean = value => String(value ?? '').replace(/[\r\n|]/g, ' ').slice(0,200);

function audit(args) {
  const result = spawnSync(npm, ['audit', '--json', ...args], {
    encoding:'utf8',
    maxBuffer:20 * 1024 * 1024,
    timeout:120_000,
  });
  if (result.error) throw result.error;
  let report;
  try { report = JSON.parse(result.stdout); }
  catch {
    throw new Error('npm audit did not return JSON: ' + String(result.stderr || result.stdout).slice(0,400));
  }
  if (!report.vulnerabilities || !report.metadata?.vulnerabilities) {
    throw new Error('npm audit returned an error instead of a vulnerability report: ' + JSON.stringify(report.error || report).slice(0,350));
  }
  return report;
}

function summarize(report) {
  const vulnerabilities = Object.entries(report.vulnerabilities).map(([name, entry]) => ({
    package: name,
    severity: entry.severity,
    direct: Boolean(entry.isDirect),
    range: entry.range,
    affectedNodes: entry.nodes?.length ?? 0,
    fix: entry.fixAvailable,
    advisories: (entry.via ?? []).filter(v => typeof v === 'object').map(v => ({
      title: v.title, url: v.url, severity: v.severity, range: v.range,
    })),
  })).sort((a,b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5) || a.package.localeCompare(b.package));
  return {counts:report.metadata.vulnerabilities, vulnerabilities};
}

const full = summarize(audit([]));
const production = summarize(audit(['--omit=dev']));
const output = {generatedAt:new Date().toISOString(), full, production};

mkdirSync('.qa-reports', {recursive:true});
writeFileSync('.qa-reports/dependencies-security.json', JSON.stringify(output,null,2) + '\n');
console.log('\nDEPENDENCY SECURITY AUDIT (report-only; does not upgrade packages)');
for (const [label, data] of [['ALL',full],['PRODUCTION',production]]) {
  console.log('\n' + label + ' ' + JSON.stringify(data.counts));
  for (const v of data.vulnerabilities) {
    const advisories = v.advisories.map(a => clean(a.title) + (a.url ? ' ' + a.url : '')).join('; ');
    console.log('[' + v.severity + '] ' + v.package + ' direct=' + v.direct + ' range=' + clean(v.range) + ' fix=' + JSON.stringify(v.fix) + (advisories ? ' | ' + advisories : ''));
  }
}
const danger = Number(production.counts.high || 0) + Number(production.counts.critical || 0);
if (danger) console.log('::warning::' + danger + ' HIGH/CRITICAL production dependency findings require remediation before production release.');

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = ['### Dependency security audit (report only)', '', '| Scope | Critical | High | Moderate | Low |', '|---|---:|---:|---:|---:|'];
  for (const [label, data] of [['All dependencies',full],['Production only',production]]) {
    const c = data.counts;
    lines.push('| ' + label + ' | ' + (c.critical || 0) + ' | ' + (c.high || 0) + ' | ' + (c.moderate || 0) + ' | ' + (c.low || 0) + ' |');
  }
  lines.push('', 'Full package-level report is in the workflow artifact. These findings are not cleared by a green CI result.');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n') + '\n');
}
