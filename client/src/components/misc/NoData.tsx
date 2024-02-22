import {Box, Typography} from "@mui/material";
import React from "react";

export const NoData: React.FC = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant={"h5"}>No Data to show for selected time frame.</Typography>
        </Box>
    );
}