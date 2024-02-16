import {Box, ButtonBase, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {Cell, Pie, PieChart, Tooltip} from "recharts";
import {rowStyle} from "../../Utils/StylesUtils.tsx";
import {useAppContext, useAppTaskDispatch} from "../../context/context";
import {useState} from "react";
import {green} from "@mui/material/colors";


const CapellaCharts: React.FC<{ data: PipelineData | null }> = ({data}) => {
    const dispatchContext = useAppTaskDispatch();
    const appContext = useAppContext();
    const [selectedEnv, setSelectedEnv] = useState(appContext.environment);
    const getPipelinePieData = (jobs: PipelineJob[]) => {
        const resultCounts: { [key: string]: number } = {};
        jobs.forEach((job) => {
            if (resultCounts[job.result]) {
                resultCounts[job.result] += 1;
            } else {
                resultCounts[job.result] = 1;
            }
        });
        return Object.keys(resultCounts).map((result) => ({
            name: result,
            value: resultCounts[result],
        }));
    };

    const getJobsPieData = (pipelineJobs: PipelineJob[]) => {
        const resultCounts: { [key: string]: number } = {};
        pipelineJobs.forEach((pipelineJob) => {
            const job = pipelineJob.jobs;
            for (const jobKey in job) {
                const jobs = job[jobKey];
                jobs.forEach((job) => {
                    if (resultCounts[job.result]) {
                        resultCounts[job.result] += 1;
                    } else {
                        resultCounts[job.result] = 1;
                    }
                });
            }
        });
        return Object.keys(resultCounts).map((result) => ({
            name: result,
            value: resultCounts[result],
        }));
    };

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
                {!data ?
                    <CircularProgress/> :
                    Object.entries(data).map(([key, value]) => (
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
                                                 data={getPipelinePieData(value.jobs)}
                                                 isAnimationActive={true}
                                                 cx='50%'
                                                 cy='50%'
                                                 outerRadius={60}>
                                                {getPipelinePieData(value.jobs).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={rowStyle(entry.name).backgroundColor}/>
                                                ))}
                                            </Pie>
                                            <Pie dataKey={'value'}
                                                 data={getJobsPieData(value.jobs)}
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
                                                {getJobsPieData(value.jobs).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={rowStyle(entry.name).backgroundColor}/>
                                                ))}
                                            </Pie>
                                            <Tooltip/>
                                        </PieChart>
                                    </CardContent>
                                </ButtonBase>
                            </Card>
                    ))}
            </Box>
        </>
    );
};

export default CapellaCharts;