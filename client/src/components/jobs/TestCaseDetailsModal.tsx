import React, {useDeferredValue, useEffect, useState} from "react";
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
    Paper, CircularProgress, Tooltip, TextField
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
                <TableCell align="center">
                    <Tooltip title={row.className}>
                        <div>{row.className?.substring(0, 20)}</div>
                    </Tooltip>
                </TableCell>
                <TableCell align="center">
                    <Tooltip title={row.suite}>
                        <div>{row.suite.substring(0,20)}</div>
                    </Tooltip>
                </TableCell>
                <TableCell align="center">{row.status}</TableCell>
                <TableCell align="center">{formatDurationSeconds(row.duration)}</TableCell>
                <TableCell align="center">{row.errorDetails?.substring(0, 20)}</TableCell>
                <TableCell align="center">{row.errorStackTrace?.substring(0, 20)}</TableCell>
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
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);


    useEffect(() => {
        if(result === "" || docId === ""){
            return;
        }
        setIsLoading(true);
        setSearch("");
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

    let rows = data;
    rows = rows.filter((value) => value.name.includes(deferredSearch) ||
        value.className.includes(deferredSearch) || value.suite.includes(deferredSearch) ||
        value.errorDetails?.includes(deferredSearch) || value.errorStackTrace?.includes(deferredSearch));


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
                            <Box>
                                <TextField label='Search by Name, Class Name, Suite, Error Details or Error Stack Trace'
                                           value={search}
                                           sx={{width: '100%'}}
                                           onChange={(e) => setSearch(e.target.value)}
                                />
                                <TableContainer component={Paper}>
                                    <Table aria-label="collapsible table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell />
                                                <TableCell>Name</TableCell>
                                                <TableCell align="center">Class Name</TableCell>
                                                <TableCell align="center">Suite</TableCell>
                                                <TableCell align="center">Status</TableCell>
                                                <TableCell align="center">Duration</TableCell>
                                                <TableCell align="center">Error Details</TableCell>
                                                <TableCell align="center">Error Stack Trace</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.map((row, index) => (
                                                <Row key={`${row.name}_${index}`} row={row} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
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