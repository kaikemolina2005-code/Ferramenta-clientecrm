import { jsx as _jsx } from "react/jsx-runtime";
export function GlassCard({ children, className = '' }) {
    return (_jsx("div", { className: `glass-card p-6 ${className}`, children: children }));
}
export function Button({ variant = 'primary', size = 'md', isLoading = false, children, className = '', ...props }) {
    const baseClasses = 'font-poppins font-semibold rounded-lg transition-all duration-300';
    const variantClasses = {
        primary: 'bg-dark-blue text-white hover:bg-opacity-90',
        secondary: 'bg-light-gray text-dark-blue hover:bg-opacity-80',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    return (_jsx("button", { className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`, disabled: isLoading || props.disabled, ...props, children: isLoading ? 'Carregando...' : children }));
}
export function Badge({ color = 'blue', children }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        gray: 'bg-gray-100 text-gray-800',
    };
    return (_jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`, children: children }));
}
