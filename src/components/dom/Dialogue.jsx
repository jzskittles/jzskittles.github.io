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

export function AnnotationContext({ i, title, description }) {
    return (
        <div style={{
            paddingBottom: "0.5em",
            fontSize: "1.05em"
        }}>
            <p>Annotation {i != -1 && i + 1}</p>
            <p>Title: {title}</p>
            <p>Description: {description}</p>
        </div>
    )
}
