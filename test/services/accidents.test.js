const assert = require("assert");
const app = require("../../server/app");

describe("'accidents' service", () => {
	it("registered the service", () => {
		const service = app.service("accidents");

		assert.ok(service, "Registered the service");
	});
});
