import dynamic from 'next/dynamic'
import ProjectPanel from '@/components/dom/ProjectPanel'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

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
        console.log("pressed URL submit!")
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
            const data = await response.json();
            if (response.status === 200) {
                console.log("status 200!")
                try {
                    const response = await fetch('/api/versionhistory', {
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
                    if (!response.ok) throw new Error(`Error: ${response.status}`)
                    const data = await response.json();

                } catch (e) {
                    console.log('ERROR', e)
                }
                for (let group = 0; group < numGroupsValue; group++) {
                    try {
                        const response = await fetch('/api/versionhistory', {
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
                        if (!response.ok) throw new Error(`Error: ${response.status}`)
                        const data = await response.json();

                    } catch (e) {
                        console.log('ERROR', e)
                    }
                }
                router.push("/blockbyblock")
            }
            console.log("POST", data)

        } catch (e) {
            console.log('ERROR', e)
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
Page.canvas = (props) => <Logo scale={0.5} route='/blockbyblock' position-y={-1} />

export async function getStaticProps() {
    return { props: { title: 'Index' } }
}
