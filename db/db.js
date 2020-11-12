const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "01",
    dateCreated: "",
    visits: 1,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "02",
    dateCreated: "",
    visits: 3,
  },
};

// Hard coded users will not work for login as bcrypt cannot compare hardcoded passwords.
// When testing and evaluating, please create a new user via /register and login with that user.
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
};

module.exports = { urlDatabase, usersDb };