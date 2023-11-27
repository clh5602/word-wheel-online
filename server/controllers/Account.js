const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');
const changePasswordPage = (req, res) => res.render('changePass');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(400).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

const changePassword = async (req, res) => {
  const oldPass = `${req.body.oldPass}`;
  const newPass = `${req.body.newPass}`;

  if (!oldPass || !newPass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const hash = await Account.generateHash(newPass);

  return Account.authenticate(req.session.account.username, oldPass, async (err, account) => {
    if (err || !account) {
      return res.status(400).json({ error: 'Wrong password!' });
    }

    const updatedAccount = account;
    updatedAccount.password = hash;
    await updatedAccount.save();

    return res.status(201).json({ error: 'Password updated successfully!' });
  });
};

module.exports = {
  login,
  loginPage,
  signup,
  logout,
  changePasswordPage,
  changePassword,
};
