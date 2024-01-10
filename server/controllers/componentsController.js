const dbClient = require("../utils/cbclient");
const getComponentsByVersionOs = async (req, res) => {
    const scope = req.params.scope;
    const version = req.params.version;
    const os = req.params.os;
    const queryString = "SELECT name FROM `components` WHERE version = $1 AND os =$2 AND name IS NOT NULL";
    try {
        const result = await dbClient.queryDB(scope, queryString, [version, os]);
        const names = result.rows.map(row => row.name);
        const response = {};
        response[os] = names;
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const getComponentsByVersion = async (req, res) => {
    const scope = req.params.scope;
    const version = req.params.version;
    const queryString = "SELECT os, ARRAY_AGG(name) AS names FROM `components` WHERE version = $1 AND name IS NOT NULL GROUP BY os";

    try {
        const result = await dbClient.queryDB(scope, queryString, [version]);
        const response = {}
        result.rows.forEach(row => {
            response[row.os] = row.names;
        })
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAllOs = async (req, res) => {
    const scope = req.params.scope;
    const queryString = "SELECT DISTINCT os FROM `components` WHERE os IS NOT NULL";
    try {
        const result = await dbClient.queryDB(scope, queryString, []);
        const response = result.rows.map(row => row.os);
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAllComponents = async (req, res) => {
    const scope = req.params.scope;
    const queryString = "SELECT DISTINCT name FROM `components` WHERE name IS NOT NULL";
    try {
        const result = await dbClient.queryDB(scope, queryString, []);
        const response = result.rows.map(row => row.name);
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getSideBarDataForVersion = async (req, res) => {
    const scope = req.params.scope;
    const version = req.params.version;
    try {
        const componentsData = await dbClient.getFromDB(scope, "versionComponents", version);
        return res.json(componentsData.content);
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
}

const getAllComponentsOsForBuild = async (req, res) => {
    console.time('getAllComponentsOsForBuild Duration'); // Start the timer
    const scope = req.params.scope;
    const buildNumber = req.params.build_number;
    const version = buildNumber.split("-")[0];
    try {
        const queryString1 = "SELECT c.name, c.os, SUM(jobs.totalCount) AS totalCount FROM `components` c " +
            "UNNEST OBJECT_VALUES(jobs) AS jobs WHERE c.`version` = $1 AND c.name IS NOT NULL " +
            "GROUP BY c.name, c.os";

        const queryString2 = "SELECT name, os, totalCount, failCount FROM `components` WHERE `build` = $1";

        const [result1, result2] = await Promise.all([
            dbClient.queryDB(scope, queryString1, [version]),
            dbClient.queryDB(scope, queryString2, [buildNumber])
        ]);

        let osCompsAll = {"os": {}};
        result1.rows.forEach(row => {
            if (!osCompsAll.os.hasOwnProperty(row.os)) {
                osCompsAll.os[row.os] = {};
            }
            osCompsAll.os[row.os][row.name] = row.totalCount;
        });

        let response = {"os": {}};
        result2.rows.forEach(row => {
            if (!response.os.hasOwnProperty(row.os)) {
                response.os[row.os] = {};
            }
            response.os[row.os][row.name] = {
                "totalCount": row.totalCount,
                "failCount": row.failCount,
                "pending": 0
            };
        });

        for (let osKey in osCompsAll.os) {
            for (let component in osCompsAll.os[osKey]) {
                if (response.os.hasOwnProperty(osKey)) {
                    if (response.os[osKey].hasOwnProperty(component)) {
                        response.os[osKey][component]["pending"] = osCompsAll.os[osKey][component] - response.os[osKey][component]["totalCount"];
                    } else {
                        response.os[osKey][component] = {
                            "totalCount": 0,
                            "failCount": 0,
                            "pending": osCompsAll.os[osKey][component]
                        };
                    }
                } else {
                    response.os[osKey] = {};
                    response.os[osKey][component] = {
                        "totalCount": 0,
                        "failCount": 0,
                        "pending": osCompsAll.os[osKey][component]
                    }
                }
            }
        }

        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        console.timeEnd('getAllComponentsOsForBuild Duration'); // Stop the timer and print the duration
    }
};


module.exports = {
    getComponentByVersion: getComponentsByVersion,
    getComponentsByVersionOs,
    getAllOs,
    getAllComponents,
    getAllComponentsOsForBuild,
    getSideBarDataForVersion
};