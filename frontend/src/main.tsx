import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { initSentry } from './services/sentry'
import App from './App'
import { chakraTheme } from './theme/chakra'
import './styles/globals.css'

// Initialize Sentry BEFORE rendering the app
initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={chakraTheme.config.initialColorMode} />
    <ChakraProvider theme={chakraTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
