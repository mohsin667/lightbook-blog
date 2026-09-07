import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from './components/ui/ToastContainer';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { EditorPage } from './pages/EditorPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { DashboardPage } from './pages/DashboardPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { useAppDispatch } from './app/hooks';
import { useEffect } from 'react';
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
  useEffect(() => {
    dispatch(checkAuth())
    dispatch(fetchCategories())
    dispatch(getAllPosts({ skip: 0 }))
    dispatch(getTopAuthors())
  }, [dispatch])

  return (
    <>
      <ToastContainer />
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
