import { useEffect } from 'react';
import Lenis from 'lenis';

// Site-wide smooth (inertia) scrolling on the main window — MIT-licensed
// (https://github.com/darkroomengineering/lenis). Mounted once in Layout.tsx
// so it persists across route changes. Lenis only takes over the window's
// own scroll via native scrollTo calls driven by requestAnimationFrame — it
// doesn't touch nested `overflow-y-auto` containers (e.g. the chat widget's
// own message list) or affect position: fixed/sticky elements, so the
// navbar, bottom nav, and chat widget all keep working exactly as before.
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);
}
