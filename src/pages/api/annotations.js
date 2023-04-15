import path from 'path'
import fs from 'fs'

function buildPath() {
    return path.join(process.cwd(), 'src', 'data', 'annotations.json')
}

function extractData(filePath) {
    const jsonData = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(jsonData)
    return data
}

export default function handler(req, res) {
    const filePath = buildPath()
    const { annotations } = extractData(filePath)

    if (req.method === 'GET') {
        res.status(200).json(annotations)
    } else if (req.method === 'POST') {
        let exists = false

        //check if annotation exists
        if (Object.hasOwn(annotations, req.body.url)) {
            annotations[req.body.url].map((current_annotation) => {
                if (current_annotation.title === req.body.title) {
                    res.status(201).json({ message: "An annotation with this title has already been added" })
                    exists = true
                }
            })
            if (!exists) {
                const newAnnotation = {
                    title: req.body.title,
                    description: req.body.description,
                    camPos: req.body.camPos,
                    lookAt: req.body.lookAt
                }
                annotations[req.body.url] = [...annotations[req.body.url], newAnnotation]

                fs.writeFileSync(filePath, JSON.stringify({ annotations: annotations }))
                res.status(200).json(newAnnotation)
            }
        } else { //make new object with array

            const newAnnotation = {
                title: req.body.title,
                description: req.body.description,
                camPos: req.body.camPos,
                lookAt: req.body.lookAt
            }
            const newURLCategory = [newAnnotation]
            annotations[req.body.url] = newURLCategory

            fs.writeFileSync(filePath, JSON.stringify({ annotations: annotations }))
            res.status(200).json(newAnnotation)
        }
    } else if (req.method === 'PUT') {
        let exists = false

        annotations[req.body.url].map((current_annotation) => {
            if (current_annotation.lookAt.x === req.body.lookAt.x && current_annotation.lookAt.y === req.body.lookAt.y && current_annotation.lookAt.z === req.body.lookAt.z) {
                exists = true
                current_annotation.title = req.body.title
                current_annotation.description = req.body.description
                current_annotation.camPos = req.body.camPos
                current_annotation.lookAt = req.body.lookAt
            }
            return current_annotation
        })
        if (exists) {
            res.status(200).json("Updated annotation at " + req.body.lookAt, annotations)
            fs.writeFileSync(filePath, JSON.stringify({ annotations: annotations }))
        } else {
            res.status(201).json({ message: "An annotation at position " + req.body.lookAt + " was not found" })
        }

    } else if (req.method === 'DELETE') {
        const index = parseInt(req.body.index)

        if (index < annotations[req.body.url].length) {
            const deletedAnnotation = annotations[req.body.url].splice(index, 1)
            res.status(200).json("Deleted annotation at index" + req.body.index, deletedAnnotation)
            fs.writeFileSync(filePath, JSON.stringify({ annotations: annotations }))
        } else {
            res.status(201).json({ message: "An annotation at position " + req.body.index + " was not found" })
        }

    }
}