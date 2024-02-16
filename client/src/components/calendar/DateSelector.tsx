import {addDays, endOfDay, endOfYesterday, startOfDay, startOfWeek, startOfYesterday} from 'date-fns';
import {useState} from "react";
import {useAppContext, useAppTaskDispatch} from "../../context/context.tsx";
import {Box, Button, Card, CardContent, Stack, Tooltip, Typography} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers";

const CalandarRangePick: React.FC = () => {
    const today = new Date();
    const appContext = useAppContext();
    const [startDate, setStartDate] = useState<Date | null>(new Date(appContext.startDate));
    const [endDate, setEndDate] = useState<Date | null>(new Date(appContext.endDate));
    const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
    const appTaskDispatch = useAppTaskDispatch();

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        setEndDate(null); // Reset end date
        if (date) setOpenEndDatePicker(true); // Open end date picker if start date is selected
    };

    const handleEndDateChange = (date: Date | null) => {
        date ? setEndDate(date) : setEndDate(today);
        storeDates(startDate, endDate);
    };

    const storeDates = (start: Date | null, end: Date | null) => {
        if (start === null || end === null) {
            return;
        }
        const startTime = startOfDay(start)?.getTime();
        const endTime = endOfDay(end)?.getTime();
        appTaskDispatch({
            type: "startDateDataChanged",
            startDate: startTime
        });
        appTaskDispatch({
            type: "endDateDataChanged",
            endDate: endTime
        })
    }

    const handleCloseEndDatePicker = () => {
        setOpenEndDatePicker(false);
    };


    const setToday = () => {
        setStartDate(today);
        setEndDate(today);
        storeDates(today, today);
    };

    const setYesterday = () => {
        const yesterday = startOfYesterday();
        setStartDate(yesterday);
        setEndDate(endOfYesterday());
        storeDates(yesterday, yesterday);
    };

    const setThisWeek = () => {
        const startWeek = startOfWeek(today, {weekStartsOn: 1});
        setStartDate(startWeek);
        setEndDate(today);
        storeDates(startWeek, today);
    };

    const setLastWeek = () => {
        const startOfLastWeek = addDays(startOfWeek(today, {weekStartsOn: 1}), -7)
        const endOfLastWeek = addDays(startOfWeek(today, {weekStartsOn: 1}), -1)
        setStartDate(startOfLastWeek);
        setEndDate(endOfLastWeek);
        storeDates(startOfLastWeek, endOfLastWeek);
    };

    return (
        <>
            <Card variant="outlined"
                  sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 1,
                  }}
            >
                <CardContent sx={{alignItems: 'center'}}>
                    <Stack>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 2,
                        }}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                onAccept={(value) => handleStartDateChange(value)}
                                shouldDisableDate={(date) => date > today}
                            />
                            <Typography variant='body1' sx={{
                                margin: 1
                            }}>to</Typography>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                onAccept={(value) => handleEndDateChange(value)}
                                shouldDisableDate={(date) => (!!startDate && date < startDate) || date > today}
                                open={openEndDatePicker}
                                onClose={handleCloseEndDatePicker}
                            />
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 1,
                        }}>
                            <Tooltip title={"Get Today's data"}>
                                <Button onClick={setToday}>Today</Button>
                            </Tooltip>
                            <Tooltip title={"Get Yesterday's data"}>
                                <Button onClick={setYesterday}>Yesterday</Button>
                            </Tooltip>
                            <Tooltip title={"Get this Week's data"}>
                                <Button onClick={setThisWeek}>This week</Button>
                            </Tooltip>
                            <Tooltip title={"Get last Week's data"}>
                                <Button onClick={setLastWeek}>Last week</Button>
                            </Tooltip>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </>
    )
};

export default CalandarRangePick