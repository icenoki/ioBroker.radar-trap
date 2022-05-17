const assert = require("assert");
const app = require("../../server/app");

describe("'fixedTraps' service", () => {
	it("registered the service", () => {
		const service = app.service("fixed-traps");

		assert.ok(service, "Registered the service");
	});
});
