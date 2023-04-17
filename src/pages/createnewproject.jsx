import { useRouter } from 'next/router'
import { useRef } from 'react'

// Dom components go here
export default function Page(props) {
    const router = useRouter()

    const inputID = useRef()
    const inputName = useRef()
    const inputStartDate = useRef()
    const inputEndDate = useRef()
    const inputNumGroups = useRef()
    const inputBaseMap = useRef()

    const onSubmit = async (e) => {
        e.preventDefault()

        const idValue = inputID.current.value
        const nameValue = inputName.current.value
        const startDateValue = inputStartDate.current.value
        const endDateValue = inputEndDate.current.value
        const numGroupsValue = inputNumGroups.current.value
        const baseMapValue = inputBaseMap.current.value

        try {
            const response = await fetch('/api/workshops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: idValue,
                    name: nameValue,
                    startDate: startDateValue,
                    endDate: endDateValue,
                    numGroups: numGroupsValue,
                    baseMap: baseMapValue
                })
            })
            if (!response.ok) throw new Error(`Error: ${response.status}`)

            //if you successfully make a new workshop, create initial versionhistory for all groups
            if (response.status === 200) {
                try {
                    const newBaseVersionResponse = await fetch('/api/versionhistory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            workshopID: idValue,
                            group: "Base Map",
                            url: baseMapValue
                        })
                    })
                    if (!newBaseVersionResponse.ok) throw new Error(`Error: ${newBaseVersionResponse.status}`)
                } catch (e) {
                    console.log(`error ${e}`)
                }
                for (let group = 0; group < numGroupsValue; group++) {
                    try {
                        const newGroupVersionResponse = await fetch('/api/versionhistory', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                workshopID: idValue,
                                group: "Group " + (group + 1),
                                url: baseMapValue
                            })
                        })
                        if (!newGroupVersionResponse.ok) throw new Error(`Error: ${newGroupVersionResponse.status}`)
                    } catch (e) {
                        console.log(`error ${e}`)
                    }
                }
                router.push("/blockbyblock")
            }
        } catch (e) {
            console.log(`error ${e}`)
        }
    }
    return (
        <div>
            <form onSubmit={onSubmit}>
                <p>Workshop Name </p>
                <input ref={inputName} id="name" type="text" style={{ color: '#000000' }} required />
                <p>Workshop ID </p>
                <input ref={inputID} id="ID" type="text" style={{ color: '#000000' }} required />
                <p>Start Date </p>
                <input ref={inputStartDate} id="startDate" type="date" style={{ color: '#000000' }} required />
                <p>End Date </p>
                <input ref={inputEndDate} id="endDate" type="date" style={{ color: '#000000' }} required />
                <p>Number of Groups </p>
                <input ref={inputNumGroups} id="numGroups" type="number" style={{ color: '#000000' }} required />
                <p>Sketchfab Minecraft Map URL </p>
                <input ref={inputBaseMap} id="baseMap" type="url" style={{ color: '#000000' }} required />
                <br />
                <input type="submit" value="Submit" />
            </form>

        </div>
    )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
//Page.canvas = (props) => <Logo scale={0.5} route='/blob' position-y={-1} />

export async function getStaticProps() {
    return { props: { title: 'Index' } }
}
