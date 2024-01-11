import {createContext, useContext, useReducer} from "react";
import {object} from "prop-types";

const AppContext = createContext<context>({
        buildFilter: 0,
        buildID: "",
        featureFilters: [],
        jobsData: [],
        pendingData: [],
        platformFilters: [],
        runFilter: 0,
        scope: "server",
        sideBarData: {},
        variantFilters: {},
        version: "",
        versions: []
});
const AppDispatchContext = createContext({});

type context = {
        scope: string;
        versions: string[];
        version: string;
        buildID: string;
        runFilter: number;
        buildFilter: number;
        platformFilters: string[];
        featureFilters: string[];
        variantFilters: any;
        jobsData: any[];
        pendingData: any[];
        sideBarData: object;
};

const initialStates = {
        scope: 'server',
        versions: [],
        version: '',
        buildID: '',
        platformFilters: [],
        featuresFilters: [],
        variantsFilters: object,
        buildFilter: 5,
        runFilter: 2000,
        jobsData : [],
        pendingData: [],
        sideBarData: {},
    }

function appTaskReducer(task: any, action: { type: string; scope: any; versions: any; version: any; buildID: any;
        runFilter: number; buildFilter: number; platformFilters: string[], featuresFilters:string[],
        variantsFilters:any, jobsData: any[], pendingData: any[], sideBarData: any}){
        switch (action.type) {
                case 'scopeChange' : {
                        return {
                                ...task,
                                scope: action.scope
                        };
                }
                case 'versionsChanged': {
                        return {
                                ...task,
                                versions: action.versions
                        };
                }
                case 'versionChanged': {
                        return {
                                ...task,
                                version: action.version
                        };
                }
                case 'buildIdChanged': {
                        return {
                                ...task,
                                buildID: action.buildID
                        };
                }
                case 'buildFilterChanged': {
                        return {
                                ...task,
                                buildFilter: action.buildFilter
                        };
                }
                case 'runFilterChanged': {
                        return {
                                ...task,
                                runFilter: action.runFilter
                        };
                }
                case 'platformFiltersChanged': {
                        return {
                                ...task,
                                platformFilters: action.platformFilters
                        };
                }
                case 'featuresFilterChanged': {
                        return {
                                ...task,
                                featuresFilters: action.featuresFilters
                        };
                }
                case 'variantsFilterChanged': {
                        return {
                                ...task,
                                variantsFilters: action.variantsFilters
                        };
                }
                case 'jobsDataChanged': {
                        return {
                                ...task,
                                jobsData: action.jobsData
                        };
                }
                case 'pendingDataChanged': {
                        return {
                                ...task,
                                pendingData: action.pendingData
                        };
                }
                case 'sideBarDataChanged': {
                        return {
                                ...task,
                                sideBarData: action.sideBarData
                        };
                }
                default: {
                        throw Error('Unknown action: ' + action.type);
                }
        }
}

export function useAppContext() {
        return useContext(AppContext);
}

export function useAppTaskDispatch() {
        return useContext(AppDispatchContext);
}

// @ts-ignore
export function AppContextProvider({ children }) {
        const [tasks, dispatch] = useReducer(
            appTaskReducer,
            initialStates
        );
        // @ts-ignore
        return (
            <AppContext.Provider value={tasks}>
                    <AppDispatchContext.Provider value={dispatch}>
                            {children}
                    </AppDispatchContext.Provider>
            </AppContext.Provider>
        );
}