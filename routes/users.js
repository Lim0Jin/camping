const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');

const users = require('../controllers/users');
const { storeReturnTo } = require('../middleware');

router.route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.route('/login')
  .get(users.renderLogin)
  .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', }), users.login)
// ↑ stroeReturnTo 를 passport.authenticate앞에 써줘야함
// passport.authenticate()가 세션을 지우고 req.session.returnTo를 삭제하기전에
//returnTo값을 res.locals에 저장 할수있음 그래서 로그인 후 그전 페이지로 갈수있음

router.get('/logout', users.logout);


module.exports = router;