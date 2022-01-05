const fs = require("fs");

// Data
const toursSimple = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
    res.json({
        status: "success",
        count: toursSimple.length,
        data: toursSimple,
    });
};

exports.createNewTours = (req, res) => {
    const newId = toursSimple[toursSimple.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    toursSimple.push(newTour);
    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(toursSimple),
        (err) => {
            if (err) {
                res.status(500).send("Unable to update tours");
            }
            res.status(201).send({ status: "success", data: newTour });
        }
    );
};

exports.getTour = (req, res) => {
    const id = req.params.id * 1;
    const tour = toursSimple.find((el) => el.id === id);
    if (!tour) {
        res.status(404).send({
            status: "failed",
            message: `No tour with id ${id} found`,
        });
    } else {
        res.send({ status: "success", data: tour });
    }
};

exports.patchTour = (req, res) => {
    const id = req.params.id * 1;
    let tour = toursSimple.find((el) => el.id === id);
    if (!tour) {
        res.status(404).send({
            status: "failed",
            message: `No tour with id ${id} found`,
        });
    }
    const update = Object.res
        .status(202)
        .send({ status: "success", data: update });
};

exports.deleteTour = (req, res) => {
    const id = req.params;
    res.status(204).send();
};
