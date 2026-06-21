import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';
import Card from './Card';
import IconBox from './IconBox';
import type { ReactNode } from 'react';

interface MiniStatisticsProps {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Ex.: "+2.45%" (verde) ou "-1.2%" (vermelho). */
  growth?: string;
  growthLabel?: string;
}

/** Card de KPI no estilo Horizon: IconBox redondo + label + valor + crescimento. */
export default function MiniStatistics({
  label,
  value,
  icon,
  growth,
  growthLabel = 'vs mês anterior',
}: MiniStatisticsProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = 'secondaryGray.600';
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.600', 'white');

  const isNegative = growth?.trim().startsWith('-');
  const growthColor = isNegative ? 'red.500' : 'green.500';

  return (
    <Card py="15px">
      <Flex my="auto" h="100%" align={{ base: 'center', xl: 'start' }} justify="center">
        {icon && (
          <IconBox
            w="56px"
            h="56px"
            bg={boxBg}
            me="18px"
            flexShrink={0}
            fontSize="28px"
            color={brandColor}
            icon={icon}
          />
        )}
        <Stat my="auto">
          <StatLabel lineHeight="100%" color={textColorSecondary} fontSize="sm" fontWeight="500">
            {label}
          </StatLabel>
          <StatNumber color={textColor} fontSize="2xl" fontWeight="700">
            {value}
          </StatNumber>
          {growth && (
            <Flex align="center" mt="4px">
              <Icon as={isNegative ? RiArrowDownSFill : RiArrowUpSFill} color={growthColor} me="2px" />
              <Text color={growthColor} fontSize="xs" fontWeight="700" me="5px">
                {growth}
              </Text>
              <Text color="secondaryGray.600" fontSize="xs" fontWeight="400">
                {growthLabel}
              </Text>
            </Flex>
          )}
        </Stat>
      </Flex>
    </Card>
  );
}
