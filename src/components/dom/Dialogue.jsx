import React, { useState } from 'react'

export function NewComment({ i, postComment }) {
    const [isEditing, setIsEditing] = useState(true)
    const [commentName, setCommentName] = useState("")
    const [commentDescription, setCommentDescription] = useState("")

    let newComment
    if (isEditing) {
        newComment = (
            <div className='newComment'>
                <label for="name" >Name</label>
                <br />
                <input label="name" value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    type="text" style={{ color: "#000000", border: "2px solid #ccc", borderRadius: "5px", minWidth: "15em" }} />
                <br />
                <label for="description">Description</label>
                <br />
                <textarea label="description" value={commentDescription}
                    onChange={(e) => setCommentDescription(e.target.value)}
                    type="text" style={{ color: "#000000", border: "2px solid #ccc", borderRadius: "5px", minHeight: "75px", minWidth: "15em" }} />
                <br />
                <button onClick={(e) => {
                    e.preventDefault()
                    postComment(commentName, commentDescription)
                    setCommentName("")
                    setCommentDescription("")
                }}>Save</button>
            </div>
        )
    } else {
        newComment = (
            <div className='newComment'>
                <p>{commentName}</p>
                <p>{commentDescription}</p>
            </div>
        )
    }
    return (
        newComment
    )
}

export function Comment({ i, name, description, datetime, deleteComment }) {
    return (
        <div style={{
            border: "solid", padding: "0.5em", borderRadius: "0.5em", minWidth: "15em"
        }}>
            <p className='alignleft'>{name}</p>
            <p className='alignright'>{datetime}</p>
            <p style={{ clear: "both" }}>{description}</p>
            <button onClick={(e) => {
                e.preventDefault()
                deleteComment(i)
            }}>Delete</button>
        </div>
    )
}

export function AnnotationContext({ i, editing, group, title, description, updateAnnotation, deleteAnnotation }) {
    const [isEditing, setIsEditing] = useState(editing)
    const [annotationTitle, setAnnotationTitle] = useState(title)
    const [annotationGroup, setAnnotationGroup] = useState(group)
    const [annotationDescription, setAnnotationDescription] = useState(description)

    let annotationContext
    if (isEditing) {
        annotationContext = (
            <div>
                <p className='alignleft' style={{ fontSize: "1.3em" }}>Annotation {i != -1 && i + 1}</p>
                <button onClick={() => deleteAnnotation(i)} className='alignright'>Delete</button>
                <br />
                <br />
                <p>Title</p>
                <input label="title" defaultValue={annotationTitle}
                    onChange={(e) => {
                        e.preventDefault()
                        setAnnotationTitle(e.target.value)
                    }}
                    type="text" style={{ color: "#000000", border: "2px solid #ccc", borderRadius: "5px", minWidth: "15em" }} />
                <p>Description</p>
                <textarea label="description"
                    defaultValue={annotationDescription}
                    onChange={(e) => {
                        e.preventDefault()
                        setAnnotationDescription(e.target.value)
                    }}
                    type="text" style={{ color: "#000000", border: "2px solid #ccc", borderRadius: "5px", minWidth: "15em" }} />
                <p>Group (optional)</p>
                <input label="group" defaultValue={annotationGroup}
                    onChange={(e) => {
                        e.preventDefault()
                        setAnnotationGroup(e.target.value)
                    }}
                    type="text" style={{ color: "#000000", border: "2px solid #ccc", borderRadius: "5px", minWidth: "15em" }} />
                <button onClick={(e) => {
                    e.preventDefault()
                    setIsEditing(false)
                    updateAnnotation(annotationTitle, annotationDescription, annotationGroup, i)
                }}>Save</button>
                <p style={{ paddingTop: "10px" }}>Comments</p>
            </div>
        )

    } else {
        if (title != annotationTitle) {
            setAnnotationTitle(title)
        }
        if (description != annotationDescription) {
            setAnnotationDescription(description)
        }
        if (group != annotationGroup) {
            setAnnotationGroup(group)
        }
        annotationContext = (
            <div>
                <p className='alignleft' style={{ fontSize: "1.3em" }}>Annotation {i != -1 && i + 1}</p>
                <button onClick={() => deleteAnnotation(i)} className='alignright'>Delete</button>
                <br />
                <br />
                <button onClick={() => setIsEditing(true)} className='alignright'>Edit</button>
                <p>{annotationTitle}</p>
                <p>{annotationDescription}</p>
                <p>{annotationGroup}</p>
                <p style={{ paddingTop: "10px" }}>Comments</p>
            </div>
        )
    }
    return (
        <div style={{ paddingBottom: "0.5em", fontSize: "1.05em" }}>{annotationContext}</div>
    )
}
