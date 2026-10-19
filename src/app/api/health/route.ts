import { NextResponse } from "next/server";

import type { HealthCheckResponse } from "@/lib/ai/contracts";
import { getAiAvailability } from "@/lib/ai/service";

/**
 * GET /api/health
 *
 * 健康检查始终返回 200：`status` 表示应用本身是否可用，AI 是否配置由 `ai`
 * 字段单独表达。未配置 AI 时返回 503 会让部署平台误判整个应用不可用，
 * 也会把「配置缺失」和「服务故障」混为一谈。
 */
export function GET() {
  const body: HealthCheckResponse = {
    status: "ok",
    ai: getAiAvailability(),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    headers: {
      // 状态和 timestamp 必须来自本次请求，禁止浏览器或 CDN 复用旧响应。
      "Cache-Control": "no-store",
    },
  });
}
