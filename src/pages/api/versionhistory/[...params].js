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
        collection: "versionhistory",
    };
    const baseUrl = `${process.env.DATA_API_URL}/action`;

    try {
        switch (req.method) {
            case "GET":
                const params = req.query.params

                console.log("params", params)
                const readData = await fetch(`${baseUrl}/find`, {
                    ...fetchOptions,
                    body: JSON.stringify({
                        ...fetchBody,
                        filter: {
                            workshopID: params[0],
                            [params[1]]: { "$exists": true },
                        }
                    }),
                });
                const readDataJson = await readData.json();
                console.log("new api versionhistory route", readDataJson.documents)
                res.status(200).json(readDataJson.documents);
                break;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}