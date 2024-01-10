import {Typography, Box, FormControlLabel} from "@mui/material";
import CardItem from "./sideBarCards";
import SortButtonGroup from "./sideBarSort";
import {CheckBox} from "@mui/icons-material";

interface SectionProps {
    title: string;
    items: any[];
    sortBy: string | null;
    order: string | null;
    setSortBy: React.Dispatch<React.SetStateAction<string>> | null;
    setOrder: React.Dispatch<React.SetStateAction<string>> | null;
}

const SideBarSection: React.FC<SectionProps> = ({ title, items, sortBy, order, setSortBy, setOrder }) => {
    return (
        <div>
            <Box sx={{display: "flex"}}>
                <Typography variant='h4' component='h4'>{title}</Typography>
                <FormControlLabel control={<CheckBox key={title}></CheckBox>} label="ALL" sx={{marginLeft: 4}} />
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