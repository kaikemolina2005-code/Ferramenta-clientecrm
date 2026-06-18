import { useState, useEffect } from 'react';
import { NotificationsContainer } from './NotificationsContainer';
import useSocket, { type SocketNotification } from '@/hooks/useSocket';
import { designSystem } from '@/theme/designSystem';
import { CRMSidebar } from './ui/CRMSidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const { onNotification, onDocumentAnalyzed, onDocumentProcessingCompleted, onDocumentProcessingError } = useSocket();

  useEffect(() => {
    const unsub = onNotification((n) => setNotifications((prev) => [n, ...prev]));
    return () => { if (unsub) unsub(); };
  }, [onNotification]);

  useEffect(() => {
    const unsub = onDocumentAnalyzed((data) => {
      setNotifications((prev) => [{
        type: 'success',
        title: '📄 Documento Analisado',
        message: `Classificado como ${data.classification} com ${(data.confidence * 100).toFixed(0)}% de confiança`,
        timestamp: new Date(),
        id: `${Date.now()}-doc-analyzed`,
      }, ...prev]);
    });
    return () => { if (unsub) unsub(); };
  }, [onDocumentAnalyzed]);

  useEffect(() => {
    const unsub = onDocumentProcessingCompleted((data) => {
      setNotifications((prev) => [{
        type: 'success',
        title: '✅ Processamento Completo',
        message: `${data.successCount}/${data.processedCount} documentos processados com sucesso`,
        timestamp: new Date(),
        id: `${Date.now()}-processing-complete`,
      }, ...prev]);
    });
    return () => { if (unsub) unsub(); };
  }, [onDocumentProcessingCompleted]);

  useEffect(() => {
    const unsub = onDocumentProcessingError((data) => {
      setNotifications((prev) => [{
        type: 'error',
        title: '❌ Erro no Processamento',
        message: data.error || 'Erro ao processar documentos',
        timestamp: new Date(),
        id: `${Date.now()}-processing-error`,
      }, ...prev]);
    });
    return () => { if (unsub) unsub(); };
  }, [onDocumentProcessingError]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      <div className="flex h-screen" style={{ backgroundColor: designSystem.colors.neutral.light }}>
        {/* Animated collapsible sidebar */}
        <CRMSidebar />

        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: designSystem.colors.neutral.light }}
        >
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
      <NotificationsContainer notifications={notifications} onRemove={removeNotification} />
    </>
  );
}
