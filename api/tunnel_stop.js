export default function handler(req, res) {
	res.status(501).json({
		ok: false,
		error:
			"Stopping cloudflared is not applicable in Vercel serverless environment. Manage tunnels on a persistent host.",
	});
}
