import path from 'path'
import fs from 'fs'

export const config = {
    api: {
        bodyParser: process.env.NODE_ENV !== 'production'
    }
};

function buildPath() {
    return path.join(process.cwd(), 'src', 'data', 'workshops.json')
}

function extractData(filePath) {
    const jsonData = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(jsonData)
    return data
}

export default function handler(req, res) {
    const filePath = buildPath()
    const { workshops } = extractData(filePath)

    if (req.method === 'GET') {
        res.status(200).json(workshops)
    } else if (req.method === 'POST') {
        let exists = false

        workshops.map((currentWorkshop) => {
            if (currentWorkshop.id === req.body.id) {
                res.status(201).json({ message: "A workshop with this ID has already been added" })
                exists = true
            }
        })

        if (!exists) {
            const newWorkshop = {
                id: req.body.id,
                name: req.body.name,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                numGroups: req.body.numGroups,
                baseMap: req.body.baseMap
            }

            {
                [...Array(parseInt(req.body.numGroups))].map((x, i) => {
                    const groupName = "Group " + (i + 1)
                    newWorkshop[groupName] = req.body.baseMap
                })
            }

            workshops.push(newWorkshop)
            fs.writeFileSync(filePath, JSON.stringify({ workshops: workshops }))
            res.status(200).json(workshops)
        }
    } else if (req.method === 'PUT') {
        workshops.map((currentWorkshop) => {
            if (currentWorkshop.id === req.body.id) {
                const groupName = req.body.editGroup
                currentWorkshop[groupName] = req.body[groupName]

                fs.writeFileSync(filePath, JSON.stringify({ workshops: workshops }))
                res.status(200).json(workshops)
            }
        })
    }
}