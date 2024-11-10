const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const consentController = require('../controllers/consentController');

router.post('/users', userController.createUser);
router.post('/users/:userId/family-members', userController.addFamilyMember);
router.post('/users/:userId/financial-accounts', userController.addFinancialAccount);
router.post('/financial-accounts/:accountId/nominees', userController.addNominee);
router.post('/users/:userId/api-responses', userController.storeApiResponse);



router.post('/users/:userId/consent-request', consentController.requestConsent);
router.get('/consent/:handle/status', consentController.fetchConsentStatus);
router.post('/consent/:consentHandle/data-request', consentController.triggerDataRequest);


router.post('/users/:userId/consent-request', consentController.requestConsent);
router.get('/consent/:handle/status', consentController.fetchConsentStatus);
router.post('/consent/:consentHandle/data-request', consentController.triggerDataRequest);
router.post('/data/:sessionId/fetch', consentController.triggerDataFetch);

module.exports = router;
