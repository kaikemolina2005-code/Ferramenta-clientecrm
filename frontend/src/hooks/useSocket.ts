import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export interface SocketNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  id: string;
}

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    // Conectar ao Socket.io
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 Socket.io connected');
      setIsConnected(true);

      // Autenticar usuário
      socket.emit('user:authenticate', user.id);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket.io disconnected');
      setIsConnected(false);
    });

    socket.on('users:online', ({ count }) => {
      setOnlineUsers(count);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  /**
   * Listen to document analyzed event
   */
  const onDocumentAnalyzed = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('document:analyzed', callback);
        return () => {
          socketRef.current?.off('document:analyzed', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to document processing started
   */
  const onDocumentProcessingStarted = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('document:processing:started', callback);
        return () => {
          socketRef.current?.off('document:processing:started', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to document processing completed
   */
  const onDocumentProcessingCompleted = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('document:processing:completed', callback);
        return () => {
          socketRef.current?.off('document:processing:completed', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to document processing error
   */
  const onDocumentProcessingError = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('document:processing:error', callback);
        return () => {
          socketRef.current?.off('document:processing:error', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to kanban card moved
   */
  const onKanbanCardMoved = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('kanban:card:moved', callback);
        return () => {
          socketRef.current?.off('kanban:card:moved', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to kanban card created
   */
  const onKanbanCardCreated = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('kanban:card:created', callback);
        return () => {
          socketRef.current?.off('kanban:card:created', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to kanban card deleted
   */
  const onKanbanCardDeleted = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('kanban:card:deleted', callback);
        return () => {
          socketRef.current?.off('kanban:card:deleted', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to lead status changed
   */
  const onLeadStatusChanged = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('lead:status:changed', callback);
        return () => {
          socketRef.current?.off('lead:status:changed', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to lead converted
   */
  const onLeadConverted = useCallback(
    (callback: (data: any) => void) => {
      if (socketRef.current) {
        socketRef.current.on('lead:converted', callback);
        return () => {
          socketRef.current?.off('lead:converted', callback);
        };
      }
    },
    []
  );

  /**
   * Listen to notifications
   */
  const onNotification = useCallback(
    (callback: (notification: SocketNotification) => void) => {
      if (socketRef.current) {
        socketRef.current.on('notification:sent', (data) => {
          callback({
            ...data,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(data.timestamp),
          });
        });
        return () => {
          socketRef.current?.off('notification:sent');
        };
      }
    },
    []
  );

  return {
    isConnected,
    onlineUsers,
    socket: socketRef.current,
    onDocumentAnalyzed,
    onDocumentProcessingStarted,
    onDocumentProcessingCompleted,
    onDocumentProcessingError,
    onKanbanCardMoved,
    onKanbanCardCreated,
    onKanbanCardDeleted,
    onLeadStatusChanged,
    onLeadConverted,
    onNotification,
  };
};

export default useSocket;
