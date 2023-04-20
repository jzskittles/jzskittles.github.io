import React, { useState } from 'react'
import { Html } from '@react-three/drei'


export function Annotations({ title, description, x, y, z, i, selected, setSelected, updateAnnotation, deleteAnnotation }) {
    const [isEditing, setIsEditing] = useState(false)
    const [annotationTitle, setAnnotationTitle] = useState(title)
    const [annotationDescription, setAnnotationDescription] = useState(description)

    /*let newAnnotation
    if (isEditing) {
        newAnnotation = (
            <div>
                <p>Title</p>
                <input label="title" defaultValue={annotationTitle}
                    onChange={(e) => {
                        e.preventDefault()
                        setAnnotationTitle(e.target.value)
                    }}
                    type="text" style={{ color: "#000000", minWidth: "200px", padding: "5px" }} />
                <p>Description</p>
                <textarea label="description"
                    defaultValue={annotationDescription}
                    onChange={(e) => {
                        e.preventDefault()
                        setAnnotationDescription(e.target.value)
                    }}
                    type="text" style={{ color: "#000000", minWidth: "200px", minHeight: "90px", padding: "5px" }} />
                <button onClick={(e) => {
                    e.preventDefault()
                    setIsEditing(false)
                    updateAnnotation(annotationTitle, annotationDescription, x, y, z, i)
                }}>Save</button>
            </div>
        )

    } else {
        newAnnotation = (
            <div>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={() => deleteAnnotation(i)}>Delete</button>
            </div>
        )
    }*/

    let fillColor = "#0147AB"
    if (selected == i) {
        fillColor = "#9BBE49"
    }


    //check which url annotation is associated with

    return (
        <group>
            <Html key={i} position={[x, y, z]}>
                <svg height="34" width="200" transform="translate(-16 -16)" style={{ cursor: 'pointer' }}>
                    <circle cx="17" cy="17" r="16" stroke="white" strokeWidth="2" fill={fillColor} onClick={(e) => {
                        e.preventDefault()
                        if (selected === i) {
                            setSelected(-1)
                            fillColor = "#9BBE49"
                        } else {
                            setSelected(i)
                        }
                    }} />
                    <text class="unselectable" x="12" y="22" fill="white" fontSize={17} fontFamily="monospace" style={{ pointerEvents: 'none' }}>
                        {i + 1}
                    </text>
                </svg>
            </Html>
        </group>
    )
}
