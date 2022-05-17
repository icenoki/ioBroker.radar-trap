const assert = require("assert");
const app = require("../../server/app");

describe("'mobileTraps' service", () => {
	it("registered the service", () => {
		const service = app.service("mobile-traps");

		assert.ok(service, "Registered the service");
	});
});
