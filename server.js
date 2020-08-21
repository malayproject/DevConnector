const express = require('express');
const app = express();
var port = process.env.port || 5000;
app.listen(port, () => console.log(`listening at port ${port}`));
app.get('/', (req, res) => res.send('api running'));
