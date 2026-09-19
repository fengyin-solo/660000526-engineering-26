import { describe } from 'vitest';
import { mockProblems } from '../../src/services/mockProblemService';
import { SEED_LIST_RECORDS, DISPLAY_EXAMPLES, PROBLEM_META, type ProblemSlug } from '../fixtures/listCases';
import { parseListText, parseAddTwoInput, parseMergeKInput, diffListNodes } from '../lib/linkedList';
import { recordTest, expect } from '../lib/recordTest';

/**
 * seed-mock 页面对应数据源 src/services/mockProblemService.ts
 * 逐条核对种子用例的 input / expectedOutput / hidden，并把期望输出解析为链表逐节点比对。
 */
describe('前端种子数据(mockProblemService)回归', () => {
  const bySlug = new Map<ProblemSlug, (typeof mockProblems)[number]>();
  for (const slug of Object.keys(PROBLEM_META) as ProblemSlug[]) {
    bySlug.set(slug, mockProblems.find(p => p.id === PROBLEM_META[slug].mockId)!);
  }

  for (const slug of ['add-two-numbers', 'merge-k-lists'] as ProblemSlug[]) {
    const problem = bySlug.get(slug)!;

    recordTest(`seed-mock:${slug}:meta:title`, `题目标题应为「${PROBLEM_META[slug].title}」`, () => {
      expect(problem.title).toBe(PROBLEM_META[slug].title);
    });

    // ---- 测试用例逐条 ----
    const seedRecords = SEED_LIST_RECORDS.filter(r => r.slug === slug);
    recordTest(`seed-mock:${slug}:testcase:count`, `测试用例数量应为 ${seedRecords.length}`, () => {
      expect(problem.testCases.length).toBe(seedRecords.length);
    });

    seedRecords.forEach((rec, i) => {
      recordTest(`seed-mock:${slug}:testcase:${rec.seq}`, `用例#${i + 1} 输入/期望/隐藏标记`, () => {
        const tc = problem.testCases[i];
        expect(tc, `缺少第 ${i + 1} 条测试用例`).toBeTruthy();
        expect(tc.input).toBe(rec.input);
        expect(tc.expectedOutput).toBe(rec.expectedText);
        expect(tc.hidden).toBe(rec.hidden ?? false);

        // 输入可解析，且与结构化基准一致
        if (slug === 'add-two-numbers') {
          const { l1, l2 } = parseAddTwoInput(tc.input);
          expect(l1).toEqual(rec.l1 ?? null);
          expect(l2).toEqual(rec.l2 ?? null);
        } else {
          expect(parseMergeKInput(tc.input)).toEqual(rec.lists ?? []);
        }

        // 期望输出逐节点
        const mismatch = diffListNodes(rec.expected, parseListText(tc.expectedOutput));
        expect(mismatch, mismatch?.message).toBeNull();
      });
    });

    // ---- 示例 ----
    const examples = DISPLAY_EXAMPLES.filter(e => e.slug === slug && e.seq < 100);
    recordTest(`seed-mock:${slug}:example:count`, `示例数量应为 ${examples.length}`, () => {
      expect(problem.examples.length).toBe(examples.length);
    });

    examples.forEach(ex => {
      recordTest(`seed-mock:${slug}:example:${ex.seq}`, `示例 ${ex.seq} 输入/输出/说明文本`, () => {
        const shown = problem.examples.find(e => e.input === ex.input);
        expect(shown, `缺少示例输入: ${ex.input}`).toBeTruthy();
        expect(shown!.output).toBe(ex.output);
        if (ex.outputAsList !== undefined) {
          const mismatch = diffListNodes(ex.outputAsList, parseListText(shown!.output));
          expect(mismatch, mismatch?.message).toBeNull();
        }
        expect(shown!.explanation).toBe(ex.explanation);
      });
    });
  }
});
