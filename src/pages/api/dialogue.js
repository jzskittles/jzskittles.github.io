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

    if (req.method === 'GET') {
        res.status(200).json(dialogue)
    } else if (req.method === 'POST') {
        console.log("POST", req.body.url, req.body.annotationindex, req.body.name, req.body.description, req.body.datetime)

        //check if version history for this workshop exists
        if (Object.hasOwn(dialogue, req.body.url)) {
            console.log("has url", req.body.url)
            const newComment = {
                name: req.body.name,
                description: req.body.description,
                datetime: req.body.datetime,
            }
            if (Object.hasOwn(dialogue[req.body.url], req.body.annotationindex)) {
                console.log("has annotation index", req.body.annotationindex)
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
    } else if (req.method === 'DELETE') {
        console.log("DELETE", req.body.url, req.body.annotationindex, req.body.index)
        const index = parseInt(req.body.index)

        //check if version history for this workshop exists
        if (Object.hasOwn(dialogue, req.body.url)) {
            console.log("has url", req.body.url)
            if (Object.hasOwn(dialogue[req.body.url], req.body.annotationindex)) {
                console.log("has annotation index", req.body.annotationindex)
                const comments = dialogue[req.body.url][req.body.annotationindex]

                if (index < comments.length) {
                    const deletedComment = comments.splice(index, 1)
                    res.status(200).json("Deleted version at index" + req.body.index, deletedComment)
                    fs.writeFileSync(filePath, JSON.stringify({ dialogue: dialogue }))
                } else {
                    res.status(404).json({ message: "Comment doesn't exist" })
                }
            }
        }
    }
}