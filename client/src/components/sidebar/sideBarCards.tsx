    import {Card, CardContent, Typography, Stack, Switch, ButtonBase, Checkbox} from "@mui/material";
import {green, red, yellow, grey} from "@mui/material/colors";
    import {getPercentage} from "../../Utils/NumberUtils.ts";

interface CardItemProps {
    id: string;
    totalCount: number;
    failCount: number;
    pending: number;
    isToggled: boolean;
    handleToggle: (title: string, state: boolean) => void;
    showPerc: boolean;
}

const CardItem: React.FC<CardItemProps> = ({id, totalCount, failCount, pending, isToggled, handleToggle, showPerc}) => {
    const getBackgroundColor = (totalCount: number, failCount: number, pending: number) => {
        if (!isToggled) return grey['300'];
        if (totalCount === 0 && failCount === 0 && pending === 0) return grey['100'];
        if (totalCount === 0) return grey['600'];
        if (failCount === 0) return green['300'];
        if (failCount === totalCount) return red['300'];
        return yellow[300];
    };

    const handleCardClick = () => {
        handleToggle(id, !isToggled);
    };

    let tc = showPerc ? getPercentage(totalCount, totalCount + pending) : totalCount;
    let fc = showPerc ? getPercentage(failCount, totalCount) : failCount;
    let pc = showPerc ? getPercentage(totalCount - failCount, totalCount) : totalCount - failCount;
    const totalPerc = getPercentage(totalCount, totalCount + pending);


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
                            {
                                showPerc? `Total: ${tc}% Fail:${fc}% Pass: ${pc}%`:
                                `Total: ${tc} Failed: ${fc} Pass: ${pc} Pending: ${pending}`
                            }
                        </Typography>
                    </Stack>
                </CardContent>
                <Stack
                    direction="column">
                    <Typography variant="body2" color = "text.secondary">
                        {totalPerc}%
                    </Typography>
                    <Checkbox
                        checked={isToggled}
                        onChange={handleCardClick}
                        inputProps={{ 'aria-label': `${id} Toggle Checkbox` }}
                        style={{ marginLeft: 'auto', marginRight: 8, color: green['900'] }} // Ensures the switch is pushed to the right
                    />
                </Stack>
            </ButtonBase>
        </Card>
    );
};

export default CardItem;