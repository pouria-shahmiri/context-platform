import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Flex, Text, Box, Card, TextField, Link as RadixLink } from '@radix-ui/themes';
import { Loader2, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Try logging in.');
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isResetting) {
        await resetPassword(email);
        setResetSent(true);
      } else if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Try logging in.');
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, width: '100%' }}>
        <Box p="4">
            <Flex direction="column" gap="4" align="center">
                <Text size="5" weight="bold">
                  {isResetting ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}
                </Text>
                
                {error && <Text size="2" color="red">{error}</Text>}
                {resetSent && <Text size="2" color="green">Password reset email sent!</Text>}

                {!resetSent && (
                  <form onSubmit={handleEmailAuth} style={{ width: '100%' }}>
                    <Flex direction="column" gap="3">
                      <TextField.Root 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        type="email"
                      >
                        <TextField.Slot>
                          <Mail height="16" width="16" />
                        </TextField.Slot>
                      </TextField.Root>

                      {!isResetting && (
                        <TextField.Root 
                          placeholder="Password" 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      )}

                      <Button 
                        size="3" 
                        variant="solid" 
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%' }}
                      >
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        {isResetting ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In')}
                      </Button>
                    </Flex>
                  </form>
                )}

                {!isResetting && (
                  <>
                    <Flex align="center" gap="2" width="100%">
                      <Box style={{ height: 1, flex: 1, background: 'var(--gray-5)' }} />
                      <Text size="2" color="gray">OR</Text>
                      <Box style={{ height: 1, flex: 1, background: 'var(--gray-5)' }} />
                    </Flex>

                    <Button 
                        size="3" 
                        variant="soft" 
                        onClick={handleGoogleSignIn} 
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        Continue with Google
                    </Button>
                  </>
                )}

                <Flex direction="column" gap="2" align="center">
                  {!isResetting && (
                    <Text size="2">
                      {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                      <RadixLink 
                        className="cursor-pointer" 
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </RadixLink>
                    </Text>
                  )}
                  
                  <Text size="2">
                    <RadixLink 
                      className="cursor-pointer" 
                      onClick={() => {
                        setIsResetting(!isResetting);
                        setError('');
                        setResetSent(false);
                      }}
                    >
                      {isResetting ? 'Back to Login' : 'Forgot Password?'}
                    </RadixLink>
                  </Text>
                </Flex>
            </Flex>
        </Box>
    </Card>
  );
};

export default Login;
