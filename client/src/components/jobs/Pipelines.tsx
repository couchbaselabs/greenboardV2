import React from "react";
import {Box, Divider, Stack} from "@mui/material";
import PipelinesTable from "./PipelinesTable.tsx";
import PipelineJobsTable from "./PipelineJobsTable.tsx";
import CapellaCharts from "../charts/CapellaCharts.tsx";
import CalandarRangePick from "../calendar/DateSelector.tsx";


const Pipelines: React.FC = () => {
    // @ts-ignore
    return (
        <Box sx={{
            mt: 3
        }}>
            <Stack direction='row' display='flex' justifyContent='space-between'>
                <CapellaCharts/>
                <Divider orientation="vertical" variant="middle" flexItem/>
                <CalandarRangePick/>
            </Stack>
            <Box sx={{
                justifyContent: 'center'
            }}>
                <Divider textAlign="left">Pipelines</Divider>
                <PipelinesTable/>
                <Divider textAlign="left">Pipeline Jobs</Divider>
                <PipelineJobsTable/>
            </Box>
        </Box>
    );
}

export default Pipelines;