export default function handler(req, res) {
    const { method } = req;
    if (method === 'POST') {
        const { url } = req.body;

        res.status(200).json({ message: `You have added ${url} successfully` })
    }
}