import {Box, ThemeProvider, CssBaseline} from "@mui/material";
import AppBarComponent from "../components/navbar/AppBar";
import React from "react";
import theme from "../theme";
import {AppContextProvider} from "../context/context";
import MainSection from "../components/main/MainSection.tsx";

const MainPage = () => {
    return (
        <React.Fragment>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <AppContextProvider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                        <Box sx={{height: '10%'}}>
                            <AppBarComponent/>
                        </Box>
                        <MainSection />
                    </Box>
                </AppContextProvider>
            </ThemeProvider>
        </React.Fragment>
    );
};
export default MainPage;