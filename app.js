const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.json());

const loadUsers = () => {
  try {
    const data = fs.readFileSync("users.json", "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const savedUsers = (users) => {
  const dataJSON = JSON.stringify(users);
  fs.writeFileSync("users.json", dataJSON);
};

//gets all users
app.get("/users", (req, res) => {
  const users = loadUsers();
  if (users) {
    res.status(200).send(users);
  } else {
    res.send("No Users in users.json");
  }
});

//gets specific user
app.get("/users/:id", (req, res) => {
  const users = loadUsers();
  const id = req.params.id;
  const selectedUser = users.find((user) => user.id === id);
  if (!selectedUser) return res.status(400).send("User not found");
  res.send(selectedUser);
});

//adds new user
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

app.put("/users/deposit/:id", (req, res) => {
  const users = loadUsers();
  const id = req.params.id;
  const selectedUser = users.find((user) => user.id == id);
  if (!selectedUser) return res.status(400).send("User not found");
  const cash = req.body.cash;
  selectedUser.cash += cash;
  res.send(selectedUser);
  savedUsers(users);
});

//Withdraw money from user
app.put("/users/withdraw/:id", (req, res) => {
  const users = loadUsers();
  const id = req.params.id;
  const selectedUser = users.find((user) => user.id == id);
  if (!selectedUser) return res.status(400).send("User not found");
  if (Math.abs(selectedUser.cash) === selectedUser.credit) {
    return res.status(400).send("Cannot withdraw anymore");
  }
  if (req.body.sumToWithdraw < selectedUser.cash) {
    selectedUser.cash -= req.body.sumToWithdraw;
    res.send(selectedUser);
    savedUsers(users);
  }
  if (req.body.sumToWithdraw > selectedUser.cash + selectedUser.credit) {
    return res
      .status(400)
      .send("Hey.. what you trying to do?? Cannot withdraw more");
  } else {
    selectedUser.cash -= req.body.sumToWithdraw;
    res.send(selectedUser);
    savedUsers(users);
  }
});
//transfer
app.put("/users/transfer/", (req, res) => {
  const users = loadUsers();
  const transferID = req.body.transferID;
  const cash = req.body.cash;
  const recieverID = req.body.recieverID;
  const transferUser = users.find((user) => user.id == transferID);
  const recieverUser = users.find((user) => user.id == recieverID);
  if (!transferUser || !recieverUser)
    return res.status(400).send("User not found");
  transferUser.cash -= cash;
  recieverUser.cash += cash;
  res.send({
    transMsg: "Transfer User new Balance",
    transUser: transferUser,
    recivMsg: "Reciever User new Balance",
    recivUser: recieverUser,
  });
  savedUsers(users);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
