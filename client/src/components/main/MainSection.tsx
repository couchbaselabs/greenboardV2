import {useAppContext} from "../../context/context.tsx";
import SiderComponent from "../sidebar/SideBar.tsx";
import CapellaMain from "./CapellaMain.tsx";
import DefaultMain from "./DefaultMain.tsx";
import {Stack} from "@mui/material";
import React from "react";

const MainSection: React.FC = () => {
    const appContext = useAppContext();
    const product = appContext.scope;

    return (
        <Stack direction='row' sx={{ height: '90%' }}>
            <SiderComponent/>
            {
                product === "capella"? (
                    <CapellaMain />
                ) : (
                    <DefaultMain />
                )
            }
        </Stack>
    )
}

export default MainSection;