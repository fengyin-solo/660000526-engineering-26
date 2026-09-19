/**
 * 记录级回归核心：
 *  - 每条校验有稳定 RID（[页面]:[题目]:[分组]:[序号]）
 *  - REGRESSION_ONLY_FAILED=1 时，仅执行上次失败 RID，其余跳过
 *  - 自定义 reporter（regressionReporter.ts）从测试名中解析 RID 产出记录级结果
 */
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ARTIFACTS_DIR, REPORT_JSON, REPORT_TXT, FAILED_RIDS, PAGE_LABEL, type PageKey } from './constants';

export { ARTIFACTS_DIR, REPORT_JSON, REPORT_TXT, FAILED_RIDS, PAGE_LABEL };
export type { PageKey };

function loadFailedRids(): Set<string> | null {
  if (process.env.REGRESSION_ONLY_FAILED !== '1') return null;
  try {
    const raw = JSON.parse(readFileSync(FAILED_RIDS, 'utf8')) as { rids?: string[] };
    return new Set(raw.rids ?? []);
  } catch {
    return null; // 没有失败清单 = 没有可重跑项
  }
}

const failedFilter = loadFailedRids();

export function isRidAllowed(rid: string): boolean {
  if (failedFilter === null) return true;
  return failedFilter.has(rid);
}

/** 全量模式无清单时也要跑；失败重跑模式下无清单则全跳过 */
export const rerunMode = failedFilter !== null;
export const rerunRids = failedFilter;

export function makeRid(page: PageKey, slug: string, group: string, seq: number | string): string {
  return `${page}:${slug}:${group}:${seq}`;
}

/**
 * 注册一条记录级校验。
 * - 全量运行：执行全部 RID
 * - 失败重跑（REGRESSION_ONLY_FAILED=1）：只执行清单中的 RID，其余标记 skipped
 */
export function recordTest(
  rid: string,
  description: string,
  fn: () => void | Promise<void>,
) {
  const title = `[RID=${rid}] ${description}`;
  if (!isRidAllowed(rid)) {
    test.skip(title, () => {});
    return;
  }
  test(title, fn);
}

export { expect };
