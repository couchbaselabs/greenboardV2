import React, { useState } from 'react';
import {Box, Tooltip} from '@mui/material';
import AnalysisDialog from './AnalysisDialog';



const AnalysisColumnCell: React.FC<AnalysisColumnCellProps> = ({ id, initialAnalysisText, onAnalysisSubmit }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [analysisText, setAnalysisText] = useState(initialAnalysisText);

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleSubmit = (text: string) => {
        setAnalysisText(text);
        onAnalysisSubmit(id, text); // Propagate changes up to parent component
        handleCloseDialog();
    };

    return (
        <>
            <Tooltip title={analysisText? `${analysisText} \n Click to edit analysis` : 'Click to edit analysis'} sx={{whiteSpace: 'pre-wrap'}}>
                <Box onClick={handleOpenDialog}
                     sx={{
                         overflowY: 'auto',
                         cursor: 'pointer',
                         '&:hover': {
                             backgroundColor: 'action.hover',
                         },
                         p: 1,
                     }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {analysisText || "Edit"}
                    </div>
                </Box>
            </Tooltip>
            <AnalysisDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                analysisText={analysisText}
                onSubmit={handleSubmit}
            />
        </>
    );
};

export default AnalysisColumnCell;
