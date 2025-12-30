import { Theme } from '@radix-ui/themes';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PyramidEditor from './pages/PyramidEditor';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/" />;
  
  return children;
};

const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <Theme appearance={theme} accentColor="gray" grayColor="slate" radius="medium">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pyramid/:pyramidId" 
            element={
              <ProtectedRoute>
                <PyramidEditor />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </Theme>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
