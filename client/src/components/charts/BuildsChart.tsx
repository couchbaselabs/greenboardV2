import React, {useEffect, useState} from 'react';
import {
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    ComposedChart,
    Cell
} from 'recharts';
import {red, green} from "@mui/material/colors";
import {useAppContext, useAppTaskDispatch} from "../../context/context";
import {Box, CircularProgress, Typography} from "@mui/material";

type DataPoint = {
    key: string;
    passCount: number;
    failCount: number;
    totalCount: number;
};

const BuildChartComponent: React.FC = () => {
    const appContext = useAppContext();
    const appTasksDispatch = useAppTaskDispatch();
    const [data, setData] = useState<DataPoint[]>([]);
    const [chartTitle, setChartTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const scope = appContext.scope;
    const version = appContext.version;
    const buildFilter = appContext.buildFilter;
    const testFilter = appContext.runFilter;

    const setBuildNumber = (buildNumber: string) => {
        appTasksDispatch({
            type: "buildIdChanged",
            buildID: buildNumber
        });
    }

    useEffect(() => {
        setIsLoading(true);
        if(scope === "" || version === ""){
            return;
        }
        const api = "http://localhost:8080/versions/" + scope + "/" + version + "?buildFilter=" + buildFilter
            + "&testFilter=" + testFilter;
        // Fetch data from the API
        fetch(api)
            .then((res) => res.json())
            .then((fetchedData) => {
                // @ts-ignore
                const transformedData: DataPoint[] = Object.entries(fetchedData).map(([key, value]) => ({
                    key,
                    passCount: value.passCount,
                    failCount: value.failCount,
                    totalCount: value.totalCount,
                    jobCount: value.jobCount,
                }));

                // Sort data by key in ascending order
                transformedData.sort((a, b) => (a.key > b.key ? 1 : -1));
                setData(transformedData);
                // Set chart title to the last item's key
                // When data is fetched, set the active key to the last item's key
                if (transformedData.length > 0) {
                    const lastKey = transformedData[transformedData.length - 1].key;
                    setChartTitle(lastKey);
                    setBuildNumber(lastKey);
                    setActiveKey(lastKey);
                }
                setIsLoading(false);
            })
            .catch((error) =>{
                console.error('Error fetching data: ', error);
                setIsLoading(false);
            });
    }, [scope, version, buildFilter, testFilter]);

    const handleBarClick = (dataKey: string) => {
        setBuildNumber(dataKey.key);
        setActiveKey(dataKey.key);
        setChartTitle(dataKey.key);
    };

    // Function to dynamically set the fill color
    const barFill = (entry: DataPoint, color: string) => {
        if (entry.key === activeKey) {
            return color === "green"? green["800"] : red["800"]; // Slightly darker for the selected item
        }
        return color === "green"? green["300"] : red["300"]; // Default color
    };

    // Function to dynamically set the hover color
    const onBarMouseOver = (e: any, color: string) => {
        e.target.style.fill = color === "green"? green["600"] : red["600"]; // Slightly darker on hover
    };

    const onBarMouseOut = (dataKey: any, color: string, e: any) => {
        e.target.style.fill = barFill(dataKey, color); // Revert to original color
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }
    return (
        <>
            <Typography variant='h4' align='center'>
                {chartTitle}
            </Typography>
            <ResponsiveContainer width="75%" height="100%">
                <ComposedChart data={data} margin={{
                    top: 20, right: 20, bottom: 20, left: 20
                }}>
                    <CartesianGrid stroke="#f5f5f5"/>
                    <XAxis dataKey="key"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>
                    <Bar dataKey="passCount" stackId="a" onClick={handleBarClick}>
                        {
                            data.map((entry, index) => (
                                <Cell key={`cell-${index}`}
                                      fill={barFill(entry, 'green')}
                                      onMouseOver={(e) => onBarMouseOver(e, 'green')}
                                      onMouseOut={(e) => onBarMouseOut(entry, 'green', e)}/>
                            ))
                        }
                    </Bar>
                    <Bar dataKey="failCount" stackId="a" fill="#ff6666" onClick={handleBarClick}>
                        {
                            data.map((entry, index) => (
                                <Cell key={`cell-${index}`}
                                      fill={barFill(entry, 'red')}
                                      onMouseOver={(e) => onBarMouseOver(e, 'red')}
                                      onMouseOut={(e) => onBarMouseOut(entry, 'red', e)}/>
                            ))
                        }
                    </Bar>
                    <Line type="monotone" dataKey="totalCount" stroke="#000"/>
                    <Line type="monotone" dataKey="jobCount" stroke="blue"/>
                </ComposedChart>
            </ResponsiveContainer>
        </>
    );
};

export default BuildChartComponent;
