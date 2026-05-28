import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { designSystem } from '@/theme/designSystem';
export const TopBar = ({ title = 'Dashboard', subtitle, actions }) => {
    const { user } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    return (_jsx("div", { className: "sticky top-0 z-40 px-8 py-4 shadow-md", style: {
            backgroundColor: designSystem.colors.neutral.white,
            borderBottom: `2px solid ${designSystem.colors.accent.gold}`,
        }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", style: { color: designSystem.colors.primary.dark }, children: title }), subtitle && (_jsx("p", { className: "text-sm mt-1", style: { color: designSystem.colors.neutral.gray500 }, children: subtitle }))] }), actions && (_jsx("div", { className: "flex items-center gap-4", children: actions })), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowUserMenu(!showUserMenu), className: "flex items-center gap-3 px-4 py-2 rounded-lg transition-all", style: {
                                backgroundColor: designSystem.colors.primary.lighter,
                                color: designSystem.colors.primary.dark,
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor =
                                    designSystem.colors.accent.light;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor =
                                    designSystem.colors.primary.lighter;
                            }, children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center font-bold", style: {
                                        backgroundColor: designSystem.colors.accent.gold,
                                        color: designSystem.colors.primary.dark,
                                    }, children: user?.name?.charAt(0).toUpperCase() }), _jsxs("div", { className: "text-left hidden sm:block", children: [_jsx("p", { className: "text-sm font-semibold", children: user?.name }), _jsx("p", { className: "text-xs", style: { color: designSystem.colors.neutral.gray500 }, children: user?.role })] }), _jsx("span", { className: "ml-2", children: "\u25BC" })] }), showUserMenu && (_jsxs("div", { className: "absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50", style: {
                                backgroundColor: designSystem.colors.neutral.white,
                                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                            }, children: [_jsx("button", { className: "w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2", children: "\uD83D\uDC64 Perfil" }), _jsx("button", { className: "w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2", children: "\u2699\uFE0F Configura\u00E7\u00F5es" }), _jsx("button", { className: "w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 border-t", style: {
                                        borderColor: designSystem.colors.neutral.gray300,
                                        color: designSystem.colors.status.error,
                                    }, children: "\uD83D\uDEAA Sair" })] }))] })] }) }));
};
// Card Component com design system
export const Card = ({ children, title, subtitle, icon, className = '', hoverable = false, style = {} }) => {
    return (_jsxs("div", { className: `rounded-lg p-6 ${hoverable ? 'cursor-pointer transition-all' : ''} ${className}`, style: {
            backgroundColor: designSystem.colors.neutral.white,
            border: `1px solid ${designSystem.colors.neutral.gray200}`,
            boxShadow: designSystem.shadows.md,
            ...(hoverable && {
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
            }),
            ...style,
        }, onMouseEnter: (e) => {
            if (hoverable) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = designSystem.shadows.lg;
            }
        }, onMouseLeave: (e) => {
            if (hoverable) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = designSystem.shadows.md;
            }
        }, children: [(title || icon) && (_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [icon && _jsx("span", { className: "text-2xl", children: icon }), _jsxs("div", { children: [title && (_jsx("h3", { className: "font-semibold text-lg", style: { color: designSystem.colors.primary.dark }, children: title })), subtitle && (_jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: subtitle }))] })] })), children] }));
};
// Button Component com design system
export const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, style = {} }) => {
    const sizeStyles = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    const variantStyles = {
        primary: {
            backgroundColor: designSystem.colors.primary.dark,
            color: designSystem.colors.neutral.white,
            border: 'none',
        },
        secondary: {
            backgroundColor: designSystem.colors.accent.gold,
            color: designSystem.colors.primary.dark,
            border: 'none',
        },
        success: {
            backgroundColor: designSystem.colors.status.success,
            color: designSystem.colors.neutral.white,
            border: 'none',
        },
        error: {
            backgroundColor: designSystem.colors.status.error,
            color: designSystem.colors.neutral.white,
            border: 'none',
        },
        outline: {
            backgroundColor: 'transparent',
            color: designSystem.colors.primary.dark,
            border: `2px solid ${designSystem.colors.primary.dark}`,
        },
    };
    return (_jsx("button", { onClick: onClick, disabled: disabled, className: `rounded-lg font-semibold transition-all ${sizeStyles[size]} ${className}`, style: {
            ...variantStyles[variant],
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...style,
        }, onMouseEnter: (e) => {
            if (!disabled) {
                e.currentTarget.style.opacity = '0.9';
            }
        }, onMouseLeave: (e) => {
            if (!disabled) {
                e.currentTarget.style.opacity = '1';
            }
        }, children: children }));
};
// Badge Component
export const Badge = ({ children, variant = 'primary', size = 'md' }) => {
    const sizeStyles = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
    };
    const variantColors = {
        primary: {
            bg: designSystem.colors.primary.lighter,
            text: designSystem.colors.primary.dark,
        },
        success: {
            bg: '#d4edda',
            text: designSystem.colors.status.success,
        },
        warning: {
            bg: '#fff3cd',
            text: designSystem.colors.status.warning,
        },
        error: {
            bg: '#f8d7da',
            text: designSystem.colors.status.error,
        },
        info: {
            bg: '#d1ecf1',
            text: designSystem.colors.status.info,
        },
    };
    return (_jsx("span", { className: `rounded-full font-medium ${sizeStyles[size]}`, style: {
            backgroundColor: variantColors[variant].bg,
            color: variantColors[variant].text,
        }, children: children }));
};
