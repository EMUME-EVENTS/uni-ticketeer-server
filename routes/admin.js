const express = require("express")
const { authenticateAdmin, getOverview, getAdminProfile } = require("../controllers/adminController")
const { adminLoginValidation } = require("../middlewares/admin-validations")
const { isAdminAuthenticated, canAdminRead } = require("../middlewares/admin-auth")
const router = express.Router()

router.get('/profile', isAdminAuthenticated, getAdminProfile)
router.get('/overview', isAdminAuthenticated, canAdminRead, getOverview)

router.post('/login', adminLoginValidation, authenticateAdmin)
router.post('/createadmin', )

module.exports = router