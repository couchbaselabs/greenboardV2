import {createContext, useContext, useReducer, Dispatch} from "react";
import {object} from "prop-types";
import {endOfDay, startOfDay} from 'date-fns';

// Define action type for proper typing
type AppAction = {
    type: string;
    scope?: any;
    versions?: any;
    version?: any;
    buildID?: any;
    runFilter?: number;
    buildFilter?: number;
    platformFilters?: string[];
    featuresFilters?: string[];
    variantsFilters?: any;
    jobsData?: any[];
    pendingData?: any[];
    sideBarData?: any;
    environment?: string;
    startDate?: number;
    endDate?: number;
    pipelineFilters?: string[];
    pipelineSearchFilters?: string[];
    pipelinesData?: any[];
    pipelineJobsData?: any[];
};

const AppContext = createContext<context>({
        buildFilter: 0,
        buildID: "",
        featureFilters: [],
        jobsData: [],
        pendingData: [],
        platformFilters: [],
        runFilter: 0,
        scope: "capella",
        sideBarData: {},
        variantFilters: {},
        pipelineFilters: [],
        pipelineSearchFilters: [],
        pipelinesData: [],
        pipelineJobsData: [],
        version: "",
        versions: [],
        environment: "sbx",
        startDate: startOfDay(new Date()).getTime(),
        endDate: endOfDay(new Date()).getTime(),
});

// Fix the dispatch context typing
const AppDispatchContext = createContext<Dispatch<AppAction>>({} as Dispatch<AppAction>);

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
        pipelineFilters: string[];
        pipelineSearchFilters: string[];
        jobsData: any[];
        pendingData: any[];
        pipelinesData: any[];
        pipelineJobsData: any[];
        sideBarData: object;
        environment: string;
        startDate: number;
        endDate: number;
};

const initialStates = {
        scope: 'capella',
        versions: [],
        version: '',
        buildID: '',
        platformFilters: [],
        featuresFilters: [],
        variantsFilters: object,
        pipelineFilters: [],
        pipelineSearchFilters: [],
        buildFilter: 5,
        runFilter: 2000,
        jobsData : [],
        pendingData: [],
        pipelinesData: [],
        pipelineJobsData: [],
        sideBarData: {},
        environment: "sbx",
        startDate: startOfDay(new Date()).getTime(),
        endDate: endOfDay(new Date()).getTime(),
    }

function appTaskReducer(task: any, action: AppAction){
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
                                featureFilters: action.featuresFilters
                        };
                }
                case 'variantsFilterChanged': {
                        return {
                                ...task,
                                variantFilters: action.variantsFilters
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
                case 'environmentDataChanged': {
                        return {
                                ...task,
                                environment: action.environment
                        };
                }
                case 'startDateDataChanged': {
                        return {
                                ...task,
                                startDate: action.startDate
                        };
                }
                case 'endDateDataChanged': {
                        return {
                                ...task,
                                endDate: action.endDate
                        };
                }
                case 'pipelineFiltersChanged': {
                        return {
                                ...task,
                                pipelineFilters: action.pipelineFilters
                        };
                }
                case 'pipelineSearchFiltersChanged': {
                        return {
                                ...task,
                                pipelineSearchFilters: action.pipelineSearchFilters
                        };
                }
                case 'pipelinesDataChanged': {
                        return {
                                ...task,
                                pipelinesData: action.pipelinesData
                        };
                }
                case 'pipelineJobsDataChanged': {
                        return {
                                ...task,
                                pipelineJobsData: action.pipelineJobsData
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