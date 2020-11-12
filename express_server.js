/**
* A simple web application that shortens a given URL with a users database functionality. 
* Users can only edit and delete shorten URLS that belong to them. 
* Built on Node and Express, tested with Mocha and Chai.
* @author Shaun Yap
*/
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const { generateRandomString, checkValidRegistration, checkLogin, urlsForUser } = require('./helpers.js');

const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "01" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "02" },
}

// Hard coded users will not work for login as bcrypt cannot compare hardcoded passwords
const usersDb = {
  "01": {
    id: "01",
    email: "a@a.com",
    password: "2222",
  },
  "02": {
    id: "02",
    email: "b@b.com",
    password: "1111",
  },
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

app.get('/', (req, res) => {
  console.log("Handshake with server established");
})

app.get("/urls", (req, res) => {
  const userURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { 
    user: usersDb[req.session.user_id],
    urls: userURLS,
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: usersDb[req.session.user_id],
  };
  res.render("urls_new", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL],
      user: usersDb[req.session.user_id],
      urlUser: urlDatabase[req.params.shortURL].userID,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Not found");
  }
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL.longURL);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
})

app.get("/register", (req, res) => {
  const templateVars = { 
    user: usersDb[req.session.user_id],
  };
  res.render("register", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = { 
    user: usersDb[req.session.user_id],
  };
  res.render("login", templateVars);
})

app.post("/urls", (req, res) => {
  const userLoggedIn = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longURL, userID: userLoggedIn};
  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userLoggedIn = req.session.user_id;
  const urlUser = urlDatabase[shortURL].userID;
  if (userLoggedIn === urlUser) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("You do not have permission to perform this action.");
  }
})

app.post("/urls/:id", (req, res) => {
  const userLoggedIn = req.session.user_id;
  const urlUser = urlDatabase[req.params.id].userID;
  const newURL = req.body.longURL;

  if (userLoggedIn === urlUser) {
    urlDatabase[req.params.id] = { longURL: newURL, userID: userLoggedIn };
    res.redirect("/urls");
  } else {
    res.status(400).send("You do not have permission to perform this action.");
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

app.post("/register", (req, res) => {  
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter a valid input");
  } else {
    checkValidRegistration(res, req, usersDb);
  }
})

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter a valid input");
  } else {
    checkLogin(res, req, usersDb);
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

module.exports = { urlDatabase, usersDb };