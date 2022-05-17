const assert = require("assert");
const app = require("../../server/app");

describe("'atudo' service", () => {
	it("registered the service", () => {
		const service = app.service("atudo");

		assert.ok(service, "Registered the service");
	});
});
