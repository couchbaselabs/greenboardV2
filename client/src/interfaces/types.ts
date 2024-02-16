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