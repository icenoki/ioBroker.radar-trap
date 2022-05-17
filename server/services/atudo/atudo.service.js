// Initializes the `atudo` service on path `/atudo`
const { Atudo } = require("./atudo.class");
const hooks = require("./atudo.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate")
  };

  // Initialize our service with any options it requires
  app.use("/atudo", new Atudo(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("atudo");

  service.hooks(hooks);
};
