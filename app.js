const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.json());

const loadUsers = () => {
  try {
    const dataBuffer = fs.readFileSync("users.json");
    const data = dataBuffer.toString();
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const savedUsers = (users) => {
  const dataJSON = JSON.stringify(users);
  fs.writeFileSync("users.json", dataJSON);
};

app.post("/users", (req, res) => {
  const users = loadUsers();
  const duplicateUser = users.find((user) => user.id === req.body.id);
  if (duplicateUser) return res.status(400).send("User already exists");

  const id = req.body.id ? req.body.id : uuidv4();
  const myCash = req.body.myCash ? +req.body.myCash : 0;
  const myCredit = req.body.myCredit ? +req.body.myCredit : 0;

  const user = {
    id: id,
    cash: myCash,
    credit: myCredit,
  };
  users.push(user);
  res.status(201).send(user);
  savedUsers(users);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
