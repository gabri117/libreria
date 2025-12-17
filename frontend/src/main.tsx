import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { SessionProvider } from './context/SessionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SessionProvider>
  </StrictMode>,
)
