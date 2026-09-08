export interface PageLoaderProps {
  /** When true, fades the whole overlay out (see App.tsx's exit timer). */
  isExiting?: boolean;
}

// Full-screen overlay shown until the app's first-load data (auth,
// categories, posts) has settled AND a minimum display time has elapsed
// (both gated in App.tsx) — a glowing neon ring, pure CSS (see
// .glow-ring-* in index.css), no external assets or WebGL needed.
export function PageLoader({ isExiting = false }: PageLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-bg transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="glow-ring-wrap">
        <div className="glow-ring-halo" />
        <div className="glow-ring-track" />
        <div className="glow-ring-sweep" />
      </div>
    </div>
  );
}
