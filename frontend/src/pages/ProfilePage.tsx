import {
  Box,
  Flex,
  Grid,
  GridItem,
  Avatar,
  Text,
  Badge,
  SimpleGrid,
  Stack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from '@/components/horizon/Card';
import MiniCalendar from '@/components/horizon/MiniCalendar';
import { useAuth } from '@/context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LAWYER: 'Advogado',
  ASSISTANT: 'Assistente',
  USER: 'Usuário',
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  const labelColor = 'secondaryGray.600';
  const valueColor = useColorModeValue('navy.700', 'white');
  return (
    <Flex justify="space-between" py="8px">
      <Text fontSize="sm" color={labelColor}>
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="600" color={valueColor}>
        {value || '—'}
      </Text>
    </Flex>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const titleColor = useColorModeValue('navy.700', 'white');

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="20px">
      {/* Cartao do perfil com banner */}
      <GridItem colSpan={{ base: 1, lg: 2 }}>
        <Card p="0" overflow="hidden">
          <Box h="120px" bgGradient="linear(135deg, #003f7f 0%, #0d47a1 100%)" />
          <Flex direction="column" align="center" mt="-44px" pb="24px" px="20px">
            <Avatar
              size="xl"
              name={user?.name}
              src={user?.avatar}
              border="4px solid white"
              bg="gold.500"
              color="brand.600"
            />
            <Text fontSize="xl" fontWeight="700" color={titleColor} mt="12px">
              {user?.name || 'Usuário'}
            </Text>
            <Badge colorScheme="blue" borderRadius="8px" mt="4px">
              {ROLE_LABELS[user?.role || ''] || user?.role}
            </Badge>
          </Flex>
        </Card>
      </GridItem>

      {/* Dados da conta */}
      <GridItem>
        <Card>
          <Text fontSize="lg" fontWeight="700" color={titleColor} mb="8px">
            Informações da Conta
          </Text>
          <Divider mb="8px" />
          <Stack spacing="0" divider={<Divider />}>
            <InfoRow label="Nome" value={user?.name} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Telefone" value={user?.phone} />
            <InfoRow label="Cargo" value={ROLE_LABELS[user?.role || ''] || user?.role} />
          </Stack>
        </Card>
      </GridItem>

      {/* Agenda */}
      <GridItem>
        <Stack spacing="20px">
          <MiniCalendar />
          <Card>
            <SimpleGrid columns={2} spacing="16px">
              <Box>
                <Text fontSize="2xl" fontWeight="700" color={titleColor}>
                  —
                </Text>
                <Text fontSize="sm" color="secondaryGray.600">
                  Tarefas pendentes
                </Text>
              </Box>
              <Box>
                <Text fontSize="2xl" fontWeight="700" color={titleColor}>
                  —
                </Text>
                <Text fontSize="sm" color="secondaryGray.600">
                  Leads atribuídos
                </Text>
              </Box>
            </SimpleGrid>
          </Card>
        </Stack>
      </GridItem>
    </Grid>
  );
}

export default ProfilePage;
