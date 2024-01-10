const express = require('express');
const versionController = require("../controllers/versionController");

const versionRouter = express.Router();
// Query to get details of a particular version
versionRouter.get("/versions/:scope/:version", versionController.getVersionWithFilter);
// Query to get all the versions that are collected.
versionRouter.get("/allversions/:scope", versionController.getAllVersions);
module.exports = versionRouter;
