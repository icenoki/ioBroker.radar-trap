const assert = require("assert");
const app = require("../../server/app");

describe("'routes' service", () => {
	it("registered the service", () => {
		const service = app.service("routes");

		assert.ok(service, "Registered the service");
	});
});
