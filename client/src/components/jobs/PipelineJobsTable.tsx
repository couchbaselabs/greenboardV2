import {Link, Stack} from "@mui/material";
import {useState} from "react";
import {GridColDef, GridToolbar, GridValueGetterParams} from "@mui/x-data-grid";
import {StyledDataGrid} from "./StyledDataGrip.tsx";
import {getRowClassName} from "../../Utils/StylesUtils.tsx";
import PipelineJobDetailsModal from "./PipelineJobDetailsModal.tsx";
import {KeyboardArrowDown} from "@mui/icons-material";
import {formatDuration} from "../../Utils/DateUtils.ts";
import {useAppContext} from "../../context/context.tsx";


const PipelineJobsTable : React.FC<PipelineProps> = ({jobs, loading}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState<PipelineJobsModal | null>(null);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });
    const appContext = useAppContext();
    const platformFilters = appContext.platformFilters;
    const featureFilters = appContext.featureFilters;
    const variantFilters = appContext.variantFilters;

    // @ts-ignore
    const handleOpenDialog = (row) => {
        const job: PipelineJobsModal = {
            jobName: row.jobName,
            jobs: row.jobs
        }
        setSelectedJob(job);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedJob(null);
    };

    let rows = [];
    for (const job of jobs) {
        const parentName = job.jobName;
        const parentUrl = job.url;
        const cbVersion = job.cbVersion;
        const cpVersion = job.cpVersion;
        const pipelineJobs = job.jobs;
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
            };
            rows.push(row);
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

    const columns: GridColDef[] = [
        {
            field: 'jobName', headerName: 'Job Name', width: 350,
            renderCell: (params) => {
                const hasExtraInfo = params.row.jobs && params.row.jobs.length > 1;
                return hasExtraInfo ? (
                    <Stack direction="row">
                        <Link href={params.row.url} target="_blank">{params.value}</Link>
                        <Link href="#" onClick={() => handleOpenDialog(params.row)}><KeyboardArrowDown /></Link>
                    </Stack>
                ) : (
                    <Link href={params.row.url} target="_blank">{params.value}</Link>
                );
            },
        },
        { field: 'result', headerName: 'Result', width: 100 },
        { field: 'failCount', headerName: 'Fail Count', type: 'number', width: 80 },
        { field: 'passCount', headerName: 'Pass Count', type: 'number', width: 80 },
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
                            loading={loading}
                            slots={{
                                toolbar: GridToolbar,
                            }}
            />
            <PipelineJobDetailsModal open={openDialog} onClose={handleCloseDialog} job={selectedJob} />
        </>
    )
};

export default PipelineJobsTable;