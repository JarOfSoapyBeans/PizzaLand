export default function handler(req, res) {
	res.status(200).json({
		ok: true,
		timestamp: new Date().toISOString(),
		message: "Backend is working (Vercel serverless).",
		from: "Scramjet Vercel API",
	});
}
