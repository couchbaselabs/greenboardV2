import {useDeferredValue, useEffect, useState} from "react";
import {DataGrid, GridColDef, GridRowClassNameParams, GridToolbar, GridValidRowModel} from "@mui/x-data-grid";
import {green, red, yellow, grey} from "@mui/material/colors";
import {Box, ButtonBase, Paper, Stack, Tab, Tabs, TextField, Tooltip, Typography} from "@mui/material";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import {darken, lighten, styled} from '@mui/material/styles';
import TabComponent from "./TabComponent";
import {useAppContext, useAppTaskDispatch} from "../../context/context";
import JobsDetailsModal from "./JobsDetailsModal";
import {formatDuration} from "../../Utils/DateUtils";


interface Job {
    displayName: string;
    name: string;
    component: string;
    os: string;
    totalCount: number;
    failCount: number;
    passCount: number;
    duration: number;
    jobCount: number;
    result: string;
    runDate: number;
    runParams: string;
    variants: Record<string, string> | null;
    id: string;
}

const JobsTable: React.FC = () => {
    const [data, setData] = useState<Job[]>([]);
    const [runsData, setRunsData] = useState<Job[]>([]);
    const [filteredRunsData, setFilteredRunsData] = useState<Job[]>([]);
    const [pendingJobsData, setPendingJobsData] = useState<Job[]>([]);
    const [filteredPendingData, setFilteredPendingData] = useState<Job[]>([]);
    const [initialLoad, setInitialLoad] = useState(false);
    const [loading, setLoading] = useState(true);
    const [order, _setOrder] = useState<'asc' | 'dsc'>('asc');
    const [orderBy, _setOrderBy] = useState<keyof Job>('displayName');
    const [search, setSearch] = useState('');
    const [filter, _setFilter] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [jobsDetailsId, setJobsDetailsId] = useState("")
    const deferredSearch = useDeferredValue(search);
    const [resultFilter, setResultFilter] = useState<string>('ALL');
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });
    const appContext = useAppContext();
    const scope = appContext.scope;
    let sidebarData = appContext.sideBarData;
    const featuresFilters = appContext.featureFilters;
    const platformFilters = appContext.platformFilters;
    const variantFilters = appContext.variantFilters;
    const appTasksDispatch = useAppTaskDispatch();

    const tabsChanged = (newValue: string) => {
        if (newValue === "PENDING") {
            setData(filteredPendingData);
        } else {
            setData(filteredRunsData);
        }
        setResultFilter(newValue);
    }

    useEffect(() => {
        setInitialLoad(false);
        setLoading(true);
        setData([]);
        setRunsData([]);
        storeRunsData([]);
        setPendingJobsData([]);
        setPendingJobsData([]);
    }, [appContext.buildID]);

    useEffect(() => {
        if (!initialLoad) {
            return;
        }
        const scope = appContext.scope;
        const buildNumber = appContext.buildID;
        const pageSize = paginationModel.pageSize;
        //Fetch rest of the data now.
        const restOfDataApi = `${import.meta.env.VITE_APP_SERVER}/builds/${scope}/${buildNumber}?offset=${pageSize + 1}`;
        fetch(restOfDataApi)
            .then((response) => response.json())
            .then((restOfData) => {
                let combinedData = data;
                combinedData = combinedData.concat(restOfData);
                setData(combinedData);
                setRunsData(combinedData);
                storeRunsData(combinedData);
                calculateSideBarData(combinedData, false);
            })
        // Fetch pending jobs data now.
        const pending_api = `${import.meta.env.VITE_APP_SERVER}/pending/${scope}/${buildNumber}`;
        fetch(pending_api)
            .then((response) => response.json())
            .then((pending) => {
                let pendingJobs: Job[] = [];
                for (const item in pending) {
                    const os = item;
                    for (const pendingItem of pending[item]) {
                        const component = pendingItem["component"];
                        for (const job of pendingItem['jobs']) {
                            const name = job['name'];
                            let displayName: string;
                            if (job.hasOwnProperty('displayName')) {
                                displayName = job['displayName'];
                            } else {
                                displayName = job['name'];
                            }
                            const totalCount = job['totalCount'];
                            let variants;
                            if (job.hasOwnProperty('variants') && job['variants'].length !== 0) {
                                variants = job['variants'];
                            }
                            let jobToStore: Job = {
                                displayName: displayName,
                                name: name,
                                component: component,
                                os: os,
                                totalCount: totalCount,
                                failCount: 0,
                                passCount: 0,
                                duration: 0,
                                jobCount: 0,
                                result: "PENDING",
                                runDate: 0,
                                runParams: "",
                                variants: variants,
                                id: name
                            }
                            pendingJobs.push(jobToStore);
                        }
                    }
                }
                setPendingJobsData(pendingJobs);
                storePendingData(pendingJobs);
                calculateSideBarData(pendingJobs, true);
            });
    }, [initialLoad]);

    useEffect(() => {
        setLoading(true);
        const scope = appContext.scope;
        const buildNumber = appContext.buildID;
        if (scope == "" || buildNumber == "") {
            setLoading(true);
            return;
        }
        const page = paginationModel.page;
        const pageSize = paginationModel.pageSize;
        const api = `${import.meta.env.VITE_APP_SERVER}/builds/${scope}/${buildNumber}?limit=${pageSize}&page=${page}`
        //Fetch only the data for first page.
        fetch(api)
            .then((response) => response.json())
            .then((data) => {
                setData(data);
                setRunsData(data);
                storeRunsData(data);
                setLoading(false);
                setInitialLoad(true);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, [appContext.scope, appContext.buildID]);

    function shouldShowJob(job: Job) {
        let show = true;
        if (platformFilters !== undefined) {
            show = show && platformFilters.includes(job.os);
        }
        if (featuresFilters !== undefined) {
            show = show && featuresFilters.includes(job.component);
        }
        if (variantFilters !== undefined) {
            for (const variantsKey in job.variants) {
                show = show && variantFilters[variantsKey].includes(job.variants[variantsKey]);
            }
        }
        return show;
    }

    function storeSideBarData(data: object) {
        appTasksDispatch({
            type: "sideBarDataChanged",
            sideBarData: data
        });
    }

    function storeRunsData(jobs: Job[]) {
        setFilteredRunsData(jobs);
        appTasksDispatch({
            type: "jobsDataChanged",
            jobsData: jobs
        });
    }

    function storePendingData(jobs: Job[]) {
        setFilteredPendingData(jobs);
        appTasksDispatch({
            type: "pendingDataChanged",
            pendingData: jobs
        });
    }


    function calculateSideBarData(jobs: Job[], pending: boolean){
        let updatedSideBarData = {...sidebarData};
        for (const job of jobs) {
            const platform = job.os;
            const feature = job.component;
            const variants = job.variants;
            if(pending) {
                updatedSideBarData['platforms'][platform]["pending"] += job.totalCount;
                updatedSideBarData['features'][feature]["pending"] += job.totalCount;
                for (const variantsKey in variants) {
                    updatedSideBarData['variants'][variantsKey][variants[variantsKey]]["pending"] += job.totalCount;
                }
                continue;
            }
            updatedSideBarData['platforms'][platform]['totalCount'] += job.totalCount;
            updatedSideBarData['platforms'][platform]['failCount'] += job.failCount;
            updatedSideBarData['features'][feature]['totalCount'] += job.totalCount;
            updatedSideBarData['features'][feature]['failCount'] += job.failCount;
            for (const variantsKey in variants) {
                updatedSideBarData['variants'][variantsKey][variants[variantsKey]]["totalCount"] += job.totalCount;
                updatedSideBarData['variants'][variantsKey][variants[variantsKey]]["failCount"] += job.failCount;
            }
        }
        storeSideBarData(updatedSideBarData);
    }

    useEffect(() => {
        const filteredRunData = runsData.filter((job) =>
            job.displayName.toLowerCase().includes(deferredSearch.toLowerCase()) &&
            shouldShowJob(job));
        storeRunsData(filteredRunData);
        calculateSideBarData(filteredRunData, false);
        const filteredPendingData = pendingJobsData.filter(
            (job) =>
                job.displayName.toLowerCase().includes(deferredSearch.toLowerCase()) &&
                shouldShowJob(job)
        )
        storePendingData(filteredPendingData);
        calculateSideBarData(filteredPendingData, true);
    }, [deferredSearch, platformFilters, featuresFilters, variantFilters])

    const filteredData = data.filter(
        (job) =>
            job.displayName.toLowerCase().includes(deferredSearch.toLowerCase()) &&
            (filter ? job.result === filter : true) &&
            (resultFilter === 'ALL' || job.result === resultFilter) &&
            shouldShowJob(job)
    );

    const jobCounts = {
        ALL: filteredRunsData.length,
        SUCCESS: filteredRunsData.filter(job => job.result === 'SUCCESS').length,
        FAILURE: filteredRunsData.filter(job => job.result === 'FAILURE').length,
        UNSTABLE: filteredRunsData.filter(job => job.result === 'UNSTABLE').length,
        ABORTED: filteredRunsData.filter(job => job.result === 'ABORTED').length,
        PENDING: filteredPendingData.length

    }

    const rowStyle = (result: string) => {
        let bgcolor: string = grey['100'];
        switch (result) {
            case 'SUCCESS':
                bgcolor = green['300'];
                break;
            case 'FAILURE':
                bgcolor = red['300'];
                break;
            case 'UNSTABLE':
                bgcolor = yellow['300'];
                break;
            case 'ABORTED':
                bgcolor = grey['500'];
                break;
            case 'PENDING':
                bgcolor = grey['500'];
                break
        }
        return {backgroundColor: bgcolor};
    };

    const columns: GridColDef[] = [
        {
            field: 'displayName',
            headerName: 'Job Name',
            sortable: true,
            width: 300,
            flex: 1,
            filterable: true,
            renderCell: (params) => {
                const displayValue = params.value as string;
                const isLongText = displayValue.length > 30;

                const cellContent = (
                    () => {
                        if (resultFilter === "PENDING") {
                            return (<Box>{params.value}</Box>);
                        } else {
                            return (
                                <Box>
                                    <a onClick={() => {
                                        setModalOpen(true);
                                        setJobsDetailsId(params.row.id);
                                    }} style={{
                                        cursor: 'pointer'
                                    }}
                                    >
                                        {params.value}
                                    </a>
                                </Box>
                            );
                        }
                    }
                );
                return isLongText ? (
                    <Tooltip title={displayValue}>
                        {cellContent()}
                    </Tooltip>
                ) : (
                    cellContent()
                );
            }
        },
        {
          field: 'rerun',
          headerName: 'Rerun',
          sortable: false,
          filterable: false,
            width: 50,
          renderCell: (params) => (
              <Box sx={{alignContent: 'center'}}>
                  <ButtonBase
                  >
                    <DirectionsRunIcon fontSize='small' />
                  </ButtonBase>
              </Box>
          )
        },
        {
            field: 'result',
            headerName: 'Result',
            sortable: true,
            filterable: true,
            renderCell: (params) => (
                <Box sx={rowStyle(params.value)}>
                    {params.value}
                </Box>
            )
        },
        {
            field: 'passCount',
            headerName: 'Passed',
            sortable: true,
        },
        {
            field: 'failCount',
            headerName: 'Failed',
            sortable: true,
        },
        {
            field: 'totalCount',
            headerName: 'Total',
            sortable: true,
        },
        {
            field: 'passperc',
            headerName: 'Pass %',
            sortable: true,
            valueGetter: ({row}) => {
                const totalCount = row.totalCount;
                const passCount = row.passCount;
                if (totalCount === 0) return 0;  // Handle division by zero
                return passCount / totalCount * 100;
            },
            valueFormatter: (params) => {
                // Check if the value is NaN and return '0%' if true
                if (isNaN(params.value)) {
                    return '0%';
                }
                const valueFormatted = Number(params.value).toFixed(2);
                return `${valueFormatted}%`;
            }
        },
        {
            field: 'duration',
            headerName: 'Duration',
            valueFormatter: (params) =>
                formatDuration(params.value),
        },
        {
            field: 'runDate',
            headerName: 'Run Date',
            sortable: true,
            flex: 1,
            valueFormatter: (params) =>
                new Date(params.value).toUTCString(),
        },
        {
            field: 'jobCount',
            headerName: 'Runs',
            sortable: true,
        },
        ...(data[0]?.variants ? Object.keys(data[0].variants).map((key) => ({
            field: key,
            headerName: key,
            sortable: true,
            flex: 1,
            renderCell: (params) => (
                <>
                    {params.row.variants[key] === "UNDEFINED" ? "N/A" : params.row.variants[key]}
                </>
            )
        })) : []),
    ];

    const getBackgroundColor = (color: string, mode: string) =>
        mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7);

    const getHoverBackgroundColor = (color: string, mode: string) =>
        mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

    const getSelectedBackgroundColor = (color: string, mode: string) =>
        mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);

    const getSelectedHoverBackgroundColor = (color: string, mode: string) =>
        mode === 'dark' ? darken(color, 0.4) : lighten(color, 0.4);

    const StyledDataGrid = styled(DataGrid)(({theme}) => ({
        '& .data-grid--even': {
            backgroundColor: getBackgroundColor(grey['100'], theme.palette.mode),
            '&:hover': {
                backgroundColor: getHoverBackgroundColor(grey['100'], theme.palette.mode),
            },
            '&.Mui-selected': {
                backgroundColor: getSelectedBackgroundColor(grey['100'], theme.palette.mode),
                '&:hover': {
                    backgroundColor: getSelectedHoverBackgroundColor(grey['100'], theme.palette.mode),
                }
            }
        },
        '& .data-grid--odd': {
            backgroundColor: getBackgroundColor(grey['400'], theme.palette.mode),
            '&:hover': {
                backgroundColor: getHoverBackgroundColor(grey['400'], theme.palette.mode),
            },
            '&.Mui-selected': {
                backgroundColor: getSelectedBackgroundColor(grey['400'], theme.palette.mode),
                '&:hover': {
                    backgroundColor: getSelectedHoverBackgroundColor(grey['400'], theme.palette.mode),
                }
            }
        }
    }));

    const getRowClassName = (params: GridRowClassNameParams<GridValidRowModel>) => {
        return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
    };

    return (
        <>
            <Box sx={{
                margin: '0.2em',
                width: '100%',
                height: '100%',
            }} margin='0.2em' width='100%'>
                <Stack flexGrow={1} sx={{
                    height: '100%',
                    width: '100%'
                }}>
                    <TextField label='Search by Job Name'
                               value={search}
                               onChange={(e) => setSearch(e.target.value)}
                    />
                    <Paper elevation={3} sx={{
                        maxHeight: '15%'
                    }}>
                        <Tabs value={resultFilter}
                              onChange={(_event, newValue) => tabsChanged(newValue)}
                              sx={{
                                  mt: '0.3em'
                              }}
                        >
                            <Tab label={<TabComponent display={`${jobCounts.ALL} JOBS COMPLETED`} bgcolor={grey['100']}/>}
                                 value='ALL'/>
                            <Tab label={<TabComponent display={`${jobCounts.SUCCESS} JOBS SUCCESSFUL`} bgcolor={green['300']}/>}
                                 value="SUCCESS"
                            />
                            <Tab label={<TabComponent display={`${jobCounts.FAILURE} JOBS FAILED`} bgcolor={red['300']}/>}
                                 value="FAILURE"
                            />
                            <Tab label={<TabComponent display={`${jobCounts.UNSTABLE} JOBS UNSTABLE`} bgcolor={yellow['300']}/>}
                                 value="UNSTABLE"
                            />
                            <Tab label={<TabComponent display={`${jobCounts.ABORTED} JOBS ABORTED`} bgcolor={grey['500']}/>}
                                 value="ABORTED"
                            />
                            <Tab label={<TabComponent display={`${jobCounts.PENDING} JOBS PENDING`} bgcolor={grey['100']}/>}
                                 value="PENDING"
                            />
                        </Tabs>
                    </Paper>
                    <Paper elevation={3} style={{
                        marginTop: '1em',
                        height: '60%',
                        width: '100%'
                    }}>
                        <StyledDataGrid columns={columns} rows={filteredData}
                                  initialState={{
                                      sorting: {
                                          sortModel: [{field: 'displayName', sort: 'asc'}]
                                      }
                                  }}
                                  getRowClassName={(params) => `data-grid--${getRowClassName(params)}`}
                                  paginationModel={paginationModel}
                                  onPaginationModelChange={setPaginationModel}
                                  pageSizeOptions={[5, 10, 25, 50, 100]}
                                  loading={loading}
                                  slots={{
                                      toolbar: GridToolbar,
                                  }}
                        />
                    </Paper>
                </Stack>
                <JobsDetailsModal isModalOpen={isModalOpen} setModalOpen={setModalOpen} scope={scope}
                                  documentId={jobsDetailsId}/>
            </Box>
        </>
    );
};

export default JobsTable;