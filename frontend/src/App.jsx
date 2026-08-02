import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardPage from './pages/BoardPage';
import ListingDetailPage from './pages/ListingDetailPage';
import NewListingPage from './pages/NewListingPage';
import MyListingsPage from './pages/MyListingsPage';
import MyClaimsPage from './pages/MyClaimsPage';
import ProfilePage from './pages/ProfilePage';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/board" element={<BoardPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route
          path="/new-listing"
          element={
            <ProtectedRoute role="donor">
              <NewListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute role="donor">
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-claims"
          element={
            <ProtectedRoute role="receiver">
              <MyClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
