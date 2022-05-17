// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const mbxDirections = require("@mapbox/mapbox-sdk/services/directions");
const polyline = require("@mapbox/polyline");

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  let directionsService = null;

  return async context => {
    const {result, app} = context;
    const startGeometry = result.start.geometry;
    const zielGeometry = result.ziel.geometry;

    if (directionsService === null) {
      directionsService = mbxDirections({accessToken: process.env["MBX_ACCESS_TOKEN"]});
    }

    let exclusions = Object.entries(result.settings.exclusion[result.settings.profile]).reduce((res, exclude) => {
      if (exclude[1]) {
        res += exclude[0] + ",";
      }

      return res;
    }, "");

    let directionSettings = {
      profile: result.settings.profile,
      alternatives: false,
      overview: "full",
      steps: false,
      waypoints: [
        {coordinates: [+startGeometry.lng, +startGeometry.lat]}, {coordinates: [+zielGeometry.lng, +zielGeometry.lat]},
      ],
      annotations: ["duration", "distance"],
    };

    if (exclusions) {
      exclusions = exclusions.slice(0, exclusions.length - 1);
      directionSettings = {...directionSettings, ...{exclude: exclusions}};
    }

    const directionRequest = directionsService.getDirections(directionSettings);
    const directionData = await directionRequest.send();
    const directionLine = polyline.toGeoJSON(directionData.body.routes[0].geometry);

    const duration = directionData.body.routes[0].duration;
    const distance = directionData.body.routes[0].distance;

    if (!result.direction) {
      await app.service("directions").create({directionLine, profile: result.settings.profile, duration, distance, routeId: result._id});
    } else {
      await app.service("directions").update(result.direction._id, {directionLine, profile: result.settings.profile, duration, distance, routeId: result._id});
    }

    return context;
  };
};
