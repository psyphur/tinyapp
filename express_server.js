const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "01" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "02" },
}

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
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log("Handshake with server established");
})

app.get("/urls", (req, res) => {
  const userURLS = urlsForUser(req.cookies.user_id);
  const templateVars = { 
    user: usersDb[req.cookies.user_id],
    urls: userURLS,
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: usersDb[req.cookies.user_id],
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
      user: usersDb[req.cookies.user_id],
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
    user: usersDb[req.cookies.user_id],
  };
  res.render("register", templateVars);
})

app.get("/login", (req, res) => {
  const templateVars = { 
    user: usersDb[req.cookies.user_id],
  };
  res.render("login", templateVars);
})

app.post("/urls", (req, res) => {
  const userLoggedIn = req.cookies.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longURL, userID: userLoggedIn};
  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userLoggedIn = req.cookies.user_id;
  const urlUser = urlDatabase[shortURL].userID;
  if (userLoggedIn === urlUser) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("You do not have permission to perform this action.");
  }
})

app.post("/urls/:id", (req, res) => {
  const userLoggedIn = req.cookies.user_id;
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
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  
  checkValidRegistration(id, email, password, res);
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  checkLogin(email, password, res);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

function generateRandomString() {
  const randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = '';

  for (let i = 0; i < 6; i++) {
    res += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
  }

  return res;
};

function checkValidRegistration(id, email, password, res) {
  if (!email || !password) {
    res.status(400).send("Please enter a valid input.");
  } else {
    if (checkEmailExists(email)) {
      res.status(400).send("That email already exists. Please <a href='/login'>login</a> instead.");
    } else {
      const user = { id, email, password };
      usersDb[id] = user;
      usersDb[password] = password;
      res.cookie("user_id", id);
      res.redirect("/urls");
    }
  }
  console.log(usersDb);
}

function checkEmailExists(email) {
  let exists = false;

  for (const user in usersDb) {
    const userEmailKey = usersDb[user].email;
    if (email === userEmailKey) exists = true;
  }
  return exists;
}

function checkLogin(email, password, res) {
  let foundUser;

  if (checkEmailExists(email)) {
    for (const user in usersDb) {
      const usersKey = usersDb[user];
      if (usersKey.email === email && bcrypt.compareSync(password, usersKey.password)) {
        foundUser = usersKey.id;
        break;
      } 
    }
  }
  if (foundUser) {
    res.cookie("user_id", foundUser);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid login.");
  }
}

function urlsForUser(user) {
  let res = {};

  for (const url in urlDatabase) {
    const urlKey = urlDatabase[url];
    if (user === urlKey.userID) {
      const longURL = urlKey.longURL;
      res[url] = { longURL };
    }
  }
  return res;
}

