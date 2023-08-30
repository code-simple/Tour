const IP = require('ip');
const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const DB = process.env.DATABASE.replace('<Password>', process.env.DB_PASSWORD); // Remote DB
const port = process.env.PORT || 5000;

//It is good practice to connect to the DB before running the app
mongoose
  .connect(DB)
  .then(() =>
    app.listen(port, () => {
      console.log(`App running on server ${IP.address()}:${port}`);
      console.log('Connected to DB Successfully');
    }),
  )
  .catch((e) => console.log(e));
