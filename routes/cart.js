const express = require('express');
const { isUserAuthenticated } = require('../middlewares/auth');
const { getUserCart, checkOutCart, deleteCartItem } = require('../controllers/cartController');
const { checkoutValidation } = require('../middlewares/validations');
const router = express.Router();

router.get('/:userid', isUserAuthenticated, getUserCart);
router.post('/checkout', isUserAuthenticated, checkoutValidation, checkOutCart);

router.delete('/delete_item/:itemid', isUserAuthenticated, deleteCartItem);

module.exports = router;