import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@radix-ui/themes';
import { LogIn, Loader2 } from 'lucide-react';

const GoogleLogin = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Button 
      size="3" 
      variant="soft" 
      onClick={handleLogin}
      disabled={isLoggingIn}
      className="cursor-pointer"
    >
      {isLoggingIn ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4 mr-2" />
      )}
      {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
};

export default GoogleLogin;
