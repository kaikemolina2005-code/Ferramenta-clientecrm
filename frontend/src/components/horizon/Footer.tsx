import { Flex, Text, Link } from '@chakra-ui/react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="space-between"
      px={{ base: '16px', md: '24px' }}
      py="20px"
      gap="8px"
    >
      <Text color="secondaryGray.700" fontSize="sm">
        © {year} ADVGD CRM — Diego Patrício Advogado. Todos os direitos reservados.
      </Text>
      <Link href="#" color="gold.600" fontSize="sm" fontWeight="500">
        Suporte
      </Link>
    </Flex>
  );
}

export default Footer;
