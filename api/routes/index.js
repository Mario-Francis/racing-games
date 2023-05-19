const companiesController = require('../controllers/companies.controller');
const gamesController = require('../controllers/games.controller');
const router = require('express').Router();

router.route(process.env.COMPANIES_ROUTE)
    .get(companiesController.getAll)
    .post(companiesController.createOne);

router.route(process.env.SINGLE_COMPANY_ROUTE)
    .get(companiesController.getOne)
    .put(companiesController.updateOne)
    .patch(companiesController.patchOne)
    .delete(companiesController.deleteOne);

router.route(process.env.COMPANY_GAMES_ROUTE)
    .get(gamesController.getAll)
    .post(gamesController.createOne);

router.route(process.env.COMPANY_GAME_ROUTE)
    .get(gamesController.getOne)
    .put(gamesController.updateOne)
    .patch(gamesController.patchOne)
    .delete(gamesController.deleteOne);

module.exports = router;