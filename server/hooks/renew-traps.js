// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    const {app, result} = context;

    const direction = await app.service("directions").get(result.direction._id);
    const directionLine = direction.directionLine;

    const traps = await app.service("atudo").get(directionLine);
    traps.routeId = result._id;
    traps.directionId = direction._id;
    traps.profile = result.settings.profile;

    if (result.traps === null) {
      await app.service("traps").create(traps);
    } else {
      await app.service("traps").update(result.traps._id, traps);
    }

    return context;
  };
};
