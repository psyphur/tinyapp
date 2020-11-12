/**
* A simple web application that shortens a given URL with a users database functionality.
* Users can only edit and delete shorten URLS that belong to them.
* Built on Node and Express, tested with Mocha and Chai.
* @author Shaun Yap (github @psyphur)
*/
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
// Bringing in helper functions.
const { generateRandomString, checkValidRegistration, checkLogin, urlsForUser, redirectInvalidLink } = require('./helpers.js');
// Require our user and url databases.
const { urlDatabase, usersDb } = require('./db/db.js');

const app = express();
const PORT = 8080;

// Server settings.
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// Using cookie-session middleware to control our user sessions
app.use(cookieSession({
  name: 'session',
  // Only using 1 session key
  keys: ['key1'],
}));

// Gets homepage view.
app.get('/', (req, res) => {
  // Redirects user to main url page if logged in.
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    // Redirects user to login page if not logged in.
    res.redirect("/login");
  }
});

// Gets urls view per user.
app.get("/urls", (req, res) => {
  // Gets all the urls as an object, owned by the currently logged in user.
  const userURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    user: usersDb[req.session.user_id],
    urls: userURLS,
  };
  res.render("urls_index", templateVars);
});

// Gets new url creation page view.
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: usersDb[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Gets shortened url page view.
app.get("/urls/:shortURL", (req, res) => {
  // If user owns that short url, render the page to edit long url.
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: usersDb[req.session.user_id],
      urlUser: urlDatabase[req.params.shortURL].userID,
      dateCreated: urlDatabase[req.params.shortURL].dateCreated,
      visits: urlDatabase[req.params.shortURL].visits
    };
    res.render("urls_show", templateVars);
  } else {
    // If the short url does not exist, redirect and show and error message.
    redirectInvalidLink(res);
  }
});

// Redirects to long url.
app.get("/u/:shortURL", (req, res) => {
  // Redirects user to short url object's long url and increment visit counter.
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    urlDatabase[req.params.shortURL].visits++;
    res.redirect(longURL.longURL);
  } else {
    // If the short url does not exist, redirect and show and error message.
    redirectInvalidLink(res);
  }
});

// Gets user registration page view.
app.get("/register", (req, res) => {
  const templateVars = {
    user: usersDb[req.session.user_id],
  };
  res.render("register", templateVars);
});

// Gets user login page view.
app.get("/login", (req, res) => {
  const templateVars = {
    user: usersDb[req.session.user_id],
  };
  res.render("login", templateVars);
});

// Creates new shortened url, linked to the user.
app.post("/urls", (req, res) => {
  const userLoggedIn = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const dateCreated = new Date().toDateString();
  urlDatabase[shortURL] = { longURL: longURL, userID: userLoggedIn, visits: 0, dateCreated: dateCreated };
  res.redirect(`/urls/${shortURL}`);
});

// Deletes user's shortened url.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userLoggedIn = req.session.user_id;
  const urlUser = urlDatabase[shortURL].userID;
  // Check to see if user owns that short url to be allowed to delete.
  if (userLoggedIn === urlUser) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    // If user does not own that short url, show and error message.
    res.status(400).send("You do not have permission to perform this action.");
  }
});

// Updates user's shortened url.
app.post("/urls/:id", (req, res) => {
  const userLoggedIn = req.session.user_id;
  const urlUser = urlDatabase[req.params.id].userID;
  const newURL = req.body.longURL;

  // Checks if user owns that short url to edit.
  if (userLoggedIn === urlUser) {
    urlDatabase[req.params.id] = { longURL: newURL, userID: userLoggedIn };
    res.redirect("/urls");
  } else {
    // If user does not own that short url, show an error message.
    res.status(400).send("You do not have permission to perform this action.");
  }
});

// Destroys current session, logs out user, and redirect them to /urls page.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Adds new user to user database if registration form input is valid.
app.post("/register", (req, res) => {
  // Check for valid input first before sending to server for registration validation.
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter a valid input");
  } else {
    checkValidRegistration(res, req, usersDb);
  }
});

// Logs in user if user login info is valid.
app.post("/login", (req, res) => {
  // Check for valid input first before sending to server for registration validation.
  if (!req.body.email || !req.body.password) {
    // Replies with a vague error message to dissuade forced intrusion.
    res.status(400).send("Please enter a valid input");
  } else {
    checkLogin(res, req, usersDb);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Exporting our databases to helper.js file.
module.exports = { urlDatabase, usersDb };