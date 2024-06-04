import {Box, Divider} from "@mui/material";
import BuildChartComponent from "../charts/BuildsChart.tsx";
import JobTable from "../jobs/DataTable.tsx";
import React from "react";


const DefaultMain: React.FC = () => {
    return (
        <Box component="main" sx={{ width: "80%" }}>
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
    )
}

export default DefaultMain;