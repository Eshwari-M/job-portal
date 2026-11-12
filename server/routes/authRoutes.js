
const express = require("express");
const router = express.Router();

const { users } = require("../data/data");

// REGISTER
router.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (role !== "candidate" && role !== "recruiter") {
        return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = {
        id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
        name,
        email,
        password,
        role
    };

    users.push(newUser);

    res.status(201).json({
        message: "Registration successful",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }
    });
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = users.find(
        user => user.email === email && user.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

module.exports = router;
