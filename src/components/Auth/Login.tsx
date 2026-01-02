import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, TextField, Flex, Text, Tabs, Box, Card } from '@radix-ui/themes';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [tab, setTab] = useState<string>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (tab === 'signin') {
        await signIn(email, password);
      } else {
        const { user, session } = await signUp(email, password);
        if (user && !session) {
            setMessage("Account created! Please check your email to confirm.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, width: '100%' }}>
      <Tabs.Root defaultValue="signin" onValueChange={(val) => { setTab(val); setError(''); setMessage(''); }}>
        <Tabs.List>
          <Tabs.Trigger value="signin">Sign In</Tabs.Trigger>
          <Tabs.Trigger value="signup">Sign Up</Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              {error && <Text size="2" color="red">{error}</Text>}
              {message && <Text size="2" color="green">{message}</Text>}
              
              <label>
                <Text as="div" size="2" mb="1" weight="bold">Email</Text>
                <TextField.Root 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              
              <label>
                <Text as="div" size="2" mb="1" weight="bold">Password</Text>
                <TextField.Root 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <Button disabled={loading} type="submit">
                {loading && <Loader2 className="animate-spin" />}
                {tab === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </Flex>
          </form>
        </Box>
      </Tabs.Root>
    </Card>
  );
};

export default Login;
