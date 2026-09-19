import { describe } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SEED_LIST_RECORDS, DISPLAY_EXAMPLES, PROBLEM_META, type ProblemSlug } from '../fixtures/listCases';
import { parseListText, parseAddTwoInput, parseMergeKInput, diffListNodes } from '../lib/linkedList';
import { recordTest, expect } from '../lib/recordTest';

/**
 * seed-backend 页面对应后端数据源 DataInitializer.java。
 * 不启动 Spring，直接解析 Java 源文件里的字符串字面量，
 * 保证后端种子与基准记录逐条、逐节点一致（含 \n / \" 等转义）。
 */

interface JavaExample { input: string; output: string; explanation: string }
interface JavaTestCase { input: string; expectedOutput: string; hidden: boolean }

function unescapeJavaString(literal: string): string {
  return literal
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/** 匹配 "..."（支持 \" 与 \\ 转义） */
const JAVA_STRING = '"((?:\\\\.|[^"\\\\])*)"';

function extractBlocks(source: string): Map<string, { examples: JavaExample[]; testCases: JavaTestCase[] }> {
  const result = new Map<string, { examples: JavaExample[]; testCases: JavaTestCase[] }>();
  // 按 Problem pN = new Problem(); 切块
  const blocks = source.split(/new Problem\(\);/).slice(1);
  for (const block of blocks) {
    const titleMatch = block.match(/setTitle\("((?:\\.|[^"\\])*)"\)/);
    if (!titleMatch) continue;
    const title = unescapeJavaString(titleMatch[1]);

    const examples: JavaExample[] = [];
    const exampleRe = new RegExp(`new ExampleExample\\(\\s*${JAVA_STRING}\\s*,\\s*${JAVA_STRING}\\s*,\\s*${JAVA_STRING}\\s*\\)`, 'g');
    let m: RegExpExecArray | null;
    while ((m = exampleRe.exec(block))) {
      examples.push({
        input: unescapeJavaString(m[1]),
        output: unescapeJavaString(m[2]),
        explanation: unescapeJavaString(m[3]),
      });
    }

    const testCases: JavaTestCase[] = [];
    const tcRe = new RegExp(`new TestCaseExample\\(\\s*${JAVA_STRING}\\s*,\\s*${JAVA_STRING}\\s*,\\s*(true|false)\\s*\\)`, 'g');
    while ((m = tcRe.exec(block))) {
      testCases.push({
        input: unescapeJavaString(m[1]),
        expectedOutput: unescapeJavaString(m[2]),
        hidden: m[3] === 'true',
      });
    }
    result.set(title, { examples, testCases });
  }
  return result;
}

const javaPath = resolve(__dirname, '../../../backend/src/main/java/com/codeinterview/config/DataInitializer.java');
const source = readFileSync(javaPath, 'utf8');
const blocks = extractBlocks(source);

describe('后端种子数据(DataInitializer)回归', () => {
  for (const slug of ['add-two-numbers', 'merge-k-lists'] as ProblemSlug[]) {
    const title = PROBLEM_META[slug].title;
    const block = blocks.get(title);

    recordTest(`seed-backend:${slug}:meta:title`, `后端存在题目「${title}」初始化块`, () => {
      expect(block, `未在 DataInitializer.java 中找到 setTitle("${title}")`).toBeTruthy();
    });
    if (!block) return;

    const seedRecords = SEED_LIST_RECORDS.filter(r => r.slug === slug);
    recordTest(`seed-backend:${slug}:testcase:count`, `测试用例数量应为 ${seedRecords.length}`, () => {
      expect(block.testCases.length).toBe(seedRecords.length);
    });

    seedRecords.forEach((rec, i) => {
      recordTest(`seed-backend:${slug}:testcase:${rec.seq}`, `用例#${i + 1} 输入/期望/隐藏标记`, () => {
        const tc = block.testCases[i];
        expect(tc, `缺少第 ${i + 1} 条测试用例`).toBeTruthy();
        expect(tc.input).toBe(rec.input);
        expect(tc.expectedOutput).toBe(rec.expectedText);
        expect(tc.hidden).toBe(rec.hidden ?? false);

        if (slug === 'add-two-numbers') {
          const { l1, l2 } = parseAddTwoInput(tc.input);
          expect(l1).toEqual(rec.l1 ?? null);
          expect(l2).toEqual(rec.l2 ?? null);
        } else {
          expect(parseMergeKInput(tc.input)).toEqual(rec.lists ?? []);
        }
        const mismatch = diffListNodes(rec.expected, parseListText(tc.expectedOutput));
        expect(mismatch, mismatch?.message).toBeNull();
      });
    });

    const examples = DISPLAY_EXAMPLES.filter(e => e.slug === slug && e.seq < 100);
    recordTest(`seed-backend:${slug}:example:count`, `示例数量应为 ${examples.length}`, () => {
      expect(block.examples.length).toBe(examples.length);
    });

    examples.forEach(ex => {
      recordTest(`seed-backend:${slug}:example:${ex.seq}`, `示例 ${ex.seq} 输入/输出/说明文本`, () => {
        const shown = block.examples.find(e => e.input === ex.input);
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
