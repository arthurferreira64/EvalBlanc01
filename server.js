const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'HJndezo78ZDBJ',
    database: 'garage_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Routes
app.post('/api/signup', (req, res) => {
    const { lastname, firstname, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const isAdmin = false; // New field with default value

    const sql = 'INSERT INTO users (lastname, firstname, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [lastname, firstname, email, hashedPassword, isAdmin], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        res.status(201).send('User registered');
    });
});

app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            res.status(401).send('Invalid password');
            return;
        }

        const token = jwt.sign({ id: user.id }, 'secret-key', { expiresIn: '1h' });

        res.status(200).cookie('token', token).send({auth: true, 'message': 'Token set'})
        res.json({ message: 'Authenticated successfully' });
    });
});

app.get('/api/user-details', (req, res) => {
    const token = req.cookies.token;

    console.log('ici')
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'secret-key');
        const userId = decoded.id;

        const sql = 'SELECT isAdmin FROM users WHERE id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Server error' });
            }
            console.log(results)
            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ isAdmin: results[0].isAdmin });
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Fetch all users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT id, lastname, firstname, email FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        res.status(200).json(results);
    });
});

// Update user details
app.put('/api/users/:id', (req, res) => {
    const { lastname, firstname, email, password, id } = req.body;
    console.log(req)
    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const sql = 'UPDATE users SET lastname = ?, firstname = ?, email = ?, password = ? WHERE id = ?';
        db.query(sql, [lastname, firstname, email, hashedPassword, id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send('User not found');
                return;
            }
            res.status(200).send('User updated successfully');
        });
    } else {
        const sql = 'UPDATE users SET lastname = ?, firstname = ?, email = ? WHERE id = ?';
        db.query(sql, [lastname, firstname, email, id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send('User not found');
                return;
            }
            res.status(200).send('User updated successfully');
        });
    }

});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.status(200).send('User deleted successfully');
    });
});

app.get('/api/users-count', (req, res) => {
    const sql = 'SELECT COUNT(*) AS count FROM users WHERE isAdmin = false';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.status(200).json({ count: results[0].count });
    });
});

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (_, res) => {
    res.sendFile(
        path.join(__dirname, "./client/dist/index.html")
    );
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
