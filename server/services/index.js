const routes = require("./routes/routes.service.js");
const atudo = require("./atudo/atudo.service.js");
const directions = require("./directions/directions.service.js");
const traps = require("./traps/traps.service.js");
// eslint-disable-next-line no-unused-vars
module.exports = function(app) {
  app.configure(routes);
  app.configure(atudo);
  app.configure(directions);
  app.configure(traps);
};
