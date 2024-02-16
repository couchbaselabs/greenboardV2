import React, {useState} from 'react';
import {Box, Link} from '@mui/material';
import {GridColDef, GridToolbar, GridValueGetterParams} from '@mui/x-data-grid';
import {StyledDataGrid} from "./StyledDataGrip";
import {getRowClassName} from "../../Utils/StylesUtils";
import {formatDuration} from "../../Utils/DateUtils.ts";
import {useAppContext} from "../../context/context.tsx";


const PipelinesTable: React.FC<PipelineProps> = ({jobs, loading}) => {

    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });
    const appContext = useAppContext();
    const variantFilters = appContext.variantFilters;
    const columns: GridColDef[] = [
        {
            field: 'jobName',
            headerName: 'Job Name',
            width: 250,
            renderCell: (params) => (<Link href={params.row.url} target="_blank">{params.value}</Link>)
        },
        {field: 'cbVersion', headerName: 'CB Version', width: 110},
        {field: 'cpVersion', headerName: 'CP Version', width:110},
        {
            field: 'commitUrl',
            headerName: 'Commit URL',
            width: 200,
            renderCell: (params) => (<Link href={params.value} target="_blank">commitID</Link>)
        },
        {field: 'result', headerName: 'Result', width: 110},
        {field: 'duration', headerName: 'Duration', width: 110,
            valueGetter: (params: GridValueGetterParams) => formatDuration(params.value)},
        {
            field: 'runDate',
            headerName: 'Run Date',
            width: 160,
            valueGetter: (params: GridValueGetterParams) => new Date(params.row.runDate).toLocaleString()
        },
        {field: 'description', headerName: 'Description', width: 200},
    ];

    let rows = jobs.map((job) => ({
        id: job.id,
        jobName: job.jobName,
        cbVersion: job.cbVersion,
        cpVersion: job.cpVersion,
        commitUrl: job.commitUrl,
        result: job.result,
        duration: job.duration,
        runDate: job.runDate,
        description: job.description,
        url: job.url,
    }));

    // Filter out rows based on filters
    for (const variantKey in variantFilters) {
        if(variantKey === "CP Version"){
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cpVersion));
        } else if(variantKey === "CB Version") {
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cbVersion));
        }
    }

    return (
        <Box sx={{ maxHeight: '10%', width: '100%'}}>
            <StyledDataGrid columns={columns} rows={rows}
                            initialState={{
                                sorting: {
                                    sortModel: [{field: 'jobName', sort: 'asc'}]
                                }
                            }}
                            getRowClassName={(params) => `data-grid--${getRowClassName(params)}`}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[5, 10, 25, 50, 100]}
                            slots={{
                                toolbar: GridToolbar,
                            }}
                            loading={loading}
                            sx={{
                                maxHeight: '20%'
                            }}
            />
        </Box>
    );
};

export default PipelinesTable;