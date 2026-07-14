import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { initSentry } from './services/sentry';
import App from './App';
import { chakraTheme } from './theme/chakra';
import './styles/globals.css';
// Initialize Sentry BEFORE rendering the app
initSentry();
ReactDOM.createRoot(document.getElementById('root')).render(_jsxs(React.StrictMode, { children: [_jsx(ColorModeScript, { initialColorMode: chakraTheme.config.initialColorMode }), _jsx(ChakraProvider, { theme: chakraTheme, children: _jsx(App, {}) })] }));
