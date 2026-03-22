import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { ExtrudeGeometry, Mesh, Shape } from 'three'

export interface FloatingShieldProps {
  size?: number
  color?: string
  speed?: number
  interactive?: boolean
}

export function FloatingShield({
  size = 1,
  color = '#0066FF',
  speed = 0.003,
  interactive = true,
}: FloatingShieldProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useCursor(hovered)

  const geometry = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(0, 1)
    shape.quadraticCurveTo(0.8, 0.8, 0.7, 0)
    shape.quadraticCurveTo(0.5, -0.8, 0, -1.2)
    shape.quadraticCurveTo(-0.5, -0.8, -0.7, 0)
    shape.quadraticCurveTo(-0.8, 0.8, 0, 1)

    return new ExtrudeGeometry(shape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 5,
      curveSegments: 20,
    })
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += hovered ? speed * 3 : speed
    meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.2
  })

  return (
    <group scale={size}>
      <pointLight position={[0, 2, 2]} intensity={1.4} color="#0066FF" />
      <pointLight position={[0, -2, 1]} intensity={1.2} color="#8B5CF6" />
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerOver={() => interactive && setHovered(true)}
        onPointerOut={() => interactive && setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={hovered ? '#0044AA' : '#001133'}
          emissiveIntensity={hovered ? 0.9 : 0.45}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.18} transparent />
      </mesh>
    </group>
  )
}

export default FloatingShield
