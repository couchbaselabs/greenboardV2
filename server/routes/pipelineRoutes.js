const express = require('express');
const pipelineController = require('../controllers/pipelineController');

const pipelineRouter = express.Router();
// Query to get pipeline job details for a given date range.
pipelineRouter.get("/pipeline_jobs/:scope", pipelineController.getPipelineJobs);
pipelineRouter.get('/pipeline_aggregates/:scope', pipelineController.getPipelineAggregates);
pipelineRouter.get('/pipelines/:scope', pipelineController.getPipelines);
pipelineRouter.get('/test_cases/:result/:doc_id', pipelineController.getJobTestCases);
pipelineRouter.get('/pipeline_summary_cp', pipelineController.getPipelineSummaryForCp);
pipelineRouter.get('/pipeline_summary_ami', pipelineController.getPipelineSummaryForAMI);

module.exports = pipelineRouter;