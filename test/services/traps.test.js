const assert = require("assert");
const app = require("../../server/app");

describe("'traps' service", () => {
	it("registered the service", () => {
		const service = app.service("traps");

		assert.ok(service, "Registered the service");
	});
});
