/**
 * 记录级回归共享常量与类型（不依赖 vitest，Reporter 在 Node 主上下文也可安全引入）。
 */

export const ARTIFACTS_DIR = 'regression/.artifacts';
export const REPORT_JSON = `${ARTIFACTS_DIR}/report.json`;
export const REPORT_TXT = `${ARTIFACTS_DIR}/report.txt`;
export const FAILED_RIDS = `${ARTIFACTS_DIR}/failed-rids.json`;

export type PageKey =
  | 'bank'
  | 'interviewer-room'
  | 'candidate-room'
  | 'seed-mock'
  | 'seed-backend'
  | 'semantics';

export const PAGE_LABEL: Record<PageKey, { label: string; route: string }> = {
  'bank': { label: '题库管理页', route: '/problem-bank' },
  'interviewer-room': { label: '面试官房间页', route: '/room/:roomId/interviewer' },
  'candidate-room': { label: '候选人房间页', route: '/room/:roomId/candidate' },
  'seed-mock': { label: '前端种子数据(mockProblemService)', route: 'src/services/mockProblemService.ts' },
  'seed-backend': { label: '后端种子数据(DataInitializer)', route: 'backend/src/main/java/com/codeinterview/config/DataInitializer.java' },
  'semantics': { label: '链表语义参考实现', route: 'regression/lib/linkedList.ts' },
};
