import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'


createRoot(document.getElementById('root')).render(
  <Auth0Provider
      domain="dev-upy3vx7yj5qed3fl.us.auth0.com"
      clientId="lOY49jXlQ0O7v08clF4sVLwQjs2dAHuP"
      authorizationParams={{
        audience: "https://dev-upy3vx7yj5qed3fl.us.auth0.com/api/v2/",
        redirect_uri: window.location.origin
      }}
    >
    <App />
  </Auth0Provider>,
)