import { Box, useStyleConfig, type BoxProps } from '@chakra-ui/react';

/**
 * Card base no estilo Horizon UI: cantos arredondados, fundo branco,
 * sombra suave. Usado como container padrao de widgets/paineis.
 */
export default function Card(props: BoxProps & { variant?: string }) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig('Card', { variant });
  return (
    <Box
      __css={styles}
      bg="white"
      borderRadius="20px"
      p="20px"
      boxShadow="0px 18px 40px rgba(112, 144, 176, 0.12)"
      {...rest}
    >
      {children}
    </Box>
  );
}
