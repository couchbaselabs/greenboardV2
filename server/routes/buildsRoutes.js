const express = require('express');
const buildController = require("../controllers/buildsController");

const buildRouter = express.Router();
// Query to get all the build documents from cluster for a given build number
buildRouter.get("/builds/:scope/:build_number", buildController.getBuilds);
// Query to get a specific build document from cluster
buildRouter.get("/build_document/:scope/:doc_id", buildController.getBuildDocument);
// Query to get the pending jobs for a particular build_number
buildRouter.get("/pending/:scope/:build_number", buildController.getPendingJobsForBuild);

module.exports = buildRouter;