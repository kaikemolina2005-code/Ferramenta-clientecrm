import { Flex, type FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

/** Circulo de icone no estilo Horizon (fundo claro + icone colorido). */
export default function IconBox({ icon, ...rest }: FlexProps & { icon: ReactNode }) {
  return (
    <Flex alignItems="center" justifyContent="center" borderRadius="50%" {...rest}>
      {icon}
    </Flex>
  );
}
