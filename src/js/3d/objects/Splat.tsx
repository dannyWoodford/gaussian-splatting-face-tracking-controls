import { Object3DNode, extend } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";

// Make LumaSplatsThree available to R3F
extend( { LumaSplats: LumaSplatsThree } );

// For typeScript support:
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
  }
}

export default function Splat() {
	return (
		<group name="lumaSplats Group">
			<lumaSplats
				semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
				source='https://lumalabs.ai/capture/a68f48e0-026f-4701-933c-457678434414'
				position={[-1, 0, -13]}
				rotation={[0, 2.6, 0]}
				scale={1}
				particleRevealEnabled={true}
			/>
		</group>
	);
}
