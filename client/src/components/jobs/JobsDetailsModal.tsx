import React, {useEffect, useState} from "react";
import {
    Box,
    Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    Paper, PaperProps, Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {green, grey, red, yellow} from "@mui/material/colors";
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import {formatDuration} from "../../Utils/DateUtils";



interface JobsDetailsModalProps {
    isModalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
    scope: string;
    documentId: string;
}

interface JobsDetails {
    index: number;
    url: string;
    result: string;
    totalCount: number;
    passCount: number;
    failCount: number;
    duration: number;
    runDate: number;
}

function PaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    )
}

const JobsDetailsModal : React.FC<JobsDetailsModalProps> = ({isModalOpen, setModalOpen, scope, documentId}) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<JobsDetails[]>([]);
    const [displayName, setDisplayName] = useState<string>("");
    const [buildNumber, setBuildNumber] = useState<string>("");

    const handleClose = () => {
        setModalOpen(false);
    };

    useEffect(() => {
        setLoading(true);
        if(scope == "" || documentId == ""){
            return;
        }
        const api = "http://localhost:8080/build_document/" + scope + "/" + documentId;
        fetch(api)
            .then((response) => response.json())
            .then((documentData) => {
                setDisplayName(documentData.displayName);
                setBuildNumber(documentData.build);
                let jobs = documentData.jobs;
                let jobDetails = [];
                let i = 1;
                for (const job of jobs) {
                    if (job.deleted) {
                        continue;
                    }
                    let details = {
                        index: i,
                        url : job.url + job.buildId.toString(),
                        result: job.result,
                        totalCount: job.totalCount,
                        passCount: job.passCount,
                        failCount: job.totalCount - job.passCount,
                        duration: job.duration,
                        runDate: job.runDate
                    };
                    jobDetails.push(details);
                    i++;
                }
                setData(jobDetails);
                setLoading(false);
            })
    }, [scope, documentId]);

    const rowStyle = (result: string) => {
        let bgcolor: string = grey['100'];
        switch (result) {
            case 'SUCCESS':
                bgcolor = green['300'];
                break;
            case 'FAILURE':
                bgcolor = red['300'];
                break;
            case 'UNSTABLE':
                bgcolor = yellow['300'];
                break;
            case 'ABORTED':
                bgcolor = grey['500'];
        }
        return { backgroundColor : bgcolor };
    };

    return (
        <>
            <Dialog open={isModalOpen}
                    onClose={handleClose}
                    PaperComponent={PaperComponent}
                    aria-labelledby="draggable-jobs-details"
                    maxWidth='lg'
            >
                <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                    <Stack>
                        <Typography variant='h4' align='center'>
                            {displayName}
                        </Typography>
                        <Typography variant='h5' align='center'>
                            {buildNumber}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
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
                        <TableContainer component={Paper}>
                            <Table aria-label="jobs-details">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Run No.</TableCell>
                                        <TableCell>Url</TableCell>
                                        <TableCell>Result</TableCell>
                                        <TableCell>Passed</TableCell>
                                        <TableCell>Failed</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Duration</TableCell>
                                        <TableCell>Run Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row) => (
                                        <TableRow
                                            key={row.index}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.index}
                                            </TableCell>
                                            <TableCell>
                                                <a href={row.url + "/testReport/"} target='_blank'>Link</a>
                                            </TableCell>
                                            <TableCell sx={rowStyle(row.result)}>{row.result}</TableCell>
                                            <TableCell>{row.passCount}</TableCell>
                                            <TableCell>{row.failCount}</TableCell>
                                            <TableCell>{row.totalCount}</TableCell>
                                            <TableCell>{formatDuration(row.duration)}</TableCell>
                                            <TableCell>{new Date(row.runDate).toUTCString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box><Typography>{documentId}</Typography></Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
};

export default JobsDetailsModal;