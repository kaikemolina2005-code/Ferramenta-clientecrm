import {
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  useColorModeValue,
  type InputGroupProps,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';

/** Campo de busca arredondado no estilo Horizon. */
export default function SearchBar(props: InputGroupProps & { placeholder?: string }) {
  const { placeholder = 'Buscar...', ...rest } = props;
  const searchBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const inputText = useColorModeValue('gray.700', 'white');
  const iconColor = useColorModeValue('gray.500', 'white');

  return (
    <InputGroup w={{ base: '100%', md: '200px' }} {...rest}>
      <InputLeftElement>
        <Icon as={Search} color={iconColor} boxSize="16px" />
      </InputLeftElement>
      <Input
        variant="filled"
        fontSize="sm"
        bg={searchBg}
        color={inputText}
        borderRadius="30px"
        placeholder={placeholder}
        _placeholder={{ color: 'secondaryGray.600', fontSize: '14px' }}
        _focus={{ bg: searchBg, borderColor: 'transparent' }}
        _hover={{ bg: searchBg }}
        border="none"
      />
    </InputGroup>
  );
}
