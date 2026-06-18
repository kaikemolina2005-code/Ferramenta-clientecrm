import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { NotificationsContainer } from './NotificationsContainer';
import useSocket, { type SocketNotification } from '@/hooks/useSocket';
import { ADVGDLogo } from './Logo';
import { designSystem } from '@/theme/designSystem';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { onNotification, onDocumentAnalyzed, onDocumentProcessingCompleted, onDocumentProcessingError } = useSocket();

  // Setup notification listeners
  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onNotification]);

  useEffect(() => {
    const unsubscribe = onDocumentAnalyzed((data) => {
      setNotifications((prev) => [
        {
          type: 'success',
          title: '📄 Documento Analisado',
          message: `Documento classificado como ${data.classification} com ${(data.confidence * 100).toFixed(0)}% de confiança`,
          timestamp: new Date(),
          id: `${Date.now()}-doc-analyzed`,
        },
        ...prev,
      ]);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onDocumentAnalyzed]);

  useEffect(() => {
    const unsubscribe = onDocumentProcessingCompleted((data) => {
      setNotifications((prev) => [
        {
          type: 'success',
          title: '✅ Processamento Completo',
          message: `${data.successCount}/${data.processedCount} documentos processados com sucesso`,
          timestamp: new Date(),
          id: `${Date.now()}-processing-complete`,
        },
        ...prev,
      ]);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onDocumentProcessingCompleted]);

  useEffect(() => {
    const unsubscribe = onDocumentProcessingError((data) => {
      setNotifications((prev) => [
        {
          type: 'error',
          title: '❌ Erro no Processamento',
          message: data.error || 'Erro ao processar documentos',
          timestamp: new Date(),
          id: `${Date.now()}-processing-error`,
        },
        ...prev,
      ]);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onDocumentProcessingError]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <div className="flex h-screen" style={{ backgroundColor: designSystem.colors.neutral.light }}>
        {/* Mobile Menu Toggle */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center px-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl"
            style={{ color: designSystem.colors.primary.dark }}
          >
            ☰
          </button>
          <h2 className="ml-4 font-bold" style={{ color: designSystem.colors.primary.dark }}>
            ADVGD CRM
          </h2>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`w-64 shadow-xl flex flex-col fixed md:relative h-full z-40 md:z-0 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ 
            backgroundColor: designSystem.colors.primary.dark,
            borderRight: `3px solid ${designSystem.colors.accent.gold}`,
            top: 0,
            left: 0
          }}
        >
          {/* Logo Area */}
          <div 
            className="p-6 border-b"
            style={{ 
              borderColor: designSystem.colors.accent.gold,
              background: 'linear-gradient(135deg, #003f7f 0%, #0d47a1 100%)'
            }}
          >
            <ADVGDLogo size="small" variant="icon" showText={false} className="mb-3" />
            <h1 
              className="text-2xl font-bold font-poppins"
              style={{ color: designSystem.colors.neutral.white }}
            >
              ADVGD CRM
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: designSystem.colors.accent.light }}
            >
              Diego Patrício Advogado
            </p>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-3 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all"
              style={{
                color: designSystem.colors.neutral.white,
                backgroundColor: 'rgba(201, 169, 97, 0.15)',
                borderLeft: `3px solid ${designSystem.colors.accent.gold}`
              }}
              onClick={() => setSidebarOpen(false)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201, 169, 97, 0.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201, 169, 97, 0.15)';
              }}
            >
              <span className="mr-3">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/leads"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">👥</span>
              <span>Leads</span>
            </Link>

            <Link
              to="/kanban"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">📋</span>
              <span>Kanban</span>
            </Link>

            <Link
              to="/automation"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">⚙️</span>
              <span>Automações</span>
            </Link>

            <Link
              to="/reports"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">📈</span>
              <span>Relatórios</span>
            </Link>

            <Link
              to="/tarefas"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">✅</span>
              <span>Tarefas</span>
            </Link>

            <Link
              to="/documentos"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">📄</span>
              <span>Documentos</span>
            </Link>

            <Link
              to="/whatsapp"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">💬</span>
              <span>WhatsApp</span>
            </Link>

            <Link
              to="/ai"
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              style={{ color: designSystem.colors.neutral.white }}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">🧠</span>
              <span>IA Documents</span>
            </Link>
          </nav>

          {/* User Info */}
          <div 
            className="border-t p-4"
            style={{ borderColor: designSystem.colors.accent.gold }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p 
                  className="text-sm font-semibold"
                  style={{ color: designSystem.colors.neutral.white }}
                >
                  {user?.name}
                </p>
                <p 
                  className="text-xs"
                  style={{ color: designSystem.colors.accent.light }}
                >
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 text-xs font-medium rounded transition-all"
                style={{
                  backgroundColor: designSystem.colors.status.error,
                  color: designSystem.colors.neutral.white,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto md:pt-0 pt-16"
          style={{ backgroundColor: designSystem.colors.neutral.light }}
        >
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
      <NotificationsContainer notifications={notifications} onRemove={removeNotification} />
    </>
  );
}
