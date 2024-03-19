import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";


const AnalysisDialog: React.FC<AnalysisDialogProps> = ({ open, onClose, analysisText: initialText, onSubmit }) => {
    const [analysisText, setAnalysisText] = useState(initialText);

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        onSubmit(analysisText);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Edit Analysis</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    multiline
                    rows={4}
                    margin="dense"
                    id="analysis"
                    label="Analysis Text"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnalysisDialog;
