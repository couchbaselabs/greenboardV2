import { Box, List, ListItemButton, ListItemText, Menu, MenuItem, Tooltip, Zoom } from "@mui/material";
import {useState} from "react";
import Styles from "./styles";
import {useAppContext, useAppTaskDispatch} from "../../context/context";

  const Products = [
    "server",
    "capella",
    "mobile",
    "sync_gateway"
  ]
  
  const ProductMenu: React.FC = () => {
    const appContext = useAppContext();
    const appTasksDispatch = useAppTaskDispatch();

    const [anchorProd, setAnchorProd] = useState<HTMLElement>(null);
    const prodOpen = Boolean(anchorProd);

    const handleProdClickListItem = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorProd(event.currentTarget);
    };

    const setScopeContext = (index: number) => {
      appTasksDispatch({
        type: "scopeChange",
        scope: Products[index]
      });
    }
  
    const handleProdMenuItemClick = (_event: React.MouseEvent<HTMLElement>, index: number) => {
      setScopeContext(index);
      // setSelectedProd(index);
      setAnchorProd(null);
      localStorage.setItem('scope', Products[index]);
    }
  
    const handleProdMenuClose = () => {
      setAnchorProd(null);
    }
  
    return (
      <>
       <Tooltip title = "Select Product here" arrow TransitionComponent={Zoom} placement='left-end'>
        <Box sx={{ ml: 1, mr: 1, mt: 0.1, mb: 0.1 }}>
          <List aria-label="Product selection" sx={Styles.menus}>
            <ListItemButton
              id="prod-lock-button"
              aria-haspopup='listbox'
              aria-controls='lock-menu'
              aria-label='Product'
              aria-expanded={prodOpen ? 'true' : undefined}
              onClick={handleProdClickListItem}
            >
              <ListItemText
                primary="Product"
                secondary={appContext.scope}
              />
            </ListItemButton>
          </List>
          <Menu
            id="product-menu"
            anchorEl={anchorProd}
            open={prodOpen}
            onClose={handleProdMenuClose}
            MenuListProps={{
              'aria-labelledby': "product-button",
              "role": 'listbox'
            }}
          >
            {Products.map((product, index) => (
              <MenuItem
                key={product}
                selected={index === Products.indexOf(appContext.scope)}
                sx = {Styles.menus}
                onClick={(event) => handleProdMenuItemClick(event, index)}
              >
                {product}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        </Tooltip>
      </>
    );
  };
  
  export {
    Products,
    ProductMenu
  };