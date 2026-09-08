import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from './components/ui/ToastContainer';
import { Layout } from './components/layout/Layout';
import { PageLoader } from './components/ui/PageLoader';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { EditorPage } from './pages/EditorPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { DashboardPage } from './pages/DashboardPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { useEffect, useState } from 'react';
import { checkAuth } from './features/auth/checkAuthSlice';
import ProtectedRoute from './pages/ProtectedRoute';
import PublicOnlyRoute from './pages/PublicOnlyRoute';
import AdminRoute from './pages/AdminRoute';
import { AdminPage } from './pages/AdminPage';
import { fetchCategories } from './features/categories/categoriesSlice';
import { getAllPosts } from './features/posts/createPostThunk';
import { getTopAuthors } from './features/users/usersSlice';

function App() {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((s) => s.auth.status);
  const categoriesStatus = useAppSelector((s) => s.categories.status);
  const postsStatus = useAppSelector((s) => s.posts.status);
  const homeFeedStatus = useAppSelector((s) => s.posts.homeFeedStatus);

  useEffect(() => {
    dispatch(checkAuth())
    dispatch(fetchCategories())
    dispatch(getAllPosts({ skip: 0 }))
    dispatch(getTopAuthors())
  }, [dispatch])

  // Gate the very first paint on auth + categories + the accumulated posts
  // list (used for the featured hero) always, and ALSO the numbered home
  // feed's first page — but only when that's actually the page being
  // landed on. HomePage is the only route that ever touches homeFeedStatus,
  // so gating on it unconditionally would mean the loader never clears on
  // a direct link to e.g. /post/:id or /dashboard, since nothing would ever
  // move it off 'idle'.
  const isHomeRoute = window.location.pathname === '/';
  const requiredStatuses = isHomeRoute
    ? [authStatus, categoriesStatus, postsStatus, homeFeedStatus]
    : [authStatus, categoriesStatus, postsStatus];
  const dataLoading = requiredStatuses.some((s) => s === 'idle' || s === 'loading');

  // The loader is deliberately kept on screen for at least MIN_DISPLAY_MS
  // even if the real data finishes loading faster than that — otherwise on
  // a fast connection it can flash for under 100ms, which reads as buggy
  // rather than intentional. minTimeElapsed only ever flips true once.
  const MIN_DISPLAY_MS = 2000;
  const FADE_MS = 500;
  // Safety net: whatever the cause (a stalled request, a status flag that
  // never settles), the loader must never hang indefinitely — force it
  // away after MAX_DISPLAY_MS no matter what dataLoading says.
  const MAX_DISPLAY_MS = 6000;
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [forceHide, setForceHide] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setForceHide(true), MAX_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  const readyToHide = (!dataLoading && minTimeElapsed) || forceHide;

  // Once both conditions are met, start the fade (readyToHide flips the
  // PageLoader's opacity to 0 via its isExiting prop), then unmount it
  // entirely after the fade finishes so its three.js scene gets torn down.
  useEffect(() => {
    if (!readyToHide) return;
    const t = setTimeout(() => setLoaderMounted(false), FADE_MS);
    return () => clearTimeout(t);
  }, [readyToHide]);

  return (
    <>
      <ToastContainer />
      {loaderMounted && <PageLoader isExiting={readyToHide} />}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/write" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path="/write/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/signin" element={<PublicOnlyRoute><SignInPage /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
