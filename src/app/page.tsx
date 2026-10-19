import en from "../../messages/en.json";
import zh from "../../messages/zh-CN.json";

import { HomeHero } from "@/components/marketing/home-hero";

/**
 * 首页。
 * 语言切换暂由组件内状态实现（阶段 1 占位）；
 * C 接入 next-intl 后，本页会移到 src/app/[locale]/page.tsx，
 * 并把 messages 换成 useTranslations()，Hero 结构不变。
 */
export default function HomePage() {
  return <HomeHero messages={{ zh, en }} />;
}
