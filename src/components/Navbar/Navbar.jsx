import { Flex, Text, Button, Avatar, DropdownMenu } from '@radix-ui/themes';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Download } from 'lucide-react';
import APIKeyModal from './APIKeyModal';
import ContextModal from './ContextModal';
import { exportToExcel } from '../../services/exportService';
import { useLocation } from 'react-router-dom';

const Navbar = ({ currentPyramid }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isBoardView = location.pathname.startsWith('/pyramid/');

  const handleExport = () => {
    if (currentPyramid) {
      exportToExcel(currentPyramid);
    }
  };

  return (
    <div className="border-b border-gray-200 px-4 py-3 bg-white">
      <Flex justify="between" align="center">
        <Text size="5" weight="bold" className="text-black">
          PS
        </Text>

        <Flex gap="3" align="center">
          {isBoardView && currentPyramid && (
             <Button variant="soft" color="gray" onClick={handleExport}>
                <Download size={16} className="mr-1" /> Export
             </Button>
          )}

          <APIKeyModal />
          
          <ContextModal />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="outline-none">
                <Avatar 
                  src={user?.photoURL} 
                  fallback={user?.displayName?.[0] || 'U'} 
                  radius="full"
                  size="2"
                />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>
                <Text size="2">{user?.displayName}</Text>
                <br />
                <Text size="1" color="gray">{user?.email}</Text>
              </DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </div>
  );
};

export default Navbar;
