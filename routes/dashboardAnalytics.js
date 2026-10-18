const express = require('express');
const { getDashboardAnalytics } = require('../controllers/dashboardAnalytics');
const { isUserAuthenticated, isUserOrganiser } = require('../middlewares/auth');
const router = express.Router();

router.get('/', isUserAuthenticated, isUserOrganiser, getDashboardAnalytics);

module.exports = router;
