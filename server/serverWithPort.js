/* eslint-disable no-console */
const https = require("https");
const logger = require("./logger");
const app = require("./app");

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason),
);

module.exports = function(port, that) {
  // const server = app.listen(port);
  // console.log("THIS", that);

  that.getCertificates("defaultPublic", "defaultPrivate", (err, ...res) => {
    // console.log("certificates", res);

    const server = https.createServer({
      key: res[0].key,
      cert: res[0].cert,
    }, app).listen(port);

    app.setup(server);

    server.on("listening", () =>
      console.log("Feathers application started on https://%s:%d", app.get("host"), port),
    );
  });

  return app;
};
