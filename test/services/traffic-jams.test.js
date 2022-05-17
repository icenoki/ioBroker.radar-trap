const assert = require("assert");
const app = require("../../server/app");

describe("'trafficJams' service", () => {
	it("registered the service", () => {
		const service = app.service("traffic-jams");

		assert.ok(service, "Registered the service");
	});
});
