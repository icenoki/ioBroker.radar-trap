const assert = require("assert");
const app = require("../../server/app");

describe("'sleekness' service", () => {
	it("registered the service", () => {
		const service = app.service("sleekness");

		assert.ok(service, "Registered the service");
	});
});
