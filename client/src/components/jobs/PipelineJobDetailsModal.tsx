import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {PaperComponent, rowStyle} from "../../Utils/StylesUtils";
import React, {useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {formatDuration} from "../../Utils/DateUtils";
import {TestCaseDetailsModal} from "./TestCaseDetailsModal.tsx";


const PipelineJobDetailsModal: React.FC<PipelineJobDetailsModalProps> = ({open, onClose, job}) => {
    if (job === null) {
        return null;
    }
    const [selectedJobTestCase, setSelectedJobTestCase] = useState<TestCaseDetailModal>({docId: "", testName:""});
    const [openTestCaseDialog, setOpenTestCaseDialog] = useState(false);
    const [selectedTestStatus, setSelectedTestStatus] = useState("");

    // @ts-ignore
    const handleOpenTestCaseDialog = (row) => {
        const test: TestCaseDetailModal = {
            docId: row.id,
            testName: job.jobName
        }
        setSelectedJobTestCase(test);
        setOpenTestCaseDialog(true);
    }

    const handleCloseTestDialog = () => {
        setOpenTestCaseDialog(false);
        setSelectedJobTestCase({docId: "", testName: ""});
        setSelectedTestStatus("");
    }

    return (
        <Dialog open={open}
                onClose={onClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-jobs-details"
                maxWidth='lg'
        >
            <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
                <Stack>
                    <Typography variant='h4' align='center'>
                        {job.jobName}
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
                <CloseIcon/>
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
                        <Table aria-label="pipeline-jobs-details">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="right">Run No.</TableCell>
                                    <TableCell align="right">URL</TableCell>
                                    <TableCell align="right">Result</TableCell>
                                    <TableCell align="right">Total Count</TableCell>
                                    <TableCell align="right">Fail Count</TableCell>
                                    <TableCell align="right">Pass Count</TableCell>
                                    <TableCell align="right">Run Date</TableCell>
                                    <TableCell align="right">Duration</TableCell>
                                    <TableCell align="right">Provider</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {job.jobs.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{index}</TableCell>
                                        <TableCell><Link href={row.url} target="_blank">link</Link></TableCell>
                                        <TableCell sx={rowStyle(row.result)}>{row.result}</TableCell>
                                        <TableCell>{row.totalCount}</TableCell>
                                        <TableCell>
                                            {
                                                row.failCount === 0 ?
                                                    (<div>{row.failCount}</div>):
                                                    (<Link href="#" onClick={() => {
                                                        handleOpenTestCaseDialog(row);
                                                        setSelectedTestStatus("FAILED");
                                                    }}>
                                                        {row.failCount}
                                                    </Link>)
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                row.passCount === 0 ?
                                                    (<div>{row.passCount}</div>):
                                                    (<Link href="#" onClick={() => {
                                                        handleOpenTestCaseDialog(row);
                                                        setSelectedTestStatus("PASSED");
                                                    }}>
                                                        {row.passCount}
                                                    </Link>)
                                            }
                                        </TableCell>
                                        <TableCell>{new Date(row.runDate).toLocaleString()}</TableCell>
                                        <TableCell>{formatDuration(row.duration)}</TableCell>
                                        <TableCell>{row.provider}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TestCaseDetailsModal testName={selectedJobTestCase?.testName}
                                          result={selectedTestStatus}
                                          docId={selectedJobTestCase?.docId}
                                          isModalOpen={openTestCaseDialog}
                                          onClose={handleCloseTestDialog} />
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default PipelineJobDetailsModal;