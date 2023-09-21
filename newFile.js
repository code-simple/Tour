const IP = require('ip');
const mongoose = require('mongoose');
const app = require('./app');
const { DB, port } = require('.');

//It is good practice to connect to the DB before running the app
mongoose
  .connect(DB)
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`App running on server ${IP.address()}:${port}`);
      console.log('Connected to DB Successfully');
    });
  })
  .catch((e) => {
    console.log(e.message);
  });
