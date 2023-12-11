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

    return res.json({ redirect: '/landing' });
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
    return res.json({ redirect: '/landing' });
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

const addWinnings = async (req, res) => {
  const winnings = `${req.body.winnings}`;

  const doc = await Account.findOne({ username: req.session.account.username }).exec();
  doc.winnings += winnings;
  await doc.save();

  return res.status(201).json({ error: 'Winnings updated successfully!' });
};

const visibility = async (req, res) => {
  try {
    const doc = await Account.findOne({ username: req.session.account.username }).exec();
    if (!doc) {
      throw new Error("account not found");
    }
    doc.isVisible = !doc.isVisible;
    await doc.save();

    const responseObj = {
      username: doc.username,
      winnings: doc.winnings,
      gamesPlayed: doc.gamesPlayed,
      gamesWon: doc.gamesWon,
      isPremium: doc.isPremium,
      isVisible: doc.isVisible
    }

    return res.status(201).json(responseObj);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving account!' });
  }
};

const basicInfo = async (req, res) => {
  try {
    const doc = await Account.findOne({ username: req.session.account.username }).exec();
    if (!doc) {
      throw new Error("account not found");
    }

    const responseObj = {
      username: doc.username,
      winnings: doc.winnings,
      gamesPlayed: doc.gamesPlayed,
      gamesWon: doc.gamesWon,
      isPremium: doc.isPremium,
      isVisible: doc.isVisible
    }

    return res.json({ account: responseObj });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving account!' });
  }
};

module.exports = {
  login,
  loginPage,
  signup,
  logout,
  changePasswordPage,
  changePassword,
  basicInfo,
  visibility,
  addWinnings
};
