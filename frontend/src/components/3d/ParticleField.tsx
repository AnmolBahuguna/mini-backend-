import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, InstancedMesh, Object3D } from 'three'
import { useMouseParallax } from '../../hooks/useMouseParallax'

export interface ParticleFieldProps {
  count?: number
  color?: string
  speed?: number
  mouseInteractive?: boolean
}

interface ParticleItem {
  x: number
  y: number
  z: number
  driftX: number
  driftY: number
}

export function ParticleField({
  count = 3000,
  color = '#ffffff',
  speed = 0.006,
  mouseInteractive = true,
}: ParticleFieldProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const groupRef = useRef<Group>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const mouse = useMouseParallax()

  const finalCount = useMemo(() => {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 4) return 0
    if (typeof window !== 'undefined' && window.innerWidth < 768) return Math.min(count, 500)
    return count
  }, [count])

  const particles = useMemo<ParticleItem[]>(
    () => Array.from({ length: finalCount }, () => ({
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 14,
      z: (Math.random() - 0.5) * 12,
      driftX: (Math.random() - 0.5) * 0.003,
      driftY: Math.random() * speed + 0.001,
    })),
    [finalCount, speed],
  )

  useFrame(() => {
    if (!meshRef.current) return

    particles.forEach((particle, index) => {
      particle.y += particle.driftY
      particle.x += particle.driftX

      if (particle.y > 8) {
        particle.y = -8
        particle.x = (Math.random() - 0.5) * 16
      }

      dummy.position.set(particle.x, particle.y, particle.z)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(index, dummy.matrix)
    })

    if (mouseInteractive && groupRef.current) {
      groupRef.current.rotation.x = -mouse.y * 0.15
      groupRef.current.rotation.y = mouse.x * 0.15
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    return () => {
      meshRef.current?.geometry.dispose()
      const material = meshRef.current?.material
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose())
      } else {
        material?.dispose()
      }
    }
  }, [])

  if (finalCount === 0) return null

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, finalCount]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  )
}

export default ParticleField
