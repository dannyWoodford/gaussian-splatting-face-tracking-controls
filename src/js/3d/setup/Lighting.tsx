import React from "react";
import { SoftShadows } from '@react-three/drei'

export default function Lighting() {

	return (
		<group name="Lighting">
			<SoftShadows size={25} focus={0} samples={10} />

			<group name="Basic Lighting Setup" >
				<ambientLight intensity={Math.PI / 2} />
				<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
				<pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
			</group>
		</group>
	);
}
