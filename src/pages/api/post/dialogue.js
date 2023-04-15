import path from 'path'
import fs from 'fs'

function buildPath() {
    return path.join(process.cwd(), 'src', 'data', 'dialogue.json')
}

function extractData(filePath) {
    const jsonData = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(jsonData)
    return data
}

export default function handler(req, res) {
    const filePath = buildPath()
    const { dialogue } = extractData(filePath)

    console.log("req.body", req.body.url, dialogue)
    if (Object.hasOwn(dialogue, req.body.url)) {
        const newComment = {
            name: req.body.name,
            description: req.body.description,
            datetime: req.body.datetime,
        }
        console.log("has url", req.body.url, newComment)
        if (Object.hasOwn(dialogue[req.body.url], req.body.annotationindex)) {
            const comments = dialogue[req.body.url][req.body.annotationindex]

            comments.push(newComment)
            fs.writeFileSync(filePath, JSON.stringify({ dialogue: dialogue }))
            res.status(200).json(dialogue)

        } else {
            dialogue[req.body.url].push([newComment])
            fs.writeFileSync(filePath, JSON.stringify({ dialogue: dialogue }))
            res.status(200).json(dialogue)
        }
    }
}