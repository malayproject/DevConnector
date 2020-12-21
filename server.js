const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require('path');

//connect database
connectDB();

// init middleware
app.use(express.json({ extended: false }));

//app.get('/', (req, res) => res.send('homepage showing.'));

//define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

//Serve static assets in production
if(process.env.NODE_ENV === 'production')   {

    //Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'inex.html'));
    })
}

var port = process.env.PORT || 5050;
app.listen(port, () => console.log(`listening at port ${port}`));