import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import GUI from 'lil-gui'

import { createPortal, useFrame, useThree } from '@react-three/fiber'

// import particlesVertexShader from './shaders/particles/vertex.glsl'
// import particlesFragmentShader from './shaders/particles/fragment.glsl'
// import gpgpuParticlesShader from './shaders/gpgpu/particles.glsl'

// import particlesVertexShader from './shaders/particles/vertexShader.glsl.js'
// import particlesFragmentShader from './shaders/particles/fragmentShader.glsl.js'
// import gpgpuParticlesShader from './shaders/gpgpu/gpgpuParticlesShader.glsl.js'


// Inline shaders
const particlesVertexShader = /* glsl */ `
uniform vec2 uResolution;
uniform float uSize;

varying vec3 vColor;

void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = vec3(1.0);
}
`

const particlesFragmentShader = /* glsl */ `
varying vec3 vColor;

void main()
{
    float distanceToCenter = length(gl_PointCoord - 0.5);
    if(distanceToCenter > 0.5)
        discard;

    gl_FragColor = vec4(vColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`

const gpgpuParticlesShader = /* glsl */ `
uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

varying vec2 vUv;

// Include the contents of simplexNoise4d.glsl directly
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float simplexNoise4d(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
  // First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

  // Other corners

  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  // x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

  // Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
  // Gradients
  // (7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

  // Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}

void main()
{
    float time = uTime * 0.2;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);
    
    // Dead
    if(particle.a >= 1.0)
    {
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;
    }

    // Alive
    else
    {
        // Strength
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
        float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
        strength = smoothstep(influence, 1.0, strength);

        // Flow field
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
        );
        flowField = normalize(flowField);
        particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;

        // Decay
        particle.a += uDeltaTime * 0.3;
    }
    
    gl_FragColor = particle;
}
`

const ParticlesPlainV2 = () => {
	const { gl, scene } = useThree()

	useEffect(() => {
		// Base
		const gui = new GUI({ width: 340 })
		const debugObject = {}

		// Loaders
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath('/draco/')

		const gltfLoader = new GLTFLoader()
		gltfLoader.setDRACOLoader(dracoLoader)

		// Sizes
		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelRatio: Math.min(window.devicePixelRatio, 2),
		}


		const findFirstMeshChild = (gltf) => {
			let firstMesh = null

			// Recursive function to traverse the scene graph
			const traverseScene = (node) => {
				if (node.type === 'Mesh') {
					firstMesh = node
					return true // Stop traversal as we found the first mesh
				}

				if (node.children) {
					for (let i = 0; i < node.children.length; i++) {
						if (traverseScene(node.children[i])) {
							return true // Stop further traversal
						}
					}
				}

				return false // Continue traversal
			}

			traverseScene(gltf.scene)
			return firstMesh
		}

		debugObject.clearColor = '#29191f'
		gl.setClearColor(debugObject.clearColor)

		// Load model
		gltfLoader.load(process.env.PUBLIC_URL + '/model.glb', (gltf) => {

			console.log('%cgltf', 'color:red;font-size:14px;', gltf.scene.children[0])

			const firstMesh = findFirstMeshChild(gltf)

			if (firstMesh) {
				console.log('Found mesh:', firstMesh)
			} else {
				console.log('No mesh found in the GLTF scene.')
			}

			const baseGeometry = {}

			baseGeometry.instance = firstMesh.geometry
			baseGeometry.count = baseGeometry.instance.attributes.position.count

			// GPU Compute
			const gpgpu = {}
			gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))
			gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, gl)

			// Base particles
			const baseParticlesTexture = gpgpu.computation.createTexture()

			for (let i = 0; i < baseGeometry.count; i++) {
				const i3 = i * 3
				const i4 = i * 4

				// Position based on geometry
				baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
				baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
				baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
				baseParticlesTexture.image.data[i4 + 3] = Math.random()
			}

			// Particles variable
			gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
			gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [gpgpu.particlesVariable])

			// Uniforms
			gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
			gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
			gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture)
			gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5)
			gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(2)
			gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5)

			// Init
			gpgpu.computation.init()

			// Debug
			gpgpu.debug = new THREE.Mesh(
				new THREE.PlaneGeometry(3, 3),
				new THREE.MeshBasicMaterial({ map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture })
			)
			gpgpu.debug.position.x = 3
			gpgpu.debug.visible = false
			scene.add(gpgpu.debug)

			// Particles
			const particles = {}

			// Geometry
			const particlesUvArray = new Float32Array(baseGeometry.count * 2)
			const sizesArray = new Float32Array(baseGeometry.count)

			for (let y = 0; y < gpgpu.size; y++) {
				for (let x = 0; x < gpgpu.size; x++) {
					const i = y * gpgpu.size + x
					const i2 = i * 2

					// UV
					const uvX = (x + 0.5) / gpgpu.size
					const uvY = (y + 0.5) / gpgpu.size

					particlesUvArray[i2 + 0] = uvX
					particlesUvArray[i2 + 1] = uvY

					// Size
					sizesArray[i] = Math.random()
				}
			}

			particles.geometry = new THREE.BufferGeometry()
			particles.geometry.setDrawRange(0, baseGeometry.count)
			particles.geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))
			particles.geometry.setAttribute('aColor', baseGeometry.instance.attributes.color)
			particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

			// Material
			particles.material = new THREE.ShaderMaterial({
				vertexShader: particlesVertexShader,
				fragmentShader: particlesFragmentShader,
				uniforms: {
					uSize: new THREE.Uniform(0.07),
					uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
					uParticlesTexture: new THREE.Uniform(),
				},
			})

			// Points
			particles.points = new THREE.Points(particles.geometry, particles.material)
			scene.add(particles.points)

			// Tweaks
			gui.addColor(debugObject, 'clearColor').onChange(() => {
				gl.setClearColor(debugObject.clearColor)
			})
			gui.add(particles.material.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('uSize')
			gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value').min(0).max(1).step(0.001).name('uFlowfieldInfluence')
			gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value').min(0).max(10).step(0.001).name('uFlowfieldStrength')
			gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value').min(0).max(1).step(0.001).name('uFlowfieldFrequency')

			// Animate
			const clock = new THREE.Clock()
			let previousTime = 0

			const tick = () => {
				const elapsedTime = clock.getElapsedTime()
				const deltaTime = elapsedTime - previousTime
				previousTime = elapsedTime

				// GPGPU Update
				gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime
				gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime
				gpgpu.computation.compute()
				particles.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture

				// Call tick again on the next frame
				requestAnimationFrame(tick)
			}

			tick()
		})

		// return () => {
		// 	window.removeEventListener('resize', resizeHandler)
		// 	gui.destroy()
		// 	renderer.dispose()
		// 	scene.clear()
		// }
	}, [])

	return null
}

export default ParticlesPlainV2
