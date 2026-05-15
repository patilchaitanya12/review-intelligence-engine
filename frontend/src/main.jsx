import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CustomerApp from './CustomerApp.jsx'
import LandingApp from './LandingApp.jsx'

const path = window.location.pathname;

let Component;
if (path === "/" || path === "") {
  Component = LandingApp;
} else if (path.startsWith("/compare")) {
  Component = CustomerApp;
} else if (path.startsWith("/seller")) {
  Component = App;
} else {
  Component = LandingApp;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>,
)