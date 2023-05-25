const companiesRouter = require('./companies.route');
const usersRouter = require('./users.route');
const router = require('express').Router();

router.use(process.env.COMPANIES_SUBSET_ROUTE, companiesRouter);
router.use(process.env.USERS_SUBSET_ROUTE, usersRouter);

module.exports = router;