import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import {useState} from "react";
import { ProductMenu } from "./ProductMenu";
import UserMenu from "./UserMenu";
import VersionMenu from "./VersionMenu";
import Styles from "./styles";
import {FilterMenu} from "./FilterMenu";

const AppBarComponent: React.FC = () => {
  //const [selectedProd, setSelectedProd] = useState(Products.indexOf(localStorage.getItem('scope') || ""));
  //const [version, setVersion] = useState<string>(versions[0]);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const buildsFilterItems = [5, 10, 25];
  const runsFilterItems = [0, 2000, 5000, 10000];

  const handleLogin = (response: any) => {
    setLoggedIn(true);
    setUserName(response.profileObj.name);
    localStorage.setItem("user", response.profileObj.name);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserName('');
    localStorage.setItem("user", "");
  };

  return (
    <AppBar position="absolute" sx={Styles.toolBar} >
        <Toolbar>
            <LeaderboardIcon sx={Styles.appLogo} />
            <Typography variant='h4'  component="a" href='#' sx={Styles.appLogoText}>
              Greenboard
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box display='flex'>
                <ProductMenu />
                <VersionMenu />
                <FilterMenu title="Builds" items={buildsFilterItems} scopeVariable='buildFilter' scopeAction='buildFilterChanged' />
                <FilterMenu title="Runs" items={runsFilterItems} scopeVariable='runFilter' scopeAction='runFilterChanged' />
                <UserMenu isLoggedIn={isLoggedIn} userName={userName} handleLogin={handleLogin} handleLogout={handleLogout} />
            </Box>
        </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
