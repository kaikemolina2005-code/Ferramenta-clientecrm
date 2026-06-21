import { Box, Flex, Text, IconButton, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { Menu as MenuIcon, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/kanban': 'Kanban',
  '/tarefas': 'Tarefas',
  '/automation': 'Automações',
  '/reports': 'Relatórios',
  '/documentos': 'Documentos',
  '/whatsapp': 'WhatsApp',
  '/ai': 'IA Documents',
};

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { pathname } = useLocation();
  const pageName =
    PAGE_NAMES[pathname] ||
    Object.entries(PAGE_NAMES).find(([k]) => pathname.startsWith(k))?.[1] ||
    'Página';

  const navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)');

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
      <Flex align="center" justify="space-between">
        <Box>
          <Text fontSize="xs" color="secondaryGray.700">
            Páginas / {pageName}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="navy.700" lineHeight="1.2">
            {pageName}
          </Text>
        </Box>
        <HStack spacing="8px">
          <IconButton
            aria-label="Notificações"
            icon={<Icon as={Bell} boxSize="18px" />}
            variant="ghost"
            color="secondaryGray.700"
            borderRadius="full"
          />
          <IconButton
            aria-label="Menu"
            icon={<Icon as={MenuIcon} boxSize="20px" />}
            variant="ghost"
            color="secondaryGray.700"
            display={{ base: 'flex', xl: 'none' }}
            onClick={onOpenSidebar}
          />
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navbar;
