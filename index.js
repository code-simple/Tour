const app = require("./app");
const IP = require("ip");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App running on server ${IP.address()}:${port}`);
});
