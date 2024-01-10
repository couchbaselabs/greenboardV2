const dbClient = require("../utils/cbclient");
const collection = "versions";
const getVersionWithFilter = async (req, res) => {
    console.time("getVersionWithFilter");
    try {
        const scope = req.params.scope;
        const version = req.params.version;
        const buildFilter = parseInt(req.query.buildFilter, 10);
        const testFilter = parseInt(req.query.testFilter, 10);
        const osFilter = req.query.osFilter;
        const result = await dbClient.getFromDB(scope, collection, version);
        const builds = Object.keys(result.content.builds)
            .filter(build => {
                // Filter out builds that doesn't contain OSFilter.
                if (osFilter !== undefined) {
                    return result.content.builds[build].os[osFilter];
                }
                return true;
            })
            .filter( (build) => {
                // Filter out builds that has totalCount less than testFilter
                if(testFilter > 0) {
                    return result.content.builds[build].totalCount > testFilter;
                }
                return true;
            })
            .sort()
            .slice(-buildFilter);
        const filteredBuilds = {};
        builds.forEach(build => {
            filteredBuilds[build] = result.content.builds[build];
        });
        res.json(filteredBuilds);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        console.timeEnd("getVersionWithFilter");
    }
}

const getVersionWithFilterExperiment = async (req, res) => {
    console.time("getVersionWithFilter");
    try {
        const scope = req.params.scope;
        const version = req.params.version;
        const buildFilter = parseInt(req.query.buildFilter, 10);
        const testFilter = parseInt(req.query.testFilter, 10);
        const osFilter = req.query.osFilter;
        let extraParams = 2;
        let queryParams = [version];
        let queryString = "SELECT b.* FROM `versions` as d UNNEST OBJECT_PAIRS(d.`builds`) as b " +
            "WHERE d.version = '$1'";
        if (testFilter > 0) {
            queryString += " AND b.val.totalCount > $" + extraParams;
            queryParams.push(testFilter);
            extraParams++;
        }
        if (osFilter !== undefined && osFilter !== ""){
            queryString += " AND '$" + extraParams + "' IN OBJECT_NAMES(b.val.os)"
            queryParams.push(osFilter);
            extraParams++;
        }
        queryString += " ORDER BY b.name DESC LIMIT $" + extraParams;
        queryParams.push(buildFilter);
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        let response = {};
        result.rows.forEach( row => {
            const build = row.name;
            const value = row.val;
            const passCount = value.passCount;
            const failCount = value.failCount;
            const totalCount = value.totalCount;
            const jobCount = value.jobCount;
            response[build] = {
                'passCount' : passCount,
                'failCount' : failCount,
                'totalCount' : totalCount,
                'jobCount' : jobCount
            }
        })
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        console.timeEnd("getVersionWithFilter");
    }
}

const getAllVersions = async (req, res) => {
    try {
        const scope = req.params.scope;
        const queryString = "SELECT RAW version FROM `versions` ORDER BY version DESC";
        const result = await dbClient.queryDB(scope, queryString, []);
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getVersionWithFilter,
    getAllVersions
};