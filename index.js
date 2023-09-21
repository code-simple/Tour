const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const DB = process.env.DATABASE.replace('<Password>', process.env.DB_PASSWORD); // Remote DB
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Listening to the server at port ${port}`);
});
//It is good practice to connect to the DB before running the app
mongoose
  .connect(DB)
  .then(() => console.log('Connected to DB Successfully'))
  .catch((e) => {
    // In case cannot connect to DB then close server then exit app
    server.close(() => {
      process.exit(1);
    });
    console.log(e.message);
  });
