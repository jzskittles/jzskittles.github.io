import { urls } from 'src/data/urls';

export default function handler(req, res) {
    if (req.method === 'GET') {
        res.status(200).json(urls)
    } else if (req.method === 'POST') {
        const url = req.body.url
        var exists = false
        urls.map((current_url) => {
            if (current_url.url === url) {
                res.status(201).json({ message: 'This URL has already been added' });
                exists = true
            }
        })
        if (!exists) {
            const newURL = {
                id: urls.length + 1,
                title: "bench",
                url: url
            }
            urls.push(newURL)
            res.status(201).json(newURL)
        }
    }
}