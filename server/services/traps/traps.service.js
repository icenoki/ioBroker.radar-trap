// Initializes the `traps` service on path `/traps`
const { Traps } = require("./traps.class");
const createModel = require("../../models/traps.model");
const hooks = require("./traps.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use("/traps", new Traps(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("traps");

  service.hooks(hooks);
};
