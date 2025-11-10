import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-upy3vx7yj5qed3fl.us.auth0.com"
    clientId="lOY49jXlQ007v08cIF4sVLwQjs2dAHuP"
    authorizationParams={{
      redirect_uri: window.location.origin,            
      audience: "https://pf-filmes-api",               
      scope: "openid profile email"
    }}
    cacheLocation="localstorage"
    useRefreshTokens
  >
    <App />
  </Auth0Provider>
)
