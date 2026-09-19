import { describe, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProblemBankPage } from '../../src/components/ProblemBankPage';
import { SEED_LIST_RECORDS, buildProblem, PROBLEM_META, type ProblemSlug } from '../fixtures/listCases';
import { recordTest, expect } from '../lib/recordTest';

/**
 * bank 页面（路由 /problem-bank）列表卡片展示回归。
 * mock 掉 problemService 数据访问层，不触网、不依赖 localStorage 缓存状态。
 * 校验：链表题卡片存在、标题/难度、测试用例计数（种子记录数）。
 */

vi.mock('../../src/services/problemService', () => ({
  getProblems: vi.fn(async () => [
    buildProblem('add-two-numbers'),
    buildProblem('merge-k-lists'),
  ]),
  deleteProblem: vi.fn(async () => undefined),
  isUsingMockData: () => false,
}));

describe('题库管理页(/problem-bank)展示回归', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  for (const slug of ['add-two-numbers', 'merge-k-lists'] as ProblemSlug[]) {
    const seedRecords = SEED_LIST_RECORDS.filter(r => r.slug === slug);
    const meta = PROBLEM_META[slug];

    recordTest(`bank:${slug}:card:title`, `列表卡片渲染题目标题「${meta.title}」`, async () => {
      render(<ProblemBankPage />);
      const heading = await screen.findByRole('heading', { name: meta.title });
      expect(heading.textContent).toBe(meta.title);
    });

    recordTest(`bank:${slug}:card:testcase-count`, `卡片展示「${seedRecords.length} 个测试用例」`, async () => {
      render(<ProblemBankPage />);
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${seedRecords.length} 个测试用例`))).toBeTruthy();
      });
    });
  }
});
