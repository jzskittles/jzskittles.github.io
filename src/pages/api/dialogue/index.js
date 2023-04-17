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
        collection: "dialogue",
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
                const newComment = {
                    name: req.body.name,
                    description: req.body.description,
                    datetime: req.body.datetime,
                    url: req.body.url,
                    annotationID: req.body.annotationID,
                    workshopID: req.body.workshopID,
                    groups: req.body.groups
                }
                console.log(req.body.baseMap, req.body.numGroups)
                if (req.body.baseMap) {
                    newComment["groups"] = ["Base Map"]
                    for (let i = 0; i < req.body.numGroups; i++) {
                        newComment["groups"].push("Group " + (i + 1))
                    }
                }
                const insertData = await fetch(`${baseUrl}/insertOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        document: newComment
                    }),
                });
                const insertDataJson = await insertData.json();
                res.status(200).json(insertDataJson);
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