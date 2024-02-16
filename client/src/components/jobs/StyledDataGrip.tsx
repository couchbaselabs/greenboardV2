import {styled} from "@mui/material/styles";
import {DataGrid} from "@mui/x-data-grid";
import {grey} from "@mui/material/colors";
import {
    getBackgroundColor,
    getHoverBackgroundColor,
    getSelectedBackgroundColor,
    getSelectedHoverBackgroundColor
} from "../../Utils/StylesUtils";

export const StyledDataGrid = styled(DataGrid)(({theme}) => ({
    '& .data-grid--even': {
        backgroundColor: getBackgroundColor(grey['100'], theme.palette.mode),
        '&:hover': {
            backgroundColor: getHoverBackgroundColor(grey['100'], theme.palette.mode),
        },
        '&.Mui-selected': {
            backgroundColor: getSelectedBackgroundColor(grey['100'], theme.palette.mode),
            '&:hover': {
                backgroundColor: getSelectedHoverBackgroundColor(grey['100'], theme.palette.mode),
            }
        }
    },
    '& .data-grid--odd': {
        backgroundColor: getBackgroundColor(grey['400'], theme.palette.mode),
        '&:hover': {
            backgroundColor: getHoverBackgroundColor(grey['400'], theme.palette.mode),
        },
        '&.Mui-selected': {
            backgroundColor: getSelectedBackgroundColor(grey['400'], theme.palette.mode),
            '&:hover': {
                backgroundColor: getSelectedHoverBackgroundColor(grey['400'], theme.palette.mode),
            }
        }
    }
}));