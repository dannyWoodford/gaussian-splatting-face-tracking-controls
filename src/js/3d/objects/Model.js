/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/model.glb -d 
Author: Scottish Maritime Museum (https://sketchfab.com/ScottishMaritimeMuseum)
License: CC0-1.0 (http://creativecommons.org/publicdomain/zero/1.0/)
Source: https://sketchfab.com/3d-models/mv-spartan-e2c3ced464f14e3b864f15871bf6d87d
Title: MV Spartan
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model(props) {
  const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + '/model-2.glb')
  return (
    <group {...props} dispose={null}>
      <group position={[-2.285, 2.102, 3.339]} rotation={[-1.593, -0.002, 0.073]}>
        <mesh geometry={nodes.default_SpartanDoor_Low_withTX_Material_t2_l0_u1_v1_0.geometry} material={materials.SpartanDoor_Low_withTX_Material_t2_l0_u1_v1} position={[2.448, 3.02, -1.894]} />
      </group>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={nodes.Spartan_default_0.geometry} material={materials['default']} />
        <mesh geometry={nodes.Spartan_default_0_1.geometry} material={materials['default']} />
        <mesh geometry={nodes.Spartan_default_0_2.geometry} material={materials['default']} />
        <mesh geometry={nodes.Spartan_default_0_3.geometry} material={materials['default']} />
        <mesh geometry={nodes.Spartan_default_0_4.geometry} material={materials['default']} />
        <mesh geometry={nodes.Spartan_default_0_5.geometry} material={materials['default']} />
      </group>
      <mesh geometry={nodes.bars_bars_Material_u1_v1_0.geometry} material={materials.bars_Material_u1_v1} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.windows_WindowswithTextures_Material_t1_l1_u1_v1_0.geometry} material={materials.WindowswithTextures_Material_t1_l1_u1_v1} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Box001_Unwrap_Texture_Checker_Material_0.geometry} material={materials.Unwrap_Texture_Checker_Material} position={[-0.823, -0.075, 0.438]} rotation={[-Math.PI / 2, 0, 0.021]} />
    </group>
  )
}

// useGLTF.preload(process.env.PUBLIC_URL + '/model.glb')