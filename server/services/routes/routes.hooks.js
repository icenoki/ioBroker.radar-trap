/* eslint-disable no-unused-vars */
const getGeometry = require("../../hooks/get-geometry");
const getDirection = require("../../hooks/get-direction");
const renewTraps = require("../../hooks/renew-traps");
const {iff, stashBefore, populate} = require("feathers-hooks-common");

const routeAddressChanged = async context => {
  const {start: actualStart, ziel: actualZiel, settings: actualSettings} = context.params.before;
  const {start: newStart, ziel: newZiel, settings: newSettings} = context.data;

  return !(JSON.stringify(actualStart) === JSON.stringify(newStart) && JSON.stringify(actualZiel) === JSON.stringify(newZiel)) ||
    !(JSON.stringify(actualSettings) === JSON.stringify(newSettings));
};

const removeDirectionAndTrap = async (context) => {
  const {app, result} = context;

  await app.service("directions").remove(null, {query: {routeId: result._id}});
  await app.service("traps").remove(null, {query: {routeId: result._id}});

  return context;
};

const routeDirectionSchema = {
  include: {
    service: "directions",
    nameAs: "direction",
    parentField: "_id",
    childField: "routeId",
    query: {$select: ["_id"]},
  },
};

const routeTrapsSchema = {
  include: {
    service: "traps",
    nameAs: "traps",
    parentField: "_id",
    childField: "routeId",
    query: {$select: ["_id"]},
  },
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [stashBefore(), iff(routeAddressChanged, getGeometry())],
    remove: [],
  },

  after: {
    all: [],
    find: [populate({schema: routeDirectionSchema}), populate({schema: routeTrapsSchema})],
    get: [],
    create: [],
    update: [],
    patch: [
      iff(routeAddressChanged, populate({schema: routeDirectionSchema}), getDirection(),
        populate({schema: routeDirectionSchema}), populate({schema: routeTrapsSchema}), renewTraps()),
    ],
    remove: [removeDirectionAndTrap],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
