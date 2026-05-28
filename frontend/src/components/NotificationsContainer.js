import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
const NotificationItem = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(notification.id), 5000);
        return () => clearTimeout(timer);
    }, [notification.id, onClose]);
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return _jsx(CheckCircle, { className: "text-green-400", size: 20 });
            case 'error':
                return _jsx(AlertCircle, { className: "text-red-400", size: 20 });
            case 'warning':
                return _jsx(AlertTriangle, { className: "text-yellow-400", size: 20 });
            case 'info':
            default:
                return _jsx(Info, { className: "text-blue-400", size: 20 });
        }
    };
    const getBackgroundColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-500/10 border-green-500/30';
            case 'error':
                return 'bg-red-500/10 border-red-500/30';
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/30';
            case 'info':
            default:
                return 'bg-blue-500/10 border-blue-500/30';
        }
    };
    const getTextColor = () => {
        switch (notification.type) {
            case 'success':
                return 'text-green-300';
            case 'error':
                return 'text-red-300';
            case 'warning':
                return 'text-yellow-300';
            case 'info':
            default:
                return 'text-blue-300';
        }
    };
    return (_jsxs("div", { className: `flex items-start gap-3 p-4 rounded-lg border ${getBackgroundColor()} mb-2 animate-in fade-in slide-in-from-right`, children: [_jsx("div", { className: "flex-shrink-0", children: getIcon() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: `font-semibold ${getTextColor()}`, children: notification.title }), _jsx("p", { className: "text-gray-300 text-sm", children: notification.message })] }), _jsx("button", { onClick: () => onClose(notification.id), className: "flex-shrink-0 text-gray-400 hover:text-gray-300 transition", children: _jsx(X, { size: 16 }) })] }));
};
export const NotificationsContainer = ({ notifications, onRemove, }) => {
    if (notifications.length === 0)
        return null;
    return (_jsx("div", { className: "fixed top-4 right-4 w-96 max-w-full z-50 pointer-events-none", children: _jsx("div", { className: "pointer-events-auto space-y-2", children: notifications.map((notification) => (_jsx(NotificationItem, { notification: notification, onClose: onRemove }, notification.id))) }) }));
};
export default NotificationsContainer;
