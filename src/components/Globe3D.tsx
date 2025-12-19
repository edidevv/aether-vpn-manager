import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei'

const AnimatedSphere = () => {
  const sphereRef = useRef<any>(null)

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.2
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2.4}>
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        emissive="#4c1d95"
        emissiveIntensity={0.5}
        wireframe={true}
      />
    </Sphere>
  )
}

const Globe3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedSphere />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  )
}

export default Globe3D