import { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  HStack,
  Icon,
  Avatar,
  IconButton,
  Tooltip,
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
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const SIDEBAR_WIDTH = 290;
export const SIDEBAR_COLLAPSED = 84;

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/kanban', icon: Kanban, label: 'CRM' },
  { to: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
  { to: '/automation', icon: Settings, label: 'Automações' },
  { to: '/reports', icon: BarChart2, label: 'Relatórios' },
  { to: '/documentos', icon: FileText, label: 'Documentos' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/ai', icon: Brain, label: 'IA Documents' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

function SidebarContent({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
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
      <HStack
        spacing="12px"
        px="8px"
        pb="20px"
        mb="12px"
        borderBottomWidth="1px"
        borderColor={borderCol}
        justify={collapsed ? 'center' : 'flex-start'}
      >
        <Box
          as="img"
          src="/logo-icon.png"
          alt="Diego Patrício Advogado"
          h={collapsed ? '44px' : '64px'}
          w="auto"
          flexShrink={0}
          borderRadius="12px"
          objectFit="contain"
        />
        {!collapsed && (
          <Box overflow="hidden" whiteSpace="nowrap">
            <Text fontSize="md" fontWeight="bold" color={brandText} lineHeight="1.1">
              CRM
            </Text>
            <Text fontSize="xs" color="gold.600" lineHeight="1.1">
              Diego Patrício
            </Text>
          </Box>
        )}
      </HStack>

      {/* Navegacao */}
      <Stack spacing="2px" flex="1" overflowY="auto" overflowX="hidden">
        {NAV_ITEMS.map(({ to, icon: ItemIcon, label }) => {
          const active = pathname === to || pathname.startsWith(to + '/');
          return (
            <Tooltip key={to} label={label} placement="right" isDisabled={!collapsed} hasArrow>
              <HStack
                as={Link}
                to={to}
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
                justify={collapsed ? 'center' : 'flex-start'}
              >
                {active && (
                  <Box position="absolute" left="0" h="60%" w="4px" borderRadius="full" bg="gold.500" />
                )}
                <Icon as={ItemIcon} boxSize="20px" flexShrink={0} color={active ? activeColor : 'inherit'} />
                {!collapsed && (
                  <Text fontSize="sm" whiteSpace="nowrap" overflow="hidden">
                    {label}
                  </Text>
                )}
              </HStack>
            </Tooltip>
          );
        })}
      </Stack>

      {/* Usuario */}
      <HStack
        mt="12px"
        pt="14px"
        borderTopWidth="1px"
        borderColor={borderCol}
        spacing="12px"
        justify={collapsed ? 'center' : 'flex-start'}
      >
        <Avatar size="sm" src="/logo-icon.png" name={user?.name} bg="#000000" color="white" flexShrink={0} />
        {!collapsed && (
          <>
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
          </>
        )}
      </HStack>
    </Flex>
  );
}

/**
 * Sidebar fixa para desktop com efeito recolher/expandir no hover:
 * recolhida mostra so os icones; ao passar o mouse expande mostrando os textos.
 */
export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const bg = useColorModeValue('white', 'navy.800');
  return (
    <Box
      display={{ base: 'none', xl: 'block' }}
      position="fixed"
      top="0"
      left="0"
      h="100vh"
      w={`${expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED}px`}
      bg={bg}
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      zIndex="20"
      overflow="hidden"
      transition="width 0.2s ease"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <SidebarContent collapsed={!expanded} />
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
