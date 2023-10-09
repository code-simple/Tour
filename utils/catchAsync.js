// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // this next will be carying error as props and it will be handled by globalerrorhandler in app.js
  };
};
