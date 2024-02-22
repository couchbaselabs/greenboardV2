import React, {useEffect, useState} from 'react';
import {Box, Link} from '@mui/material';
import {GridColDef, GridToolbar, GridValueGetterParams} from '@mui/x-data-grid';
import {StyledDataGrid} from "./StyledDataGrip";
import {getRowClassName} from "../../Utils/StylesUtils";
import {formatDuration} from "../../Utils/DateUtils.ts";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";
import {NoData} from "../misc/NoData.tsx";


const PipelinesTable: React.FC = () => {

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
                setData(data)
                if(data.hasOwnProperty(env)) {
                    setDataRows(data[env]);
                } else {
                    const newEnv = Object.keys(data)[0]
                    setDataRows(data[newEnv]);
                    taskDispatch({
                        type: "buildIdChanged",
                        buildID: newEnv
                    })
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
        }
    }, [env])

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

    let rows = dataRows;
    // Filter out rows based on filters
    for (const variantKey in variantFilters) {
        if(variantKey === "CP Version"){
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cpVersion));
        } else if(variantKey === "CB Version") {
            rows = rows.filter((value) => variantFilters[variantKey].includes(value.cbVersion));
        }
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