/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mkcert = require("mkcert");
const https = require("https");
const logger = require("./logger");
const app = require("./app");

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason),
);

const createCertificatesIfRequired = async (that) => {
  try {
    const obj = await that.getForeignObjectAsync("system.certificates");
    let cert = null;

    if (obj && obj.native && obj.native.certificates && obj.native.certificates.radarTrapPublic !== undefined) {
      cert = that.tools.getCertificateInfo(obj.native.certificates.radarTrapPublic);

      // console.log("CERT", cert);

      const nativeDomains = JSON.parse("[" + that.config.domains.replace(/(^|,)\s*([^,]*[^0-9, ][^,]*?)\s*(?=,|$)/g, "$1\"$2\"") + "]").sort();
      const certDomains = cert.dnsNames;

      const allCd = certDomains.reduce((cdList, cd) => {
        for (const [key, value] of Object.entries(cd)) {
          if (key === "type" && value === 7) {
            cdList.push(cd.ip);
            return cdList.sort();
          }

          if (key === "type" && value === 2) {
            cdList.push(cd.value);
            return cdList.sort();
          }
        }
        return cdList.sort();
      }, []);

      // console.log("nativeDomains", nativeDomains);
      // console.log("allCD", allCd);
      // console.log(JSON.stringify(nativeDomains) === JSON.stringify(allCd));

      if (JSON.stringify(nativeDomains) !== JSON.stringify(allCd)) {
        cert = null;
      }

      if (cert) {
        const dateCertStart = Date.parse(cert.validityNotBefore);
        const dateCertEnd = Date.parse(cert.validityNotAfter);
        // check, if certificate is invalid (too old, longer then 825 days or keylength too short)
        if (dateCertEnd <= Date.now() || cert.keyLength < 2048 || (dateCertEnd - dateCertStart) > 365 * 24 * 60 * 60 * 1000) {
          // generate new certificates
          if (cert.certificateFilename) {
            that.log.info("Existing radarTrapPublic certificate is invalid (too old, validity longer then 345 days or keylength too short). Please check it!");
          } else {
            that.log.info(
              "Existing earlier generated radarTrapPublic certificate is invalid (too old, validity longer then 345 days or keylength too short). Generating new Certificate!");
            cert = null;
          }
        }
      }
    }

    if (!cert) {
      const ca = await mkcert.createCA({
        organization: "ioBroker radar-trap",
        countryCode: "DE",
        state: "ioBroker radar-trap",
        locality: "ioBroker radar-trap",
        validityDays: 365,
      });

      const domains = JSON.parse("[" + that.config.domains.replace(/(^|,)\s*([^,]*[^0-9, ][^,]*?)\s*(?=,|$)/g, "$1\"$2\"") + "]");
      const cert = await mkcert.createCert({
        domains: domains,
        validityDays: 365,
        caKey: ca.key,
        caCert: ca.cert,
      });

      obj.native.certificates.radarTrapPrivate = cert.key;
      obj.native.certificates.radarTrapPublic = cert.cert;
      // obj.native.certificates.radarTrapCA = ca.cert;
      await that.setForeignObjectAsync(obj._id, obj);

      const caPath = path.resolve("server", "certificates", "radarTrapCA.pem");
      fs.writeFileSync(caPath, ca.cert);
      that.log.info("radarTrapCA was generated.");

      const publicPath = path.resolve("server", "certificates", "radarTrapPublic.pem");
      fs.writeFileSync(publicPath, cert.cert);
      that.log.info("radarTrapPublic certificate was generated.");

      const privatePath = path.resolve("server", "certificates", "radarTrapPrivate.pem");
      fs.writeFileSync(privatePath, cert.key);
      that.log.info("radarTrapPrivate certificate was generated.");
    }

  } catch (err) {
    throw new Error(err);
  }
};

module.exports = async function(that) {
  if (that.config.httpsEnabled === true) {
    await createCertificatesIfRequired(that);

    await new Promise((resolve, reject) => {
      that.getCertificates("radarTrapPublic", "radarTrapPrivate", async (err, ...res) => {
        const server = https.createServer({
          key: res[0].key,
          cert: res[0].cert,
        }, app).listen(that.config.feathersPort);

        app.setup(server);

        server.on("listening", () => that.log.info(`Feathers server for radar-trap started on https://${app.get("host")}:${that.config.feathersPort}`));

        resolve();
      });
    });
  } else {
    const server = app.listen(that.config.feathersPort);
    server.on("listening", () => that.log.info(`Feathers server for radar-trap started on http://${app.get("host")}:${that.config.feathersPort}`));
  }

  return app;
};
