import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/LoadingSpinner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceEditor from './pages/InvoiceEditor';
import NewInvoice from './pages/NewInvoice';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import BusinessProfile from './pages/BusinessProfile';
import AIAssistant from './pages/AIAssistant';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/invoices" element={
            <ProtectedRoute>
              <InvoiceList />
            </ProtectedRoute>
          } />

          <Route path="/invoices/new" element={
            <ProtectedRoute>
              <InvoiceEditor />
            </ProtectedRoute>
          } />

          <Route path="/invoices/:id" element={
            <ProtectedRoute>
              <InvoiceEditor />
            </ProtectedRoute>
          } />

          <Route path="/new-invoice" element={
            <ProtectedRoute>
              <NewInvoice />
            </ProtectedRoute>
          } />

          <Route path="/clients" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />

          <Route path="/clients/:id" element={
            <ProtectedRoute>
              <ClientDetail />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <BusinessProfile />
            </ProtectedRoute>
          } />

          <Route path="/ai-assistant" element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Router>
    </AuthProvider>
  );
}
