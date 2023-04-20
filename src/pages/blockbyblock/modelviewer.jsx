import React, { useState, useRef, useEffect, useLayoutEffect, Suspense } from 'react'
import { View, OrbitControls, ambientLight, pointLight, spotLight, PerspectiveCamera, Html, Environment, useProgress } from '@react-three/drei'
import { Canvas, extend, useThree, useLoader, applyProps, useFrame } from '@react-three/fiber'
import { NewVersion, VersionHistory } from "@/components/dom/VersionHistory"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { NewComment, Comment, AnnotationContext } from '@/components/dom/Dialogue'
import { push as Menu } from 'react-burger-menu'
import useRefs from 'react-use-refs';
import { Annotations } from "@/components/dom/Annotations"

export default function ModelViewer({ url, workshopID, group, numberOfGroups, editAnnotations, setEditAnnotation }) {
    const [annotations, setAnnotations] = useState([])
    const [selectedAnnotation, setSelectedAnnotation] = useState(-1)

    const [versionURLs, setVersionURLs] = useState([])
    const [selectedVersion, setSelectedVersion] = useState(-1)
    const [selectedURL, setSelectedURL] = useState(url)

    const [dialogue, setDialogue] = useState([])

    const [handler, setHandler] = useState("")
    const [menuOpen, setMenuOpen] = useState(false)

    const orbitref = useRef()
    const [lerping, setLerping] = useState(false)
    const [to, setTo] = useState()
    const [target, setTarget] = useState()

    const [ref, view1] = useRefs()

    const fetchAnnotations = async () => {
        const response = await fetch(`/api/annotations/${workshopID}/${group}/${selectedVersion}`)
        const data = await response.json()
        setAnnotations(data)
    }

    const fetchVersionHistory = async () => {
        const response = await fetch(`/api/versionhistory/${workshopID}/${group}`)
        const data = await response.json()
        setVersionURLs(data)
    }

    const fetchDialogue = async () => {
        const response = await fetch(`/api/dialogue/${workshopID}/${group}`)
        const data = await response.json()
        setDialogue(data)
    }

    useEffect(() => {
        fetchVersionHistory()
    }, [])

    useEffect(() => {
        if (selectedVersion != -1) {
            fetchAnnotations()
        }
        if (selectedAnnotation != -1) {
            fetchDialogue()
        }
    }, [editAnnotations])

    useEffect(() => {
        if (selectedAnnotation != -1) {
            fetchDialogue()
            setMenuOpen(true)
        } else {
            setMenuOpen(false)
        }
    }, [selectedAnnotation])

    useEffect(() => {
        if (selectedVersion != -1) {
            fetchAnnotations()
        }
    }, [selectedVersion])

    useEffect(() => {
        if (versionURLs.length > 0 && Object.hasOwn(versionURLs[0], group)) {
            if (selectedVersion == -1) {
                const lastIndex = versionURLs[0][group].length - 1
                setSelectedVersion(lastIndex)
                setSelectedURL(versionURLs[0][group].slice(lastIndex)[0])
            } else {
                if (selectedVersion < versionURLs[0][group].length) {
                    setSelectedURL(versionURLs[0][group][selectedVersion])
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

    function setEventHandler(message) {
        setHandler(message)
        setTimeout(() => { setHandler("") }, 3000)
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
                    lookAt: { x: x, y: y, z: z },
                    workshopID: workshopID,
                    versionIndex: selectedVersion,
                    groups: [group],
                    groupOwner: ""
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            fetchAnnotations()
            setSelectedAnnotation(annotations.length)
        } catch (e) {
            console.log("error", e)
        }
    }

    async function updateAnnotation(title, description, groupOwner, i) {
        try {
            const response = await fetch('/api/annotations', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    groupOwner: groupOwner,
                    group: group,
                    url: selectedURL,
                    camPos: { x: 0, y: 0, z: 0 },
                    lookAt: { x: annotations[i].lookAt.x, y: annotations[i].lookAt.y, z: annotations[i].lookAt.z },
                    baseMap: selectedURL === versionURLs[0][group][0],
                    _id: annotations[i]._id.toString()
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            fetchAnnotations()
            setSelectedAnnotation(i)
        } catch (e) {
            console.log(`error ${e}`)
        }
    }

    async function deleteAnnotation(i) {
        const annotationID = annotations[i]._id.toString()
        try {
            const response = await fetch('/api/annotations', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    _id: annotationID
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            setEventHandler("Successfully deleted annotation!")
            fetchAnnotations()
            //when you delete an annotation, delete the comments attached to the annotation
            for (let c = dialogue.length - 1; c >= 0; c--) {
                if (dialogue[c].annotationID === annotationID) {
                    deleteComment(c)
                }
            }
            setSelectedAnnotation(-1)
        } catch (e) {
            console.log(`error ${e}`)
        }
    }

    const clickedMesh = async (e) => {
        if (editAnnotations) {
            e.stopPropagation()
            setEditAnnotation(false)

            postAnnotation("title" + (annotations.length + 1), "", e.point.x, e.point.y, e.point.z)
        }
    }

    //when you post a new version, also add new object to annotations with new url
    async function postVersion(url) {
        if (versionURLs[0][group].includes(url)) {
            setEventHandler("A version with this URL has already been added")
            setSelectedVersion(versionURLs[0][group].length - 1)
        } else {
            try {
                const response = await fetch('/api/versionhistory', {
                    method: 'PUT',
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
                    setEventHandler("Successfully added a new version!")
                    try {
                        const newGroupVersionResponse = await fetch('/api/workshops', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: workshopID,
                                group: group,
                                url: url
                            })
                        })
                        if (!newGroupVersionResponse.ok) throw new Error(`Error: ${newGroupVersionResponse.status}`)
                    } catch (e) {
                        console.log(`error ${e}`)
                    }
                    setSelectedVersion(versionURLs[0][group].length)
                }
            } catch (e) {
                console.log(`error ${e}`)
            }
        }

    }

    async function deleteVersion(i) {
        try {
            const response = await fetch('/api/versionhistory', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    index: i,
                    workshopID: workshopID,
                    group: group,
                    url: versionURLs[0][group][selectedVersion]
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            fetchVersionHistory()
            if (response.status == 200) {
                //resetting latest version in workshops database
                try {
                    const updateGroupVersionResponse = await fetch('/api/workshops', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: workshopID,
                            group: group,
                            url: versionURLs[0][group][selectedVersion - 1]
                        })
                    })
                    if (!updateGroupVersionResponse.ok) throw new Error(`Error: ${updateGroupVersionResponse.status}`)
                } catch (e) {
                    console.log(`error ${e}`)
                }

                //deleting annotations associated with this version
                for (let index = annotations.length - 1; index >= 0; index--) {
                    deleteAnnotation(index)
                }
                setSelectedVersion(selectedVersion - 1)
            }
        } catch (e) {
            console.log(`error ${e}`)
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
                    annotationID: annotations[selectedAnnotation]._id.toString(),
                    name: name,
                    description: description,
                    datetime: time + ", " + date,
                    workshopID: workshopID,
                    groups: [group],
                    baseMap: selectedURL === versionURLs[0][group][0],
                    numGroups: numberOfGroups
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            fetchDialogue()
        } catch (e) {
            console.log(`error ${e}`)
        }
    }

    async function deleteComment(index) {
        try {
            const response = await fetch('/api/dialogue', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    _id: dialogue[index]._id.toString()
                })
            })

            if (!response.ok) throw new Error(`Error: ${response.status}`)
            fetchDialogue()
        } catch (e) {
            console.log(`error ${e}`)
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
            fontSize: '1em',
            overflowX: 'hidden'
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
                        <AnnotationContext i={selectedAnnotation} editing={selectedAnnotation === annotations.length} group={annotations[selectedAnnotation]?.groupOwner} title={annotations[selectedAnnotation]?.title} description={annotations[selectedAnnotation]?.description} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} />
                        {dialogue.map((comment, i) => {
                            if (Object.hasOwn(comment, "annotationID") && selectedAnnotation < annotations.length && comment.annotationID === annotations[selectedAnnotation]._id.toString()) {
                                return (<Comment i={i} key={i} name={comment.name} description={comment.description} datetime={comment.datetime} deleteComment={deleteComment} />)
                            }
                        })}
                        <NewComment i={dialogue.length - 1 || 0} postComment={postComment} />
                    </>
                )}
            </Menu>
            <Canvas eventSource={ref} className="canvas" id="canvas" shadows>

                <>{
                    versionURLs.length > 0 && Object.hasOwn(versionURLs[0], group) && versionURLs[0][group].map((url, i) => {
                        if (i == versionURLs[0][group].length - 1 && group != "Base Map") {
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
                    <color attach="background" args={['#76BCE8']} />
                    <PerspectiveCamera makeDefault position={[-3, 3, 5]} near={0.01} />
                    <ambientLight intensity={0.5} />
                    <spotLight castShadow intensity={1} angle={0.1} position={[-20, 20, -20]} shadow-mapSize={[2048, 2048]} shadow-bias={-0.000001} />

                    {selectedVersion != -1 && <Model url={selectedURL} clickedMesh={clickedMesh} />}

                    <>{annotations.map((a, i) => {
                        return (
                            <Annotations key={i} title={a.title} description={a.description} x={a.lookAt.x} y={a.lookAt.y} z={a.lookAt.z} i={i} selected={selectedAnnotation} setSelected={setSelectedAnnotation} updateAnnotation={updateAnnotation} deleteAnnotation={deleteAnnotation} />
                        )
                    })}</>
                    <Environment preset={'park'} />
                </View>
                <Html style={{ left: "-45vw", bottom: "-30vh" }} position={[0, 0, 0]}>
                    <p style={{ color: "#000000" }}>{handler}</p>
                </Html>
            </Canvas>
        </div >
    )
}


function Model({ url, clickedMesh }) {
    const { scene, nodes } = useLoader(GLTFLoader, url)
    useLayoutEffect(() => scene.traverse(o => (o.castShadow = o.receiveShadow = true)), [])
    return (
        <>
            <primitive object={scene} onClick={clickedMesh} />
            <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} />
        </>
    )
}