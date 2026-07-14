import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ADVGDLogo = ({ size = 'medium', variant = 'full', showText = true, className = '' }) => {
    const sizeMap = {
        small: 40,
        medium: 60,
        large: 80,
        xlarge: 120,
    };
    const iconSize = sizeMap[size];
    const textSize = {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 28,
    }[size];
    return (_jsxs("div", { className: `flex items-center gap-3 ${className}`, children: [(variant === 'full' || variant === 'icon') && (_jsxs("svg", { width: iconSize, height: iconSize, viewBox: "0 0 120 120", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "drop-shadow-lg", children: [_jsx("circle", { cx: "60", cy: "60", r: "55", stroke: "#c9a961", strokeWidth: "3", fill: "none" }), _jsx("path", { d: "M 30 60 Q 25 50 25 60 Q 25 70 30 60", fill: "#c9a961", opacity: "0.8" }), _jsx("path", { d: "M 90 60 Q 95 50 95 60 Q 95 70 90 60", fill: "#c9a961", opacity: "0.8" }), _jsxs("g", { fill: "#003f7f", children: [_jsx("path", { d: "M 35 40 L 35 80 Q 35 85 40 85 Q 55 85 55 62 Q 55 40 40 40 Q 35 40 35 40", fill: "#c9a961", stroke: "#003f7f", strokeWidth: "2" }), _jsx("path", { d: "M 65 85 L 65 40 L 80 40 Q 85 40 85 45 Q 85 55 70 55 L 65 55", fill: "none", stroke: "#c9a961", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("circle", { cx: "77", cy: "50", r: "8", fill: "none", stroke: "#c9a961", strokeWidth: "2.5" })] }), _jsx("line", { x1: "40", y1: "90", x2: "80", y2: "90", stroke: "#c9a961", strokeWidth: "2", opacity: "0.5" })] })), (variant === 'full' || variant === 'text') && showText && (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { style: {
                            fontSize: `${textSize}px`,
                            fontWeight: 'bold',
                            color: '#003f7f',
                            fontFamily: '"Segoe UI", sans-serif',
                            lineHeight: '1.2',
                        }, children: "ADVGD" }), _jsx("span", { style: {
                            fontSize: `${textSize * 0.6}px`,
                            color: '#c9a961',
                            fontFamily: '"Segoe UI", sans-serif',
                            fontWeight: '500',
                            letterSpacing: '2px',
                        }, children: "CRM" })] }))] }));
};
// Variante com texto completo (para header)
export const ADVGDLogoDiego = ({ size = 'medium', className = '', }) => {
    const imgSize = {
        small: 120,
        medium: 170,
        large: 220,
        xlarge: 280,
    }[size];
    return (_jsx("div", { className: `flex flex-col items-center ${className}`, children: _jsx("img", { src: "/logo.png", alt: "Diego Patr\u00EDcio Advogado", style: { width: `${imgSize}px`, height: 'auto', borderRadius: '12px' } }) }));
};
