/**
 * Tema Chakra UI - ADVGD CRM
 * Visual inspirado no Horizon UI, adaptado para as cores da marca
 * (Azul Marinho #003f7f + Ouro #c9a961).
 *
 * As cores aqui espelham o designSystem.ts existente para manter
 * consistencia entre os componentes antigos (Tailwind) e os novos (Chakra)
 * durante a migracao.
 */
import { extendTheme } from '@chakra-ui/react';
const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};
export const chakraTheme = extendTheme({
    config,
    colors: {
        // Azul marinho da marca como cor primaria (brand)
        brand: {
            50: '#e3f2fd',
            100: '#bbdefb',
            200: '#90caf9',
            300: '#64b5f6',
            400: '#1565c0',
            500: '#0d47a1',
            600: '#003f7f',
            700: '#003266',
            800: '#00254d',
            900: '#001a35',
        },
        // Ouro/dourado da marca como acento
        gold: {
            50: '#faf6ec',
            100: '#f1e6c9',
            200: '#e8d7b5',
            300: '#dcc592',
            400: '#d0b478',
            500: '#c9a961',
            600: '#a68039',
            700: '#876730',
            800: '#684f25',
            900: '#49381a',
        },
        // Escala navy exata do Horizon (usada pelo dark mode)
        navy: {
            50: '#d0dcfb',
            100: '#aac0fe',
            200: '#a3b9f8',
            300: '#728fea',
            400: '#3652ba',
            500: '#1b3bbb',
            600: '#24388a',
            700: '#1B254B',
            800: '#111c44',
            900: '#0b1437',
        },
        secondaryGray: {
            100: '#e0e5f2',
            200: '#e1e9f8',
            300: '#f4f7fe',
            400: '#e9edf7',
            500: '#8f9bba',
            600: '#a3aed0',
            700: '#707eae',
            800: '#707eae',
            900: '#1b2559',
        },
    },
    fonts: {
        heading: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        body: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    shadows: {
        card: '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
        cardDark: '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
        cardSoft: '0px 18px 40px rgba(112, 144, 176, 0.12)',
    },
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'navy.900' : 'secondaryGray.300',
                color: props.colorMode === 'dark' ? 'white' : 'navy.700',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            },
            '*::placeholder': {
                color: 'secondaryGray.500',
            },
        }),
    },
    components: {
        Button: {
            baseStyle: {
                borderRadius: '16px',
                fontWeight: '600',
                _focus: { boxShadow: 'none' },
                _active: { boxShadow: 'none' },
            },
            variants: {
                brand: {
                    bg: 'brand.600',
                    color: 'white',
                    _hover: { bg: 'brand.700' },
                    _active: { bg: 'brand.800' },
                },
                gold: {
                    bg: 'gold.500',
                    color: 'brand.600',
                    _hover: { bg: 'gold.600', color: 'white' },
                },
            },
        },
        Heading: {
            baseStyle: { color: 'navy.700', fontWeight: '700' },
        },
    },
});
export default chakraTheme;
