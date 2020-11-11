const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

const usersDb = {
  "01": {
    id: "01",
    email: "a@a.com",
    password: "1234",
  },
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log("Handshake with server established");
})

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: usersDb[req.cookies.user_id],
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
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;
  urlDatabase[req.params.id] = newURL;
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
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
      res.cookie("user_id", id);
      res.redirect("/urls");
    }
  }
}

function checkEmailExists(email) {
  let exists = false;

  for (user in usersDb) {
    const userEmailKey = usersDb[user].email;
    if (email === userEmailKey) exists = true;
  }
  return exists;
}

function checkLogin(email, password, res) {

  if (checkEmailExists(email)) {
    console.log("found");
    for (user in usersDb) {
      const usersKey = usersDb[user];
      console.log(usersKey);
      if (usersKey.email === email && usersKey.password === password) {
        res.cookie("user_id", usersKey.id);
        res.redirect("/urls");
      } else {
        res.status(403).send("Invalid login.");
      }
    }
  } else {
    res.status(403).send("User not found.");
  }
}


