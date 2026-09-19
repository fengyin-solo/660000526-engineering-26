/**
 * 记录级回归 Reporter：
 *  输出 regression/.artifacts/ 下：
 *   - report.json       全量记录结果（含页面/路由定位、错误摘要）
 *   - report.txt        按页面分组的可读报告（失败含节点定位信息）
 *   - failed-rids.json  失败 RID 清单（供 npm run regression:failed 重跑）
 * 失败重跑模式下，未执行（skip）的记录沿用上一次结果。
 */
import type { Reporter, File as VitestFile } from 'vitest';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { ARTIFACTS_DIR, REPORT_JSON, REPORT_TXT, FAILED_RIDS, PAGE_LABEL, type PageKey } from './constants';

type Status = 'passed' | 'failed' | 'skipped';

interface RecordResult {
  rid: string;
  page: string;
  pageLabel: string;
  route: string;
  slug: string;
  group: string;
  seq: string;
  name: string;
  status: Status;
  durationMs: number;
  inherited?: boolean;
  error?: string;
}

const RID_RE = /\[RID=([^\]]+)]/;

const clip = (s: string, max = 600) => {
  const flat = s.replace(/\s+$/g, '');
  return flat.length > max ? flat.slice(0, max) + ` …(截断，共 ${flat.length} 字符)` : flat;
};

interface WalkableTask {
  type: string;
  name: string;
  tasks?: WalkableTask[];
  result?: { state?: string; duration?: number; errors?: { message?: string; stack?: string }[] };
}

function walk(task: WalkableTask, cb: (t: WalkableTask) => void) {
  if (task.type === 'test') {
    cb(task);
    return;
  }
  task.tasks?.forEach(child => walk(child, cb));
}

function tryReadPrevious(): { records: RecordResult[] } | null {
  try {
    return JSON.parse(readFileSync(REPORT_JSON, 'utf8')) as { records: RecordResult[] };
  } catch {
    return null;
  }
}

const pageOrder: PageKey[] = [
  'bank',
  'interviewer-room',
  'candidate-room',
  'seed-mock',
  'seed-backend',
  'semantics',
];

export default class RegressionReporter implements Reporter {
  onFinished(files: VitestFile[] | undefined) {
    const rerunMode = process.env.REGRESSION_ONLY_FAILED === '1';
    const previous = rerunMode ? tryReadPrevious() : null;
    const prevByRid = new Map(previous?.records.map(r => [r.rid, r]) ?? []);

    const records: RecordResult[] = [];
    const executedRids = new Set<string>();

    for (const file of files ?? []) {
      if (!file.tasks) continue;
      walk(file as unknown as WalkableTask, task => {
        const m = RID_RE.exec(task.name);
        if (!m) return;
        const rid = m[1];
        const state = task.result?.state;
        const status: Status = state === 'pass' ? 'passed' : state === 'fail' ? 'failed' : 'skipped';
        const [page, slug, group, ...rest] = rid.split(':');
        const seq = rest.join(':');
        const meta = PAGE_LABEL[page as PageKey];

        if (status !== 'skipped') executedRids.add(rid);

        let record: RecordResult = {
          rid,
          page,
          pageLabel: meta?.label ?? page,
          route: meta?.route ?? '-',
          slug,
          group,
          seq,
          name: task.name.replace(RID_RE, '').trim(),
          status,
          durationMs: Math.round(task.result?.duration ?? 0),
        };

        if (status === 'failed') {
          const err = task.result?.errors?.[0];
          const message = err?.message ?? err?.stack ?? String(err ?? '断言失败');
          record.error = clip(message.split('\n').slice(0, 6).join('\n'));
        }

        // 失败重跑：未执行的记录（上次通过的）沿用历史结果
        if (status === 'skipped' && rerunMode) {
          const prev = prevByRid.get(rid);
          if (prev) record = { ...prev, inherited: true };
        }

        records.push(record);
      });
    }

    // 双保险：补入本次未覆盖但历史报告里存在的记录
    if (rerunMode) {
      for (const prev of previous?.records ?? []) {
        if (!records.some(r => r.rid === prev.rid)) {
          records.push({ ...prev, inherited: true });
        }
      }
    }

    records.sort((a, b) => {
      const pi = pageOrder.indexOf(a.page as PageKey);
      const pj = pageOrder.indexOf(b.page as PageKey);
      return (pi === -1 ? 99 : pi) - (pj === -1 ? 99 : pj)
        || a.slug.localeCompare(b.slug)
        || a.group.localeCompare(b.group)
        || Number(a.seq) - Number(b.seq)
        || a.rid.localeCompare(b.rid);
    });

    const passed = records.filter(r => r.status === 'passed').length;
    const failed = records.filter(r => r.status === 'failed');
    const skipped = records.filter(r => r.status === 'skipped' && !r.inherited).length;
    const inherited = records.filter(r => r.inherited).length;

    const report = {
      runAt: new Date().toISOString(),
      mode: rerunMode ? 'failed-only' : 'full',
      counts: {
        total: records.length,
        passed,
        failed: failed.length,
        skipped,
        inheritedFromPreviousRun: inherited,
        executedThisRun: executedRids.size,
      },
      records,
    };

    mkdirSync(ARTIFACTS_DIR, { recursive: true });
    writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(
      FAILED_RIDS,
      JSON.stringify({ generatedAt: report.runAt, rids: failed.map(r => r.rid) }, null, 2),
      'utf8',
    );

    // ---- 可读报告 ----
    const lines: string[] = [];
    lines.push('链表题展示回归报告');
    lines.push(`运行时间: ${report.runAt}    模式: ${report.mode}`);
    lines.push(`总计 ${records.length} 条 | 通过 ${passed} | 失败 ${failed.length} | 本次执行 ${executedRids.size} | 沿用历史 ${inherited} | 跳过 ${skipped}`);
    lines.push('='.repeat(80));

    const byPage = new Map<string, RecordResult[]>();
    for (const r of records) {
      const arr = byPage.get(r.pageLabel) ?? [];
      arr.push(r);
      byPage.set(r.pageLabel, arr);
    }
    for (const [pageLabel, arr] of byPage) {
      const route = arr[0]?.route ?? '';
      lines.push(`\n■ ${pageLabel}  (${route})`);
      for (const r of arr) {
        const icon = r.status === 'passed' ? '✓' : r.status === 'failed' ? '✗' : '⊘';
        const tag = r.inherited ? ' [沿用上次]' : '';
        lines.push(`  ${icon} ${r.rid}${tag}  ${r.status === 'failed' ? '' : r.name}`);
        if (r.status === 'failed') {
          lines.push(`      名称: ${r.name}`);
          lines.push(...(r.error ?? '断言失败').split('\n').map(l => `      ${l}`));
        }
      }
    }
    writeFileSync(REPORT_TXT, lines.join('\n') + '\n', 'utf8');

    // ---- 控制台摘要 ----
    const out = (s: string) => process.stdout.write(s + '\n');
    out('\n┌──────────────────────────────────────────────┐');
    out(`│ 记录总数 ${String(records.length).padEnd(4)}  通过 ${String(passed).padEnd(4)}  失败 ${String(failed.length).padEnd(4)}${rerunMode ? `  执行 ${executedRids.size}` : ''}`.padEnd(48) + '│');
    out('└──────────────────────────────────────────────┘');
    if (failed.length > 0) {
      out('\n失败记录（已定位到页面/节点）:');
      for (const r of failed) {
        out(`  ✗ ${r.rid}`);
        out(`    页面: ${r.pageLabel} ${r.route}`);
        const firstLine = (r.error ?? '').split('\n')[0];
        out(`    原因: ${firstLine}`);
      }
      out('\n修正后只重跑失败项:  npm run regression:failed');
      out(`详细报告: ${REPORT_TXT}`);
    } else if (rerunMode) {
      out('\n✓ 上次失败项已全部通过。');
    }
  }
}
