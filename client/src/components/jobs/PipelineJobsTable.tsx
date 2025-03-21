import { Link, Stack, Tooltip} from "@mui/material";
import React, {useEffect, useState} from "react";
import {GridColDef, GridToolbar, GridValueGetterParams} from "@mui/x-data-grid";
import {StyledDataGrid} from "./StyledDataGrip.tsx";
import {getRowClassName} from "../../Utils/StylesUtils.tsx";
import PipelineJobDetailsModal from "./PipelineJobDetailsModal.tsx";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import {formatDuration} from "../../Utils/DateUtils.ts";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";
import {NoData} from "../misc/NoData.tsx";
import {TestCaseDetailsModal} from "./TestCaseDetailsModal.tsx";
import AnalysisColumnCell from "./AnalysisColumnCell";


const PipelineJobsTable : React.FC<{search: string}> = ({search}) => {
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
    const [_, setJobs] = useState<PipelineJob[] | null>(null);
    const [dataRows, setDataRows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    const appContext = useAppContext();
    const platformFilters = appContext.platformFilters;
    const featureFilters = appContext.featureFilters;
    const variantFilters = appContext.variantFilters;
    const pipelineFilters = appContext.pipelineFilters;
    const pipelineSearchFilters = appContext.pipelineSearchFilters;
    const env = appContext.environment;
    const taskDispatch = useAppTaskDispatch();

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

    // New function to update sidebar statistics based on filtered rows
    const updateSideBarItemsFromFilteredRows = (filteredRows: any[]) => {
        // Get the current sideBarData structure to preserve all items
        const currentSideBarData = appContext.sideBarData as SideBarData;
        if (!currentSideBarData || !currentSideBarData.platforms) {
            return; // Skip if no current data
        }

        // Create a new sideBarData object with the same structure as the existing one
        let updatedSideBarData: SideBarData = {
            platforms: {},
            features: {},
            variants: {},
        };

        // Initialize the structure with the same keys but zeroed counts
        // This ensures all items remain visible even if they have no jobs in the current filter
        // Platforms
        for (const platform in currentSideBarData.platforms) {
            updatedSideBarData.platforms[platform] = {
                totalCount: 0,
                failCount: 0,
                pending: 0
            };
        }
        
        // Features
        for (const feature in currentSideBarData.features) {
            updatedSideBarData.features[feature] = {
                totalCount: 0,
                failCount: 0,
                pending: 0
            };
        }
        
        // Variants
        for (const variantType in currentSideBarData.variants) {
            updatedSideBarData.variants[variantType] = {};
            for (const variant in currentSideBarData.variants[variantType]) {
                updatedSideBarData.variants[variantType][variant] = {
                    totalCount: 0,
                    failCount: 0,
                    pending: 0
                };
            }
        }

        // Update counts based on filtered rows
        for (const row of filteredRows) {
            const platform = row.provider.toUpperCase();
            const component = row.component.toUpperCase();
            const cpVersion = row.cpVersion;
            const cbVersion = row.cbVersion;
            
            // Update platform stats
            if (updatedSideBarData.platforms[platform]) {
                updatedSideBarData.platforms[platform].totalCount += row.totalCount;
                updatedSideBarData.platforms[platform].failCount += row.failCount;
            }
            
            // Update feature stats
            if (updatedSideBarData.features[component]) {
                updatedSideBarData.features[component].totalCount += row.totalCount;
                updatedSideBarData.features[component].failCount += row.failCount;
            }
            
            // Update CP Version stats
            if (updatedSideBarData.variants['CP Version'] && 
                updatedSideBarData.variants['CP Version'][cpVersion]) {
                updatedSideBarData.variants['CP Version'][cpVersion].totalCount += row.totalCount;
                updatedSideBarData.variants['CP Version'][cpVersion].failCount += row.failCount;
            }
            
            // Update CB Version stats
            if (updatedSideBarData.variants['CB Version'] && 
                updatedSideBarData.variants['CB Version'][cbVersion]) {
                updatedSideBarData.variants['CB Version'][cbVersion].totalCount += row.totalCount;
                updatedSideBarData.variants['CB Version'][cbVersion].failCount += row.failCount;
            }
        }

        // Update the sidebar data in the context
        taskDispatch({
            type: "sideBarDataChanged",
            sideBarData: updatedSideBarData
        });
    };

    // Add useEffect hooks to update sidebar items when filters change
    useEffect(() => {
        if (dataRows.length > 0) {
            // Apply the same filtering logic as in the rendering part
            let filteredRows = [...dataRows];
            filteredRows = filteredRows.filter((value) => platformFilters.includes(value.provider.toUpperCase()));
            filteredRows = filteredRows.filter((value) => featureFilters.includes(value.component.toUpperCase()));
            
            for (const variantKey in variantFilters) {
                if (variantKey === "CP Version") {
                    filteredRows = filteredRows.filter((value) => variantFilters[variantKey].includes(value.cpVersion));
                } else if (variantKey === "CB Version") {
                    filteredRows = filteredRows.filter((value) => variantFilters[variantKey].includes(value.cbVersion));
                }
            }
            
            if (pipelineFilters.length > 0) {
                filteredRows = filteredRows.filter((value) => pipelineFilters.includes(value.pipelineId));
            }
            
            if (pipelineSearchFilters.length > 0 || search !== "") {
                filteredRows = filteredRows.filter((value) => 
                    pipelineSearchFilters.includes(value.pipelineId) && value.jobName.includes(search));
            }
            
            // Update sidebar items based on filtered rows
            updateSideBarItemsFromFilteredRows(filteredRows);
        }
    }, [platformFilters, featureFilters, variantFilters, pipelineFilters, pipelineSearchFilters, search]);

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
                    let rows = calculateRows(data[env].jobs);
                    setDataRows(rows);
                    taskDispatch({
                        type: "pipelineJobsDataChanged",
                        pipelineJobsData: rows,
                    });
                } else {
                    const newEnv = Object.keys(data)[0]
                    setJobs(data[newEnv].jobs);
                    calculateSideBarItems(data[newEnv].jobs);
                    taskDispatch({
                        type: "buildIdChanged",
                        buildID: newEnv
                    });
                    let rows = calculateRows(data[newEnv].jobs);
                    setDataRows(rows);
                    taskDispatch({
                        type: "pipelineJobsDataChanged",
                        pipelineJobsData: rows,
                    });
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
            let rows = calculateRows(fullJobsData[env].jobs);
            setDataRows(rows);
            taskDispatch({
                type: "pipelineJobsDataChanged",
                pipelineJobsData: rows,
            });
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

    const handleAnalysisSubmit = async (analysisText: string, rowId: string) => {
        try {
            const api = `${import.meta.env.VITE_APP_SERVER}/job_analysis/${rowId}`
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ analysis: analysisText }),
            });

            if (!response.ok) {
                console.log(`Error in trying to push data. ${response.statusText}`)
            }

            const data = await response.json();
            console.log('Analysis Submitted:', data);
            // Handle the response further here, e.g., display a success message
        } catch (error) {
            console.error('Error submitting analysis:', error);
            // Handle the error here, e.g., display an error message
        }
    };

    const calculateRows = (jobs: PipelineJob[] | null) => {
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
        return rows;
    }
    let rows = dataRows;
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
    if(pipelineSearchFilters.length > 0 || search !== ""){
        rows = rows.filter((value) => pipelineSearchFilters.includes(value.pipelineId) && value.jobName.includes(search));
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
                        <Tooltip title="Show other job runs">
                            <Link href="#" onClick={() => handleJobOpenDialog(params.row)}><KeyboardArrowDown /></Link>
                        </Tooltip>
                    </Stack>
                ) : (
                    <></>
                );
            }
        },
        {
            field: 'jobName', headerName: 'Job Name', width: 250,
            renderCell: (params) => {
                return(
                    <Tooltip title={params.value}>
                        <Link href={`${params.row.url}testReport`} target="_blank">
                            <div>{params.value.length > 25?
                                `${params.value.substring(0,22)}...`:
                                params.value
                            }</div>
                        </Link>
                    </Tooltip>
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
        { field: 'passPercentage', headerName: 'Pass %', width: 100, valueGetter: (params: GridValueGetterParams) => {
                const totalCount = params.row.totalCount;
                const passCount = params.row.passCount;
                return totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) + '%' : '0%';
            }
        },
        { field: 'duration', headerName: 'Duration', width: 100, valueGetter: (params: GridValueGetterParams) => formatDuration(params.value)},
        { field: 'runDate', headerName: 'Run Date', width: 180, valueGetter: (params) => new Date(params.row.runDate).toLocaleString() },
        { field: 'provider', headerName: 'Provider', width: 100, valueGetter: (params) => params.value.toUpperCase() },
        { field: 'cpVersion', headerName: 'CP version', width: 110 },
        { field: 'cbVersion', headerName: 'CB version', width: 120 },
        { field: 'parentName', headerName: 'Pipeline Job', width: 200,
            renderCell: (params) => (<Tooltip title={params.value}><Link href={params.row.parentUrl} target="_blank">{params.value}</Link></Tooltip>) },
        /*{ field: "analysis", headerName: "Analysis", width: 300, renderCell: (params) => {
                const [analysisText, setAnalysisText] = useState(params.value?params.value:"");
                const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                    setAnalysisText(event.target.value);
                };

                const handleSubmit = () => {
                    handleAnalysisSubmit(analysisText, params.id.toString());
                };
            return (
                <TextField
                    multiline
                    rows={2}
                    variant='standard'
                    size='small'
                    value={analysisText}
                    onChange={handleChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleSubmit}>
                                    <DoneIcon fontSize="small"/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            )
            }},*/
        { field: 'analysis', headerName: "Analysis", width: 300,
            renderCell: (params) => (
                <AnalysisColumnCell
                    id={params.id.toString()}
                    initialAnalysisText={params.value || ""}
                    onAnalysisSubmit={(id, text) => {
                        const updatedRows = dataRows.map((row) =>
                            row.id.toString() === id ? { ...row, analysis: text } : row
                        );
                        setDataRows(updatedRows);
                        handleAnalysisSubmit(text, id);
                    }}
                />
            ),
        },
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