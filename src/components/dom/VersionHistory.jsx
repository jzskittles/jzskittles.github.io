import React, { useState } from 'react'
import { Html } from '@react-three/drei'

export function NewVersion({ i, postVersion }) {
    const [isEditing, setIsEditing] = useState(false)
    const [versionURL, setVersionURL] = useState()

    let newVersion
    if (isEditing) {
        newVersion = (
            <div >
                <p>URL</p>
                <input label="url" value={versionURL}
                    onChange={(e) => setVersionURL(e.target.value)}
                    type="url" style={{ color: "#000000", inlineSize: "850px" }} />
                <button onClick={(e) => {
                    e.preventDefault()
                    setIsEditing(false)
                    postVersion(versionURL)
                    setVersionURL("")
                }}>Save</button>
            </div>
        )
    } else {
        newVersion = (
            <div>
                <p>{versionURL}</p>
            </div>
        )
    }
    //position={[-2, 1.8 - 0.9 * i, 0]}>
    return (
        <group>
            <Html style={{ left: "-45vw" }} position={[0, 1.3 - 1.2 * i, 0]}>
                <svg height="34" width="34" transform="translate(-16 -16)" style={{ cursor: 'pointer' }}>
                    <circle cx="17" cy="17" r="16" stroke="white" strokeWidth="2" fill="rgba(1,0,0,.66)" onClick={() => {
                        if (isEditing) {
                            setIsEditing(false)
                            setVersionURL("")
                        } else {
                            setIsEditing(true)
                        }
                    }} />
                    <text class="unselectable" x="12" y="22" fill="white" fontSize={17} fontFamily="monospace" style={{ pointerEvents: 'none' }}>
                        {"+"}
                    </text>
                </svg>
            </Html>
            <Html style={{ left: "-40vw" }} position={[0, 2 - 1.2 * i, 0]}>
                {newVersion}
            </Html>
        </group>
    )
}
export function VersionHistory({ i, selected, setSelected, deleteVersion }) {
    const [show, setShow] = useState(false)
    let version = (
        <div style={{ color: "#000000" }}>
            {i != 0 && <button onClick={(e) => {
                e.preventDefault()
                deleteVersion(i)
            }}>Delete</button>}
        </div>
    )
    let fillColor = "#000080"
    if (selected == i) {
        fillColor = "#3CB043"
    }

    return (
        <group>
            <Html style={{ color: "#000000", left: "-45vw" }} position={[0, 2.5 - 1.2 * i, 0]}>
                <svg height="34" width="34" transform="translate(-16 -16)" style={{ cursor: 'pointer' }}>
                    <circle cx="17" cy="17" r="16" stroke="white" strokeWidth="2" fill={fillColor} onClick={(e) => {
                        e.preventDefault()
                        if (show && selected == i) {
                            setShow(false)
                        } else {
                            setSelected(i)
                            fillColor = "#3CB043"
                            setShow(true)
                        }
                    }} />
                    <text class="unselectable" x="12" y="22" fill="white" fontSize={17} fontFamily="monospace" style={{ pointerEvents: 'none' }}>
                        {i + 1}
                    </text>
                </svg>

            </Html>
            <Html style={{ left: "-40vw" }} position={[0, 2.7 - 1.2 * i, 0]}>
                {selected === i && show && (version)}
            </Html>
        </group>
    )
}
