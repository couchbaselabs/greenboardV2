import React from "react";
import Pipelines from "../jobs/Pipelines.tsx";
import {Box} from "@mui/material";


const CapellaMain: React.FC = () => {
    return(
        <>
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Pipelines />
            </Box>
        </>
    )
};

export default CapellaMain;