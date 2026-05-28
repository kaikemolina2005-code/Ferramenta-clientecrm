/**
 * Design System - ADVGD CRM
 * Baseado na logo Diego Patrício Advogado
 *
 * Cores Principais:
 * - Azul Marinho (Profissional): #003f7f
 * - Ouro/Dourado (Acento): #c9a961
 * - Branco (Fundo): #ffffff
 */
export const designSystem = {
    colors: {
        // Primárias
        primary: {
            dark: '#003f7f', // Azul marinho profissional
            main: '#0d47a1', // Azul um pouco mais claro
            light: '#1565c0', // Azul ainda mais claro
            lighter: '#e3f2fd', // Azul muito claro para backgrounds
        },
        // Acento (Ouro)
        accent: {
            gold: '#c9a961', // Ouro principal
            light: '#e8d7b5', // Ouro claro
            dark: '#a68039', // Ouro escuro
        },
        // Neutros
        neutral: {
            white: '#ffffff',
            light: '#f5f5f5',
            gray100: '#f0f0f0',
            gray200: '#e8e8e8',
            gray300: '#d0d0d0',
            gray400: '#999999',
            gray500: '#666666',
            gray600: '#444444',
            black: '#1a1a1a',
        },
        // Status
        status: {
            success: '#27ae60',
            error: '#c0392b',
            warning: '#e67e22',
            info: '#3498db',
        },
        // Gradientes
        gradients: {
            primary: 'linear-gradient(135deg, #003f7f 0%, #0d47a1 100%)',
            gold: 'linear-gradient(135deg, #c9a961 0%, #e8d7b5 100%)',
            dark: 'linear-gradient(135deg, #003f7f 0%, #1a1a1a 100%)',
        },
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
    },
    typography: {
        fontFamily: {
            primary: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            secondary: 'Georgia, serif',
        },
        fontSize: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '20px',
            xxl: '24px',
            xxxl: '32px',
            title: '40px',
        },
        fontWeight: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
        },
    },
    borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 63, 127, 0.05)',
        md: '0 4px 8px rgba(0, 63, 127, 0.1)',
        lg: '0 12px 24px rgba(0, 63, 127, 0.15)',
        xl: '0 20px 40px rgba(0, 63, 127, 0.2)',
        gold: '0 4px 16px rgba(201, 169, 97, 0.3)',
    },
    transitions: {
        fast: 'all 0.15s ease-in-out',
        normal: 'all 0.3s ease-in-out',
        slow: 'all 0.5s ease-in-out',
    },
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px',
    },
};
// Temas pré-configurados
export const lightTheme = {
    ...designSystem,
    bgPrimary: designSystem.colors.neutral.white,
    bgSecondary: designSystem.colors.neutral.light,
    bgTertiary: designSystem.colors.primary.lighter,
    textPrimary: designSystem.colors.neutral.black,
    textSecondary: designSystem.colors.neutral.gray500,
    border: designSystem.colors.neutral.gray300,
};
export const darkTheme = {
    ...designSystem,
    bgPrimary: designSystem.colors.neutral.black,
    bgSecondary: designSystem.colors.neutral.gray600,
    bgTertiary: designSystem.colors.primary.dark,
    textPrimary: designSystem.colors.neutral.white,
    textSecondary: designSystem.colors.neutral.gray300,
    border: designSystem.colors.neutral.gray500,
};
