const express = require('express');
const componentsController = require('../controllers/componentsController');
const componentsRouter = express.Router();

// Query for all components with given version and os
componentsRouter.get('/components/:scope/:version/:os', componentsController.getComponentsByVersionOs);
// Query for all components with given version grouped by os
componentsRouter.get('/componentsall/:scope/:version', componentsController.getComponentByVersion);
// Query for all os
componentsRouter.get('/componentsallos/:scope', componentsController.getAllOs);
// Query for all components
componentsRouter.get('/componentsallcomponent/:scope', componentsController.getAllComponents);
// Query to get OS and Components details for a build_number
componentsRouter.get('/oscomponentsbuild/:scope/:build_number', componentsController.getAllComponentsOsForBuild);

// Query to get OS, Components and Variants details for a version for sidebar
componentsRouter.get('/sidebardata/:scope/:version', componentsController.getSideBarDataForVersion);

module.exports = componentsRouter;
