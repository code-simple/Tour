// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // this next will be carying error as props and it will be handled by globalerrorhandler in app.js
  };
};

// Note: Remember whenever there is something passed to next(something) it will not jump to any other route , and will stop jumping to next route, because it is designed like that and and that something in next is considerd as error.
