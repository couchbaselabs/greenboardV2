import {darken, lighten} from "@mui/material/styles";
import {GridRowClassNameParams, GridValidRowModel} from "@mui/x-data-grid";
import {green, grey, red, yellow} from "@mui/material/colors";
import {Paper, PaperProps} from "@mui/material";
import Draggable from "react-draggable";

export const getBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.7) : lighten(color, 0.7);

export const getHoverBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

export const getSelectedBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);

export const getSelectedHoverBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.4) : lighten(color, 0.4);

export const getRowClassName = (params: GridRowClassNameParams<GridValidRowModel>) => {
    return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
};

export const rowStyle = (result: string) => {
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

export const PaperComponent = (props: PaperProps) => {
    return (
        <Draggable
            handle="#draggable-dialog-title"
    cancel={'[class*="MuiDialogContent-root"]'}
        >
        <Paper {...props} />
    </Draggable>
    )
};