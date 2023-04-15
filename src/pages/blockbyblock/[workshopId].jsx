import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import useRefs from 'react-use-refs';
import { View, OrbitControls, ambientLight, pointLight, PerspectiveCamera, Html } from '@react-three/drei'
import { Canvas, extend, useThree, useLoader } from '@react-three/fiber'
import { Annotations } from "@/components/dom/Annotations"
import { NewVersion, VersionHistory } from "@/components/dom/VersionHistory"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { NewComment, Comment, AnnotationContext } from '@/components/dom/Dialogue'
import useSyncedCamera from '@/components/dom/useSyncedCamera';
import { push as Menu } from 'react-burger-menu'
extend({ Canvas })

function Workshop() {
    const router = useRouter()
    const workshopId = router.query.workshopId
    const [workshops, setWorkshops] = useState([])
    const [viewerMode, setViewerMode] = useState("ModelViewer")

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
                        <div> -----------------------------------------</div>
                        <form>
                            <button type="button" style={{ color: "#ffffff" }} onClick={() => router.push("/blockbyblock")}> Project Selection </button>
                            <button type="button" style={{ color: "#ffffff" }} onClick={() => setViewerMode("ModelViewer")}> Home </button>
                            <button type="button" style={{ color: "#ffffff" }} onClick={() => setViewerMode("CompareBuilds")}> Compare Builds </button>
                        </form>
                        {viewerMode == "ModelViewer" && (
                            <Tabs id="groups" >
                                <TabPanel index={0} style={{ height: "65vh" }}>
                                    <ModelViewer url={workshop.baseMap} workshopID={workshop.id} group={"Base Map"} />
                                </TabPanel>
                                <>{[...Array(numberOfGroups)].map((x, i) => {
                                    const groupName = "Group " + (i + 1)
                                    return (
                                        <TabPanel key={i} index={i} style={{ height: "65vh" }}>
                                            <ModelViewer url={workshop.baseMap} workshopID={workshop.id} group={groupName} />
                                        </TabPanel>
                                    )
                                })}</>
                                <TabList style={{ fontSize: 18 / (numberOfGroups + 1) + "vw" }}>
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
                                <CompareBuilds workshop={workshop} fetchWorkshops={fetchWorkshops} />
                            </div>
                        )}

                    </div>
                )
            }
        })}</>
    )
}

function CompareBuilds({ workshop, fetchWorkshops }) {
    useEffect(() => {
        fetchWorkshops()
    })
    const numberOfGroups = parseInt(workshop.numGroups)
    const [ref, view1, view2] = useRefs()

    const [compareGroupL, setCompareGroupL] = useState("")
    const [compareGroupR, setCompareGroupR] = useState("")

    const [modelLURL, setModelLURL] = useState("")
    const [modelRURL, setModelRURL] = useState("")

    const [syncCameras, toggleSyncCameras] = useState(true)

    return (<>
        <form>
            <select style={{ color: '#000000' }} required
                value={compareGroupL}
                onChange={(e) => {
                    e.preventDefault()
                    setCompareGroupL(e.target.value)
                    if (Object.hasOwn(workshop, e.target.value)) {
                        setModelLURL(workshop[e.target.value])
                    }
                }}>
                <option value="" hidden disabled selected> -- select an option -- </option>
                <>{[...Array(numberOfGroups)].map((x, i) => {
                    const groupName = "Group " + (i + 1)
                    return (
                        <option key={i} value={groupName} label={groupName} style={{ color: '#000000' }}> {groupName} </option>
                    )
                }
                )}</>
            </select>
            <select style={{ color: '#000000' }} required
                value={compareGroupR}
                onChange={(e) => {
                    e.preventDefault()
                    setCompareGroupR(e.target.value)
                    if (Object.hasOwn(workshop, e.target.value)) {
                        setModelRURL(workshop[e.target.value])
                    }
                }}>
                <option value="" hidden disabled selected> -- select an option -- </option>
                <>{[...Array(numberOfGroups)].map((x, i) => {
                    const groupName = "Group " + (i + 1)
                    return (
                        <option key={i} value={groupName} label={groupName} style={{ color: '#000000' }}> {groupName} </option>
                    )
                }
                )}</>
            </select>
            <button type="button" style={{ color: "#ffffff" }} onClick={() => {
                setCompareGroupL("")
                setCompareGroupR("")
                setModelLURL("")
                setModelRURL("")
            }}> Reset </button>
            <button type="button" style={{ color: "#ffffff" }} onClick={() => toggleSyncCameras(!syncCameras)}> Toggle Camera Sync </button>
        </form >
        <div ref={ref} className="comparecanvas">
            <div ref={view1} style={{ position: 'relative', overflow: 'hidden' }} />
            <div ref={view2} style={{ position: 'relative', overflow: 'hidden' }} />
            <Canvas eventSource={ref} className="canvas" id="canvas">
                <View index={1} track={view1} >
                    <color attach="background" args={['#87CEEB']} />
                    <PerspectiveCamera makeDefault position={[-3, 3, 5]} />
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} intensity={0.75} />
                    {modelLURL != "" && <CompareModel url={modelLURL} synced={syncCameras} />}
                </View>
                <View index={2} track={view2}>
                    <color attach="background" args={['#87CEEB']} />
                    <PerspectiveCamera makeDefault position={[-3, 3, 5]} />
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} intensity={0.75} />
                    {modelRURL != "" && <CompareModel url={modelRURL} synced={syncCameras} />}
                </View>
            </Canvas>
        </div>
    </>)
}

function CompareModel({ url, synced }) {
    let update = useSyncedCamera(useThree)
    let orbitControls = <OrbitControls makeDefault />
    if (synced) {
        orbitControls = <OrbitControls makeDefault onChange={update} />
    }

    const gltf = useLoader(GLTFLoader, url)
    return (<>
        <primitive object={gltf.scene} />
        {orbitControls}
    </>)
}

function Model({ url, clickedMesh }) {
    const gltf = useLoader(GLTFLoader, url)

    return (
        <>
            <primitive object={gltf.scene} onClick={clickedMesh} />
            <OrbitControls makeDefault />
        </>
    )
}

//{modelRURL === modelLURL ? <Clone object={gltfL.scene} /> : <primitive object={gltfR.scene} />}
//<primitive object={gltfR.scene} /> <primitive object={gltfL.scene} />

function ModelViewer({ url, workshopID, group }) {
    const [editAnnotations, setEditAnnotation] = useState(false)
    const [annotations, setAnnotations] = useState([])
    const [selectedAnnotation, setSelectedAnnotation] = useState(-1)

    const [versionURLs, setVersionURLs] = useState([])
    const [selectedVersion, setSelectedVersion] = useState(-1)
    const [selectedURL, setSelectedURL] = useState(url)

    const [dialogue, setDialogue] = useState([])

    const [handler, setHandler] = useState("Handler")
    const [menuOpen, setMenuOpen] = useState(false)

    const orbitref = useRef()
    const [lerping, setLerping] = useState(false)
    const [to, setTo] = useState()
    const [target, setTarget] = useState()

    const [ref, view1] = useRefs()

    const fetchAnnotations = async () => {
        const response = await fetch('/api/annotations')
        const data = await response.json()
        setAnnotations(data)
    }

    const fetchVersionHistory = async () => {
        const response = await fetch('/api/versionhistory')
        const data = await response.json()
        setVersionURLs(data)
    }

    const fetchDialogue = async () => {
        const response = await fetch('/api/dialogue')
        const data = await response.json()
        setDialogue(data)
    }

    useEffect(() => {
        fetchAnnotations()
        fetchVersionHistory()
        fetchDialogue()
    }, [editAnnotations])

    useEffect(() => {
        if (selectedAnnotation != -1) {
            setMenuOpen(true)
        } else {
            setMenuOpen(false)
        }
    }, [selectedAnnotation])

    useEffect(() => {
        if (Object.hasOwn(versionURLs, workshopID) && Object.hasOwn(versionURLs[workshopID], group)) {
            if (selectedVersion == -1) {
                const lastIndex = versionURLs[workshopID][group].length - 1
                setSelectedVersion(lastIndex)
                setSelectedURL(versionURLs[workshopID][group].slice(lastIndex)[0])
            } else {
                if (selectedVersion < versionURLs[workshopID][group].length) {
                    setSelectedURL(versionURLs[workshopID][group][selectedVersion])
                    setSelectedAnnotation(-1)
                }
            }
        }
    }, [versionURLs, selectedVersion])

    function gotoAnnotation(idx) {
        setTo(annotations[idx].camPos)
        setTarget(annotations[idx].lookAt)
        setSelectedAnnotation(idx)
        //setLerping(true)
    }

    //when you add a new annotation, create a new object for comments in dialogue
    async function postAnnotation(title, description, x, y, z) {
        try {
            const response = await fetch('/api/annotations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    url: selectedURL,
                    camPos: { x: 0, y: 0, z: 0 },
                    lookAt: { x: x, y: y, z: z }
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchAnnotations()
            setSelectedAnnotation(annotations[selectedURL].length)
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    async function updateAnnotation(title, description, x, y, z, i) {
        try {
            const response = await fetch('/api/annotations', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    url: selectedURL,
                    camPos: { x: 0, y: 0, z: 0 },
                    lookAt: { x: x, y: y, z: z }
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchAnnotations()
            setSelectedAnnotation(i)
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    async function deleteAnnotation(i) {
        try {
            const response = await fetch('/api/annotations', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    index: i,
                    url: selectedURL
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchAnnotations()
            //when you delete an annotation, delete the comments attached to the annotation
            if (Object.hasOwn(dialogue, selectedURL) && i < dialogue[selectedURL].length) {
                for (let c = dialogue[selectedURL][i].length - 1; c >= 0; c--) {
                    deleteComment(c)
                }
            }
            setSelectedAnnotation(-1)
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    const clickedMesh = async (e) => {
        if (editAnnotations) {
            setEditAnnotation(false)

            postAnnotation("title" + annotations[selectedURL].length, "description", e.point.x, e.point.y, e.point.z)
        }
    }

    //when you post a new version, also add new object to annotations with new url
    async function postVersion(url, workshopID, group) {
        try {
            const response = await fetch('/api/versionhistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    workshopID: workshopID,
                    group: group
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchVersionHistory()
            if (response.status == 200) {
                try {
                    const newGroupVersionResponse = await fetch('/api/workshops', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: workshopID,
                            editGroup: group,
                            [group]: url
                        })
                    })
                    if (!newGroupVersionResponse.ok) throw new Error(`Error: ${newGroupVersionResponse.status}`)
                    const newVersionData = await newGroupVersionResponse.json();
                } catch (e) {
                    alert(`error ${e}`)
                }
            }

            if (response.status == 201) {
                setHandler(data.message)
                setSelectedVersion(versionURLs[workshopID][group].length - 1)
            } else {
                setSelectedVersion(versionURLs[workshopID][group].length)
            }
            return response
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    //when you delete a version, make sure to delete annotations for that url as well
    async function deleteVersion(i, workshopID, group) {
        try {
            const response = await fetch('/api/versionhistory', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    index: i,
                    workshopID: workshopID,
                    group: group
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchVersionHistory()
            if (response.status == 200) {
                try {
                    const updateGroupVersionResponse = await fetch('/api/workshops', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: workshopID,
                            editGroup: group,
                            [group]: versionURLs[workshopID][group][selectedVersion - 1]
                        })
                    })
                    if (!updateGroupVersionResponse.ok) throw new Error(`Error: ${updateGroupVersionResponse.status}`)
                    const updateVersionData = await updateGroupVersionResponse.json();
                } catch (e) {
                    alert(`error ${e}`)
                }
            }
            setSelectedVersion(selectedVersion - 1)
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    async function postComment(name, description) {
        try {
            const dateObj = new Date()
            const time = dateObj.getHours() + ':' + dateObj.getMinutes()
            const date = (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear()

            const response = await fetch('/api/dialogue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: selectedURL,
                    annotationindex: selectedAnnotation,
                    name: name,
                    description: description,
                    datetime: time + ", " + date
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchDialogue()
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    async function deleteComment(i) {
        try {
            const response = await fetch('/api/dialogue', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: selectedURL,
                    annotationindex: selectedAnnotation,
                    index: i
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            const data = await response.json();
            fetchDialogue()
        } catch (e) {
            alert(`error ${e}`)
        }
    }

    const styles = {
        bmBurgerButton: {
            position: 'fixed',
            width: '36px',
            height: '30px',
            right: '36px',
            top: '36px'
        },
        bmBurgerBars: {
            background: '#373a47'
        },
        bmBurgerBarsHover: {
            background: '#a90000'
        },
        bmCrossButton: {
            height: '24px',
            width: '24px'
        },
        bmCross: {
            background: '#bdc3c7'
        },
        bmMenuWrap: {
            position: 'fixed',
            height: '65vh',
            width: '19em'
        },
        bmMenu: {
            background: '#373a47',
            padding: '1em',
            fontSize: '1em'
        },
        bmMorphShape: {
            fill: '#373a47'
        },
        bmItemList: {
            color: '#b8b7ad',
            padding: '0.8em'
        },
        bmItem: {
            display: 'inline-block'
        },
        bmOverlay: {
            background: 'rgba(0, 0, 0, 0.3)'
        }
    }


    return (
        <div ref={ref} className="onecanvas" >
            <div ref={view1} style={{ position: 'relative', overflow: 'hidden' }} />
            <Menu right styles={styles} isOpen={menuOpen}>
                {selectedAnnotation === -1 ? (
                    <div>Select an Annotation to view dialogue!</div>
                ) : (
                    <>
                        {Object.hasOwn(dialogue, selectedURL) && (
                            <AnnotationContext i={selectedAnnotation} title={annotations[selectedURL][selectedAnnotation]?.title} description={annotations[selectedURL][selectedAnnotation]?.description} />
                        )}
                        {Object.hasOwn(dialogue, selectedURL) != -1 && selectedAnnotation < dialogue[selectedURL].length && dialogue[selectedURL][selectedAnnotation].map((comment, i) => {
                            return (<Comment i={i} key={i} name={comment.name} description={comment.description} datetime={comment.datetime} deleteComment={deleteComment} />)
                        })}
                        {Object.hasOwn(dialogue, selectedURL) && (<NewComment i={dialogue[selectedURL][selectedAnnotation]?.length - 1 || 0} postComment={postComment} />
                        )}
                    </>
                )}
            </Menu>
            <Canvas eventSource={ref} className="canvas" id="canvas">
                <>{
                    Object.hasOwn(versionURLs, workshopID) && Object.hasOwn(versionURLs[workshopID], group) && versionURLs[workshopID][group].map((url, i) => {
                        if (i == versionURLs[workshopID][group].length - 1 && group != "Base Map") {
                            return (<group key={i}>
                                <VersionHistory url={url} workshopID={workshopID} group={group} i={i} selected={selectedVersion} setSelected={setSelectedVersion} deleteVersion={deleteVersion} />
                                <NewVersion workshopID={workshopID} group={group} i={i} postVersion={postVersion} />
                            </group>)
                        } else {
                            return (<VersionHistory key={i} url={url} workshopID={workshopID} group={group} i={i} selected={selectedVersion} setSelected={setSelectedVersion} deleteVersion={deleteVersion} />)
                        }
                    })
                }</>
                <View index={1} track={view1} >
                    <color attach="background" args={['#87CEEB']} />
                    <PerspectiveCamera makeDefault position={[-3, 3, 5]} />
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} intensity={0.75} />
                    <Model url={selectedURL} clickedMesh={clickedMesh} />
                    <>{Object.hasOwn(annotations, selectedURL) && annotations[selectedURL].map((a, i) => {
                        return (
                            <Annotations key={i} title={a.title} description={a.description} x={a.lookAt.x} y={a.lookAt.y} z={a.lookAt.z} i={i} selected={selectedAnnotation} setSelected={setSelectedAnnotation} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} />
                        )
                    })}</>

                </View>
                <Html style={{ left: "-45vw", bottom: "-30vh" }} position={[0, 0, 0]}>
                    <button type="button" onClick={() => setEditAnnotation(true)} style={{ fontSize: "1.2vw" }}> Add Annotation </button>
                    <p style={{ color: "#000000", fontSize: "1.2vw" }}> Selected Model URL: {selectedURL}</p>
                    <h1 style={{ color: "#000000", fontSize: "1.2vw" }}>{handler}</h1>
                </Html>
            </Canvas>
        </div >
    )
}

export default Workshop