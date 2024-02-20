import React, {useEffect, useState} from "react";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";
import {Box, CircularProgress, Divider, Stack, Typography} from "@mui/material";
import PipelinesTable from "./PipelinesTable.tsx";
import PipelineJobsTable from "./PipelineJobsTable.tsx";
import CapellaCharts from "../charts/CapellaCharts.tsx";
import CalandarRangePick from "../calendar/DateSelector.tsx";


const NoData: React.FC = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant={"h5"}>No Data to show for selected time frame.</Typography>
        </Box>
    )
}

const Pipelines : React.FC = () => {
    const [fullJobsData, setFullJobsData] = useState<PipelineData | null>(null);
    const [jobsData, setJobsData] = useState<PipelineJob[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    const appContext = useAppContext();
    const env = appContext.environment;
    const taskDispatch = useAppTaskDispatch()

    const calculateSideBarItems = (data: PipelineJob[]) => {
        let sideBarData: SideBarData = {
            platforms: {},
            features: {},
            variants: {},
        }
        for (const pipelineJob of data) {
            const cpVersion = pipelineJob.cpVersion;
            const cbVersion = pipelineJob.cbVersion;
            if(!sideBarData.variants['CP Version']){
                sideBarData.variants['CP Version'] = {
                }
            }
            if(!sideBarData.variants['CP Version'][cpVersion]){
                sideBarData.variants['CP Version'][cpVersion] = {
                    totalCount: 0,
                    failCount: 0,
                    pending: 0
                }
            }
            if(!sideBarData.variants['CB Version']){
                sideBarData.variants['CB Version'] = {
                }
            }
            if(!sideBarData.variants['CB Version'][cbVersion]){
                sideBarData.variants['CB Version'][cbVersion] = {
                    totalCount: 0,
                    failCount: 0,
                    pending: 0
                }
            }
            for (const jobsKey in pipelineJob.jobs) {
                const jobs = pipelineJob.jobs[jobsKey];
                const job = jobs.reduce((prev,
                                                   current) =>
                    (prev.passCount > current.passCount)?prev: current, jobs[0]);
                const component = job.component.toUpperCase();
                const platform = job.provider.toUpperCase();
                if(!sideBarData.platforms[platform]){
                    sideBarData.platforms[platform] = {
                        totalCount: 0,
                        failCount: 0,
                        pending: 0
                    }
                }
                sideBarData.platforms[platform].totalCount += job.totalCount;
                sideBarData.platforms[platform].failCount += job.failCount;
                if(!sideBarData.features[component]){
                    sideBarData.features[component] = {
                        totalCount: 0,
                        failCount: 0,
                        pending: 0
                    }
                }
                sideBarData.features[component].totalCount += job.totalCount;
                sideBarData.features[component].failCount += job.failCount;
                sideBarData.variants['CP Version'][cpVersion].totalCount += job.totalCount;
                sideBarData.variants['CP Version'][cpVersion].failCount += job.failCount;
                sideBarData.variants['CB Version'][cbVersion].totalCount += job.totalCount;
                sideBarData.variants['CB Version'][cbVersion].failCount += job.failCount;
            }
        }
        taskDispatch({
            type: "sideBarDataChanged",
            sideBarData: sideBarData
        });
        taskDispatch({
            type: "buildIdChanged",
            buildID: env
        })
    }

    useEffect(() => {
        setIsLoading(true);
        setNoData(false);
        if(appContext.scope === "capella") {
            const startDate = appContext.startDate;
            const endDate = appContext.endDate;
            const api = `${import.meta.env.VITE_APP_SERVER}/pipeline_jobs/capella?startDate=${startDate}&endDate=${endDate}`
            console.log("fetching Data");
            fetch(api)
                .then((res) => res.json())
                .then((data) => {
                    if(Object.entries(data).length == 0) {
                        setNoData(true);
                        setIsLoading(false);
                    }
                    setFullJobsData(data);
                    if(data.hasOwnProperty(env)) {
                        setJobsData(data[env].jobs);
                    } else {
                        const newEnv = Object.keys(data)[0]
                        setJobsData(data[newEnv].jobs);
                        taskDispatch({
                            type: "buildIdChanged",
                            buildID: newEnv
                        })
                    }
                    setIsLoading(false);
                    setNoData(false);
                    calculateSideBarItems(data[env].jobs);
                })
                .catch(console.error);
        }
    }, [appContext.scope, appContext.startDate, appContext.endDate]);

    useEffect(() => {
        if(fullJobsData){
            setNoData(false);
            setJobsData(fullJobsData[env].jobs);
            calculateSideBarItems(fullJobsData[env].jobs);
        }
    }, [env])

    if(isLoading) {
        return (
            <Box>
                <CircularProgress/>
            </Box>
        );
    }

    // @ts-ignore
    return (
        <Box sx={{
            mt: 3
        }}>
            <Stack direction='row' display='flex' justifyContent='space-between'>
                {isLoading?
                    <CircularProgress />:
                    fullJobsData && !noData?
                        <CapellaCharts data={fullJobsData} /> :
                        <NoData />
                }
                <Divider orientation="vertical" variant="middle" flexItem />
                <CalandarRangePick />
            </Stack>
            <Box sx={{
                justifyContent: 'center'
            }}>
                <Divider textAlign="left">Pipelines</Divider>
                {isLoading?
                    <CircularProgress />:
                    jobsData && !noData?
                        <PipelinesTable jobs={jobsData} loading={isLoading}/>:
                        <NoData />
                }
                <Divider textAlign="left">Pipeline Jobs</Divider>
                {isLoading?
                    <CircularProgress />:
                    jobsData && !noData?
                        <PipelineJobsTable jobs={jobsData} loading={isLoading} />:
                        <NoData />
                }
            </Box>
        </Box>
    )
}

export default Pipelines;