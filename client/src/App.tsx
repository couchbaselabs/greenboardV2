import { GoogleOAuthProvider } from "@react-oauth/google";
import MainPage from "./pages/MainPage";
function App() {
  const GoogleId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
  return (
          <GoogleOAuthProvider clientId={GoogleId}>
            <MainPage />
          </GoogleOAuthProvider>
  )
}

export default App
