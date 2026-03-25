const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());

const filePath = path.join(__dirname, "data", "users.json");

function readUsers() {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return data ? JSON.parse(data) : [];
}

function writeUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// GET /users?search=&sort=name&order=asc
app.get("/users", (req, res) => {
  let users = readUsers();
  const { search, sort, order } = req.query;

  if (search) {
    const value = search.toLowerCase();
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value)
    );
  }

  if (sort) {
    users.sort((a, b) => {
      const aValue = String(a[sort] || "").toLowerCase();
      const bValue = String(b[sort] || "").toLowerCase();

      if (aValue < bValue) return order === "desc" ? 1 : -1;
      if (aValue > bValue) return order === "desc" ? -1 : 1;
      return 0;
    });
  }

  res.json(users);
});

// GET /users/:id
app.get("/users/:id", (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// POST /users
app.post("/users", (req, res) => {
  const users = readUsers();
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
    email,
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// PUT /users/:id
app.put("/users/:id", (req, res) => {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  users[index] = {
    ...users[index],
    name,
    email,
  };

  writeUsers(users);
  res.json(users[index]);
});

// DELETE /users/:id
app.delete("/users/:id", (req, res) => {
  const users = readUsers();
  const filteredUsers = users.filter((u) => u.id !== parseInt(req.params.id));

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ message: "User not found" });
  }

  writeUsers(filteredUsers);
  res.json({ message: "User deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});