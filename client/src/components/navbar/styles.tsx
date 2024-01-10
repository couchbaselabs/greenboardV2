import {green} from "@mui/material/colors";

/*** @type = import("@mui/material").SxProps */
const Styles = {
    toolBar: {
        //display: 'flex',
        //flexGrow: 1,
        bgcolor: green[400],
        width: "80%",
        marginLeft: `calc(20%)`
        //zIndex: (theme) => theme.zIndex.drawer + 1
    },
    appLogo: {
        display: 'flex',
        mr: 1,
        ml: 1
    },
    appLogoText: {
        mr: 2,
        ml: 1,
        display: {
            xs: 'none',
            md: 'flex'
        },
        fontWeight: 700,
        letterSpacing: '.1rem',
        textDecoration: 'none',
        color: green[900]
    },
    modal: {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: green[300],
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        flexGrow: 1
    },
    menus: {
        bgcolor: green[900],
        mr: '1em',
    },
    modalStack: {
        display: 'flex',
        margin: "1em",
        alignItems: "center"
    },
    modalSelect: {
        width: '6em',
        textAlign: "center"
    }
};

export default Styles;