import { Modal, Box, Typography, Stack, Select, MenuItem, Divider } from "@mui/material";
import Styles from "./styles";

interface FilterModalProps {
    isModalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
    buildFilter: number;
    setBuildFilter: (filter: number) => void;
    runFilter: number;
    setRunFilter: (filter: number) => void;
  }
  
  const FilterModal: React.FC<FilterModalProps> = ({ isModalOpen, setModalOpen, buildFilter, setBuildFilter, runFilter, setRunFilter }) => {
    return (
      <Modal 
        open={isModalOpen} 
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-filter-selector"
        aria-describedby="modal-filter-selector"
      >
        <Box sx={Styles.modal}>
          <Typography 
            id="modal-filter-title" 
            variant= "h3" 
            component="h2"
            align='center' > 
            Filters
          </Typography>
          <Stack 
            direction = 'row'
            sx = {Styles.modalStack}
          >
            <Typography variant='h4' component='h4' mr="1em" flexGrow={1}>
              Builds to show
            </Typography>
            <Select value={buildFilter || 5} onChange={(e) => setBuildFilter(Number(e.target.value))} sx={Styles.modalSelect}>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </Stack>
          <Divider />
          <Stack 
            direction = 'row'
            sx = {Styles.modalStack}
          >
            <Typography variant='h4' component='h4' mr="1em" flexGrow={1}>
              Minimum tests to have been run
            </Typography>
            <Select value={runFilter || 0} onChange={(e) => setRunFilter(Number(e.target.value))} sx={Styles.modalSelect}>
              <MenuItem value={0}>0</MenuItem>
              <MenuItem value={2000}>2000</MenuItem>
              <MenuItem value={5000}>5000</MenuItem>
              <MenuItem value={10000}>10000</MenuItem>
            </Select>
          </Stack>
        </Box>
      </Modal>
    );
  };
  
  export default FilterModal;