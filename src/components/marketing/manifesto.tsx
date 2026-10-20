import { getTranslations } from "next-intl/server";

/**
 * 品牌宣言。构图依据 docs/design/HOME_IA.md §6.1：
 * 左 8 列一句大字，右 4 列三行态度短句。
 * 只用 nx-h2 不用 display 级字号——首屏才是视觉焦点，这里不该和它抢。
 */
export async function Manifesto() {
  const t = await getTranslations("Home");

  const points = [
    t("manifesto.point1"),
    t("manifesto.point2"),
    t("manifesto.point3"),
  ];

  return (
    <section
      aria-labelledby="manifesto-title"
      className="bg-nx-deep py-24 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-6">
        <h2
          id="manifesto-title"
          className="nx-h2 text-balance text-nx-ink lg:col-span-8"
        >
          {t("manifesto.title")}
        </h2>
        <ul className="flex flex-col gap-4 border-t border-nx-line-hair pt-6 text-ui text-nx-ink-3 lg:col-span-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
          {points.map((point) => (
            <li key={point} className="leading-relaxed">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
