/**
 * 链表语义参考实现 + 节点级比较
 * 参考实现只用于校验基准期望值（期望值均已在 fixture 中手算硬编码，
 * 参考实现作为第二来源交叉验证，避免"期望写错"被放过）。
 */

export type ListNodeValue = number | null;

/** LeetCode 2：两数相加（逆序存储，逐位 + 进位） */
export function addTwoNumbers(l1: ListNodeValue[] | null, l2: ListNodeValue[] | null): number[] | null {
  const a = (l1 ?? []) as number[];
  const b = (l2 ?? []) as number[];
  if (a.length === 0 && b.length === 0) return null;

  const result: number[] = [];
  let carry = 0;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n || carry; i++) {
    const sum = (a[i] ?? 0) + (b[i] ?? 0) + carry;
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }
  return result;
}

/** LeetCode 23：合并 K 个升序链表（小顶堆思路的最小堆实现，稳定保留重复值） */
export function mergeKLists(lists: (ListNodeValue[] | null)[] | null): number[] | null {
  const nonEmpty = (lists ?? []).filter((l): l is number[] => !!l && l.length > 0);
  if (nonEmpty.length === 0) return null;

  // 最小堆，元素为 { listIndex, nodeIndex }
  const heap: { li: number; ni: number }[] = [];
  const valueAt = (h: { li: number; ni: number }) => nonEmpty[h.li][h.ni];

  const siftUp = (i: number) => {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (valueAt(heap[parent]) <= valueAt(heap[i])) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };
  const siftDown = (i: number) => {
    const size = heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < size && valueAt(heap[left]) < valueAt(heap[smallest])) smallest = left;
      if (right < size && valueAt(heap[right]) < valueAt(heap[smallest])) smallest = right;
      if (smallest === i) break;
      [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
      i = smallest;
    }
  };

  nonEmpty.forEach((_, li) => heap.push({ li, ni: 0 }));
  for (let i = heap.length - 1; i >= 0; i--) siftDown(i);

  const result: number[] = [];
  while (heap.length > 0) {
    const top = heap[0];
    result.push(valueAt(top));
    const next: { li: number; ni: number } = { li: top.li, ni: top.ni + 1 };
    if (next.ni < nonEmpty[next.li].length) {
      heap[0] = next;
    } else {
      heap[0] = heap[heap.length - 1];
      heap.pop();
    }
    if (heap.length > 0) siftDown(0);
  }
  return result;
}

export interface NodeMismatch {
  /** 从 0 开始的节点下标 */
  index: number;
  expected: number | null;
  actual: number | null;
  message: string;
}

/**
 * 逐节点比较两条链表，返回第一个不一致的节点。
 * null/[] 均代表空链表。返回 null 表示完全一致。
 */
export function diffListNodes(
  expected: number[] | null,
  actual: number[] | null,
): NodeMismatch | null {
  const exp = expected ?? [];
  const act = actual ?? [];
  const n = Math.max(exp.length, act.length);
  for (let i = 0; i < n; i++) {
    const e = i < exp.length ? exp[i] : null;
    const a = i < act.length ? act[i] : null;
    if (a === null && i >= act.length) {
      return {
        index: i,
        expected: e ?? null,
        actual: null,
        message: `节点 #${i}（第${i + 1}个节点）缺失：期望节点值 ${e}，实际链表到此结束（长度 ${act.length}）`,
      };
    }
    if (e === null && i >= exp.length) {
      return {
        index: i,
        expected: null,
        actual: a ?? null,
        message: `节点 #${i}（第${i + 1}个节点）多余：期望链表到此结束（长度 ${exp.length}），实际多出节点值 ${a}`,
      };
    }
    if (e !== a) {
      return {
        index: i,
        expected: e ?? null,
        actual: a ?? null,
        message: `节点 #${i}（第${i + 1}个节点）值不一致：期望 ${e}，实际 ${a}`,
      };
    }
  }
  return null;
}

/** 将 [7,0,8] 文本解析为节点数组；[] / 空串解析为空链表 null */
export function parseListText(text: string): number[] | null {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === '[]') return null;
  const match = trimmed.match(/^\[(.*)]$/s);
  if (!match) throw new Error(`无法解析为链表文本: ${JSON.stringify(text.slice(0, 80))}`);
  const body = match[1].trim();
  if (body === '') return null;
  return body.split(',').map(s => {
    const v = s.trim();
    if (!/^-?\d+$/.test(v)) throw new Error(`节点值不是整数: ${JSON.stringify(v)}`);
    return Number(v);
  });
}

/** 将两数相加的多行输入文本解析为两条链表 */
export function parseAddTwoInput(input: string): { l1: number[] | null; l2: number[] | null } {
  const lines = input.split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length !== 2) throw new Error(`两数相加输入应为 2 行，实际 ${lines.length} 行`);
  return { l1: parseListText(lines[0]), l2: parseListText(lines[1]) };
}

/** 将合并 K 的单行输入文本解析为链表数组 */
export function parseMergeKInput(input: string): (number[] | null)[] {
  const parsed = JSON.parse(input) as unknown;
  if (!Array.isArray(parsed)) throw new Error('合并K输入应为数组');
  return (parsed as unknown[]).map(item => {
    if (!Array.isArray(item)) throw new Error('合并K输入的每个元素应为链表数组');
    return item.length === 0 ? null : (item as number[]);
  });
}
