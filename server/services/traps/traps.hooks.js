const {paramsFromClient} = require("feathers-hooks-common");
const setTimestamp = require("../../hooks/set-timestamp");

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [setTimestamp("createdAt")],
    update: [setTimestamp("updatedAt"), paramsFromClient("from")],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
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
