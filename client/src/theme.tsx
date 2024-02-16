import { createTheme } from "@mui/material";
import { green, red, grey, yellow } from "@mui/material/colors";

declare module '@mui/material/styles' {
    interface Palette {
      red: Palette['primary'];
      green: Palette['primary'];
      yellow: Palette['primary'];
    }
    // allow configuration using `createTheme`
    interface PaletteOptions {
      red?: PaletteOptions['primary'];
      green?: PaletteOptions['primary'];
      yellow?: PaletteOptions['primary'];
    }
}

let theme = createTheme ({
    palette : {
        red: {
            main: red[300],
            contrastText: grey[800]
        },
        green : {
            main: green[300],
            contrastText: grey[800]
        },
        yellow : {
            main: yellow[300],
            contrastText: grey[800]
        }
    },
    components : {
        MuiListItemText : {
            styleOverrides: {
                secondary : {
                    color: 'inherit'
                }
            }
        },
        MuiAppBar : {
            styleOverrides : {
                positionSticky : true,
                colorDefault: green[400],
                root : {
                    display: "flex",
                    flexGrow: 1
                }
            },
            
        }
    }
});

export default theme;