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
        collection: "workshops",
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
                const newWorkshop = req.body;
                {
                    [...Array(parseInt(req.body.numGroups))].map((x, i) => {
                        const groupName = "Group " + (i + 1)
                        newWorkshop[groupName] = req.body.baseMap
                    })
                }
                const insertData = await fetch(`${baseUrl}/insertOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        document: newWorkshop,
                    }),
                });
                const insertDataJson = await insertData.json();
                res.status(200).json(insertDataJson);
                break;
            case "PUT":
                const updateData = await fetch(`${baseUrl}/updateOne`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        filter: {
                            id: req.body.id,
                            [req.body.group]: { "$exists": true },
                        },
                        update: {
                            $set: {
                                [req.body.group]: req.body.url
                            }
                        }
                    }),
                });
                const updateDataJson = await updateData.json();
                res.status(200).json(updateDataJson);
                break;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}