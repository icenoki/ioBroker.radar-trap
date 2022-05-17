// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const opencage = require("opencage-api-client");

async function getGeometry(search) {
  // console.log("SEARCH", search);
  return opencage
    .geocode({q: search, limit: 1, key: process.env["OPENCAGE_ID"]})
    .then((data) => data.results[0].geometry)
    .catch((error) => {
      // console.log("Error caught:", error.message);
    });
}

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    // console.log("RUNNING getGeometry Hook");
    const start = context.data.start;
    const ziel = context.data.ziel;

    const searchStart = start.strasse + " " + start.nummer + ", " + start.plz + ", " + start.ort + ", " + start.land;
    const searchZiel = ziel.strasse + " " + ziel.nummer + ", " + ziel.plz + ", " + ziel.ort + ", " + ziel.land;

    const geometryStart = await getGeometry(searchStart);
    const geometryZiel = await getGeometry(searchZiel);

    context.data.start.geometry = geometryStart;
    context.data.ziel.geometry = geometryZiel;

    return context;
  };
};
