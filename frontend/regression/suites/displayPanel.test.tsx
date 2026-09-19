import { describe } from 'vitest';
import { render } from '@testing-library/react';
import { ProblemPanel } from '../../src/components/ProblemPanel';
import {
  DISPLAY_EXAMPLES,
  LIST_RECORDS,
  buildProblem,
  type ProblemSlug,
} from '../fixtures/listCases';
import { parseListText, diffListNodes } from '../lib/linkedList';
import { recordTest, expect, type PageKey } from '../lib/recordTest';

/**
 * 展示校验：ProblemPanel 是「面试官房间页」与「候选人房间页」共用的题目面板。
 * 两个页面分别注册同一套记录，失败时 RID 直接给出页面与节点。
 * 覆盖：标准示例、空值（空链表）、超长文本（万节点 / 20KB 说明）、进位等边界。
 */

interface DisplayItem {
  slug: ProblemSlug;
  input: string;
  output: string;
  expectedNodes: number[] | null | undefined;
  explanation?: string;
  explanationOptional?: boolean;
}

// 示例卡片（含空值/超长说明）
const exampleItems: (DisplayItem & { seq: number })[] = DISPLAY_EXAMPLES.map(e => ({
  seq: e.seq,
  slug: e.slug,
  input: e.input,
  output: e.output,
  expectedNodes: e.outputAsList,
  explanation: e.explanation,
  explanationOptional: e.explanationOptional,
}));

// 全部语义记录（含边界）都作为展示输入喂给面板
const boundaryItems: (DisplayItem & { seq: number })[] = LIST_RECORDS.map(r => ({
  seq: r.seq,
  slug: r.slug,
  input: r.input,
  output: r.expectedText,
  expectedNodes: r.expected,
}));

function renderPanel(slug: ProblemSlug, item: DisplayItem) {
  const problem = buildProblem(slug, {
    examples: [{
      input: item.input,
      output: item.output,
      ...(item.explanation !== undefined ? { explanation: item.explanation } : {}),
    }],
  });
  return render(<ProblemPanel problem={problem} />);
}

const PAGES: { page: PageKey; label: string }[] = [
  { page: 'interviewer-room', label: '面试官房间页' },
  { page: 'candidate-room', label: '候选人房间页' },
];

describe('ProblemPanel 展示回归（两房间页）', () => {
  for (const { page, label } of PAGES) {
    // ---- 示例：输入/输出文本完整渲染 + 输出逐节点 ----
    for (const item of exampleItems) {
      recordTest(
        `${page}:${item.slug}:example:${item.seq}`,
        `${label} 示例#${item.seq} 输入/输出文本与链表节点`,
        () => {
          const { container } = renderPanel(item.slug, item);
          const pres = container.querySelectorAll('pre');
          expect(pres.length, '应渲染输入/输出两个 pre 块').toBeGreaterThanOrEqual(2);

          // 文本必须逐字符完整（超长文本不得被截断/丢字）
          expect(pres[0].textContent).toBe(item.input);
          expect(pres[1].textContent).toBe(item.output);

          if (item.expectedNodes !== undefined) {
            const mismatch = diffListNodes(item.expectedNodes ?? null, parseListText(pres[1].textContent ?? ''));
            expect(mismatch, mismatch?.message).toBeNull();
          }
        },
      );

      recordTest(
        `${page}:${item.slug}:explanation:${item.seq}`,
        `${label} 示例#${item.seq} 说明文本渲染`,
        () => {
          const { container } = renderPanel(item.slug, item);
          const rendered = container.textContent ?? '';
          if (item.explanation) {
            // 20KB 超长说明也要完整出现
            expect(rendered.includes(item.explanation), '说明文本未完整渲染').toBe(true);
          } else if (item.explanationOptional) {
            // 空说明：组件本就不渲染说明块，页面不得报错/出现 "undefined"
            expect(rendered.includes('undefined')).toBe(false);
          }
        },
      );
    }

    // ---- 边界数据（空值/进位/超长链表）展示 ----
    for (const item of boundaryItems) {
      recordTest(
        `${page}:${item.slug}:boundary:${item.seq}`,
        `${label} 边界数据#${item.seq} 展示与输出节点 (输入长度 ${item.input.length})`,
        () => {
          const { container } = renderPanel(item.slug, item);
          const pres = container.querySelectorAll('pre');
          expect(pres.length).toBeGreaterThanOrEqual(2);
          expect(pres[0].textContent).toBe(item.input);
          expect(pres[1].textContent).toBe(item.output);

          const mismatch = diffListNodes(
            item.expectedNodes ?? null,
            parseListText(pres[1].textContent ?? ''),
          );
          expect(mismatch, mismatch?.message).toBeNull();
        },
      );
    }
  }
});
