import { ReactNode, useEffect } from 'react';
import { designSystem } from '@/theme/designSystem';

// ════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ════════════════════════════════════════════════════════════════

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeConfig = {
    small: '400px',
    medium: '600px',
    large: '900px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{
        backgroundColor: designSystem.colors.neutral.white,
        borderRadius: '12px',
        boxShadow: designSystem.shadows.lg,
        maxWidth: sizeConfig[size],
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'slideUp 0.3s ease-out',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
          flexShrink: 0
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: designSystem.colors.primary.dark,
            margin: 0
          }}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: designSystem.colors.neutral.gray600,
                transition: designSystem.transitions.normal,
                padding: 0,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = designSystem.colors.neutral.black}
              onMouseLeave={(e) => e.currentTarget.style.color = designSystem.colors.neutral.gray600}
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          flex: 1,
          overflowY: 'auto'
        }}>
          {children}
        </div>

        {/* Footer */}
        {(onConfirm || cancelText) && (
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '20px 24px',
            borderTop: `1px solid ${designSystem.colors.neutral.gray300}`,
            justifyContent: 'flex-end',
            flexShrink: 0
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                borderRadius: '6px',
                backgroundColor: designSystem.colors.neutral.white,
                color: designSystem.colors.neutral.gray600,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: designSystem.transitions.normal
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light;
                e.currentTarget.style.borderColor = designSystem.colors.neutral.gray400;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = designSystem.colors.neutral.white;
                e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300;
              }}
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: isDangerous ? designSystem.colors.status.error : designSystem.colors.primary.dark,
                  color: designSystem.colors.neutral.white,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: designSystem.transitions.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TOAST COMPONENT
// ════════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const toastStyles = {
  success: {
    backgroundColor: designSystem.colors.status.success,
    icon: '✓'
  },
  error: {
    backgroundColor: designSystem.colors.status.error,
    icon: '✕'
  },
  warning: {
    backgroundColor: designSystem.colors.status.warning,
    icon: '⚠'
  },
  info: {
    backgroundColor: designSystem.colors.primary.dark,
    icon: 'ℹ'
  }
};

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const style = toastStyles[type];

  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div style={{
      backgroundColor: style.backgroundColor,
      color: designSystem.colors.neutral.white,
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: designSystem.shadows.md,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <span style={{ fontSize: '18px' }}>{style.icon}</span>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: designSystem.colors.neutral.white,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 8px'
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TOAST CONTAINER (for managing multiple toasts)
// ════════════════════════════════════════════════════════════════

interface ToastItem extends ToastProps {
  id: string;
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[], onRemove: (id: string) => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 2000,
      maxWidth: '400px'
    }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CONFIRM DIALOG (convenience wrapper around Modal)
// ════════════════════════════════════════════════════════════════

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      isDangerous={isDangerous}
    >
      <p style={{
        color: designSystem.colors.neutral.gray600,
        margin: '0'
      }}>
        {message}
      </p>
    </Modal>
  );
}
