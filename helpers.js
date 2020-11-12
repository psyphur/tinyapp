const bcrypt = require('bcrypt');

function generateRandomString() {
  const randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = '';

  for (let i = 0; i < 6; i++) {
    res += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }

  return res;
};

function getUserByEmail(email, db) {
  let user;

  for (const users in db) {
    const emailKey = db[users].email;

    if (email === emailKey) {
      user = db[users];
      break;
    } 
  }
  return user;
}

function checkValidRegistration(res, req, db) {
  const email = req.body.email;
  const user = getUserByEmail(email, db);
  if (user) {
   res.status(400).send("That email already exists. Please <a href='/login'>login</a> instead.");
  } else {
    const id = generateRandomString();
    const password = bcrypt.hashSync(req.body.password, 10);
    const newUser = { id, email, password };
    db[id] = newUser;
    req.session.user_id = id;
    res.redirect("/urls");
  }
}

function checkLogin(res, req, db) {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, db);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid login.");
    }
  } else {
    res.status(403).send("Invalid login.");
  }
}

function urlsForUser(user, db) {
  let res = {};

  for (const url in db) {
    const urlKey = db[url];
    if (user === urlKey.userID) {
      const longURL = urlKey.longURL;
      res[url] = { longURL };
    }
  }
  return res;
}

module.exports = { generateRandomString, checkValidRegistration, checkLogin, urlsForUser, getUserByEmail }