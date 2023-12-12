const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/changePass', mid.requiresLogin, controllers.Account.changePasswordPage);
  app.post('/changePass', mid.requiresLogin, controllers.Account.changePassword);

  app.post('/addWinnings', mid.requiresLogin, controllers.Account.addWinnings);

  app.get('/topTen', mid.requiresLogin, controllers.Account.topTen);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/visible', mid.requiresSecure, mid.requiresLogin, controllers.Account.visibility);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/landing', mid.requiresLogin, controllers.Landing.landingPage);

  app.get('/game', mid.requiresLogin, controllers.Game.gamePage);

  app.get('/getAccount', mid.requiresLogin, controllers.Account.basicInfo);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
