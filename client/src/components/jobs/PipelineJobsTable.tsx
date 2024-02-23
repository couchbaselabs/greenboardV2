import {Link, Stack} from "@mui/material";
import React, {useEffect, useState} from "react";
import {GridColDef, GridToolbar, GridValueGetterParams} from "@mui/x-data-grid";
import {StyledDataGrid} from "./StyledDataGrip.tsx";
import {getRowClassName} from "../../Utils/StylesUtils.tsx";
import PipelineJobDetailsModal from "./PipelineJobDetailsModal.tsx";
import {KeyboardArrowDown} from "@mui/icons-material";
import {formatDuration} from "../../Utils/DateUtils.ts";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";
import {NoData} from "../misc/NoData.tsx";
import {TestCaseDetailsModal} from "./TestCaseDetailsModal.tsx";


const PipelineJobsTable : React.FC = () => {
    const [openJobDialog, setOpenJobDialog] = useState(false);
    const [openTestCaseDialog, setOpenTestCaseDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState<PipelineJobsModal | null>(null);
    const [selectedJobTestCase, setSelectedJobTestCase] = useState<TestCaseDetailModal>({docId: "", testName:""});
    const [selectedTestStatus, setSelectedTestStatus] = useState("");
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });
    const [fullJobsData, setFullJobsData] = useState<PipelineData | null>(null);
    const [jobs, setJobs] = useState<PipelineJob[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    const appContext = useAppContext();
    const platformFilters = appContext.platformFilters;
    const featureFilters = appContext.featureFilters;
    const variantFilters = appContext.variantFilters;
    const pipelineFilters = appContext.pipelineFilters;
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
        if(appContext.scope !== "capella") {
            return
        }
        setIsLoading(true);
        setNoData(false);
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
                    return;
                }
                setFullJobsData(data);
                if(data.hasOwnProperty(env)) {
                    setJobs(data[env].jobs);
                    calculateSideBarItems(data[env].jobs);
                } else {
                    const newEnv = Object.keys(data)[0]
                    setJobs(data[newEnv].jobs);
                    calculateSideBarItems(data[newEnv].jobs);
                    taskDispatch({
                        type: "buildIdChanged",
                        buildID: newEnv
                    })
                }
                setIsLoading(false);
                setNoData(false);
            })
            .catch(console.error);
    }, [appContext.scope, appContext.startDate, appContext.endDate]);

    useEffect(() => {
        if(fullJobsData){
            setNoData(false);
            setJobs(fullJobsData[env].jobs);
            calculateSideBarItems(fullJobsData[env].jobs);
        }
    }, [env])

    // @ts-ignore
    const handleJobOpenDialog = (row) => {
        const job: PipelineJobsModal = {
            jobName: row.jobName,
            jobs: row.jobs
        }
        setSelectedJob(job);
        setOpenJobDialog(true);
    };

    // @ts-ignore
    const handleOpenTestCaseDialog = (row) => {
        const job: TestCaseDetailModal = {
            docId: row.id,
            testName: row.jobName
        }
        setSelectedJobTestCase(job);
        setOpenTestCaseDialog(true);
    }

    const handleCloseJobDialog = () => {
        setOpenJobDialog(false);
        setSelectedJob(null);
    };

    const handleCloseTestDialog = () => {
        setOpenTestCaseDialog(false);
        setSelectedJobTestCase({docId: "", testName: ""});
        setSelectedTestStatus("");
    }

    let rows = [];
    if(jobs){
        for (const job of jobs) {
            const parentName = job.jobName;
            const parentUrl = job.url;
            const cbVersion = job.cbVersion;
            const cpVersion = job.cpVersion;
            const pipelineJobs = job.jobs;
            const pipelineId = job.id;
            for (const pipelineJobName in pipelineJobs){
                const pipelineJobsData = pipelineJobs[pipelineJobName];
                const bestRunDetails = pipelineJobsData.reduce((prev,
                                                                current) =>
                    (prev.passCount > current.passCount)?prev: current, pipelineJobsData[0]);
                const row = {
                    ...bestRunDetails,
                    parentName: parentName,
                    parentUrl: parentUrl,
                    cbVersion: cbVersion,
                    cpVersion: cpVersion,
                    jobs: pipelineJobsData,
                    jobName: pipelineJobName,
                    pipelineId: pipelineId,
                };
                rows.push(row);
            }
        }
    }

    // Filter out rows based on filters
    rows = rows.filter((value) => platformFilters.includes(value.provider.toUpperCase()));
    rows = rows.filter((value) => featureFilters.includes(value.component.toUpperCase()));
    for (const variantKey in variantFilters) {
        if(variantKey === "CP Version"){
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cpVersion));
        } else if(variantKey === "CB Version") {
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cbVersion));
        }
    }
    if(pipelineFilters.length > 0) {
        rows = rows.filter((value) => pipelineFilters.includes(value.pipelineId));
    }

    const columns: GridColDef[] = [
        {
            field: 'more',
            width: 10,
            headerName: "",
            filterable: false,
            renderCell: (params) => {
                const hasExtraInfo = params.row.jobs && params.row.jobs.length > 1;
                return hasExtraInfo ? (
                    <Stack direction="row">
                        <Link href="#" onClick={() => handleJobOpenDialog(params.row)}><KeyboardArrowDown /></Link>
                    </Stack>
                ) : (
                    <></>
                );
            }
        },
        {
            field: 'jobName', headerName: 'Job Name', width: 350,
            renderCell: (params) => {
                return(
                    <Link href={`${params.row.url}testReport`} target="_blank">
                        <div>{params.value.length > 40?
                            `${params.value.substring(0,37)}...`:
                            params.value
                        }</div>
                    </Link>
                );
            },
        },
        { field: 'result', headerName: 'Result', width: 100 },
        { field: 'failCount', headerName: 'Fail Count', width: 80,
            renderCell: (params) => {
                const failCount = params.value;
                return (
                    failCount === 0?
                        (
                            <div>{failCount}</div>
                        ):
                        (
                            <Link href="#" onClick={() => {
                                handleOpenTestCaseDialog(params.row);
                                setSelectedTestStatus("FAILED");
                            }}>{failCount}</Link>
            )
                )
            }
        },
        { field: 'passCount', headerName: 'Pass Count', width: 80,
            renderCell: (params) => {
                const passCount = params.value;
                return (
                    passCount === 0?
                        (
                            <div>{passCount}</div>
                        ):
                        (
                            <Link href="#" onClick={() => {
                                handleOpenTestCaseDialog(params.row);
                                setSelectedTestStatus("PASSED");
                            }}>{passCount}</Link>
                        )
                )
            }
        },
        { field: 'totalCount', headerName: 'Total Count', type: 'number', width: 80 },
        { field: 'duration', headerName: 'Duration', width: 100, valueGetter: (params: GridValueGetterParams) => formatDuration(params.value)},
        { field: 'runDate', headerName: 'Run Date', width: 180, valueGetter: (params) => new Date(params.row.runDate).toLocaleString() },
        { field: 'provider', headerName: 'Provider', width: 100, valueGetter: (params) => params.value.toUpperCase() },
        { field: 'cpVersion', headerName: 'CP version', width: 110 },
        { field: 'cbVersion', headerName: 'CB version', width: 120 },
        { field: 'parentName', headerName: 'Pipeline Job', width: 200,
            renderCell: (params) => (<Link href={params.row.parentUrl} target="_blank">{params.value}</Link>) },
        { field: 'component', headerName: 'Component', width: 100}
    ];

    if(noData) {
        return (
            <NoData />
        );
    }

    return (
        <>
            <StyledDataGrid columns={columns} rows={rows}
                            initialState={{
                                sorting: {
                                    sortModel: [{field: 'jobName', sort: 'asc'}]
                                },
                                columns: {
                                    columnVisibilityModel: {
                                        component: false,
                                    }
                                },
                            }}
                            getRowClassName={(params) => `data-grid--${getRowClassName(params)}`}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[5, 10, 25, 50, 100]}
                            loading={isLoading}
                            slots={{
                                toolbar: GridToolbar,
                            }}
            />
            <PipelineJobDetailsModal open={openJobDialog} onClose={handleCloseJobDialog} job={selectedJob} />
            <TestCaseDetailsModal testName={selectedJobTestCase?.testName}
                                  result={selectedTestStatus}
                                  docId={selectedJobTestCase?.docId}
                                  isModalOpen={openTestCaseDialog}
                                  onClose={handleCloseTestDialog} />
        </>
    )
};

export default PipelineJobsTable;