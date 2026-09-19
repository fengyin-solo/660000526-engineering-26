/**
 * 链表题展示回归 —— 基准记录（single source of truth）
 *
 * 记录 ID 规则：[页面]:[题目slug]:[分组]:[序号]
 *  - 页面：bank（题库页）、interviewer-room（面试官房间）、candidate-room（候选人房间）、
 * *        seed-mock（前端种子数据）、seed-backend（后端种子数据）、semantics（链表语义）
 *  - 分组：example（示例展示）/ testcase（测试用例）/ boundary（边界）
 *
 * 同一份语义基准同时用于：
 *  1. 校验种子数据（前端 mock / 后端 DataInitializer）逐条、逐节点正确
 *  2. 喂给 ProblemPanel / ProblemBankPage 做展示校验
 */

export type ProblemSlug = 'add-two-numbers' | 'merge-k-lists';

export type ListCaseKind =
  | 'seed-testcase'   // 与种子数据一致的标准用例
  | 'boundary';       // 空值 / 进位 / 超长 等边界用例

export interface ListRecord {
  /** 语义记录使用的序号（页面信息由 recordTest 在执行时拼前缀） */
  seq: number;
  slug: ProblemSlug;
  title: string;
  kind: ListCaseKind;
  /** 种子用例时的 hidden 标记，用于与种子数据逐字段比对 */
  hidden?: boolean;
  /** 展示用输入原文（换行分隔 l1/l2；合并K 为一行 JSON） */
  input: string;
  /** 结构化输入：两数相加为两条链表；合并 K 为链表数组；null 表示空链表 */
  l1?: (number | null)[] | null;
  l2?: (number | null)[] | null;
  lists?: ((number | null)[] | null)[] | null;
  /** 期望输出原文 */
  expectedText: string;
  /** 结构化期望节点（null 表示空链表） */
  expected: number[] | null;
  /** 失败定位时的人类可读说明 */
  note?: string;
}

export interface DisplayExample {
  seq: number;
  slug: ProblemSlug;
  input: string;
  output: string;
  explanation?: string;
  /** 输出可解析为链表时，逐节点比对；否则只做文本级比对 */
  outputAsList?: number[] | null;
  /** true 时 explanation 允许为空（空值展示场景） */
  explanationOptional?: boolean;
}

export const PROBLEM_META: Record<ProblemSlug, { title: string; mockId: string }> = {
  'add-two-numbers': { title: '两数相加', mockId: 'mock-4' },
  'merge-k-lists': { title: '合并K个升序链表', mockId: 'mock-5' },
};

/** 构造 n 个节点的全 9 链表 */
const nines = (n: number): number[] => Array<number>(n).fill(9);

// ---------------------------------------------------------------------------
// 两数相加：标准种子用例（与 DataInitializer / mockProblemService 保持一致）
// ---------------------------------------------------------------------------
const addSeedCases: ListRecord[] = [
  {
    seq: 1,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'seed-testcase',
    hidden: false,
    input: '[2,4,3]\n[5,6,4]',
    l1: [2, 4, 3],
    l2: [5, 6, 4],
    expectedText: '[7,0,8]',
    expected: [7, 0, 8],
    note: '342 + 465 = 807',
  },
  {
    seq: 2,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'seed-testcase',
    hidden: false,
    input: '[0]\n[0]',
    l1: [0],
    l2: [0],
    expectedText: '[0]',
    expected: [0],
  },
  {
    seq: 3,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'seed-testcase',
    hidden: true,
    input: '[9,9,9,9,9,9,9]\n[9,9,9,9]',
    l1: nines(7),
    l2: nines(4),
    expectedText: '[8,9,9,9,0,0,0,1]',
    expected: [8, 9, 9, 9, 0, 0, 0, 1],
    note: '长度不一致 + 最高位进位',
  },
];

// 边界：空值、单链为空、进位、超长（10000 节点）
const LONG_LEN = 10000;
const addBoundaryCases: ListRecord[] = [
  {
    seq: 101,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'boundary',
    input: '[1,2,3]\n[]',
    l1: [1, 2, 3],
    l2: null,
    expectedText: '[1,2,3]',
    expected: [1, 2, 3],
    note: '空值：l2 为空链表',
  },
  {
    seq: 102,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'boundary',
    input: '[]\n[4,5,6]',
    l1: null,
    l2: [4, 5, 6],
    expectedText: '[4,5,6]',
    expected: [4, 5, 6],
    note: '空值：l1 为空链表',
  },
  {
    seq: 103,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'boundary',
    input: '[]\n[]',
    l1: null,
    l2: null,
    expectedText: '[]',
    expected: null,
    note: '空值：两条均为空链表',
  },
  {
    seq: 104,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'boundary',
    input: '[9]\n[1]',
    l1: [9],
    l2: [1],
    expectedText: '[0,1]',
    expected: [0, 1],
    note: '边界：单节点进位产生新节点',
  },
  {
    seq: 105,
    slug: 'add-two-numbers',
    title: '两数相加',
    kind: 'boundary',
    // 超长文本：各 10000 个 9，和为 [8, 9*9999, 1]（共 10001 节点）
    input: `[${nines(LONG_LEN).join(',')}]\n[${nines(LONG_LEN).join(',')}]`,
    l1: nines(LONG_LEN),
    l2: nines(LONG_LEN),
    expectedText: `[${[8, ...nines(LONG_LEN - 1), 1].join(',')}]`,
    expected: [8, ...nines(LONG_LEN - 1), 1],
    note: `超长：各 ${LONG_LEN} 节点 + 最高位进位`,
  },
];

// ---------------------------------------------------------------------------
// 合并 K 个升序链表：标准种子用例
// ---------------------------------------------------------------------------
const mergeSeedCases: ListRecord[] = [
  {
    seq: 1,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'seed-testcase',
    hidden: false,
    input: '[[1,4,5],[1,3,4],[2,6]]',
    lists: [[1, 4, 5], [1, 3, 4], [2, 6]],
    expectedText: '[1,1,2,3,4,4,5,6]',
    expected: [1, 1, 2, 3, 4, 4, 5, 6],
  },
  {
    seq: 2,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'seed-testcase',
    hidden: false,
    input: '[]',
    lists: [],
    expectedText: '[]',
    expected: null,
    note: '空值：链表数组为空',
  },
  {
    seq: 3,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'seed-testcase',
    hidden: true,
    input: '[[]]',
    lists: [null],
    expectedText: '[]',
    expected: null,
    note: '空值：数组中只有一个空链表',
  },
  {
    seq: 4,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'seed-testcase',
    hidden: true,
    input: '[[1],[2],[3],[4],[5]]',
    lists: [[1], [2], [3], [4], [5]],
    expectedText: '[1,2,3,4,5]',
    expected: [1, 2, 3, 4, 5],
  },
];

const mergeBoundaryCases: ListRecord[] = [
  {
    seq: 101,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'boundary',
    input: '[[],[1,3],[],[2],[]]',
    lists: [null, [1, 3], null, [2], null],
    expectedText: '[1,2,3]',
    expected: [1, 2, 3],
    note: '空值：数组中混有多个空链表',
  },
  {
    seq: 102,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'boundary',
    input: '[[5,5,5],[1,1,1]]',
    lists: [[5, 5, 5], [1, 1, 1]],
    expectedText: '[1,1,1,5,5,5]',
    expected: [1, 1, 1, 5, 5, 5],
    note: '边界：重复值保持稳定合并',
  },
  {
    seq: 103,
    slug: 'merge-k-lists',
    title: '合并K个升序链表',
    kind: 'boundary',
    // 超长：100 条链表、每条 100 节点，合并后 10000 个 0..99 各重复 100 次
    input: `[${Array.from({ length: 100 }, () => `[${Array.from({ length: 100 }, (_, i) => i).join(',')}]`).join(',')}]`,
    lists: Array.from({ length: 100 }, () => Array.from({ length: 100 }, (_, i) => i)),
    expectedText: `[${Array.from({ length: 100 }, (_, v) => Array<number>(100).fill(v)).flat().join(',')}]`,
    expected: Array.from({ length: 100 }, (_, v) => Array<number>(100).fill(v)).flat(),
    note: '超长：100 条链表共 10000 节点',
  },
];

export const LIST_RECORDS: ListRecord[] = [
  ...addSeedCases,
  ...addBoundaryCases,
  ...mergeSeedCases,
  ...mergeBoundaryCases,
];

export const SEED_LIST_RECORDS = LIST_RECORDS.filter(r => r.kind === 'seed-testcase');

// ---------------------------------------------------------------------------
// 示例展示基准（ProblemPanel 的"示例"卡片）
// ---------------------------------------------------------------------------
export const DISPLAY_EXAMPLES: DisplayExample[] = [
  {
    seq: 1,
    slug: 'add-two-numbers',
    input: 'l1 = [2,4,3], l2 = [5,6,4]',
    output: '[7,0,8]',
    outputAsList: [7, 0, 8],
    explanation: '输入：l1 = [2,4,3], l2 = [5,6,4]\n输出：[7,0,8]\n解释：342 + 465 = 807.',
  },
  {
    seq: 1,
    slug: 'merge-k-lists',
    input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
    output: '[1,1,2,3,4,4,5,6]',
    outputAsList: [1, 1, 2, 3, 4, 4, 5, 6],
    explanation:
      '输入：lists = [[1,4,5],[1,3,4],[2,6]]\n输出：[1,1,2,3,4,4,5,6]\n解释：链表数组如下：\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\n将它们合并到一个有序链表中得到。\n1->1->2->3->4->4->5->6',
  },
  // 空值展示
  {
    seq: 201,
    slug: 'add-two-numbers',
    input: 'l1 = [], l2 = []',
    output: '[]',
    outputAsList: null,
    explanation: '',
    explanationOptional: true,
  },
  {
    seq: 201,
    slug: 'merge-k-lists',
    input: 'lists = [[]]',
    output: '[]',
    outputAsList: null,
    explanation: '',
    explanationOptional: true,
  },
  // 超长文本展示（说明文本约 20KB）
  {
    seq: 202,
    slug: 'add-two-numbers',
    input: `l1 = [${nines(2000).join(',')}], l2 = [${nines(2000).join(',')}]`,
    output: `[${[8, ...nines(1999), 1].join(',')}]`,
    outputAsList: [8, ...nines(1999), 1],
    explanation: '超长说明：' + '节点校验说明X'.repeat(2000),
  },
];

/** 由基准构造展示组件需要的最小 Problem 对象 */
export function buildProblem(
  slug: ProblemSlug,
  override: Partial<{
    id: string;
    description: string;
    examples: { input: string; output: string; explanation?: string }[];
    testCases: { input: string; expectedOutput: string; hidden: boolean }[];
  }> = {},
) {
  const meta = PROBLEM_META[slug];
  const seed = SEED_LIST_RECORDS.filter(r => r.slug === slug);
  return {
    id: override.id ?? meta.mockId,
    title: meta.title,
    difficulty: slug === 'add-two-numbers' ? ('medium' as const) : ('hard' as const),
    description: override.description ?? '回归校验用题目描述',
    examples: override.examples ?? DISPLAY_EXAMPLES.filter(e => e.slug === slug && e.seq < 100).map(e => ({
      input: e.input,
      output: e.output,
      explanation: e.explanation,
    })),
    testCases: override.testCases ?? seed.map(r => ({
      input: r.input,
      expectedOutput: r.expectedText,
      hidden: r.hidden ?? false,
    })),
    tags: slug === 'add-two-numbers' ? ['链表', '数学'] : ['链表', '分治'],
    timeLimit: 2000,
    memoryLimit: 256,
  };
}
