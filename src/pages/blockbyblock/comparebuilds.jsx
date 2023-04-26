import React, { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react'
import { Canvas, extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { View, OrbitControls, ambientLight, pointLight, PerspectiveCamera, AdaptiveDpr, Html, useProgress, Bounds, GizmoViewcube, GizmoHelper, GizmoViewport } from '@react-three/drei'
import useRefs from 'react-use-refs';
import useSyncedCamera from '@/components/dom/useSyncedCamera';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { LinearMipMapLinearFilter, Vector3 } from 'three'

export default function CompareBuilds({ workshop, fetchWorkshops, numberOfGroups }) {
    useEffect(() => {
        fetchWorkshops()
    }, [])
    const [ref, view1, view2] = useRefs()

    const [compareGroupL, setCompareGroupL] = useState("")
    const [compareGroupR, setCompareGroupR] = useState("")

    const [modelLURL, setModelLURL] = useState("")
    const [modelRURL, setModelRURL] = useState("")

    const [syncCameras, toggleSyncCameras] = useState(true)

    const groups = [...Array(numberOfGroups)].map((x, i) => {
        const groupName = "Group " + (i + 1)
        return (
            <option key={i} value={groupName} label={groupName} style={{ color: '#000000' }}> {groupName} </option>
        )
    }
    )

    return (<>
        <form className="compareBuildsForm">
            <select className="selectGroup"
                value={compareGroupL}
                onChange={(e) => {
                    e.preventDefault()
                    setCompareGroupL(e.target.value)
                    if (Object.hasOwn(workshop, e.target.value)) {
                        setModelLURL(workshop[e.target.value])
                    }
                }}>
                <option value="" hidden disabled selected> -- Select a Group -- </option>
                <>{groups}</>
            </select>
            <select className="selectGroup"
                value={compareGroupR}
                onChange={(e) => {
                    e.preventDefault()
                    setCompareGroupR(e.target.value)
                    if (Object.hasOwn(workshop, e.target.value)) {
                        setModelRURL(workshop[e.target.value])
                    }
                }}>
                <option value="" hidden disabled selected> -- Select a Group -- </option>
                <>{groups}</>
            </select>
            <button type="button" style={{ color: "#ffffff" }} onClick={() => {
                setCompareGroupL("")
                setCompareGroupR("")
                setModelLURL("")
                setModelRURL("")
            }}> Reset </button>
            <button type="button" style={{ color: "#ffffff", backgroundColor: syncCameras ? "#76BCE8" : "#000000" }} onClick={() => toggleSyncCameras(!syncCameras)}> Camera Sync </button>
        </form >

        <div ref={ref} className="comparecanvas">
            <div ref={view1} style={{ position: 'relative', overflow: 'hidden' }} />
            <div ref={view2} style={{ position: 'relative', overflow: 'hidden' }} />
            <Canvas eventSource={ref} className="canvas" id="canvas" >
                <View index={1} track={view1} >
                    <color attach="background" args={['#76BCE8']} />
                    <PerspectiveCamera makeDefault position={[0, 3, 5]} near={0.01} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[-20, 20, -20]} intensity={1.5} />
                    <AdaptiveDpr pixelated />
                    {modelLURL != "" && <CompareModel url={modelLURL} synced={syncCameras} />}
                </View>
                <View index={2} track={view2}>
                    <color attach="background" args={['#76BCE8']} />
                    <PerspectiveCamera makeDefault position={[0, 3, 5]} near={0.01} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[-20, 20, -20]} intensity={1.5} />
                    <AdaptiveDpr pixelated />
                    {modelRURL != "" && <CompareModel url={modelRURL} synced={syncCameras} />}
                </View>
            </Canvas>
        </div>
    </>)
}
//
function CompareModel({ url, synced }) {
    let update = useSyncedCamera(useThree)

    let orbitControls = <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} target={[4, 1, -3]} />
    if (synced) {
        orbitControls = <OrbitControls makeDefault onChange={update} maxPolarAngle={Math.PI / 2} target={[4, 1, -3]} />
    }

    const { scene, nodes } = useLoader(GLTFLoader, url)
    useLayoutEffect(() => scene.traverse(o => {
        if (o.material) {
            o.material.map.minFilter = LinearMipMapLinearFilter
            o.material.anisotropy = 16
        }

    }), [])

    return (<>
        <primitive object={scene} />
        {orbitControls}
    </>)
}
