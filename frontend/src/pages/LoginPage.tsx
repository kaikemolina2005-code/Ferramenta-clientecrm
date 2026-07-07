import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Checkbox,
  Alert,
  AlertIcon,
  Icon,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { ADVGDLogoDiego } from '@/components/Logo';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@advgd.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p="16px"
      bgGradient="linear(135deg, #000000 0%, #0a0a0a 100%)"
    >
      <Box w="100%" maxW="420px" bg="white" borderRadius="20px" p="32px" boxShadow="2xl">
        <Flex justify="center" mb="24px">
          <ADVGDLogoDiego size="medium" />
        </Flex>

        <Heading textAlign="center" fontSize="3xl" color="brand.600" mb="4px">
          Bem-vindo
        </Heading>
        <Text textAlign="center" color="secondaryGray.700" mb="28px" fontSize="sm">
          Plataforma de Gestão para Escritórios de Advocacia
        </Text>

        <form onSubmit={handleLogin}>
          <FormControl mb="16px" isRequired>
            <FormLabel fontSize="sm" color="brand.600">
              Email
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              borderRadius="12px"
            />
          </FormControl>

          <FormControl mb="16px" isRequired>
            <FormLabel fontSize="sm" color="brand.600">
              Senha
            </FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                borderRadius="12px"
              />
              <InputRightElement>
                <Box cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                  <Icon as={showPassword ? EyeOff : Eye} color="secondaryGray.600" boxSize="18px" />
                </Box>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {error && (
            <Alert status="error" borderRadius="12px" mb="16px" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Checkbox mb="20px" colorScheme="blue" defaultChecked={false}>
            <Text fontSize="sm" color="secondaryGray.700">
              Lembrar-me
            </Text>
          </Checkbox>

          <Button
            type="submit"
            isLoading={loading}
            loadingText="Carregando..."
            variant="brand"
            w="100%"
            py="22px"
          >
            Entrar
          </Button>
        </form>

        <Box mt="24px" p="14px" borderRadius="12px" bg="brand.50" borderLeftWidth="4px" borderColor="gold.500">
          <Text fontSize="xs" fontWeight="700" color="brand.600" mb="4px">
            🔓 Credenciais de Demonstração:
          </Text>
          <Text fontSize="xs" color="secondaryGray.700">
            <strong>Email:</strong> admin@advgd.com
            <br />
            <strong>Senha:</strong> 123456
          </Text>
        </Box>

        <Text textAlign="center" fontSize="xs" color="secondaryGray.700" mt="20px">
          © 2026 ADVGD CRM. Todos os direitos reservados.
        </Text>
      </Box>
    </Flex>
  );
}
