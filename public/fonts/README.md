# Self-hosted fonts

字体文件来自项目此前的素材分支，使用 SIL Open Font License 1.1。

| 文件 | 字体 | 许可 |
| --- | --- | --- |
| `space-grotesk-variable.woff2` | Space Grotesk Variable | SIL OFL 1.1 |
| `inter-variable.woff2` | Inter Variable | SIL OFL 1.1 |

- Space Grotesk: https://github.com/floriankarsten/space-grotesk
- Inter: https://github.com/rsms/inter
- License: https://openfontlicense.org/open-font-license-official-text/

由 `src/app/[locale]/layout.tsx` 通过 `next/font/local` 注册，避免运行时依赖
Google Fonts。
