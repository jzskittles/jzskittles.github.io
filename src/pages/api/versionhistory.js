import path from 'path'
import fs from 'fs'

export const config = {
    api: {
        bodyParser: process.env.NODE_ENV !== 'production'
    }
};

function buildPath() {
    return path.join(process.cwd(), 'src', 'data', 'versionhistory.json')
}

function extractData(filePath) {
    const jsonData = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(jsonData)
    return data
}

export default function handler(req, res) {
    const filePath = buildPath()
    const { versionhistory } = extractData(filePath)

    if (req.method === 'GET') {
        res.status(200).json(versionhistory)
    } else if (req.method === 'POST') {
        if (Object.hasOwn(versionhistory, req.body.workshopID)) {
            if (Object.hasOwn(versionhistory[req.body.workshopID], req.body.group)) {
                const versionURLs = versionhistory[req.body.workshopID][req.body.group]
                if (req.body.url) {
                    if (!versionURLs.includes(req.body.url)) {
                        versionURLs.push(req.body.url)
                        fs.writeFileSync(filePath, JSON.stringify({ versionhistory: versionhistory }))
                        res.status(200).json(versionhistory)
                    } else {
                        res.status(201).json({ message: "A version with this url has already been added" })
                    }
                }
            } else {
                const newVersionGroup = [req.body.url]
                versionhistory[req.body.workshopID][req.body.group] = newVersionGroup
                fs.writeFileSync(filePath, JSON.stringify({ versionhistory: versionhistory }))
                res.status(200).json(versionhistory)
            }
        } else {
            const newVersionHistory = {
                [req.body.group]: [req.body.url]
            }
            versionhistory[req.body.workshopID] = newVersionHistory
            fs.writeFileSync(filePath, JSON.stringify({ versionhistory: versionhistory }))
            res.status(200).json(versionhistory)
        }
    } else if (req.method === 'DELETE') {
        const index = parseInt(req.body.index)

        if (Object.hasOwn(versionhistory, req.body.workshopID)) {
            if (Object.hasOwn(versionhistory[req.body.workshopID], req.body.group)) {
                const versionURLs = versionhistory[req.body.workshopID][req.body.group]
                if (index < versionURLs.length) {
                    const deletedVersion = versionURLs.splice(index, 1)
                    res.status(200).json("Deleted version at index" + req.body.index, deletedVersion)
                    fs.writeFileSync(filePath, JSON.stringify({ versionhistory: versionhistory }))
                } else {
                    res.status(404).json({ message: "Version doesn't exist" })
                }
            } else {
                res.status(404).json({ message: "Workshop ID: " + req.body.workshopID + " does not have group named " + req.body.group })
            }
        } else {
            res.status(404).json({ message: "Workshop ID: " + req.body.workshopID + " does not have a versionhistory yet" })
        }
    }
}