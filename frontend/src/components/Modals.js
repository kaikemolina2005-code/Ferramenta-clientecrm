import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { designSystem } from '@/theme/designSystem';
export function Modal({ isOpen, onClose, title, children, size = 'medium', showCloseButton = true, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar', isDangerous = false }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    const sizeConfig = {
        small: '400px',
        medium: '600px',
        large: '900px'
    };
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("style", { children: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      ` }), _jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                            flexShrink: 0
                        }, children: [_jsx("h2", { style: {
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: designSystem.colors.primary.dark,
                                    margin: 0
                                }, children: title }), showCloseButton && (_jsx("button", { onClick: onClose, style: {
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
                                }, onMouseEnter: (e) => e.currentTarget.style.color = designSystem.colors.neutral.black, onMouseLeave: (e) => e.currentTarget.style.color = designSystem.colors.neutral.gray600, children: "\u2715" }))] }), _jsx("div", { style: {
                            padding: '24px',
                            flex: 1,
                            overflowY: 'auto'
                        }, children: children }), (onConfirm || cancelText) && (_jsxs("div", { style: {
                            display: 'flex',
                            gap: '12px',
                            padding: '20px 24px',
                            borderTop: `1px solid ${designSystem.colors.neutral.gray300}`,
                            justifyContent: 'flex-end',
                            flexShrink: 0
                        }, children: [_jsx("button", { onClick: onClose, style: {
                                    padding: '10px 20px',
                                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                    borderRadius: '6px',
                                    backgroundColor: designSystem.colors.neutral.white,
                                    color: designSystem.colors.neutral.gray600,
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: designSystem.transitions.normal
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light;
                                    e.currentTarget.style.borderColor = designSystem.colors.neutral.gray400;
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.backgroundColor = designSystem.colors.neutral.white;
                                    e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300;
                                }, children: cancelText }), onConfirm && (_jsx("button", { onClick: onConfirm, style: {
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: isDangerous ? designSystem.colors.status.error : designSystem.colors.primary.dark,
                                    color: designSystem.colors.neutral.white,
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: designSystem.transitions.normal
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.opacity = '0.9';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }, children: confirmText }))] }))] })] }));
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
export function Toast({ message, type = 'info', duration = 4000, onClose }) {
    const style = toastStyles[type];
    useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("span", { style: { fontSize: '18px' }, children: style.icon }), _jsx("span", { children: message }), onClose && (_jsx("button", { onClick: onClose, style: {
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    color: designSystem.colors.neutral.white,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0 8px'
                }, children: "\u2715" }))] }));
}
export function ToastContainer({ toasts, onRemove }) {
    return (_jsx("div", { style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 2000,
            maxWidth: '400px'
        }, children: toasts.map((toast) => (_jsx(Toast, { message: toast.message, type: toast.type, duration: toast.duration, onClose: () => onRemove(toast.id) }, toast.id))) }));
}
export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isDangerous = false, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
    return (_jsx(Modal, { isOpen: isOpen, onClose: onCancel, title: title, size: "small", onConfirm: onConfirm, confirmText: confirmText, cancelText: cancelText, isDangerous: isDangerous, children: _jsx("p", { style: {
                color: designSystem.colors.neutral.gray600,
                margin: '0'
            }, children: message }) }));
}
