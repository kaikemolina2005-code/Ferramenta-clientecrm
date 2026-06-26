import { Button, Icon, useColorMode } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';

/**
 * Botao flutuante (estilo Horizon FixedPlugin) para alternar tema claro/escuro
 * rapidamente de qualquer tela.
 */
export default function FixedPlugin() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button
      onClick={toggleColorMode}
      position="fixed"
      bottom="24px"
      right="24px"
      zIndex="30"
      w="56px"
      h="56px"
      borderRadius="full"
      bgGradient="linear(135deg, brand.600, brand.500)"
      color="white"
      boxShadow="0px 10px 30px rgba(0, 63, 127, 0.4)"
      _hover={{ transform: 'scale(1.05)' }}
      aria-label="Alternar tema"
    >
      <Icon as={colorMode === 'light' ? Moon : Sun} boxSize="22px" />
    </Button>
  );
}
