const dbClient = require("../utils/cbclient");

const getPipelines = async (req, res) => {
    const scope = req.params.scope;
    const startDate = parseInt(req.query.startDate, 10);
    const endDate = parseInt(req.query.endDate, 10);
    const queryString = "SELECT *, meta().id FROM `pipeline` where runDate between $1 AND $2"
    const queryParams = [startDate, endDate];
    let response = {};
    try {
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        result.rows.forEach(row => {
            const rowData = row.pipeline;
            const environment = rowData['environment'];
            if(!response.hasOwnProperty(environment)) {
                response[environment] = [];
            }
            const environmentData = response[environment];
            const jobToStore = {
                "id": row.id,
                "jobName": rowData.name,
                "cbVersion": rowData.cbVersion,
                "cpVersion": rowData.cpVersion,
                "commitUrl": rowData.commitUrl,
                "result": rowData.result,
                "duration": rowData.duration,
                "runDate": rowData.runDate,
                "description": rowData.description,
                "url": rowData.url
            };
            environmentData.push(jobToStore);
        });
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const getPipelineJobs = async (req, res) => {
    const scope = req.params.scope;
    const startDate = parseInt(req.query.startDate, 10);
    const endDate = parseInt(req.query.endDate, 10);
    const queryString = "SELECT p.environment, p.cpVersion, p.cbVersion, p.commitUrl, " +
        "p.result as pipelineResult, p.runDate as pipelineRunDate, " +
        "p.duration as pipelineDuration, p.description , j.*, meta(j).id as jobId " +
        "FROM `pipeline` p " +
        "JOIN `jobs` j ON j.pipelineID = META(p).id " +
        "WHERE p.runDate BETWEEN $1 AND $2 " +
        "AND j.runDate BETWEEN $3 AND $4";
    const queryParams = [startDate, endDate, startDate, endDate];
    let response = {};
    try {
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        for (const row of result.rows) {
            const environment = row['environment'];
            if(!response.hasOwnProperty(environment)) {
                response[environment] = {
                    "duration": 0,
                    "jobCount": 0,
                    "jobs": []
                };
            }
            let environmentData = response[environment];
            let jobsIndex = environmentData['jobs'].findIndex((value) => {return value['id'] === row['pipelineID']});
            let jobToStore;
            if(jobsIndex < 0) {
                jobToStore = {
                    'id': row['pipelineID'],
                    'jobName': row['pipelineJob'],
                    'url': row['pipelineJobUrl'],
                    'cpVersion': row['cpVersion'],
                    'cbVersion': row['cbVersion'],
                    'commitUrl': row['commitUrl'],
                    'result': row['pipelineResult'],
                    'duration': row['pipelineDuration'],
                    'description': row['description'],
                    'runDate': row['pipelineRunDate'],
                    'jobs': {}
                };
                environmentData['jobs'].push(jobToStore);
                environmentData['duration'] += row['pipelineDuration'];
            } else {
                jobToStore = environmentData['jobs'][jobsIndex];
            }
            const jobName =row['name'];
            let job = {
                'id': row['jobId'],
                'result' : row['result'],
                'totalCount' : row['totalCount'],
                'failCount' : row['failCount'],
                'passCount' : row['passCount'],
                'runDate' : row['runDate'],
                'duration': row['duration'],
                'url' : row['url'],
                'provider': row['provider'],
                'component': row['component']
            };
            if(!jobToStore['jobs'].hasOwnProperty(jobName)) {
                jobToStore['jobs'][jobName] = [];
            }
            jobToStore['jobs'][jobName].push(job);
            environmentData['jobCount']++;
        }
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const getPipelineAggregates = async (req, res) => {
    const scope = req.params.scope;
    const startDate = parseInt(req.query.startDate, 10);
    const endDate = parseInt(req.query.endDate, 10);
    try {
        const pipelineQueryString = "SELECT result, environment, count(*) as jobCount from `pipeline` " +
            "where runDate between $1 and $2 group by result, environment order by environment";
        const pipelineQueryParams = [startDate, endDate];
        const jobsQueryString = "SELECT p.environment, j.result, count(*) as jobCount " +
            "FROM `pipeline` p " +
            "JOIN `jobs` j ON j.pipelineID = META(p).id " +
            "WHERE p.runDate BETWEEN $1 AND $2 " +
            "AND j.runDate BETWEEN $3 AND $4 " +
            "GROUP BY j.result, p.environment " +
            "ORDER BY p.environment;";
        const jobsQueryParams = [startDate, endDate, startDate, endDate];
        const [pipelineResult, jobResult] = await Promise.all([
            dbClient.queryDB(scope, pipelineQueryString, pipelineQueryParams),
            dbClient.queryDB(scope, jobsQueryString, jobsQueryParams)
        ]);
        let response = {
            'pipeline': {},
            'jobs': {}
        };
        pipelineResult.rows.forEach(row => {
            const environment = row.environment;
            const jobCount = row.jobCount;
            const result = row.result;
            if (!response['pipeline'].hasOwnProperty(environment)) {
                response['pipeline'][environment] = [];
            }
            response['pipeline'][environment].push({
                "name": result,
                "value": jobCount
            });
        });
        jobResult.rows.forEach(row => {
            const environment = row.environment;
            const jobCount = row.jobCount;
            const result = row.result;
            if (!response['jobs'].hasOwnProperty(environment)) {
                response['jobs'][environment] = [];
            }
            response['jobs'][environment].push({
                "name": result,
                "value": jobCount
            });
        });
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getPipelineJobs,
    getPipelineAggregates,
    getPipelines
}