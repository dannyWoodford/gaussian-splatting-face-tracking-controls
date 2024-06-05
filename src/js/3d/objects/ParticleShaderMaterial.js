import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Import your shaders
import particlesVertexShader from './shaders/particles/vertexShader.glsl.js'
import particlesFragmentShader from './shaders/particles/fragmentShader.glsl.js'

// Inline shaders
const vertexShader = /*glsl*/ `
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
const fragmentShader = /*glsl*/ `
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

const ParticleShaderMaterial = shaderMaterial(
	{
		uSize: 0.4,
		uResolution: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio),
	},
	particlesVertexShader,
	particlesFragmentShader
)

export default ParticleShaderMaterial
