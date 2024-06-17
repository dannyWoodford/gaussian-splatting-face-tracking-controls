
import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'

import { createPortal, useFrame, useThree, extend } from '@react-three/fiber'
import { useControls } from 'leva'

import ParticleShaderMaterial from './ParticleShaderMaterial'

extend({ ParticleShaderMaterial })

const Particles = () => {
	const { size, gl, scene, camera } = useThree()

	const particlesRef = useRef()
	const { uSize, clearColor} = useControls({
		uSize: { value: 0.1, min: 0, max: 1, step: 0.001, label: 'Particle Size' },
		clearColor: { value: '#29191f', label: 'Clear Color' },
	})

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
		baseGeometry.instance = new THREE.SphereGeometry(3, 32, 32)
		baseGeometry.count = baseGeometry.instance.attributes.position.count

		particlesRef.current.add(baseGeometry)
		console.log('%cbaseGeometry.instance', 'color:red;font-size:14px;', baseGeometry.instance)
	}, [])

	// __new ______________________________________________________________________

	// Inline shaders
	const fragmentSimulation = /*glsl*/ `
		uniform sampler2D texturePosition;
		uniform float time;

		void main() {

				vec2 uv = gl_FragCoord.xy / resolution.xy;

				vec4 tmpPos = texture2D(texturePosition, uv);

				vec3 position = tmpPos.xyz;

				gl_FragColor = vec4(position + vec3(0.001), 1.0);

		}
		`

	// * ---->important Variables
	const width = window.innerWidth
	// const pointsRef = useRef()

	// $ ----> Prepare GPGPU
	const gpuCompute = useMemo(() => {
		const gpuCompute = new GPUComputationRenderer(width, width, gl)
		const dtPosition = gpuCompute.createTexture()

		for (let i = 0; i < width * width; i++) {
			const i4 = i * 4
			let x = Math.random()
			let y = Math.random()
			let z = Math.random()

			dtPosition.image[i4 + 0] = Math.random()
			dtPosition.image[i4 + 1] = Math.random()
			dtPosition.image[i4 + 2] = Math.random()
			dtPosition.image[i4 + 3] = 1
		}

		const positionVariable = gpuCompute.addVariable('texturePosition', fragmentSimulation, dtPosition)

		positionVariable.material.uniforms['time'] = { value: 0 }

		positionVariable.wrapS = THREE.RepeatWrapping
		positionVariable.wrapT = THREE.RepeatWrapping

		// dtPosition.needsUpdate = true

		gpuCompute.init()

		return gpuCompute
	}, [])

	// * ----.

	// $ ----> Main Material / Uniforms / Fill

	// const uniforms = useMemo(
	// 	() => ({
	// 		time: { value: 0 },
	// 		positionTexture: { value: null },
	// 		resolution: { value: new THREE.Vector4() },
	// 	}),
	// 	[]
	// )

	const particlesPosition = useMemo(() => {
		const array = new Float32Array(width * width * 3)
		const reference = new Float32Array(width * width * 2)

		for (let i = 0; i < width * width; i++) {
			let i3 = i * 3

			let x = Math.random()
			let y = Math.random()
			let z = Math.random()

			// --> uv
			let xx = (i % width) / width
			let yy = ~~(i / width) / width

			array.set([x, y, z], i * 3)
			reference.set([xx, yy], i * 2)
		}

		return {
			positions: array,
			reference: reference,
		}
	}, [])

	// * ----.

	// useFrame((state) => {
	// 	gpuCompute.compute()
	// 	let elapseTime = state.clock.getElapsedTime()

	// 	console.log('%cparticlesRef.current', 'color:red;font-size:14px;', particlesRef.current.material.uniforms)

	// 	particlesRef.current.material.uniforms.positionTexture = gpuCompute.getCurrentRenderTarget(gpuCompute.variables[0]).texture

	// 	// particlesRef.current.material.uniforms.time.value = elapseTime
	// })

	return (
		<points ref={particlesRef}>
			{/* <sphereGeometry args={[3, 32, 32]} /> */}
			{/* <bufferGeometry>
				<bufferAttribute attach={'attributes-position'} itemSize={3} array={particlesPosition.positions} count={width * width} />
				<bufferAttribute attach={'attributes-reference'} itemSize={2} count={width * width * 2} array={particlesPosition.reference} />
			</bufferGeometry> */}

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
