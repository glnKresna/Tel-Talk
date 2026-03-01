import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'

createRoot(document.getElementById('root')!).render(
  // TODO: Wrap the <App /> component inside <BrowserRouter>
  <StrictMode>
    <App />
  </StrictMode>,
)