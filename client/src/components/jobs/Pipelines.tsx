import React, {useDeferredValue, useEffect, useState} from "react";
import {Box, Divider, Stack, TextField} from "@mui/material";
import PipelinesTable from "./PipelinesTable.tsx";
import PipelineJobsTable from "./PipelineJobsTable.tsx";
import CapellaCharts from "../charts/CapellaCharts.tsx";
import CalandarRangePick from "../calendar/DateSelector.tsx";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";


const Pipelines: React.FC = () => {
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const appContext = useAppContext();
    const taskDispatch = useAppTaskDispatch();

    useEffect(() => {
        const pipelinesData = appContext.pipelinesData;
        const pipelineJobsData = appContext.pipelineJobsData;
        let filteredPipelinesData = pipelinesData.filter((value) => value.jobName.includes(deferredSearch) || value.description?.includes(deferredSearch));
        let filteredPipelineJobsData = pipelineJobsData.filter((value) => value.jobName.includes(deferredSearch));
        let pipelinesSearchFilter: string[] = [];
        pipelinesSearchFilter = pipelinesSearchFilter.concat(filteredPipelinesData.map(value => value.id));
        pipelinesSearchFilter = pipelinesSearchFilter.concat(filteredPipelineJobsData.map(value => value.pipelineId));
        taskDispatch({
            type: 'pipelineSearchFiltersChanged',
            pipelineSearchFilters: pipelinesSearchFilter,
        })
    }, [deferredSearch]);

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
                <TextField label='Search by pipeline name or description'
                           value={search}
                           sx={{width: '100%'}}
                           onChange={(e) => setSearch(e.target.value)}
                />
                <Divider textAlign="left">Pipelines</Divider>
                <PipelinesTable search={deferredSearch}/>
                <Divider textAlign="left">Pipeline Jobs</Divider>
                <PipelineJobsTable search={deferredSearch}/>
            </Box>
        </Box>
    );
}

export default Pipelines;