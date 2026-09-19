# 链表题展示回归（两数相加 / 合并K个升序链表）

把题目展示校验串成可重复的自动化流程。**不改动任何现有页面组件和业务代码**，运行后给出记录级结果，失败可定位到「链表节点 + 页面」。

## 使用方式

```bash
cd frontend

npm run regression            # 全量执行所有记录级校验
npm run regression:failed     # 修正后只执行上一次失败的记录
npm run regression:typecheck  # 回归代码类型检查
npm run regression:clean      # 清理临时产物（报告 / 失败清单 / 缓存）
```

退出码透传测试结果（失败为非 0），可直接接入 CI。

## 记录级结果与定位

每条校验有稳定记录 ID：

```
[页面]:[题目slug]:[分组]:[序号]
```

- 页面：`bank`（题库管理页 `/problem-bank`）、`interviewer-room`（面试官房间页）、`candidate-room`（候选人房间页）、`seed-mock`（前端种子数据）、`seed-backend`（后端 `DataInitializer`）、`semantics`（语义参考实现）
- 分组：`example`（示例展示）/ `testcase`（测试用例）/ `boundary`（边界）

示例失败输出：

```
✗ interviewer-room:add-two-numbers:boundary:3
  页面: 面试官房间页 /room/:roomId/interviewer
  原因: 节点 #7（第8个节点）值不一致：期望 2，实际 1
```

逐节点比对逻辑见 `lib/linkedList.ts` 的 `diffListNodes`，区分「节点值不一致 / 节点缺失 / 节点多余」并给出下标与链表长度。

## 失败重跑流程

1. `npm run regression` 全量跑，失败 RID 写入 `.artifacts/failed-rids.json`；
2. 修正后执行 `npm run regression:failed`，只跑清单内记录，其余记录沿用上一次结果（报告中标记 `[沿用上次]`）；
3. 失败清零后清单自动清空；再跑 `:failed` 会提示「上次没有失败记录」。

## 产物（可一键清理）

均位于 `regression/.artifacts/`（已在 `.gitignore` 忽略）：

- `report.json`：全部记录的结构化结果（页面、路由、状态、耗时、错误摘要）
- `report.txt`：按页面分组的可读报告
- `failed-rids.json`：失败 RID 清单

## 覆盖范围

- 空值：空链表、链表数组为空、数组中混有空链表、两条均空
- 超长文本：两数相加各 10000 节点（含最高位进位）、合并 K 共 10000 节点、约 20KB 说明文本
- 边界：单节点进位、长度不一致、重复值稳定合并
- 每个页面（面试官 / 候选人）独立注册记录，展示问题能区分是哪一个页面
- 前后端两份种子数据逐条、逐节点与同一基准比对
- 语义参考实现与手算硬编码期望交叉验证，避免「期望本身写错」被放过

## 目录结构

```
regression/
  fixtures/listCases.ts     记录基准（标准/空值/超长/边界，single source of truth）
  lib/linkedList.ts         链表参考实现 + 节点级 diff + 文本解析
  lib/constants.ts          页面/产物常量
  lib/recordTest.ts         RID 注册 + 失败项过滤
  lib/regressionReporter.ts 记录级报告 / 失败清单 / 历史结果合并
  suites/                   semantics / seedMock / seedBackend / displayPanel / displayBankPage
scripts/run-regression.mjs      全量 / 失败重跑入口
scripts/clean-regression.mjs   产物清理
vitest.config.ts            独立测试配置（不影响 vite.config.ts 与 dev/build）
```
