import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import './styles/global.css'

// Mobile URL bars resize the viewport constantly while scrolling;
// ignoring those resizes stops pinned sections from jumping.
ScrollTrigger.config({ ignoreMobileResize: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
