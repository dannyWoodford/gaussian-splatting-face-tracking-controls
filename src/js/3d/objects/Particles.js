
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { useControls } from 'leva'

import ParticleShaderMaterial from './ParticleShaderMaterial'

extend({ ParticleShaderMaterial })

const Particles = () => {
	const { size, gl, scene, camera } = useThree()

	const particlesRef = useRef()
	const { uSize, clearColor } = useControls({
		uSize: { value: 0.1, min: 0, max: 1, step: 0.001, label: 'Particle Size' },
		clearColor: { value: '#29191f', label: 'Clear Color' },
	})

	// useFrame(({ gl, scene }) => {
	// 	if (particlesRef.current) {
	// 		particlesRef.current.material.uniforms.uSize.value = uSize
	// 	}
	// })

	useEffect(() => {
		gl.setClearColor(clearColor)

		if (particlesRef.current) {
			particlesRef.current.material.uniforms.uSize.value = uSize
		}
	}, [clearColor, gl, uSize])



	// __new ______________________________________________________________________


	/**
	 * Base geometry
	 */
	
	useEffect(() => {
		const baseGeometry = {}
		baseGeometry.instance = new THREE.SphereGeometry(3)
		baseGeometry.count = baseGeometry.instance.attributes.position.count

		// particlesRef.current.add(baseGeometry)
		console.log('%cbaseGeometry.instance', 'color:red;font-size:14px;', baseGeometry.instance)
	
	}, [])

	return (
		<points ref={particlesRef}>
			<sphereGeometry args={[3, 32, 32]} />
			<particleShaderMaterial
				attach='material'
				uSize={uSize}
				uResolution={new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio)}
			/>
			{/* <meshBasicMaterial side={THREE.DoubleSide} color={'red'} /> */}
		</points>
	)
}

export default Particles
