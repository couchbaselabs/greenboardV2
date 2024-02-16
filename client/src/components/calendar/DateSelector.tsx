import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {addDays, endOfDay, startOfDay} from 'date-fns';
import {useState} from "react";
import { DateRangePicker } from 'react-date-range';
import {useAppTaskDispatch} from "../../context/context.tsx";

const CalandarRangePick: React.FC = () => {
    const [state, setState] = useState([
        {
            startDate: new Date(),
            key: 'selection'
        },
    ]);
    const apptTaskDispatch = useAppTaskDispatch();

    const handleSelect = (ranges: any) => {
        const { selection } = ranges;
        const startDate = startOfDay(new Date(selection.startDate)).getTime();
        const endDate = endOfDay(new Date(selection.endDate)).getTime();
        apptTaskDispatch({
            type: "startDateDataChanged",
            startDate: startDate
        });
        apptTaskDispatch({
            type: "endDateDataChanged",
            endDate: endDate
        })
        setState([ { ...selection, startDate: new Date(startDate), endDate: new Date(endDate) } ]);
    }

   return (
       <>
           <DateRangePicker
               onChange={handleSelect}
               months={1}
               showPreview={true}
               maxDate={new Date()}
               minDate={addDays(new Date(), -365)}
               direction="vertical"
               moveRangeOnFirstSelection={false}
               preventSnapRefocus={true}
               calendarFocus="backwards"
               scroll={{enabled: true}}
               ranges={state}
           />
       </>
   )
};

export default CalandarRangePick