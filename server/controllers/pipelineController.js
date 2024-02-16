const dbClient = require("../utils/cbclient");

const getPipelineJobs = async (req, res) => {
    const scope = req.params.scope;
    const startDate = parseInt(req.query.startDate, 10);
    const endDate = parseInt(req.query.endDate, 10);
    let queryString = "SELECT *, meta().id FROM `pipeline` WHERE runDate > $1 and runDate < $2 ORDER by runDate";
    const queryParams = [startDate, endDate]
    let response = {};
    try {
        const result = await dbClient.queryDB(scope, queryString, queryParams);
        for (const row of result.rows) {
            const data = row['pipeline'];
            const environment = data['environment'];
            if(!response.hasOwnProperty(environment)) {
                response[environment] = {
                    "duration": 0,
                    "jobCount": 0,
                    "jobs": []
                };
            }
            let environmentData = response[environment];
            let jobToStore = {
                'id': row['id'],
                'jobName': data['name'],
                'url': data['url'],
                'cpVersion': data['cpVersion'],
                'cbVersion': data['cbVersion'],
                'commitUrl': data['commitUrl'],
                'result': data['result'],
                'duration': data['duration'],
                'description': data['description'],
                'runDate' : data['runDate'],
                'jobs': {}
            };
            let jobsCount = 0;
            const jobsQueryString = "SELECT *, meta().id FROM `jobs` WHERE pipelineID = $1 and runDate > $2 and runDate < $3 ORDER by runDate";
            const jobQueryParams = [row['id'], startDate, endDate]
            const jobResult = await dbClient.queryDB(scope, jobsQueryString, jobQueryParams);
            jobResult.rows.forEach(jobRow => {
                const jobData = jobRow['jobs'];
                const jobName =jobData['name'];
                let job = {
                    'id': jobRow['id'],
                    'result' : jobData['result'],
                    'totalCount' : jobData['totalCount'],
                    'failCount' : jobData['failCount'],
                    'passCount' : jobData['passCount'],
                    'runDate' : jobData['runDate'],
                    'duration': jobData['duration'],
                    'url' : jobData['url'],
                    'provider': jobData['provider'],
                    'component': jobData['component']
                };
                if(!jobToStore['jobs'].hasOwnProperty(jobName)) {
                    jobToStore['jobs'][jobName] = [];
                }
                jobToStore['jobs'][jobName].push(job);
                jobsCount++;

            });
            environmentData['jobCount'] += jobsCount;
            environmentData['jobs'].push(jobToStore);
            environmentData['duration'] += data['duration'];
        }
        return res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getPipelineJobs
}