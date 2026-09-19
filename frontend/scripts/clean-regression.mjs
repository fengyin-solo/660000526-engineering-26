#!/usr/bin/env node
/**
 * 清理回归临时产物：regression/.artifacts（报告、失败清单、vitest 缓存）。
 *   npm run regression:clean
 */
import { rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = resolve(root, 'regression/.artifacts');

if (existsSync(artifacts)) {
  rmSync(artifacts, { recursive: true, force: true });
  console.log(`已清理临时产物：${artifacts}`);
} else {
  console.log('无临时产物可清理。');
}
