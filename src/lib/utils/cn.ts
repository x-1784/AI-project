export type ClassValue = string | false | null | undefined;

/**
 * 拼接类名的轻量实现。
 *
 * 项目暂不引入 clsx / tailwind-merge：组件变体顺序固定，只有调用方传入的
 * className 可能与变体冲突；等真的需要按属性合并时再评估依赖。
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
