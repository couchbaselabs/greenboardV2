import {
    Box,
    Paper,
    Divider,
    Drawer,
    useMediaQuery,
    useTheme,
    Typography,
    Card,
    CardContent, Stack
} from "@mui/material";
import {useState, useEffect} from "react";
import SideBarSection from "./sideBarSection";
import {useAppContext, useAppTaskDispatch} from "../../context/context";
import {green, red, yellow} from "@mui/material/colors";

const drawerWidth = '20%';


type SideBarData = {
    "platforms": {
        [key: string]: {
            totalCount: number;
            failCount: number;
            pending: number;
        };
    };
    "features": {
        [key: string]: {
            totalCount: number;
            failCount: number;
            pending: number;
        };
    };
    "variants": {
        [key: string]: {
            [key: string]: {
                totalCount: number;
                failCount: number;
                pending: number;
            };
        };
    };
}

type SideBarItem = {
    id: string;
    totalCount: number;
    failCount: number;
    pending: number;
}


interface DrawerProps {
    data: SideBarData;
}

const DrawerComponent: React.FC = () => {
    const [platformKeys, setPlatformKeys] = useState<SideBarItem[]>([]);
    const [featureKeys, setFeatureKeys] = useState<SideBarItem[]>([]);
    const [variantsData, setVariantsData] = useState<{ [key: string]: SideBarItem[] }>({})
    const [platformSortBy, setPlatformSortBy] = useState('totalCount');
    const [platformOrder, setPlatformOrder] = useState('desc');
    const [featuresSortBy, setFeaturesSortBy] = useState('totalCount');
    const [featuresOrder, setFeaturesOrder] = useState('desc');
    const [totalCount, setTotalCount] = useState(0);
    const [failedCount, setFailedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [toggledPlatformItems, setToggledPlatformItems] = useState<string[]>([]);
    const [platformPreviouslyToggled, setPlatformPreviouslyToggled] = useState<boolean>(false);
    const [toggledFeatureItems, setToggledFeatureItems] = useState<string[]>([]);
    const [featurePreviouslyToggled, setFeaturePreviouslyToggled] = useState<boolean>(false);
    const [toggledVariantsItems, setToggledVariantsItems] = useState<{ [key: string]: string[] }>({});
    const [variantsPreviouslyToggled, setVariantsPreviouslyToggled] = useState<{ [key: string]: boolean}>({})
    const appContext = useAppContext();
    const buildNumber = appContext.buildID;
    const data = appContext.sideBarData;
    const appTasksDispatch = useAppTaskDispatch();


    // Sorting logic
    const sortData = (arr: any[], sortBy: string, order: string) => {
        return arr.sort((a, b) => {
            if (typeof a[sortBy] === 'string') {
                return order === 'asc' ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy]);
            }
            return order === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
        });
    };

    function storePlatformToggledItems() {
        appTasksDispatch({
            type: "platformFiltersChanged",
            platformFilters: toggledPlatformItems
        });
    }

    function storeFeaturesToggledItems() {
        appTasksDispatch({
            type: "featuresFilterChanged",
            featuresFilters: toggledFeatureItems
        });
    }

    function storeVariantsToggledItems() {
        appTasksDispatch({
            type: "variantsFilterChanged",
            variantsFilters: toggledVariantsItems
        });
    }

    useEffect(() => {
        setPlatformKeys([]);
        setFeatureKeys([]);
        setVariantsData({});
        setTotalCount(0);
        setFailedCount(0);
        setPendingCount(0);
        setToggledPlatformItems([]);
        setPlatformPreviouslyToggled(false);
        setToggledFeatureItems([]);
        setFeaturePreviouslyToggled(false);
        setToggledVariantsItems({});
        setVariantsPreviouslyToggled({});

    }, [appContext.version])

    useEffect(() => {
        if (data === undefined){
            return;
        }
        let buildTotal = 0;
        let buildFailed = 0;
        let buildPending = 0;
        let platformData: SideBarItem[] = [];
        let featuresData: SideBarItem[] = [];
        let variantsData: { [key: string]: SideBarItem[] } = {};

        const platforms = data.platforms;
        for (const platformDataKey in platforms) {
            const totalCount = platforms[platformDataKey].totalCount;
            const failCount = platforms[platformDataKey].failCount;
            const pending = platforms[platformDataKey].pending;
            buildTotal += totalCount;
            buildFailed += failCount;
            buildPending += pending;
            platformData.push({
                id: platformDataKey,
                totalCount: totalCount,
                failCount: failCount,
                pending: pending
            });
            if(!platformPreviouslyToggled) {
                toggledPlatformItems.push(platformDataKey);
            }
        }
        // Features data
        const features = data.features;
        for (const featuresKey in features) {
            featuresData.push({
                id: featuresKey,
                totalCount: features[featuresKey].totalCount,
                failCount: features[featuresKey].failCount,
                pending: features[featuresKey].pending
            })
            if(!featurePreviouslyToggled) {
                toggledFeatureItems.push(featuresKey);
            }
        }
        //Variants data
        const variants = data.variants;
        for (const variantsKey in variants) {
            const variant = variants[variantsKey];
            variantsData[variantsKey] = [];
            toggledVariantsItems[variantsKey] = [];
            if(!variantsPreviouslyToggled.hasOwnProperty(variantsKey)){
                let updated = {...variantsPreviouslyToggled};
                updated[variantsKey] = false;
                setVariantsPreviouslyToggled(updated);
            }
            for (const variantKey in variant) {
                variantsData[variantsKey].push({
                    id: variantKey,
                    totalCount: variant[variantKey].totalCount,
                    failCount: variant[variantKey].failCount,
                    pending: variant[variantKey].pending,
                });
                if(!variantsPreviouslyToggled[variantsKey]) {
                    toggledVariantsItems[variantsKey].push(variantKey);
                }
            }
        }
        if(!platformPreviouslyToggled) {
            setPlatformKeys(sortData(platformData, platformSortBy, platformOrder));
        } else {
            setPlatformKeys(platformData);
        }
        if(!featurePreviouslyToggled) {
            setFeatureKeys(sortData(featuresData, featuresSortBy, featuresOrder));
        } else {
            setFeatureKeys(featuresData);
        }
        setVariantsData(variantsData);
        setTotalCount(buildTotal);
        setFailedCount(buildFailed);
        setPendingCount(buildPending);

        //Update the context
        storeFeaturesToggledItems();
        storePlatformToggledItems();
        storeVariantsToggledItems();
    }, [data]);

    useEffect(() => {
        setPlatformKeys(sortData(platformKeys, platformSortBy, platformOrder));
    }, [platformSortBy, platformOrder]);

    useEffect(() => {
        setFeatureKeys(sortData(featureKeys, featuresSortBy, featuresOrder));
    }, [featuresSortBy, featuresOrder]);

    useEffect(() => {
        storePlatformToggledItems();
    }, [toggledPlatformItems]);

    useEffect(() => {
        storeFeaturesToggledItems();
    }, [toggledFeatureItems]);

    useEffect(() => {
        storeVariantsToggledItems();
    }, [toggledVariantsItems]);


    const handlePlatformToggle = (title: string, state: boolean) => {
        setPlatformPreviouslyToggled(true);
        if (state) {
            setToggledPlatformItems(prev => [...prev, title]);
        } else {
            if(toggledPlatformItems.length === platformKeys.length){
                setToggledPlatformItems([title]);
            } else {
                setToggledPlatformItems(prev => prev.filter(item => item !== title));
            }
        }
    };

    const handleFeatureToggle = (title: string, state: boolean) => {
        setFeaturePreviouslyToggled(true);
        if (state) {
            setToggledFeatureItems(prev => [...prev, title]);
        } else {
            if(toggledFeatureItems.length === featureKeys.length) {
                setToggledPlatformItems([title]);
            } else {
                setToggledFeatureItems(prev => prev.filter(item => item !== title));
            }
        }
    };

    const handleVariantsToggle = (title: string, state: boolean) => {
        let variantKey = "";
        let found = false;
        for (const variantsDataKey in variantsData) {
            found = variantsData[variantsDataKey].map((item) => item.id).includes(title);
            if (found) {
                variantKey = variantsDataKey;
                break;
            }
        }
        setToggledVariantsItems(prev => {
            const updated = {...prev}
            if (state) {
                if (!updated[variantKey]) {
                    updated[variantKey] = [title];
                } else {
                    updated[variantKey].push(title);
                }
            } else {
                if(updated[variantKey].length === variantsData[variantKey].length) {
                    updated[variantKey] = [title];
                } else {
                    updated[variantKey] = updated[variantKey].filter(item => item != title);
                }
            }
            return updated;
        })
        let updated = {...variantsPreviouslyToggled};
        updated[variantKey] = true;
        setVariantsPreviouslyToggled(updated);
    }

    const getBackgroundColor = (totalCount: number, failCount: number) => {
        if (failCount === 0) return green[300];
        if (failCount === totalCount) return red[300];
        return yellow[300];
    };

    return (
        <Box>
            <Paper elevation={3}>
                <Box>
                    <Card variant='outlined' key={buildNumber} sx={{
                        bgcolor: getBackgroundColor(totalCount, failedCount)
                    }}
                    >
                        <CardContent style={{flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                            <Stack
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                spacing={1}
                            >
                                <Typography variant="h6" color="text.primary" gutterBottom>
                                    {buildNumber}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total: {totalCount} Failed: {failedCount} Pending: {pendingCount}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
                <SideBarSection
                    title="Platforms"
                    items={platformKeys.map(item => ({
                        ...item,
                        title: item.id,
                        isToggled: toggledPlatformItems.includes(item.id),
                        handleToggle: handlePlatformToggle
                    }))}
                    sortBy={platformSortBy}
                    order={platformOrder}
                    setSortBy={setPlatformSortBy}
                    setOrder={setPlatformOrder}
                />
                <Divider/>
                {
                    Object.entries(variantsData).map(([itemKey, items]) => (
                        <Box key={itemKey}>
                            <SideBarSection
                                title={itemKey}
                                items={items.map(item => ({
                                    ...item,
                                    title: item.id,
                                    isToggled: toggledVariantsItems[itemKey]?.includes(item.id),
                                    handleToggle: handleVariantsToggle
                                }))}
                                sortBy={null}
                                order={null}
                                setSortBy={null}
                                setOrder={null}/>
                        </Box>
                    ))
                }
                <Divider/>
                <SideBarSection
                    title="Features"
                    items={featureKeys.map(item => ({
                        ...item,
                        title: item.id,
                        isToggled: toggledFeatureItems.includes(item.id),
                        handleToggle: handleFeatureToggle
                    }))}
                    sortBy={featuresSortBy}
                    order={featuresOrder}
                    setSortBy={setFeaturesSortBy}
                    setOrder={setFeaturesOrder}
                />
            </Paper>
        </Box>
    );
};

const SiderComponent: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const appContext = useAppContext();
    const appTasksDispatch = useAppTaskDispatch();
    const scope = appContext.scope;
    const version = appContext.version;
    const [data, setData] = useState<any>({});

    useEffect(() => {
        if (scope === "" || version === "") {
            return;
        }
        let api = `${import.meta.env.VITE_APP_SERVER}/sidebardata/${scope}/${version}`;
        fetch(api)
            .then((response) => response.json())
            .then((data) => {
                let sideBarData: SideBarData = {
                    platforms: {},
                    features: {},
                    variants: {}
                };
                // Platform data
                const platforms = data['platforms'];
                for (const platform of platforms) {
                    sideBarData.platforms[platform] = {
                        totalCount: 0,
                        failCount: 0,
                        pending: 0
                    }
                }
                const features = data['features'];
                for (const feature of features) {
                    sideBarData.features[feature] = {
                        totalCount: 0,
                        failCount: 0,
                        pending: 0
                    }
                }
                const variants = data['variants'];
                for (const variantsKey in variants) {
                    sideBarData.variants[variantsKey] = {};
                    let variantsItem = sideBarData.variants[variantsKey];
                    for (const variantValue of variants[variantsKey]) {
                        variantsItem[variantValue] = {
                            totalCount: 0,
                            failCount: 0,
                            pending: 0
                        }
                    }
                    sideBarData.variants[variantsKey] = variantsItem
                }
                setData(sideBarData);
                appTasksDispatch({
                    type: "sideBarDataChanged",
                    sideBarData: sideBarData
                });
            });
    }, [scope, version]);

    useEffect(() => {
        setData(appContext.sideBarData);
    }, [appContext.sideBarData])

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={!isMobile}
            onClose={() => {
            }}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {width: drawerWidth, boxSizing: 'border-box'},
            }}
        >
            <DrawerComponent data={data}/>
        </Drawer>
    );
};

export default SiderComponent;