import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { Annotations } from "@/components/dom/Annotations"
import ModelViewer from '@/pages/blockbyblock/modelviewer';
import CompareBuilds from '@/pages/blockbyblock/comparebuilds';
import { FaEdit, FaExchangeAlt, FaGripHorizontal, FaMapMarkerAlt } from 'react-icons/fa'

function Workshop() {
    const router = useRouter()
    const workshopId = router.query.workshopId
    const [workshops, setWorkshops] = useState([])
    const [viewerMode, setViewerMode] = useState("ModelViewer")

    const [annotations, setAnnotations] = useState([])
    const [editAnnotations, setEditAnnotation] = useState(false)

    const fetchWorkshops = async () => {
        const response = await fetch('/api/workshops')
        const data = await response.json()
        setWorkshops(data)
    }

    useEffect(() => {
        fetchWorkshops()
    }, [router.query.slug])

    return (
        <>{workshops.map((workshop) => {
            if (workshop.id === workshopId) {
                const numberOfGroups = parseInt(workshop.numGroups)
                return (
                    <div key={workshop.id} style={{ overflow: "auto" }} >
                        <h1>Workshop: {workshop.name}</h1>
                        <form style={{ display: "flex" }}>
                            <button type="button" className='topNavBarButtons'
                                onClick={() => router.push("/blockbyblock")}>
                                <FaGripHorizontal style={{ marginRight: "5px" }} />Project Selection </button>
                            <button type="button" className='topNavBarButtons'
                                style={{ backgroundColor: viewerMode === "ModelViewer" ? "#76BCE8" : "#000000" }}
                                onClick={() => setViewerMode("ModelViewer")}>
                                <FaMapMarkerAlt style={{ marginRight: "5px" }} /> Model Viewer </button>
                            <button type="button" className='topNavBarButtons'
                                style={{ backgroundColor: viewerMode === "CompareBuilds" ? "#76BCE8" : "#000000" }}
                                onClick={() => setViewerMode("CompareBuilds")}>
                                <FaExchangeAlt style={{ marginRight: "5px" }} /> Compare Builds </button>
                            <button type="button" className='topNavBarButtons'
                                style={{ marginLeft: "20px", backgroundColor: editAnnotations ? "#76BCE8" : "#000000", display: viewerMode === "CompareBuilds" ? "none" : "inherit" }}
                                onClick={() => setEditAnnotation(!editAnnotations)}>
                                <FaEdit style={{ marginRight: "5px" }} /> Add Annotation </button>
                        </form>
                        {viewerMode == "ModelViewer" && (
                            <Tabs id="groups" >
                                <TabPanel index={0} style={{ height: "65vh" }}>
                                    <ModelViewer
                                        url={workshop.baseMap}
                                        workshopID={workshop.id}
                                        group={"Base Map"}
                                        numberOfGroups={numberOfGroups}
                                        editAnnotations={editAnnotations}
                                        setEditAnnotation={setEditAnnotation}
                                        annotations={annotations}
                                        setAnnotations={setAnnotations} />
                                </TabPanel>
                                <>{[...Array(numberOfGroups)].map((x, i) => {
                                    const groupName = "Group " + (i + 1)
                                    return (
                                        <TabPanel key={i} index={i} style={{ height: "65vh" }}>
                                            <ModelViewer
                                                url={workshop.baseMap}
                                                workshopID={workshop.id}
                                                group={groupName}
                                                numberOfGroups={numberOfGroups}
                                                editAnnotations={editAnnotations}
                                                setEditAnnotation={setEditAnnotation}
                                                annotations={annotations}
                                                setAnnotations={setAnnotations} />
                                        </TabPanel>
                                    )
                                })}</>
                                <TabList style={{ fontSize: "clamp(0.1rem, 1.6vw, 1.4rem)" }}>
                                    <Tab label="Base Map"> Base Map</Tab>
                                    <>{[...Array(numberOfGroups)].map((x, i) => {
                                        const groupName = "Group " + (i + 1)
                                        return (
                                            <Tab key={i} label={groupName} > {groupName} </Tab>
                                        )
                                    }
                                    )}</>
                                </TabList>
                            </Tabs>
                        )}
                        {viewerMode == "CompareBuilds" && (
                            <div style={{ height: "70vh" }}>
                                <CompareBuilds
                                    workshop={workshop}
                                    fetchWorkshops={fetchWorkshops}
                                    annotations={annotations}
                                    setAnnotations={setAnnotations} />
                            </div>
                        )}

                    </div>
                )
            }
        })}</>
    )
}

export default Workshop