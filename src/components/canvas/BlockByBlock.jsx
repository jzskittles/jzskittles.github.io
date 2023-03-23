import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCursor } from '@react-three/drei'
import useRefs from 'react-use-refs';
import { View, Bounds, OrthographicCamera, OrbitControls, CameraControls, PerspectiveCamera, Html, Center, Environment, useGLTF } from '@react-three/drei'
import { Canvas, extend } from '@react-three/fiber'
import { Soda } from '@/components/canvas/Models'

extend({ Canvas })

const AUTHENTICATION_URL = `https://sketchfab.com/oauth2/authorize/?state=123456789&response_type=token&client_id=${process.env.CLIENT_ID}`;


export function BlockByBlock({ url1, url2 }) {
  console.log('BLOCK', url1, url2)

  useEffect(() => {
    console.log("updating", url1, url2)
    /*if (url1 && url2) {
      const { nodes1, materials1 } = useGLTF(url1)
      const { nodes2, materials2 } = useGLTF(url2)
      console.log(nodes1, materials1)
      console.log(nodes2, materials2)
    }*/


  }, [url1, url2])
  /*const mesh = useRef()
  useEffect(() => {

    const gui = new dat.GUI({ width: 400 })
    console.log("create new gui", gui)

    const debugObject = {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    }
    gui.add(debugObject.position, 'x')
      .min(-4)
      .max(4)
      .step(0.0005)
      .onChange(() => {
        mesh.current.position.x = debugObject.position.x
      })

    return () => {
      gui.destroy()
    }
  }, [])

  return (
    <Canvas>
      <mesh ref={mesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={'hotpink'} />
      </mesh>

      <OrbitControls />
    </Canvas>
  )*/

  const [ref, view1, view2] = useRefs()
  const [canvas, setCanvas] = useState(null)
  const cameraControlsRef = useRef()

  return (
    <div ref={ref} className="canvasgrid">
      <div ref={view1} style={{ position: 'relative', overflow: 'hidden' }} />
      <div ref={view2} style={{ position: 'relative', overflow: 'hidden' }} />
      <Canvas className="canvas" id="canvas">
        <View index={1} track={view1}>
          <color attach="background" args={['#fed200']} />
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          <Lights preset="dawn" />
          <Soda scale={3} position={[0, -0.75, 0]} />
          <Html>
            <p style={{ color: '#bbfeeb' }}>this is html</p>
          </Html>
          <OrbitControls makeDefault />
        </View>
        <View index={2} track={view2}>
          <color attach="background" args={['#bbfeeb']} />
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          <Lights preset="dawn" />
          <Soda scale={3} position={[0, -0.75, 0]} />
          <Html>
            <p style={{ color: '#fed200' }}>html html html</p>
          </Html>
          <OrbitControls makeDefault />
        </View>
      </Canvas>
    </div>
  )

  /*return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={hovered ? "green" : "red"} />
    </mesh>
  )*/
}

function Lights({ preset }) {
  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[20, 30, 10]} />
      <pointLight position={[-10, -10, -10]} color="blue" />
      <Environment preset={preset} />
    </>
  )
}