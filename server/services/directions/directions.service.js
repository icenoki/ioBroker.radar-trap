// Initializes the `directions` service on path `/directions`
const { Directions } = require("./directions.class");
const createModel = require("../../models/directions.model");
const hooks = require("./directions.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/directions", new Directions(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("directions");

  service.hooks(hooks);
};
