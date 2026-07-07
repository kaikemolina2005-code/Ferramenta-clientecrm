import {
  Box,
  Flex,
  Text,
  IconButton,
  HStack,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Menu as MenuIcon, Bell, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SearchBar from './SearchBar';

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/kanban': 'CRM',
  '/tarefas': 'Tarefas',
  '/automation': 'Automações',
  '/reports': 'Relatórios',
  '/documentos': 'Documentos',
  '/whatsapp': 'WhatsApp',
  '/ai': 'IA Documents',
  '/perfil': 'Perfil',
};

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { pathname } = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();

  const pageName =
    PAGE_NAMES[pathname] ||
    Object.entries(PAGE_NAMES).find(([k]) => pathname.startsWith(k))?.[1] ||
    'Página';

  const mainText = useColorModeValue('navy.700', 'white');
  const secondaryText = useColorModeValue('secondaryGray.700', 'white');
  const navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)');
  const menuBg = useColorModeValue('white', 'navy.800');
  const navbarIcon = useColorModeValue('gray.400', 'white');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="10"
      bg={navbarBg}
      backdropFilter="blur(20px)"
      px={{ base: '16px', md: '24px' }}
      py="12px"
    >
      <Flex align="center" justify="space-between" gap="12px">
        {/* Esquerda: breadcrumb + titulo da pagina */}
        <Box minW="0">
          <Text fontSize="xs" color={secondaryText}>
            Páginas / {pageName}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={mainText} lineHeight="1.2" noOfLines={1}>
            {pageName}
          </Text>
        </Box>

        {/* Direita: container flutuante com busca + acoes + avatar */}
        <Flex
          align="center"
          bg={menuBg}
          p="10px"
          borderRadius="30px"
          boxShadow={shadow}
          gap="4px"
        >
          <SearchBar display={{ base: 'none', md: 'flex' }} me="6px" />

          <IconButton
            aria-label="Notificações"
            icon={<Icon as={Bell} boxSize="18px" />}
            variant="ghost"
            color={navbarIcon}
            borderRadius="full"
            size="sm"
          />

          <IconButton
            aria-label="Alternar tema"
            icon={<Icon as={colorMode === 'light' ? Moon : Sun} boxSize="18px" />}
            variant="ghost"
            color={navbarIcon}
            borderRadius="full"
            size="sm"
            onClick={toggleColorMode}
          />

          <Menu>
            <MenuButton>
              <Avatar size="sm" src="/logo-icon.png" name={user?.name} bg="brand.600" color="white" cursor="pointer" />
            </MenuButton>
            <MenuList boxShadow={shadow} p="16px" borderRadius="20px" bg={menuBg} border="none" mt="8px">
              <Box px="8px" pb="10px" mb="8px" borderBottomWidth="1px" borderColor="secondaryGray.200">
                <Text fontSize="sm" fontWeight="700" color={mainText}>
                  {user?.name || 'Usuário'}
                </Text>
                <Text fontSize="xs" color={secondaryText}>
                  {user?.role}
                </Text>
              </Box>
              <MenuItem borderRadius="8px" color="red.500" fontWeight="600" onClick={handleLogout}>
                Sair
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Hamburguer (mobile) */}
          <IconButton
            aria-label="Menu"
            icon={<Icon as={MenuIcon} boxSize="20px" />}
            variant="ghost"
            color={navbarIcon}
            borderRadius="full"
            size="sm"
            display={{ base: 'flex', xl: 'none' }}
            onClick={onOpenSidebar}
          />
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;
