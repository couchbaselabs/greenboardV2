import React, {useState} from "react";
import {useAppContext, useAppTaskDispatch} from "../../context/context";
import {Box, List, ListItemButton, ListItemText, Menu, MenuItem, Tooltip, Zoom} from "@mui/material";
import Styles from "./styles";


interface FilterMenuProps {
    title: string,
    items: number[],
    scopeVariable: string,
    scopeAction: string
}

const FilterMenu: React.FC<FilterMenuProps> = ({title, items, scopeVariable, scopeAction}) => {
    const appContext = useAppContext();
    const appTasksDispatch = useAppTaskDispatch();
    const toolTipText = "Select number of " + title + " to show";
    const [anchorFilter, setAnchorFilter] = useState<HTMLElement>(null);
    const filterOpen = Boolean(anchorFilter);

    const handleFilterClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorFilter(event.currentTarget);
    };

    const setScopeVariable = (index: number) => {
        appTasksDispatch({
            type: scopeAction,
            [scopeVariable]: items[index]
            }
        )
    }

    const handleFilterMenuItemClick = (_event: React.MouseEvent<HTMLElement>, index: number) => {
        setScopeVariable(index);
        setAnchorFilter(null);
    }

    const handleFilterMenuClose = () => {
        setAnchorFilter(null);
    }

    return (
        <>
            <Tooltip title = {toolTipText} arrow TransitionComponent={Zoom} placement='left-end'>
                <Box sx={{ ml: 1, mr: 1, mt: 0.1, mb: 0.1 }}>
                    <List aria-label="Filter selection" sx={Styles.menus}>
                        <ListItemButton
                            id="prod-lock-button"
                            aria-haspopup='listbox'
                            aria-controls='lock-menu'
                            aria-label='Filter'
                            aria-expanded={filterOpen ? 'true' : undefined}
                            onClick={handleFilterClickListItem}
                        >
                            <ListItemText
                                primary={title + " Filter"}
                                secondary={scopeVariable === "buildFilter"? appContext.buildFilter : appContext.runFilter}
                                secondaryTypographyProps={{align: "center"}}
                            />
                        </ListItemButton>
                    </List>
                    <Menu
                        id="product-menu"
                        anchorEl={anchorFilter}
                        open={filterOpen}
                        onClose={handleFilterMenuClose}
                        MenuListProps={{
                            'aria-labelledby': "filter-button",
                            "role": 'listbox'
                        }}
                    >
                        {items.map((item, index) => (
                            <MenuItem
                                key={item}
                                selected={index === items.indexOf(scopeVariable === "buildFilter"? appContext.buildFilter : appContext.runFilter)}
                                sx = {Styles.menus}
                                onClick={(event) => handleFilterMenuItemClick(event, index)}
                            >
                                {item}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Tooltip>
        </>
    );
};

export {
    FilterMenu
};