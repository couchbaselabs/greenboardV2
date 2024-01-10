import {Box, Stack, ThemeProvider, CssBaseline, Divider} from "@mui/material";
import AppBarComponent from "../components/navbar/AppBar";
import SiderComponent from "../components/sidebar/SideBar";
import BuildChartComponent from "../components/charts/BuildsChart";
import JobTable from "../components/jobs/DataTable";
import React from "react";
import theme from "../theme";
import {AppContextProvider} from "../context/context";

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
                        <Stack direction='row' sx={{ height: '90%' }}>
                            <SiderComponent/>
                            <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <Box sx={{
                                    height: '20%', /* Chart takes up 30% of the height */
                                    width: '100%',
                                    margin: '3em',
                                }}>
                                    <BuildChartComponent/>
                                </Box>
                                <Divider />
                                <Box sx={{
                                    height: '80%', /* JobTable takes the remaining 70% of the height */
                                    width: '100%',
                                    overflowY: 'auto' /* Added auto to handle scrolling */
                                }}>
                                    <JobTable/>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </AppContextProvider>
            </ThemeProvider>
        </React.Fragment>
    );
};
export default MainPage;