const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../public/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  const check = tours.find((el) => el.id == val);

  if (!check) {
    return res.status(404).json({
      status: "Fail",
      message: "404 ID NOT FOUND",
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name && !req.body.price) {
    return res.status(404).json({
      status: "Fail",
      message: "NO Name and Price Provided",
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((el) => el.id == req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../public/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...>",
    },
  });
};
exports.deleteTour = (req, res) => {
  const id = req.params.id;
  const deletedTour = tours.find((el) => el.id == id);
  const newTours = tours.filter((tour) => tour.id != id);

  if (!deletedTour) {
    return res.status(404).json({ message: "Tour Not Found" });
  }
  fs.writeFile(
    `${__dirname}/../public/tours-simple.json`,
    JSON.stringify(newTours),
    (err) => {}
  );
  res.status(200).json({
    status: "success",
    message: `Successfully Deleted Tour with ID : ${id}`,
  });
};
