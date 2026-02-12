import { server as wispServer } from "@mercuryworkshop/wisp-js/server";

const wisp = wispServer({
	logErrors: true,
});

export default function handler(req, res) {
	return new Promise((resolve) => {
		// WebSocket upgrade handling would go here, but serverless functions
		// have limited WebSocket support. Instead, we return a helpful error.
		res.status(501).json({
			error: "WebSocket support not available on serverless platform",
			message:
				"Please configure a WISP server URL in the settings panel or use an external WISP service",
		});
		resolve();
	});
}
