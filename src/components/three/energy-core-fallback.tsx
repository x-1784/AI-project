/**
 * 能量核心的静态回退。
 * WebGL 不可用、或 3D chunk 还在加载时显示它。
 * 轮廓与色调必须和 3D 主球保持一致，否则加载完成时会看到明显跳变。
 */
export function EnergyCoreFallback({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id="nx-fb-halo" cx="50%" cy="50%" r="50%">
          <stop offset="54%" stopColor="#4B8CFF" stopOpacity="0.26" />
          <stop offset="78%" stopColor="#8B5CF6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nx-fb-core" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#6FE3FF" stopOpacity="0.3" />
          <stop offset="38%" stopColor="#4B8CFF" stopOpacity="0.55" />
          <stop offset="72%" stopColor="#8B5CF6" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#0B1030" stopOpacity="0.92" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#nx-fb-halo)" />
      <circle cx="200" cy="200" r="132" fill="url(#nx-fb-core)" />
      <circle
        cx="200"
        cy="200"
        r="132"
        fill="none"
        stroke="#6FE3FF"
        strokeOpacity="0.16"
      />
    </svg>
  );
}
