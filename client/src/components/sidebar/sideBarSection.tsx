import {Typography, Box, FormControlLabel, Checkbox} from "@mui/material";
import CardItem from "./sideBarCards";
import SortButtonGroup from "./sideBarSort";
import {useEffect, useState} from "react";

interface SectionProps {
    title: string;
    items: any[];
    sortBy: string | null;
    order: string | null;
    setSortBy: React.Dispatch<React.SetStateAction<string>> | null;
    setOrder: React.Dispatch<React.SetStateAction<string>> | null;
}

const SideBarSection: React.FC<SectionProps> = ({ title, items, sortBy, order, setSortBy, setOrder }) => {
    const [allChecked, setAllChecked] = useState(false);

    useEffect(() => {
        // Check if all items are toggled
        const areAllChecked = items.every(item => item.isToggled);
        setAllChecked(areAllChecked);
    }, [items]);

    const handleAllCheck = (event) => {
        const checked = event.target.checked;
        setAllChecked(checked);
        items.forEach(item => item.handleToggle(item.id, checked));
    };


    return (
        <div>
            <Box sx={{display: "flex"}}>
                <Typography variant='h4' component='h4'>{title}</Typography>
                <FormControlLabel
                    control={<Checkbox checked={allChecked} onChange={handleAllCheck} key={title} />}
                    label="ALL"
                    sx={{ marginLeft: 4 }}
                />
            </Box>
            {sortBy !== null && order !== null && setSortBy !== null && setOrder !== null && (
                <Box mt={1}>
                    <SortButtonGroup
                        sortBy={sortBy}
                        order={order}
                        setSortBy={setSortBy}
                        setOrder={setOrder}
                        label={title}
                    />
                </Box>
            )}
            <Box>
                {items.map((item) => (
                    <CardItem key={item.id} {...item} />
                ))}
            </Box>
        </div>
    );
};

export default SideBarSection;