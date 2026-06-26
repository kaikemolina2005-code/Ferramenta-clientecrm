import { useState } from 'react';
import { Box, Flex, Grid, Text, IconButton, Icon, useColorModeValue } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Mini calendario mensal no estilo Horizon (sem dependencias externas). */
export default function MiniCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const textColor = useColorModeValue('navy.700', 'white');
  const mutedColor = 'secondaryGray.600';
  const todayBg = 'brand.600';

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const move = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <Card>
      <Flex align="center" justify="space-between" mb="12px">
        <IconButton
          aria-label="Mês anterior"
          icon={<Icon as={ChevronLeft} />}
          size="sm"
          variant="ghost"
          onClick={() => move(-1)}
        />
        <Text fontWeight="700" color={textColor}>
          {MONTHS[month]} {year}
        </Text>
        <IconButton
          aria-label="Próximo mês"
          icon={<Icon as={ChevronRight} />}
          size="sm"
          variant="ghost"
          onClick={() => move(1)}
        />
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap="4px" mb="4px">
        {WEEKDAYS.map((w, i) => (
          <Text key={i} textAlign="center" fontSize="xs" fontWeight="600" color={mutedColor}>
            {w}
          </Text>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap="4px">
        {cells.map((d, i) => (
          <Box key={i} textAlign="center" py="6px">
            {d && (
              <Flex
                align="center"
                justify="center"
                w="32px"
                h="32px"
                mx="auto"
                borderRadius="full"
                bg={isToday(d) ? todayBg : 'transparent'}
                color={isToday(d) ? 'white' : textColor}
                fontSize="sm"
                fontWeight={isToday(d) ? '700' : '500'}
                cursor="pointer"
                _hover={{ bg: isToday(d) ? todayBg : 'secondaryGray.300' }}
              >
                {d}
              </Flex>
            )}
          </Box>
        ))}
      </Grid>
    </Card>
  );
}
