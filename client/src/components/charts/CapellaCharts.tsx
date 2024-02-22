import {Box, ButtonBase, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {Cell, Pie, PieChart, Tooltip} from "recharts";
import {rowStyle} from "../../Utils/StylesUtils.tsx";
import {useAppContext, useAppTaskDispatch} from "../../context/context";
import React, {useEffect, useState} from "react";
import {green} from "@mui/material/colors";


const CapellaCharts: React.FC = () => {
    const dispatchContext = useAppTaskDispatch();
    const appContext = useAppContext();
    const [selectedEnv, setSelectedEnv] = useState(appContext.environment);
    const [chartData, setChartData] = useState<PipelineChartsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(appContext.scope !== "capella") {
            return;
        }
        setIsLoading(true);
        const startDate = appContext.startDate;
        const endDate = appContext.endDate;
        const api = `${import.meta.env.VITE_APP_SERVER}/pipeline_aggregates/capella?startDate=${startDate}&endDate=${endDate}`
        fetch(api)
            .then((res) => res.json())
            .then((data) => {
                setChartData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setChartData(null);
                setIsLoading(false);
            })
    }, [appContext.scope, appContext.startDate, appContext.endDate])


    const handlePieClick = (key: string) => {
        dispatchContext({
            type: "environmentDataChanged",
            environment: key
        });
        setSelectedEnv(key);
    }

    return (
        <>
            <Box sx={{display: 'flex', overflowX: 'auto', maxWidth: "65%", maxHeight: "10%"}}>
                { isLoading || !chartData ?
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box> :
                    Object.keys(chartData['pipeline']).map((key) => (
                        <Card variant="outlined"
                              key={key}
                              sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: 1,
                                  backgroundColor: selectedEnv === key ? green['100'] : '',
                              }}
                        >
                            <ButtonBase
                                onClick={() => handlePieClick(key)}
                                style={{
                                    backgroundColor: selectedEnv === key ? green['100'] : 'transparent', // Highlight ButtonBase if selected
                                    width: '100%',
                                }}
                            >
                                <CardContent style={{ alignItems: 'center', cursor: 'pointer' }}>
                                    <Typography variant='h5' align='center'>
                                        {key.toUpperCase()}
                                    </Typography>
                                    <PieChart width={300} height={300}>
                                        <Pie dataKey='value'
                                             data={chartData.pipeline[key]}
                                             isAnimationActive={true}
                                             cx='50%'
                                             cy='50%'
                                             outerRadius={60}>
                                            {chartData.pipeline[key].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={rowStyle(entry.name).backgroundColor}/>
                                            ))}
                                        </Pie>
                                        <Pie dataKey={'value'}
                                             data={chartData.jobs[key]}
                                             isAnimationActive={true}
                                             cx="50%"
                                             cy="50%"
                                             innerRadius={70}
                                             outerRadius={100}
                                             label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                                                 const RADIAN = Math.PI / 180;
                                                 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                 const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                 const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                 return (
                                                     <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                                         {`${value}`}
                                                     </text>
                                                 );
                                             }}
                                             labelLine={false}>
                                            {chartData.jobs[key].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={rowStyle(entry.name).backgroundColor}/>
                                            ))}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </CardContent>
                            </ButtonBase>
                        </Card>
                    ))
                }
            </Box>
        </>
    );
};

export default CapellaCharts;