import {Card, CardContent} from "@mui/material";

interface TabProps {
    display: string;
    bgcolor: string;
}

const TabComponent: React.FC<TabProps> = ({display, bgcolor}) => {
    return (
        <Card sx={{bgcolor: bgcolor}}>
            <CardContent>
                {display}
            </CardContent>
        </Card>
    );
};

export default TabComponent;