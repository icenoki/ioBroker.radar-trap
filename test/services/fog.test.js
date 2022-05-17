const assert = require("assert");
const app = require("../../server/app");

describe("'fog' service", () => {
	it("registered the service", () => {
		const service = app.service("fog");

		assert.ok(service, "Registered the service");
	});
});
