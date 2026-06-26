import { Box, useColorModeValue, type BoxProps } from '@chakra-ui/react';

/**
 * Card base no estilo Horizon UI: cantos arredondados 20px, fundo branco
 * (navy.800 no dark mode), sombra suave. Container padrao de widgets/paineis.
 */
export default function Card(props: BoxProps) {
  const { children, ...rest } = props;
  const bg = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '0px 18px 40px rgba(112, 144, 176, 0.12)',
    'none',
  );
  return (
    <Box
      bg={bg}
      borderRadius="20px"
      p="20px"
      boxShadow={shadow}
      position="relative"
      display="flex"
      flexDirection="column"
      minW="0"
      wordBreak="break-word"
      {...rest}
    >
      {children}
    </Box>
  );
}
