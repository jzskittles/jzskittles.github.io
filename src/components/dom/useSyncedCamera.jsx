import { useEffect, useCallback } from 'react'

import EventEmitter from 'eventemitter3'
import { useThree as _useThree } from '@react-three/fiber'

export const syncedCameraEmitter = { eventemitter: new EventEmitter() }

export default function useSyncedCamera(useThree) {
    const camera = useThree(({ camera }) => camera)
    const emitter = syncedCameraEmitter.eventemitter

    const update = useCallback(() => {
        emitter.emit('CAMERA_UPDATE', {
            position: camera.position.clone(),
            quaternion: camera.quaternion.clone(),
            rotation: camera.rotation.clone()
        })
    }, [camera, emitter])

    const onCameraUpdate = useCallback(({ position, quaternion, rotation }) => {
        camera.position.set(position.x, position.y, position.z)
        camera.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
        camera.rotation.set(rotation.x, rotation.y, rotation.z)
    }, [camera])

    useEffect(() => {
        emitter.addListener('CAMERA_UPDATE', onCameraUpdate)

        return () => {
            emitter.removeListener('CAMERA_UPDATE', onCameraUpdate)
        }
    }, [emitter, onCameraUpdate])

    return update
}