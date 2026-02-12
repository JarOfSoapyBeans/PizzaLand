// NOTE: Starting long-running background processes (like cloudflared) from
// Vercel Serverless Functions is not supported (ephemeral containers, timeouts).
// This endpoint returns guidance and a 501 to indicate the operation isn't available here.
export default function handler(req, res) {
	res.status(501).json({
		ok: false,
		error:
			"Starting cloudflared from Vercel is unsupported. Run cloudflared on a persistent host or use a Cloudflare named tunnel.",
		docs: "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/quickstart/",
	});
}
