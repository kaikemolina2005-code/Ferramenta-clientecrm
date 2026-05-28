import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ADVGDLogoDiego } from '@/components/Logo';
import { designSystem } from '@/theme/designSystem';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@advgd.com');
  const [password, setPassword] = useState('123456');
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #003f7f 0%, #0d47a1 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div
          className="rounded-xl p-8 shadow-xl"
          style={{
            backgroundColor: designSystem.colors.neutral.white,
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <ADVGDLogoDiego size="medium" />
          </div>

          {/* Título */}
          <h1
            className="text-3xl font-bold text-center mb-2"
            style={{ color: designSystem.colors.primary.dark }}
          >
            Bem-vindo
          </h1>
          <p
            className="text-center mb-8"
            style={{ color: designSystem.colors.neutral.gray500 }}
          >
            Plataforma de Gestão para Escritórios de Advocacia
          </p>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: designSystem.colors.primary.dark }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 transition-all"
                style={{
                  borderColor: designSystem.colors.neutral.gray300,
                  backgroundColor: designSystem.colors.neutral.white,
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    designSystem.colors.primary.dark;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    designSystem.colors.neutral.gray300;
                }}
                placeholder="seu@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: designSystem.colors.primary.dark }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 transition-all"
                style={{
                  borderColor: designSystem.colors.neutral.gray300,
                  backgroundColor: designSystem.colors.neutral.white,
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    designSystem.colors.primary.dark;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    designSystem.colors.neutral.gray300;
                }}
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: '#f8d7da',
                  color: designSystem.colors.status.error,
                  borderLeft: `4px solid ${designSystem.colors.status.error}`,
                }}
              >
                {error}
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4" />
              <label
                htmlFor="remember"
                className="ml-2 text-sm"
                style={{ color: designSystem.colors.neutral.gray500 }}
              >
                Lembrar-me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all"
              style={{
                backgroundColor: loading
                  ? designSystem.colors.neutral.gray400
                  : designSystem.colors.primary.dark,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    designSystem.colors.primary.main;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    designSystem.colors.primary.dark;
                }
              }}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div
            className="mt-8 p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: designSystem.colors.primary.lighter,
              borderColor: designSystem.colors.accent.gold,
            }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: designSystem.colors.primary.dark }}
            >
              🔓 Credenciais de Demonstração:
            </p>
            <p className="text-xs" style={{ color: designSystem.colors.neutral.gray600 }}>
              <strong>Email:</strong> admin@advgd.com<br />
              <strong>Senha:</strong> 123456
            </p>
          </div>

          {/* Footer */}
          <p
            className="text-center text-xs mt-8"
            style={{ color: designSystem.colors.neutral.gray500 }}
          >
            © 2026 ADVGD CRM. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
