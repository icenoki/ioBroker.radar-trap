const assert = require("assert");
const app = require("../../server/app");

describe("'directions' service", () => {
	it("registered the service", () => {
		const service = app.service("directions");

		assert.ok(service, "Registered the service");
	});
});
