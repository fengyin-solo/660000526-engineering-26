import type { Problem, CreateProblemRequest, UpdateProblemRequest } from '../types';

const STORAGE_KEY = 'code_interview_problems';

// 导出供回归校验读取（页面运行时仍使用下方 loadFromStorage，不受影响）
export const mockProblems: Problem[] = [
  {
    id: 'mock-1',
    title: '两数之和',
    difficulty: 'easy',
    description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。你可以按任意顺序返回答案。',
    examples: [
      { input: '[2,7,11,15], target = 9', output: '[0,1]', explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1]' },
      { input: '[3,2,4], target = 6', output: '[1,2]', explanation: '因为 nums[1] + nums[2] == 6 ，返回 [1, 2]' },
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', hidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', hidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', hidden: true },
      { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', hidden: true },
    ],
    tags: ['数组', '哈希表'],
    timeLimit: 2000,
    memoryLimit: 256,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdBy: 'system',
  },
  {
    id: 'mock-2',
    title: '有效的括号',
    difficulty: 'easy',
    description: '给定一个只包括 \'(\', \')\', \'{\', \'}\', \'[\', \']\' 的字符串 s ，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合。左括号必须以正确的顺序闭合。每个右括号都有一个对应的相同类型的左括号。',
    examples: [
      { input: 's = "()"', output: 'true', explanation: '输入: "()"\n输出: true' },
      { input: 's = "()[]{}"', output: 'true', explanation: '输入: "()[]{}"\n输出: true' },
      { input: 's = "(]"', output: 'false', explanation: '输入: "(]"\n输出: false' },
    ],
    testCases: [
      { input: '"()"', expectedOutput: 'true', hidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', hidden: false },
      { input: '"(]"', expectedOutput: 'false', hidden: false },
      { input: '"([)]"', expectedOutput: 'false', hidden: true },
      { input: '"{[]}"', expectedOutput: 'true', hidden: true },
    ],
    tags: ['栈', '字符串'],
    timeLimit: 2000,
    memoryLimit: 256,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdBy: 'system',
  },
  {
    id: 'mock-3',
    title: '无重复字符的最长子串',
    difficulty: 'medium',
    description: '给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '输入: s = "abcabcbb"\n输出: 3 \n解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。' },
      { input: 's = "bbbbb"', output: '1', explanation: '输入: s = "bbbbb"\n输出: 1\n解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。' },
      { input: 's = "pwwkew"', output: '3', explanation: '输入: s = "pwwkew"\n输出: 3\n解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。' },
    ],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', hidden: false },
      { input: '"bbbbb"', expectedOutput: '1', hidden: false },
      { input: '"pwwkew"', expectedOutput: '3', hidden: false },
      { input: '""', expectedOutput: '0', hidden: true },
      { input: '"au"', expectedOutput: '2', hidden: true },
      { input: '"abba"', expectedOutput: '2', hidden: true },
    ],
    tags: ['字符串', '滑动窗口', '哈希表'],
    timeLimit: 2000,
    memoryLimit: 256,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdBy: 'system',
  },
  {
    id: 'mock-4',
    title: '两数相加',
    difficulty: 'medium',
    description: '给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。你可以假设除了数字 0 之外，这两个数都不会以 0 开头。',
    examples: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '输入：l1 = [2,4,3], l2 = [5,6,4]\n输出：[7,0,8]\n解释：342 + 465 = 807.' },
    ],
    testCases: [
      { input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]', hidden: false },
      { input: '[0]\n[0]', expectedOutput: '[0]', hidden: false },
      { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', expectedOutput: '[8,9,9,9,0,0,0,1]', hidden: true },
    ],
    tags: ['链表', '数学', '递归'],
    timeLimit: 2000,
    memoryLimit: 256,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: 'system',
  },
  {
    id: 'mock-5',
    title: '合并K个升序链表',
    difficulty: 'hard',
    description: '给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: '输入：lists = [[1,4,5],[1,3,4],[2,6]]\n输出：[1,1,2,3,4,4,5,6]\n解释：链表数组如下：\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\n将它们合并到一个有序链表中得到。\n1->1->2->3->4->4->5->6' },
    ],
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', hidden: false },
      { input: '[]', expectedOutput: '[]', hidden: false },
      { input: '[[]]', expectedOutput: '[]', hidden: true },
      { input: '[[1],[2],[3],[4],[5]]', expectedOutput: '[1,2,3,4,5]', hidden: true },
    ],
    tags: ['链表', '分治', '堆（优先队列）', '归并排序'],
    timeLimit: 2000,
    memoryLimit: 256,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'system',
  },
];

const loadFromStorage = (): Problem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load problems from storage:', e);
  }
  return [...mockProblems];
};

const saveToStorage = (problems: Problem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (e) {
    console.warn('Failed to save problems to storage:', e);
  }
};

let problemsCache: Problem[] | null = null;

const getProblemsCache = (): Problem[] => {
  if (!problemsCache) {
    problemsCache = loadFromStorage();
  }
  return problemsCache;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetProblems(params?: { difficulty?: string; tag?: string }): Promise<Problem[]> {
  await delay(300);
  let problems = getProblemsCache();

  if (params?.difficulty && params.difficulty !== 'all') {
    problems = problems.filter(p => p.difficulty === params.difficulty);
  }

  if (params?.tag) {
    problems = problems.filter(p => p.tags.includes(params.tag!));
  }

  return [...problems];
}

export async function mockGetProblemById(id: string): Promise<Problem> {
  await delay(200);
  const problems = getProblemsCache();
  const problem = problems.find(p => p.id === id);
  if (!problem) {
    throw new Error('题目不存在');
  }
  return { ...problem };
}

export async function mockCreateProblem(data: CreateProblemRequest): Promise<Problem> {
  await delay(500);
  const problems = getProblemsCache();
  const newProblem: Problem = {
    ...data,
    id: 'problem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current-user',
  };
  problemsCache = [newProblem, ...problems];
  saveToStorage(problemsCache);
  return { ...newProblem };
}

export async function mockUpdateProblem(id: string, data: UpdateProblemRequest): Promise<Problem> {
  await delay(500);
  const problems = getProblemsCache();
  const index = problems.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('题目不存在');
  }

  const updatedProblem: Problem = {
    ...problems[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  problemsCache = [...problems];
  problemsCache[index] = updatedProblem;
  saveToStorage(problemsCache);
  return { ...updatedProblem };
}

export async function mockDeleteProblem(id: string): Promise<void> {
  await delay(300);
  const problems = getProblemsCache();
  problemsCache = problems.filter(p => p.id !== id);
  saveToStorage(problemsCache);
}

export const resetMockData = () => {
  problemsCache = [...mockProblems];
  saveToStorage(problemsCache);
};
