const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const session = require('express-session');
var cookieParser = require("cookie-parser"); // Install Cookie Parse by: npm i cookie-parser
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key';
const SESSION_SECRET = 'Xp/UAw5I0Adcttq188Sy/EbkIX0lzad7qogH6dwugqI=';


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure express-session middleware
app.use(cookieParser());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));

// User data (replace with your own user data logic)
const users = [
    { id: 1, username: 'usr123', password: 'pass123', role: 'user' },
    { id: 2, username: 'adm123', password: 'pass123', role: 'admin' }
];

// Function to find user by username and password
function findUser(username, password) {
    return users.find(user => user.username === username && user.password === password);
}

// Endpoint for user authentication

app.get('/logout', (req, res) => {
   req.session.destroy((err) => res.redirect("/"));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Find user by username and password
    const user = findUser(username, password);
    if (user) {
        // Generate JWT token
        const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        // Set session data
        req.session.authorised  = true;
        req.session.user = user;
        // Redirect to home page
        res.redirect('/home');
    } else {
        // Redirect to login page with error message
        res.status(401).sendFile(path.join(__dirname, 'index.html'));
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve home.html for /home route
app.get('/home', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'home.html'));
    } else {
        // Redirect to login if not authenticated
        res.redirect('/');
    }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
