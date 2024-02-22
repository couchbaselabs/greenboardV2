import React, {useEffect, useState} from "react";
import {
    Box,
    Collapse,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow,
    Typography,
    Paper, CircularProgress, Tooltip
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {PaperComponent} from "../../Utils/StylesUtils.tsx";
import CloseIcon from "@mui/icons-material/Close";
import {formatDurationSeconds} from "../../Utils/DateUtils.ts";

interface RowProps {
    row: TestCaseDetails;
}

const Row: React.FC<RowProps> = ({ row }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Tooltip title={row.name}>
                        <div>{row.name.length < 20? row.name : `${row.name.substring(0, 17)}...`}</div>
                    </Tooltip>
                </TableCell>
                <TableCell align="right">
                    <Tooltip title={row.className}>
                        <div>{row.className?.substring(0, 20)}</div>
                    </Tooltip>
                </TableCell>
                <TableCell align="right">
                    <Tooltip title={row.suite}>
                        <div>{row.suite.substring(0,20)}</div>
                    </Tooltip>
                </TableCell>
                <TableCell align="right">{row.status}</TableCell>
                <TableCell align="right">{formatDurationSeconds(row.duration)}</TableCell>
                <TableCell align="right">{row.errorDetails?.substring(0, 20)}</TableCell>
                <TableCell align="right">{row.errorStackTrace?.substring(0, 20)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                Details
                            </Typography>
                            <Typography>
                                Test name: {row.name}
                            </Typography>
                            <br/>
                            {row.errorDetails && <Typography>Error Details: {row.errorDetails}</Typography>}
                            <br/>
                            {row.errorStackTrace && <Typography>Stack Trace: {row.errorStackTrace}</Typography>}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};


const TestCaseDetailsModal: React.FC<TestCaseDetailsModalProps> = ({testName, result, docId, isModalOpen, onClose}) => {
    const [isloading, setIsLoading] = useState(false);
    const [data, setData] = useState<TestCaseDetails[]>([]);


    useEffect(() => {
        if(result === "" || docId === ""){
            return;
        }
        setIsLoading(true);
        const api = `${import.meta.env.VITE_APP_SERVER}/test_cases/${result}/${docId}`;
        fetch(api)
            .then((response) => response.json())
            .then((documentData) => {
                setData(documentData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [result, docId]);


    return (
        <>
            <Dialog open={isModalOpen}
                    onClose={onClose}
                    PaperComponent={PaperComponent}
                    aria-labelledby="draggable-testCase-details"
                    maxWidth='lg'
            >
                <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                    <Stack>
                        <Typography variant='h4' align='center'>
                            {testName} {result} Test Cases
                        </Typography>
                    </Stack>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 1,
                        top: 1,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: 'fit-content',
                        }}
                    >
                    {
                        isloading?
                            <CircularProgress />:
                            <TableContainer component={Paper}>
                                <Table aria-label="collapsible table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Name</TableCell>
                                            <TableCell align="right">Class Name</TableCell>
                                            <TableCell align="right">Suite</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                            <TableCell align="right">Duration</TableCell>
                                            <TableCell align="right">Error Details</TableCell>
                                            <TableCell align="right">Error Stack Trace</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.map((row) => (
                                            <Row key={row.name} row={row} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                    }
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}

export {
    TestCaseDetailsModal
}