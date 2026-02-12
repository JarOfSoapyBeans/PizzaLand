export default function handler(req, res) {
	res.status(200).json({
		ok: true,
		running: false,
		url: null,
		note: "Tunnel management is not available from Vercel serverless functions. Use an external persistent host.",
	});
}
