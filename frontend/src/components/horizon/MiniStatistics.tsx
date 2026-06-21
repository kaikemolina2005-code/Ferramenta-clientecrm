import { Flex, Stat, StatLabel, StatNumber, Text, Box } from '@chakra-ui/react';
import Card from './Card';
import type { ReactNode } from 'react';

interface MiniStatisticsProps {
  label: string;
  value: string;
  icon?: ReactNode;
  helpText?: string;
}

/** Card de KPI no estilo Horizon: icone redondo + label + valor. */
export default function MiniStatistics({ label, value, icon, helpText }: MiniStatisticsProps) {
  return (
    <Card py="18px">
      <Flex align="center">
        {icon && (
          <Flex
            align="center"
            justify="center"
            w="56px"
            h="56px"
            borderRadius="full"
            bgGradient="linear(135deg, brand.600, brand.500)"
            color="white"
            fontSize="24px"
            me="16px"
            flexShrink={0}
          >
            {icon}
          </Flex>
        )}
        <Stat my="auto">
          <StatLabel fontSize="sm" color="secondaryGray.700" fontWeight="500">
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" color="navy.700" fontWeight="700">
            {value}
          </StatNumber>
          {helpText && (
            <Box>
              <Text fontSize="xs" color="secondaryGray.700">
                {helpText}
              </Text>
            </Box>
          )}
        </Stat>
      </Flex>
    </Card>
  );
}
