    import {Card, CardContent, Typography, Stack, Switch, ButtonBase} from "@mui/material";
import {green, red, yellow, grey} from "@mui/material/colors";

interface CardItemProps {
    id: string;
    totalCount: number;
    failCount: number;
    pending: number;
    isToggled: boolean;
    handleToggle: (title: string, state: boolean) => void;
}

const CardItem: React.FC<CardItemProps> = ({id, totalCount, failCount, pending, isToggled, handleToggle}) => {
    const getBackgroundColor = (totalCount: number, failCount: number, pending: number) => {
        if (totalCount === 0 && failCount === 0 && pending === 0) return grey['100'];
        if (totalCount === pending) return grey['600'];
        if (failCount === 0) return green['300'];
        if (failCount === totalCount) return red['300'];
        return yellow[300];
    };

    const handleCardClick = () => {
        handleToggle(id, !isToggled);
    };

    return (
        <Card
            variant="outlined"
            key={id}
            sx={{
                bgcolor: getBackgroundColor(totalCount, failCount, pending),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 1
            }}
        >
            <ButtonBase
                onClick={handleCardClick}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <CardContent style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Stack
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        spacing={1}
                    >
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            {id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total: {totalCount} Failed: {failCount} Pending: {pending}
                        </Typography>
                    </Stack>
                </CardContent>
                <Stack
                    direction="column">
                    <Typography variant="body2" color = "text.secondary">
                        {Number(totalCount / (totalCount + pending) * 100).toFixed(2)}%
                    </Typography>
                    <Switch
                        checked={isToggled}
                        onChange={handleCardClick}
                        inputProps={{ 'aria-label': `${id} Toggle Switch` }}
                        style={{ marginLeft: 'auto', marginRight: 8 }} // Ensures the switch is pushed to the right
                    />
                </Stack>
            </ButtonBase>
        </Card>
    );
};

export default CardItem;