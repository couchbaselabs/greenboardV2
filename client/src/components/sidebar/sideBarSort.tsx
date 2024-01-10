import { KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, SortByAlpha } from "@mui/icons-material";
import { Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import {useState} from "react";
import {green} from "@mui/material/colors";

interface SortButtonGroupProps {
    sortBy: string;
    order: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    setOrder: React.Dispatch<React.SetStateAction<string>>;
    label: string;
}

const SortButtonGroup: React.FC<SortButtonGroupProps> = ({ sortBy, order, setSortBy, setOrder, label }) => {
    const [lastToggled, setLastToggled] = useState<string | null>(null);
    const [sort, setSort] = useState<string>(sortBy);
    const [orderBy, setOrderBy] = useState<string>(order);

    const handleSortByChange = (newValue: string | null) => {
        if (newValue !== null) {
            if (lastToggled === newValue) {
                // Toggle the order if the same button is clicked again
                setOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
                setOrderBy(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
            } else {
                setSort(newValue);
                setSortBy(newValue);
                setLastToggled(newValue);
            }
        } else {
            // Toggle the order when the same button is clicked again
            setOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
            setOrderBy(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        }
    };

    const handleOrderByChange = (newValue: string | null) => {
        if(newValue !== null) {
            setOrderBy(newValue);
            setOrder(newValue);
        }
    }
    // Custom style for selected buttons
    const selectedButtonStyle = {
        bgcolor: green['500'], // Change this value to your preferred color
        color: 'white',
        '&:hover': {
            bgcolor: green['800'],
        },
    };

    return (
        <Stack direction={'row'}>
            <ToggleButtonGroup
                value={sort}
                exclusive
                onChange={(_event, newValue) => handleSortByChange(newValue)}
                aria-label={`${label} Sort by`}
                sx={{ margin: 0.2 }}
            >
                <Tooltip title="Sort by Total Count">
                    <ToggleButton value="totalCount" aria-label={`${label} Total Count`}
                                  sx={sort === 'totalCount'? selectedButtonStyle: {}}
                    >
                        <Typography variant='h6' component={'h6'}>
                            TC
                        </Typography>
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Sort by Fail Count">
                    <ToggleButton value="failCount" aria-label={`${label} Fail Count`}
                                  sx={sort === 'failCount'? selectedButtonStyle: {}}
                    >
                        <Typography variant='h6' component={'h6'}>
                            FC
                        </Typography>
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Sort Alphabetically">
                    <ToggleButton value="id" aria-label={`${label} Alphabetically`}
                                  sx={sort === 'id'? selectedButtonStyle: {}}
                    >
                        <SortByAlpha fontSize='small' />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
            <ToggleButtonGroup
                value={orderBy}
                exclusive
                onChange={(_event, newValue) => handleOrderByChange(newValue)}
                aria-label={`${label} Order by`}
                sx={{ margin: 0.2 }}
            >
                <Tooltip title="Increasing order">
                    <ToggleButton value="asc" aria-label={`${label} Increasing`}
                                  sx={orderBy === 'asc'? selectedButtonStyle: {}}
                    >
                        <KeyboardDoubleArrowUp fontSize='small' />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Decreasing order">
                    <ToggleButton value="desc" aria-label={`${label} Decreasing`}
                                  sx={orderBy === 'desc'? selectedButtonStyle: {}}
                    >
                        <KeyboardDoubleArrowDown fontSize='small' />
                    </ToggleButton>
                </Tooltip>
            </ToggleButtonGroup>
        </Stack>
    );
};

export default SortButtonGroup