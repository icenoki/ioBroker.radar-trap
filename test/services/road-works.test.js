const assert = require("assert");
const app = require("../../server/app");

describe("'roadWorks' service", () => {
	it("registered the service", () => {
		const service = app.service("road-works");

		assert.ok(service, "Registered the service");
	});
});
