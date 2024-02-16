import { GoogleOAuthProvider } from "@react-oauth/google";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import MainPage from "./pages/MainPage";
function App() {
  const GoogleId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
  return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
          <GoogleOAuthProvider clientId={GoogleId}>
            <MainPage />
          </GoogleOAuthProvider>
      </LocalizationProvider>
  )
}

export default App
