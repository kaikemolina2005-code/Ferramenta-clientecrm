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

type Mode = 'login' | 'signup';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setInviteCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (password.length < 6) {
          setError('A senha precisa ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        await register(name.trim(), email.trim(), password, inviteCode.trim());
      } else {
        await login(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          (err instanceof Error ? err.message : isSignup ? 'Erro ao criar conta' : 'Erro ao fazer login')
      );
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
      bgGradient="linear(135deg, #2b2f36 0%, #3a4048 100%)"
    >
      <Box w="100%" maxW="420px" bg="white" borderRadius="20px" p="32px" boxShadow="2xl">
        <Flex justify="center" mb="24px">
          <ADVGDLogoDiego size="medium" />
        </Flex>

        <Heading textAlign="center" fontSize="3xl" color="brand.600" mb="4px">
          {isSignup ? 'Criar conta' : 'Bem-vindo'}
        </Heading>
        <Text textAlign="center" color="secondaryGray.700" mb="28px" fontSize="sm">
          {isSignup
            ? 'Cadastre-se para acessar a plataforma do escritório'
            : 'Plataforma de Gestão para Escritórios de Advocacia'}
        </Text>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <FormControl mb="16px" isRequired>
              <FormLabel fontSize="sm" color="brand.600">
                Nome completo
              </FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                borderRadius="12px"
              />
            </FormControl>
          )}

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
                placeholder={isSignup ? 'Mínimo 6 caracteres' : '••••••••'}
                borderRadius="12px"
              />
              <InputRightElement>
                <Box cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                  <Icon as={showPassword ? EyeOff : Eye} color="secondaryGray.600" boxSize="18px" />
                </Box>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {isSignup && (
            <FormControl mb="16px">
              <FormLabel fontSize="sm" color="brand.600">
                Código de convite
              </FormLabel>
              <Input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Código fornecido pelo escritório"
                borderRadius="12px"
              />
              <Text fontSize="xs" color="secondaryGray.600" mt="4px">
                Peça o código ao administrador do escritório.
              </Text>
            </FormControl>
          )}

          {error && (
            <Alert status="error" borderRadius="12px" mb="16px" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!isSignup && (
            <Checkbox mb="20px" colorScheme="blue" defaultChecked={false}>
              <Text fontSize="sm" color="secondaryGray.700">
                Lembrar-me
              </Text>
            </Checkbox>
          )}

          <Button
            type="submit"
            isLoading={loading}
            loadingText={isSignup ? 'Criando...' : 'Carregando...'}
            variant="brand"
            w="100%"
            py="22px"
            mt={isSignup ? '4px' : '0'}
          >
            {isSignup ? 'Criar conta' : 'Entrar'}
          </Button>
        </form>

        {/* Alternar entre login e cadastro */}
        <Flex justify="center" align="center" gap="6px" mt="20px">
          <Text fontSize="sm" color="secondaryGray.700">
            {isSignup ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
          </Text>
          <Text
            as="button"
            type="button"
            fontSize="sm"
            fontWeight="700"
            color="brand.600"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            _hover={{ textDecoration: 'underline' }}
          >
            {isSignup ? 'Entrar' : 'Criar conta'}
          </Text>
        </Flex>

        {!isSignup && (
          <Box mt="20px" p="14px" borderRadius="12px" bg="brand.50" borderLeftWidth="4px" borderColor="gold.500">
            <Text fontSize="xs" fontWeight="700" color="brand.600" mb="4px">
              🔓 Credenciais de Demonstração:
            </Text>
            <Text fontSize="xs" color="secondaryGray.700">
              <strong>Email:</strong> admin@advgd.com
              <br />
              <strong>Senha:</strong> 123456
            </Text>
          </Box>
        )}

        <Text textAlign="center" fontSize="xs" color="secondaryGray.700" mt="20px">
          © 2026 ADVGD CRM. Todos os direitos reservados.
        </Text>
      </Box>
    </Flex>
  );
}
