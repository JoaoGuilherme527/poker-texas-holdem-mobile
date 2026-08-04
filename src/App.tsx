import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './Login';
import Home from './Home';
import Game from './Game';
import TopupScreen from './TopupScreen';
import CalculadoraOdds from './ferramentas/CalculadoraOdds';
import ReplayPage from './ReplayPage';
import ProfilePage from './ProfilePage';
import LandingPage from './LandingPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const HomeSelector = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121513] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#98D8BA] border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return user ? <Home /> : <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/topup/:tokenId" element={<TopupScreen />} />
            <Route path="/" element={<HomeSelector />} />
            <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
            <Route path="/ferramentas/calculadora-de-equidade" element={<CalculadoraOdds />} />
            <Route path="/replay/:handId" element={<ReplayPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

