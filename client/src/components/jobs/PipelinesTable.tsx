import React, {useDeferredValue, useEffect, useState} from 'react';
import {Box, Checkbox, Link, TextField, Tooltip} from '@mui/material';
import {GridColDef, GridToolbar, GridValueGetterParams} from '@mui/x-data-grid';
import {StyledDataGrid} from "./StyledDataGrip";
import {getRowClassName} from "../../Utils/StylesUtils";
import {formatDuration} from "../../Utils/DateUtils.ts";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";
import {NoData} from "../misc/NoData.tsx";


const PipelinesTable: React.FC<{search: string}> = ({search}) => {

    const [paginationModel, setPaginationModel] = useState({
        pageSize: 5,
        page: 0,
    });
    const [data, setData] = useState<Pipelines | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dataRows, setDataRows] = useState<Pipeline[]>([]);
    const [noData, setNoData] = useState(false);
    const appContext = useAppContext();
    const variantFilters = appContext.variantFilters;
    const env = appContext.environment;
    const pipelineFilters = appContext.pipelineFilters;
    const pipelineSearchFilters = appContext.pipelineSearchFilters;
    const taskDispatch = useAppTaskDispatch()

    useEffect(() => {
        if(appContext.scope !== "capella"){
            return;
        }
        setIsLoading(true);
        const startDate = appContext.startDate;
        const endDate = appContext.endDate;
        const api = `${import.meta.env.VITE_APP_SERVER}/pipelines/capella?startDate=${startDate}&endDate=${endDate}`
        fetch(api)
            .then((res) => res.json())
            .then((data) => {
                if(Object.keys(data).length === 0) {
                    setNoData(true);
                    setIsLoading(false);
                    return;
                }
                setNoData(false);
                setData(data)
                if(data.hasOwnProperty(env)) {
                    setDataRows(data[env]);
                    taskDispatch({
                        type: 'pipelinesDataChanged',
                        pipelinesData: data[env],
                    });
                } else {
                    const newEnv = Object.keys(data)[0]
                    setDataRows(data[newEnv]);
                    taskDispatch({
                        type: "buildIdChanged",
                        buildID: newEnv
                    });
                    taskDispatch({
                        type: 'pipelinesDataChanged',
                        pipelinesData: data[newEnv],
                    });
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setData(null);
                setIsLoading(false);
            })
    }, [appContext.scope, appContext.startDate, appContext.endDate])

    useEffect(() => {
        if(data) {
            setDataRows(data[env]);
            taskDispatch({
                type: 'pipelinesDataChanged',
                pipelinesData: data[env],
            });
        }
    }, [env])

    const handleFilterCheckClick = (filter: string) => {
        let newPipelineFilters: string[];
        if(pipelineFilters.includes(filter)){
            newPipelineFilters = pipelineFilters.filter((value) => {return value !== filter});
        } else {
            newPipelineFilters = pipelineFilters;
            newPipelineFilters.push(filter)
        }
        taskDispatch({
            type: "pipelineFiltersChanged",
            pipelineFilters: newPipelineFilters,
        });
    }

    const columns: GridColDef[] = [
        {
            field: 'filter',
            headerName: "",
            width: 10,
            filterable: false,
            disableColumnMenu: true,
            hideable: false,
            renderCell: (params) => (
                <Tooltip title="Check to filter jobs for this pipeline">
                    <Checkbox checked={pipelineFilters.includes(params.row.id)}
                               onChange={() => handleFilterCheckClick(params.row.id)}
                    />
                </Tooltip>
            )
        },
        {
            field: 'jobName',
            headerName: 'Job Name',
            width: 250,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Link href={params.row.url} target="_blank">
                        <div>{params.value.length > 30?
                            `${params.value.substring(0,27)}...`:
                            params.value
                        }</div>
                    </Link>
                </Tooltip>
            )
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
        {field: 'description', headerName: 'Description', width: 200,
            renderCell:  (params) => (
                <Tooltip title={params.value}>
                    <div>{params.value?
                        params.value.length > 20?
                        `${params.value.substring(0,17)}...`:
                        params.value :
                        ""
                    }</div>
                </Tooltip>
            )},
    ];

    let rows = dataRows;
    // Filter out rows based on filters
    for (const variantKey in variantFilters) {
        if(variantKey === "CP Version"){
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cpVersion));
        } else if(variantKey === "CB Version") {
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cbVersion));
        }
    }
    if(pipelineSearchFilters.length > 0 || search !== "") {
        rows = rows.filter((value) => pipelineSearchFilters.includes(value.id));
    }

    if(noData) {
        return (
            <NoData />
        );
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
                            loading={isLoading}
                            sx={{
                                maxHeight: '20%'
                            }}
            />
        </Box>
    );
};

export default PipelinesTable;