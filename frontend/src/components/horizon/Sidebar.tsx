import {
  Box,
  Flex,
  Stack,
  Text,
  HStack,
  Icon,
  Avatar,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Settings,
  BarChart2,
  FileText,
  MessageSquare,
  Brain,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const SIDEBAR_WIDTH = 290;

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/kanban', icon: Kanban, label: 'Kanban' },
  { to: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
  { to: '/automation', icon: Settings, label: 'Automações' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
  { to: '/documentos', icon: FileText, label: 'Documentos' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/ai', icon: Brain, label: 'IA Documents' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const activeColor = useColorModeValue('navy.700', 'white');
  const inactiveColor = useColorModeValue('secondaryGray.700', 'secondaryGray.600');
  const activeBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandText = useColorModeValue('navy.700', 'white');
  const borderCol = useColorModeValue('secondaryGray.200', 'whiteAlpha.200');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <Flex direction="column" height="100%" pt="20px" px="16px" pb="16px">
      {/* Logo / marca */}
      <HStack spacing="12px" px="8px" pb="20px" mb="12px" borderBottomWidth="1px" borderColor={borderCol}>
        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          borderRadius="12px"
          bgGradient="linear(135deg, brand.600, brand.500)"
          color="white"
          fontWeight="bold"
          fontSize="sm"
        >
          AD
        </Flex>
        <Box>
          <Text fontSize="md" fontWeight="bold" color={brandText} lineHeight="1.1">
            ADVGD CRM
          </Text>
          <Text fontSize="xs" color="gold.600" lineHeight="1.1">
            Diego Patrício
          </Text>
        </Box>
      </HStack>

      {/* Navegacao */}
      <Stack spacing="2px" flex="1" overflowY="auto">
        {NAV_ITEMS.map(({ to, icon: ItemIcon, label }) => {
          const active = pathname === to || pathname.startsWith(to + '/');
          return (
            <HStack
              as={Link}
              to={to}
              key={to}
              onClick={onNavigate}
              spacing="14px"
              px="14px"
              py="11px"
              borderRadius="14px"
              bg={active ? activeBg : 'transparent'}
              color={active ? activeColor : inactiveColor}
              fontWeight={active ? '700' : '500'}
              transition="all 0.15s"
              _hover={{ bg: activeBg }}
              position="relative"
            >
              {active && (
                <Box position="absolute" left="0" h="60%" w="4px" borderRadius="full" bg="gold.500" />
              )}
              <Icon as={ItemIcon} boxSize="20px" color={active ? activeColor : 'inherit'} />
              <Text fontSize="sm">{label}</Text>
            </HStack>
          );
        })}
      </Stack>

      {/* Usuario */}
      <HStack mt="12px" pt="14px" borderTopWidth="1px" borderColor={borderCol} spacing="12px">
        <Avatar size="sm" name={user?.name} bg="gold.500" color="brand.600" />
        <Box flex="1" minW="0">
          <Text fontSize="sm" fontWeight="600" color={brandText} noOfLines={1}>
            {user?.name}
          </Text>
          <Text fontSize="xs" color="secondaryGray.700" noOfLines={1}>
            {user?.role}
          </Text>
        </Box>
        <IconButton
          aria-label="Sair"
          icon={<Icon as={LogOut} boxSize="18px" />}
          variant="ghost"
          colorScheme="red"
          size="sm"
          onClick={handleLogout}
        />
      </HStack>
    </Flex>
  );
}

/** Sidebar fixa para desktop. */
export function Sidebar() {
  const bg = useColorModeValue('white', 'navy.800');
  return (
    <Box
      display={{ base: 'none', xl: 'block' }}
      position="fixed"
      top="0"
      left="0"
      h="100vh"
      w={`${SIDEBAR_WIDTH}px`}
      bg={bg}
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      zIndex="20"
    >
      <SidebarContent />
    </Box>
  );
}

/** Sidebar em Drawer para mobile/tablet. */
export function SidebarMobile({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const bg = useColorModeValue('white', 'navy.800');
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="left">
      <DrawerOverlay />
      <DrawerContent w="285px" maxW="285px" bg={bg}>
        <DrawerBody p="0">
          <SidebarContent onNavigate={onClose} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default Sidebar;
