const assert = require("assert");
const app = require("../../server/app");

describe("'objects' service", () => {
	it("registered the service", () => {
		const service = app.service("objects");

		assert.ok(service, "Registered the service");
	});
});
