export default async function handler(req, res) {
    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            "api-key": process.env.DATA_API_KEY,
        },
    };
    const fetchBody = {
        dataSource: process.env.MONGODB_DATA_SOURCE,
        database: "bbb",
        collection: "versionhistory",
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
                console.log("calling POST", req.body.group, req.body.url)
                const newVersionHistory = {
                    workshopID: req.body.workshopID,
                    [req.body.group]: [req.body.url]
                }
                const insertData = await fetch(`${baseUrl}/insertOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        document: newVersionHistory
                    }),
                });
                const insertDataJson = await insertData.json();
                res.status(200).json(insertDataJson);
                break;
            case "PUT":
                console.log("calling PUT", req.body.group, req.body.url)
                const updateData = await fetch(`${baseUrl}/updateOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        filter: {
                            workshopID: req.body.workshopID,
                            [req.body.group]: { "$exists": true },
                        },
                        update: {
                            $addToSet: {
                                [req.body.group]: req.body.url
                            }
                        }
                    }),
                });
                const updateDataJson = await updateData.json();
                res.status(200).json(updateDataJson);
                break;
            case "DELETE":
                const deleteData = await fetch(`${baseUrl}/updateOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        filter: {
                            workshopID: req.body.workshopID,
                            [req.body.group]: { "$exists": true },
                        },
                        update: {
                            $pull: {
                                [req.body.group]: req.body.url
                            }
                        }
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