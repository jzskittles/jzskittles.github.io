export default async function handler(req, res) {
    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "api-key": process.env.DATA_API_KEY,
        },
    };
    const fetchBody = {
        dataSource: process.env.MONGODB_DATA_SOURCE,
        database: "bbb",
        collection: "annotations",
    };
    const baseUrl = `${process.env.DATA_API_URL}/action`;

    try {
        switch (req.method) {
            case "GET":
                const readData = await fetch(`${baseUrl}/find`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                    }),
                });
                const readDataJson = await readData.json();
                res.status(200).json(readDataJson.documents);
                break;
            case "POST":
                const newAnnotation = {
                    title: req.body.title,
                    description: req.body.description,
                    camPos: req.body.camPos,
                    lookAt: req.body.lookAt,
                    url: req.body.url,
                    workshopID: req.body.workshopID,
                    versionIndex: req.body.versionIndex.toString(),
                    groups: req.body.groups,
                    groupOwner: req.body.groupOwner
                }
                /*if (req.body.baseMap) {
                    newAnnotation["groups"] = ["Base Map"]
                    for (let i = 0; i < req.body.numGroups; i++) {
                        newAnnotation["groups"].push("Group " + (i + 1))
                    }
                }*/
                const insertData = await fetch(`${baseUrl}/insertOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        document: newAnnotation
                    }),
                });
                const insertDataJson = await insertData.json();
                res.status(200).json(insertDataJson);
                break;
            case "PUT":
                let newGroups
                if (req.body.baseMap) {
                    newGroups = ["Base Map", req.body.groupOwner]
                } else {
                    newGroups = [req.body.group]
                }
                const updateData = await fetch(`${baseUrl}/updateOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        filter: { _id: { $oid: req.body._id } },
                        update: {
                            $set: {
                                title: req.body.title,
                                description: req.body.description,
                                groupOwner: req.body.groupOwner,
                                groups: newGroups
                            }
                        }
                    }),
                });
                const updateDataJson = await updateData.json();
                res.status(200).json(updateDataJson);
                break;
            case "DELETE":
                const deleteData = await fetch(`${baseUrl}/deleteOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        filter: { _id: { $oid: req.body._id } },
                    }),
                });
                const deleteDataJson = await deleteData.json();
                res.status(200).json(deleteDataJson);
                break;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}