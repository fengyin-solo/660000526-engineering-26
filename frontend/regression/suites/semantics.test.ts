import { describe } from 'vitest';
import { LIST_RECORDS } from '../fixtures/listCases';
import { addTwoNumbers, mergeKLists, diffListNodes } from '../lib/linkedList';
import { recordTest, expect } from '../lib/recordTest';

/**
 * 语义层：参考实现 vs 基准手算期望值，逐节点交叉验证。
 * 若参考实现与硬编码期望在某节点不一致，说明至少一方写错，必须人工裁决。
 */
describe('链表语义基准交叉校验', () => {
  for (const rec of LIST_RECORDS) {
    recordTest(
      `semantics:${rec.slug}:${rec.kind}:${rec.seq}`,
      `${rec.title} / ${rec.note ?? rec.input.slice(0, 40)}`,
      () => {
        const actual = rec.slug === 'add-two-numbers'
          ? addTwoNumbers(rec.l1 ?? null, rec.l2 ?? null)
          : mergeKLists(rec.lists ?? null);

        const mismatch = diffListNodes(rec.expected, actual);
        expect(mismatch, mismatch?.message).toBeNull();
      },
    );
  }
});
