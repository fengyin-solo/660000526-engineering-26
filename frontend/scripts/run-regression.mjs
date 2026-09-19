#!/usr/bin/env node
/**
 * 展示回归入口：
 *   npm run regression          全量执行记录级校验
 *   npm run regression:failed   只执行上一次失败的记录（REGRESSION_ONLY_FAILED=1）
 *
 * 产物：regression/.artifacts/{report.json,report.txt,failed-rids.json}
 * 退出码透传 vitest（失败=1），便于接入 CI。
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failedOnly = process.argv.includes('--failed');
const failedList = resolve(root, 'regression/.artifacts/failed-rids.json');

if (failedOnly) {
  if (!existsSync(failedList)) {
    console.error('没有找到失败记录清单（regression/.artifacts/failed-rids.json）。');
    console.error('请先运行全量回归：npm run regression');
    process.exit(2);
  }
  const { rids } = JSON.parse(readFileSync(failedList, 'utf8'));
  if (!Array.isArray(rids) || rids.length === 0) {
    console.log('✓ 上次没有失败记录，无需重跑。');
    process.exit(0);
  }
  console.log(`失败重跑模式：本次只执行 ${rids.length} 条失败记录\n`);
}

const bin = resolve(root, 'node_modules/vitest/vitest.mjs');
const args = ['run', '--config', 'vitest.config.ts'];
const child = spawn(process.execPath, [bin, ...args], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, ...(failedOnly ? { REGRESSION_ONLY_FAILED: '1' } : {}) },
});

child.on('exit', code => process.exit(code ?? 0));
