const express = require('express');
const app = express();
const connectDB = require('./config/db');

connectDB();

// init middleware
app.use(express.json({ extended: false }));

var port = process.env.port || 5050;
app.listen(port, () => console.log(`listening at port ${port}`));

app.get('/', (req, res) => res.send('homepage showing.'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
