import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ClosingForm } from './pages/ClosingForm';
import { ClosingList } from './pages/ClosingList';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { AuditLogs } from './pages/AuditLogs';
import { UserRole } from '@superbom/shared';

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
        <span className="text-xs text-slate-500 font-bold uppercase mt-4 tracking-wider">Verificando Sessão...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas com Guarda de Roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/closings/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.GERENTE, UserRole.CAIXA]}>
            <ClosingForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/closings/edit/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.GERENTE, UserRole.CAIXA]}>
            <ClosingForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/closings"
        element={
          <ProtectedRoute>
            <ClosingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.GERENTE, UserRole.SUPERVISOR]}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
