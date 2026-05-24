"use client";
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// 1. KOMPONEN GENERATOR PAKU DIGITAL + GARIS JARI-JARI (MENDUKUNG TEMA DINAMIS)
function JajaranPaku({ radius, onSelectPaku, aktifB, aktifC, aktifA, targetSumbu, isDarkMode }) {
  const pakuArray = [];
  const posO = new THREE.Vector3(0, 0, 0.05); 
  
  for (let i = 0; i < 360; i += 1) {
    const radianKoding = (90 - i) * Math.PI / 180;
    const x = radius * Math.cos(radianKoding);
    const y = radius * Math.sin(radianKoding);
    const posPaku = new THREE.Vector3(x, y, 0.05);
    
    const isKelipatan10 = (i % 10 === 0);
    const isKelipatan5 = (i % 5 === 0) && !isKelipatan10;
    
    let tebalPaku = 0.012; 
    let tinggiPaku = 0.07;
    
    if (isKelipatan10 || isKelipatan5) {
      tebalPaku = 0.03;   
      tinggiPaku = 0.15;
    }

    // Warna paku & garis menyesuaikan dengan tema dark/light
    let warnaPaku = isKelipatan10 || isKelipatan5 
      ? (isDarkMode ? "#475569" : "#64748b") 
      : (isDarkMode ? "#94a3b8" : "#cbd5e1");

    if (i === aktifA) warnaPaku = "#3b82f6"; 
    if (i === aktifB) warnaPaku = "#ef4444"; 
    if (i === aktifC) warnaPaku = "#facc15"; 

    const bisaDiklik = targetSumbu === 'B' || targetSumbu === 'C';

    pakuArray.push(
      <group key={i}>
        {/* Garis Jari-Jari (Disesuaikan kontrasnya berdasarkan tema) */}
        <Line
          points={[posO, posPaku]}
          color={isDarkMode ? "#334155" : "#94a3b8"} 
          lineWidth={1.5} 
          transparent={true}
          opacity={isDarkMode ? 0.6 : 0.45}
        />

        {/* Objek Paku */}
        <group position={[x, y, tinggiPaku / 2]}>
          <mesh 
            rotation={[Math.PI / 2, 0, 0]} 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (bisaDiklik) onSelectPaku(i); 
            }}
            style={{ cursor: bisaDiklik ? 'pointer' : 'default' }}
          >
            <cylinderGeometry args={[tebalPaku, tebalPaku, tinggiPaku, 12]} />
            <meshStandardMaterial color={warnaPaku} roughness={0.1} metalness={0.5} />
          </mesh>

          {isKelipatan10 && (
            <Html 
              distanceFactor={6} 
              position={[0, 0, 0.1]} 
              center 
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                fontFamily: 'sans-serif',
                fontSize: '8.5px',
                fontWeight: 'bold',
                color: i === aktifA ? '#3b82f6' : i === aktifB ? '#ef4444' : i === aktifC ? (isDarkMode ? '#fde047' : '#ca8a04') : (isDarkMode ? '#cbd5e1' : '#475569'),
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.85)',
                padding: '1px 3px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1'
              }}
            >
              {i}°
            </Html>
          )}
        </group>
      </group>
    );
  }
  return <>{pakuArray}</>;
}

// 2. KOMPONEN UTAMA GEO CIRCLE PRO WITH TOGGLE THEME
export default function GeoCircle3D() {
  const [sudutB, setSudutB] = useState(0);    
  const [sudutC, setSudutC] = useState(90);   
  const [sudutA, setSudutA] = useState(225);  
  const [targetSumbu, setTargetSumbu] = useState('B'); 
  const [isDarkMode, setIsDarkMode] = useState(false); // BARU: State kontrol tema (default light mode / putih)
  
  const radius = 3; 

  useEffect(() => {
    let selisih = sudutC - sudutB;
    if (selisih < 0) selisih += 360;

    let sudutTengah;
    if (selisih > 180) {
      sudutTengah = sudutB + (selisih / 2);
    } else {
      sudutTengah = sudutC + ((360 - selisih) / 2);
    }
    
    let hasilSudut = Math.round(sudutTengah) % 360;
    setSudutA(hasilSudut);
  }, [sudutB, sudutC]);

  const getKoordinat = (derajat) => {
    const radianKoding = (90 - derajat) * Math.PI / 180;
    return new THREE.Vector3(radius * Math.cos(radianKoding), radius * Math.sin(radianKoding), 0.06);
  };

  const posO = new THREE.Vector3(0, 0, 0.06); 
  const posA = getKoordinat(sudutA);
  const posB = getKoordinat(sudutB);
  const posC = getKoordinat(sudutC);

  const hitungSelisihSudut = (b, c) => {
    let diff = Math.abs(b - c);
    return diff > 180 ? 360 - diff : diff;
  };

  const sudutPusat = hitungSelisihSudut(sudutB, sudutC);
  const sudutKeliling = sudutPusat / 2; 

  const handlePakuClick = (derajat) => {
    if (targetSumbu === 'B') setSudutB(derajat);
    else if (targetSumbu === 'C') setSudutC(derajat);
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', // Dinamis
      overflow: 'hidden', 
      position: 'relative', 
      fontFamily: 'sans-serif',
      transition: 'background-color 0.3s ease'
    }}>
      
      {/* PANEL HUD KONTROL - BERUBAH WARNA SESUAI TEMA */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 10, 
        background: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
        padding: '25px', 
        borderRadius: '12px', 
        color: isDarkMode ? '#f8fafc' : '#1e293b', 
        width: '340px', 
        backdropFilter: 'blur(10px)', 
        border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1', 
        boxShadow: isDarkMode ? '0 20px 25px -5px rgba(0,0,0,0.5)' : '0 20px 25px -5px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}>
        
        {/* HEADER & BUTTON TOGGLE DARK MODE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '14pt', margin: 0, color: isDarkMode ? '#38bdf8' : '#0284c7', fontWeight: 'bold' }}>Geo Circle 3D</h2>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            style={{
              background: isDarkMode ? '#facc15' : '#1e293b',
              color: isDarkMode ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '8.5pt',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <p style={{ fontSize: '8.5pt', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '15px', lineHeight: '1.4' }}>
          Pilih paku Merah/Kuning, lalu klik strip derajat mana saja pada papan untuk menggeser karet secara real-time.
        </p>
        
        <div style={{ margin: '15px 0', display: 'flex', gap: '8px' }}>
          <button onClick={() => setTargetSumbu('B')} style={{ background: targetSumbu === 'B' ? '#ef4444' : (isDarkMode ? '#334155' : '#e2e8f0'), color: targetSumbu === 'B' ? 'white' : (isDarkMode ? '#cbd5e1' : '#475569'), border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '8.5pt', flex: 1, borderBottom: targetSumbu === 'B' ? '3px solid #b91c1c' : 'none' }}>Set Paku B (Merah)</button>
          <button onClick={() => setTargetSumbu('C')} style={{ background: targetSumbu === 'C' ? '#facc15' : (isDarkMode ? '#334155' : '#e2e8f0'), color: targetSumbu === 'C' ? '#0f172a' : (isDarkMode ? '#cbd5e1' : '#475569'), border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '8.5pt', flex: 1, borderBottom: targetSumbu === 'C' ? '3px solid #eab308' : 'none' }}>Set Paku C (Kuning)</button>
        </div>

        <div style={{ background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: isDarkMode ? '1px dashed #475569' : '1px dashed #cbd5e1' }}>
          <span style={{ fontSize: '8pt', color: isDarkMode ? '#60a5fa' : '#2563eb', fontWeight: 'bold' }}>🔒 STATUS PAKU BIRU (A):</span>
          <p style={{ fontSize: '8pt', color: isDarkMode ? '#cbd5e1' : '#475569', margin: '2px 0 0 0' }}>Terkunci otomatis ke derajat terdekat (&nbsp;<b style={{color: isDarkMode ? '#60a5fa' : '#2563eb'}}>{sudutA}°</b>&nbsp;) agar sudut keliling selalu pas setengah.</p>
        </div>

        {/* AREA INDIKATOR LINGKARAN */}
        <div style={{ borderTop: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'transparent', border: '2px solid #ef4444', flexShrink: 0 }} />
            <p style={{ fontSize: '11pt', margin: 0 }}>Sudut Pusat (&ang;BOC): <b style={{ color: '#ef4444', fontSize: '14pt' }}>{sudutPusat}&deg;</b></p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'transparent', border: '2px solid #3b82f6', flexShrink: 0 }} />
            <p style={{ fontSize: '11pt', margin: 0 }}>Sudut Keliling (&ang;BAC): <b style={{ color: '#3b82f6', fontSize: '14pt' }}>{sudutKeliling}&deg;</b></p>
          </div>
        </div>
      </div>

      {/* INDIKATOR TOMBOL PANAH ROTATE 3D */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 10, 
        background: 'transparent', 
        padding: '10px 16px', 
        borderRadius: '30px', 
        color: isDarkMode ? '#38bdf8' : '#0284c7', 
        border: isDarkMode ? '1px solid #0284c7' : '1px solid #0284c7', 
        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '9.5pt', 
        fontWeight: 'bold', 
        pointerEvents: 'none', 
        userSelect: 'none' 
      }}>
        <span>🔄 Drag Layar Untuk Rotate 3D</span>
      </div>

      {/* RENDER GRAPHIC CANVAS 3D */}
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        {/* Mengubah background canvas secara dinamis mengikuti state */}
        <color attach="background" args={[isDarkMode ? '#0f172a' : '#ffffff']} />
        
        <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />
        <directionalLight position={[5, 5, 5]} intensity={isDarkMode ? 1.0 : 1.2} />
        
        <Center>
          {/* Lapisan Utama Tersembunyi */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[radius, radius, 0.1, 64]} />
            <meshStandardMaterial transparent={true} opacity={0} />
          </mesh>

          {/* Jajaran Paku Komplit dengan Garis Jari-Jari */}
          <JajaranPaku 
            radius={radius - 0.2} 
            onSelectPaku={handlePakuClick} 
            aktifB={sudutB} 
            aktifC={sudutC} 
            aktifA={sudutA} 
            targetSumbu={targetSumbu}
            isDarkMode={isDarkMode}
          />

          {/* Paku Pusat Tengah O */}
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color={isDarkMode ? "#cbd5e1" : "#475569"} />
          </mesh>

          {/* SEGMEN GARIS KARET MERAH (O -> B) */}
          <Line
            points={[posO, posB]} 
            color="#ef4444" 
            lineWidth={6} 
          />

          {/* SEGMEN GARIS KARET KUNING (O -> C) */}
          <Line
            points={[posO, posC]} 
            color="#facc15" 
            lineWidth={6} 
          />

          {/* TALI KARET BIRU (SUDUT KELILING B -> A -> C) */}
          <Line
            points={[posB, posA, posC]} 
            color="#3b82f6" 
            lineWidth={6} 
          />
        </Center>

        <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={12} makeDefault />
      </Canvas>
    </div>
  );
}