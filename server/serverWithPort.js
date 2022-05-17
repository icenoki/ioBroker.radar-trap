/* eslint-disable no-console */
// const https = require("https");
// const fs = require("fs");
// const path = require("path");
const logger = require("./logger");
const app = require("./app");

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason),
);

module.exports = function(port, that) {
  const server = app.listen(port);
  console.log("THIS", that);
  that.getCertificates("defaultPublic", "defaultPrivate", (err, ...res) => console.log("certificates", res));

  /*const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, "certificates", "ibrtest.whew.synology.me+2-key.pem"), "utf8"),
    cert: fs.readFileSync(path.join(__dirname, "certificates", "ibrtest.whew.synology.me+2.pem"), "utf8"),
  }, app).listen(port);

  app.setup(server);*/

  server.on("listening", () =>
    logger.info("Feathers application started on https://%s:%d", app.get("host"), port),
  );

  return app;
};
