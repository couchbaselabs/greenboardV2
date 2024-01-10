const dbClient = require("../utils/cbclient");

const getBuilds = async (req, res) => {
    const scope = req.params.scope;
    const buildNumber = req.params.build_number;
    const component = req.query.component;
    const os = req.query.os;
    const result = req.query.result;
    const order = req.query.order;
    const orderBy = req.query.order_by;
    const limit = parseInt(req.query.limit, 10);
    const pageNumber = parseInt(req.query.page, 10);
    const offset = parseInt(req.query.offset, 10);
    const queryParams = [buildNumber];
    let queryString = "SELECT name, displayName, component, os, totalCount, failCount, " +
        "passCount, duration, jobCount, result, runDate, runParams, variants, meta().id FROM `builds` WHERE `build` = $1";
    let extraParam = 2;
    if (component !== undefined) {
        queryString += " AND component IN [$" + extraParam + "]";
        queryParams.push(component);
        extraParam++;
    }
    if (os !== undefined) {
        queryString += " AND os IN [$" + extraParam + "]";
        queryParams.push(os);
        extraParam++;
    }
    if (result !== undefined) {
        queryString += " AND `result` = $" + extraParam;
        queryParams.push(result);
        extraParam++;
    }
    if (order !== undefined && orderBy !== undefined) {
        queryString += " ORDER BY $" + extraParam + " $" + extraParam + 1;
        queryParams.push(order);
        queryParams.push(orderBy);
        extraParam += 2;
    }
    if(!isNaN(offset)){
        queryString += " OFFSET $" + extraParam;
        queryParams.push(offset);
        extraParam++;
    }
    if (!isNaN(limit) && !isNaN(pageNumber) && isNaN(offset)){
        const offset = limit * pageNumber;
        queryString += " OFFSET $" + extraParam;
        extraParam++;
        queryString += " LIMIT $" + extraParam;
        queryParams.push(offset);
        queryParams.push(limit);
    }
    try {
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getBuildDocument = async (req, res) => {
    const scope = req.params.scope;
    const docId = req.params.doc_id;
    try {
        const result = await dbClient.getFromDB(scope, "builds", docId);
        res.json(result.content);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getPendingJobsForBuild = async (req, res) => {
    const scope = req.params.scope;
    const buildNumber = req.params.build_number;
    const os = req.query.os;
    const component = req.query.component;
    const version = buildNumber.split("-")[0]
    const queryParams = [buildNumber]
    let extraParams = 2;
    let queryString = "SELECT c.os, c.name, " +
        "(SELECT j.name, j.totalCount, j.displayName, j.variants FROM OBJECT_VALUES(c.jobs) j " +
        "WHERE j.name IN ARRAY_EXCEPT(OBJECT_NAMES(c.jobs), build_jobs)) AS jobs FROM `versionComponents` c " +
        "LET build_jobs = (SELECT RAW name FROM `builds` WHERE `build` = $1"
    if (component !== undefined ) {
        queryString += " AND component = $" + extraParams;
        queryParams.push(component);
        extraParams++;
    }
    if (os !== undefined ){
        queryString += " AND os = $" + extraParams;
        queryParams.push(os);
        extraParams++;
    }
    queryString += ") WHERE c.`version` = $" + extraParams;
    queryParams.push(version);
    extraParams++;
    if (component !== undefined ) {
        queryString += " AND c.name = $" + extraParams;
        queryParams.push(component);
        extraParams++;
    }
    if (os !== undefined ){
        queryString += " AND c.os = $" + extraParams;
        queryParams.push(os);
        extraParams++;
    }
    queryString += " AND c.jobs IS NOT NULL"
    try {
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        const response = {};
        result.rows.forEach( row => {
            if (!response.hasOwnProperty(row.os)) {
                response[row.os] = []
            }
            const job = {
                "component" : row.name,
                "jobs" : row.jobs
            }
            response[row.os].push(job);
        })
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const getJobHistory = async (req, res) => {
    const scope = req.params.scope;
    const jobName = req.params.job_name;
    const buildNumber = req.params.build_number;
    const queryString = "SELECT `build`, passCount FROM `builds` WHERE " +
        "name = $1 AND `build` < $2 ORDER BY `build` DESC LIMIT 4";
    const queryParams = [jobName, buildNumber];
    try {
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        res.json(result.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getBuilds,
    getBuildDocument,
    getPendingJobsForBuild
};