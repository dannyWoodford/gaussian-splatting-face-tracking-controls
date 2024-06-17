import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { useFrame, useThree } from '@react-three/fiber'
import GUI from 'lil-gui'
import { useControls } from 'leva'

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
//  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;

    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C 
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
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
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
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
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

const ParticlesPlain = () => {
	const { gl, scene, size } = useThree()
	const [gpgpu, setGpgpu] = useState(null)
	const particlesRef = useRef()
	// const guiRef = useRef(new GUI({ width: 340 }))
	// const debugObject = useMemo(() => ({ clearColor: '#29191f' }), [])

	// const { uSize, clearColor, uFlowFieldInfluence, uFlowFieldStrength, uFlowFieldFrequency } = useControls({
	// 	clearColor: { value: '#29191f', label: 'Clear Color' },
	// 	uSize: { value: 0.1, min: 0, max: 1, step: 0.001, label: 'uSize' },
	// 	uFlowFieldInfluence: { value: 0.1, min: 0, max: 1, step: 0.001 },
	// 	uFlowFieldStrength: { value: 0.1, min: 0, max: 10, step: 0.001 },
	// 	uFlowFieldFrequency: { value: 0.1, min: 0, max: 1, step: 0.001 },
	// })

			// guiRef.current.addColor(debugObject, 'clearColor').onChange(() => gl.setClearColor(debugObject.clearColor))
			// guiRef.current.add(particlesMaterial.uniforms.uSize, 'value').min(0).max(10).step(0.001).name('uSize')
			// guiRef.current.add(particlesVariable.material.uniforms.uFlowFieldInfluence, 'value').min(0).max(1).step(0.001).name('uFlowFieldInfluence')
			// guiRef.current.add(particlesVariable.material.uniforms.uFlowFieldStrength, 'value').min(0).max(10).step(0.001).name('uFlowFieldStrength')
			// guiRef.current.add(particlesVariable.material.uniforms.uFlowFieldFrequency, 'value').min(0).max(1).step(0.001).name('uFlowFieldFrequency')

	// useEffect(() => {
	// 	gl.setClearColor(clearColor)

	// 	if (particlesRef.current) {
	// 		particlesRef.current.material.uniforms.uSize.value = uSize
	// 	}
	// }, [clearColor, gl, uSize])


	useEffect(() => {
		const geometry = new THREE.SphereGeometry(3)
		const count = geometry.attributes.position.count

		const gpgpu = new GPUComputationRenderer(size.width, size.height, gl)
		setGpgpu(gpgpu)

		const baseParticlesTexture = gpgpu.createTexture()
		for (let i = 0; i < count; i++) {
			const i3 = i * 3
			const i4 = i * 4
			baseParticlesTexture.image.data[i4] = geometry.attributes.position.array[i3]
			baseParticlesTexture.image.data[i4 + 1] = geometry.attributes.position.array[i3 + 1]
			baseParticlesTexture.image.data[i4 + 2] = geometry.attributes.position.array[i3 + 2]
			baseParticlesTexture.image.data[i4 + 3] = Math.random()
		}

		const particlesVariable = gpgpu.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
		gpgpu.setVariableDependencies(particlesVariable, [particlesVariable])

		particlesVariable.material.uniforms.uTime = { value: 0 }
		particlesVariable.material.uniforms.uDeltaTime = { value: 0 }
		particlesVariable.material.uniforms.uBase = { value: baseParticlesTexture }
		particlesVariable.material.uniforms.uFlowFieldInfluence = { value: 0.5 }
		particlesVariable.material.uniforms.uFlowFieldStrength = { value: 2 }
		particlesVariable.material.uniforms.uFlowFieldFrequency = { value: 0.5 }

		gpgpu.init()

		const particlesUvArray = new Float32Array(count * 2)
		const sizesArray = new Float32Array(count)

		for (let y = 0; y < size.height; y++) {
			for (let x = 0; x < size.width; x++) {
				const i = y * size.width + x
				const i2 = i * 2

				const uvX = (x + 0.5) / size.width
				const uvY = (y + 0.5) / size.height

				particlesUvArray[i2] = uvX
				particlesUvArray[i2 + 1] = uvY

				sizesArray[i] = Math.random()
			}
		}

		const particlesGeometry = new THREE.BufferGeometry()
		particlesGeometry.setDrawRange(0, count)
		particlesGeometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))
		particlesGeometry.setAttribute('position', geometry.attributes.position)
		particlesGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

		const particlesMaterial = new THREE.ShaderMaterial({
			vertexShader: particlesVertexShader,
			fragmentShader: particlesFragmentShader,
			uniforms: {
				uSize: { value: 0.07 },
				uResolution: { value: new THREE.Vector2(size.width * size.pixelRatio, size.height * size.pixelRatio) },
				uParticlesTexture: { value: null },
			},
		})

		particlesRef.current = new THREE.Points(particlesGeometry, particlesMaterial)
		scene.add(particlesRef.current)

		return () => {
			scene.remove(particlesRef.current)
		}
	}, [gl, size, scene])

	useFrame(({ clock }) => {
		if (gpgpu) {
			gpgpu.compute()

			const elapsedTime = clock.getElapsedTime()
			const deltaTime = clock.getDelta()

			const particlesTexture = gpgpu.getCurrentRenderTarget(gpgpu.variables[0]).texture
			particlesRef.current.material.uniforms.uParticlesTexture.value = particlesTexture

			gpgpu.variables[0].material.uniforms.uTime.value = elapsedTime
			gpgpu.variables[0].material.uniforms.uDeltaTime.value = deltaTime
		}
	})

	return null
}

export default ParticlesPlain
