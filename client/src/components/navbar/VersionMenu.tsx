import { Box, List, ListItemButton, ListItemText, Menu, MenuItem, Tooltip, Zoom } from "@mui/material";
import {useEffect, useState} from "react";
import Styles from "./styles";
import {useAppContext, useAppTaskDispatch} from "../../context/context";

  const VersionMenu: React.FC = () => {
    const appContext = useAppContext();
    const appTasksDispatch = useAppTaskDispatch();
    const [anchorVersion, setAnchorVersion] = useState<HTMLElement>(null);
    const versionOpen = Boolean(anchorVersion);
    const setVersions = (versions) => {
      appTasksDispatch({
        type: "versionsChanged",
        versions: versions
      });
    };
    const setVersion = (version) => {
      appTasksDispatch({
        type: "versionChanged",
        version: version
      })
    }

    const isValidVersionFormat = (version) => {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      return versionRegex.test(version);
    };

    const scope = appContext.scope;

    useEffect(() => {
      const API_URL = `${import.meta.env.VITE_APP_SERVER}/allversions/${scope}`;
      // Fetch versions from API
      fetch(API_URL)
          .then(res => res.json())
          .then(data => {
            const filteredVersions = data.filter(isValidVersionFormat);
            setVersions(filteredVersions);
            if(scope === 'server'){
              setVersion(import.meta.env.VITE_APP_DEFAULT_VERSION_SERVER);
            } else {
              setVersion(filteredVersions[0]);
            }
          });
    }, [scope]);

    const versions = appContext.versions;
  
    const handleVersionClickListItem = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorVersion(event.currentTarget);
    };
  
    const handleVersionMenuItemClick = (_event: React.MouseEvent<HTMLElement>, index: number) => {
      setVersion(versions[index]);
      setAnchorVersion(null);
      localStorage.setItem('version', versions[index]);
    }
  
    const handleVersionMenuClose = () => {
      setAnchorVersion(null);
    }

    return (
      <>
      <Tooltip title = "Select Version here" arrow TransitionComponent={Zoom} placement='left-end' >
        <Box sx={{ ml: 1, mr: 1 }}>
          <List aria-label='Version selection' sx = {Styles.menus}>
            <ListItemButton
              id="version-lock-button"
              aria-haspopup='listbox'
              aria-controls='lock-menu'
              aria-label='Version'
              aria-expanded={versionOpen ? 'true' : undefined}
              onClick={handleVersionClickListItem}
            >
              <ListItemText
                primary="Version"
                secondary={appContext.version}
              />
            </ListItemButton>
          </List>
          <Menu
            id="version-menu"
            anchorEl={anchorVersion}
            open={versionOpen}
            onClose={handleVersionMenuClose}
            MenuListProps={{
              'aria-labelledby': "version-button",
              "role": 'listbox'
            }}
            slotProps= {{
                paper : {
                  style : {
                    maxHeight: 48 * 4.5,
                    width: '20ch',
                  }
                }
              }}
          >
            {versions.map((version, index) => (
              <MenuItem
                key={version}
                selected={index === versions.indexOf(appContext.version)}
                sx = {Styles.menus}
                onClick={(event) => handleVersionMenuItemClick(event, index)}
              >
                {version}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        </Tooltip>
      </>
    );
  };
  
  export default VersionMenu;