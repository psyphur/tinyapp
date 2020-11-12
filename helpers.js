const bcrypt = require('bcrypt');

/**
 * Simple random number and character generator.
 * Used to assign a random ID to new users as well as shortened URLs.
 *
 * @return a random 6 character long string of numbers and characters.
 */
function generateRandomString() {
  const randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = '';

  for (let i = 0; i < 6; i++) {
    res += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }
  return res;
}

/**
 * Gets a user based on an email input.
 *
 * @param email email input value through form login/logout.
 * @param db users database.
 * @return user object that matches the email input.
 */
function getUserByEmail(email, db) {
  let user;

  for (const users in db) {
    const emailKey = db[users].email;
    if (email === emailKey) {
      user = db[users];
      // Exit loop once user is found.
      break;
    }
  }
  return user;
}

/**
 * Checks if email input from form doesn't already exist in database.
 * If not, register user. If exists, send an error.
 *
 * @param res express_server POST response.
 * @param req express_server POST request.
 * @param db users database.
 * @return A new user stored in database, or a HTTP status error.
 */
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

/**
 * Checks if user login info is valid.
 * If valid, log in user. If not valid, send an error.
 *
 * @param res express_server POST response.
 * @param req express_server POST request.
 * @param db users database.
 * @return Store user_id as current session, or send a HTTP status error.
 */
function checkLogin(res, req, db) {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, db);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      // If login info is incorrect.
      // Replies with a vague error message to dissuade forced intrusion.
      res.status(403).send("Invalid login.");
    }
  } else {
    // If user doesn't exist.
    // Replies with a vague error message to dissuade forced intrusion.
    res.status(403).send("Invalid login.");
  }
}

/**
 * Get shorten URL object owned by a user
 *
 * @param user the user to check URLs for.
 * @param db the URLS database.
 * @return An object of the shortened URLs owned by a user.
 */
function urlsForUser(user, db) {
  let res = {};

  for (const url in db) {
    const urlKey = db[url];
    if (user === urlKey.userID) {
      const visits = urlKey.visits;
      const dateCreated = urlKey.dateCreated;
      const longURL = urlKey.longURL;
      res[url] = { longURL, dateCreated, visits };
    }
  }
  return res;
}

/**
 * Redirects user to homepage if a link is invalid.
 *
 * @param res express_server response.
 * @return Browser redirect to homepage.
 */
function redirectInvalidLink(res) {
  res.status(404).send("<html><h1>That URL does not exist. </h1><br>Go <a href='/'>Back</a></html>");
}

module.exports = { generateRandomString, checkValidRegistration, checkLogin, urlsForUser, getUserByEmail, redirectInvalidLink };