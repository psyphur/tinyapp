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
  // console.log(templateVars.user.email);
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  res.render("register");
})

app.get("/login", (req, res) => {
  res.render("login");
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

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  checkValidRegistration(email, password);

  function checkValidRegistration(email, password) {
    if (!email || !password) {
      res.status(400).send("Please enter a valid input.");
    } else {
      checkEmailExists(usersDb, email);
    }
  }

  function checkEmailExists(db, email) {
    for (user in usersDb) {
      const userEmailKey = usersDb[user].email;
  
      if (email === userEmailKey) {
        res.status(400).send("That email already exists. Please <a href='/login'>login</a> instead.");
      } else {
        const user = { id, email, password};
        usersDb[id] = user;
        res.cookie("user_id", id);
        res.redirect("/urls");
      }
    }
  }
})

app.post("/login", (req, res) => {
  
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




