const {Service} = require("feathers-nedb");

exports.Traps = class Traps extends Service {
  setup(app) {
    this.app = app;
  }

  async update(id, data, params) {
    // console.log("PARAMS", params);
    if (params.from && params.from === "renew-handler") {
      const direction = await this.app.service("directions").get(data.directionId);
      const directionLine = direction.directionLine;

      const traps = await this.app.service("atudo").get(directionLine);
      traps.routeId = data.routeId;
      traps.profile = data.profile;
      traps.updatedAt = data.updatedAt;

      return super.patch(id, traps, params);
    }

    return super.patch(id, data, params);
  }
};
