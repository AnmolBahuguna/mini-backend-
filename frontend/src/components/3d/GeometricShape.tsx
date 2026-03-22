import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'

export interface GeometricShapeProps {
  geometry: 'sphere' | 'cube' | 'octahedron' | 'icosahedron'
  color?: string
  wireframe?: boolean
  speed?: number
}

export function GeometricShape({
  geometry,
  color = '#0066FF',
  wireframe = false,
  speed = 0.01,
}: GeometricShapeProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += speed * 0.6
    meshRef.current.rotation.y += speed
  })

  return (
    <mesh ref={meshRef}>
      {geometry === 'sphere' ? <sphereGeometry args={[1, 32, 32]} /> : null}
      {geometry === 'cube' ? <boxGeometry args={[1.4, 1.4, 1.4]} /> : null}
      {geometry === 'octahedron' ? <octahedronGeometry args={[1.2, 0]} /> : null}
      {geometry === 'icosahedron' ? <icosahedronGeometry args={[1.2, 0]} /> : null}
      <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.35} roughness={0.25} />
    </mesh>
  )
}

export default GeometricShape
