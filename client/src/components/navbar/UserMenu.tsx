import { Select, MenuItem } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";

interface UserMenuProps {
    isLoggedIn: boolean;
    userName: string;
    handleLogin: (response: any) => void;
    handleLogout: () => void;
  }
  
  const UserMenu: React.FC<UserMenuProps> = ({ isLoggedIn, userName, handleLogin, handleLogout }) => {
    return (
      <>
        {isLoggedIn ? (
          <Select value={userName}>
            <MenuItem value={userName}>{userName}</MenuItem>
            <MenuItem value="settings">Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Select>
        ) : (
          <GoogleLogin
            onSuccess={handleLogin}
            onError={handleLogout}
          />
        )}
      </>
    );
  };

  export default UserMenu
  