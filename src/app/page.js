"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// DEKORASI: LINGKARAN BERPUTAR OTOMATIS DI HERO (JUDUL)
// ==========================================
function RodaDekorasiOtomatis() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  const pakuDekor = [];
  const radius = 1.6; 
  
  for (let i = 0; i < 360; i += 15) {
    const rad = (90 - i) * Math.PI / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    pakuDekor.push(
      <mesh key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
        <meshStandardMaterial color={i % 45 === 0 ? "#a855f7" : "#334155"} emissive={i % 45 === 0 ? "#a855f7" : "#000000"} emissiveIntensity={0.5} />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      {pakuDekor}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[radius, 0.012, 8, 64]} />
        <meshStandardMaterial color="#475569" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <Line points={[[0,0,0], [0, radius, 0]]} color="#f97316" lineWidth={2} />
      <Line points={[[0,0,0], [radius * Math.cos(-Math.PI/6), radius * Math.sin(-Math.PI/6), 0]]} color="#d946ef" lineWidth={2} />
      <Line points={[[0, radius, 0], [radius * Math.cos(Math.PI * 1.1), radius * Math.sin(Math.PI * 1.1), 0], [radius * Math.cos(-Math.PI/6), radius * Math.sin(-Math.PI/6), 0]]} color="#06b6d4" lineWidth={2} />
    </group>
  );
}

// ==========================================
// 1. KOMPONEN UTAMA PAPAN PAKU 3D
// ==========================================
function JajaranPaku({ radius, onSelectPaku, aktifB, aktifC, aktifA, targetSumbu }) {
  const pakuArray = [];
  const posO = new THREE.Vector3(0, 0, 0.05); 
  
  for (let i = 0; i < 360; i += 1) {
    const radianKoding = (90 - i) * Math.PI / 180;
    const x = (radius - 0.2) * Math.cos(radianKoding);
    const y = (radius - 0.2) * Math.sin(radianKoding);
    const posPaku = new THREE.Vector3(x, y, 0.05);
    
    const isKelipatan10 = (i % 10 === 0);
    const isKelipatan5 = (i % 5 === 0) && !isKelipatan10;
    
    let tebalPaku = 0.022; 
    let tinggiPaku = 0.08;
    
    if (isKelipatan10 || isKelipatan5) {
      tebalPaku = 0.032;   
      tinggiPaku = 0.18;
    }

    let warnaPaku = isKelipatan10 || isKelipatan5 ? "#94a3b8" : "#475569";

    if (i === aktifA) warnaPaku = "#06b6d4"; 
    if (i === aktifB) warnaPaku = "#f97316"; 
    if (i === aktifC) warnaPaku = "#d946ef"; 

    const bisaDiklik = targetSumbu === 'B' || targetSumbu === 'C';

    pakuArray.push(
      <group key={i}>
        <Line
          points={[posO, posPaku]}
          color="#334155" 
          lineWidth={1} 
          transparent={true}
          opacity={0.15}
        />

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
            <meshStandardMaterial 
              color={warnaPaku} 
              roughness={0.1} 
              metalness={0.9} 
              emissive={warnaPaku} 
              emissiveIntensity={i === aktifA || i === aktifB || i === aktifC ? 0.9 : 0.03} 
            />
          </mesh>

          {isKelipatan10 && (
            <Html 
              distanceFactor={6} 
              position={[0, 0, 0.16]} 
              center 
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '8px',
                fontWeight: '700',
                color: i === aktifA ? '#06b6d4' : i === aktifB ? '#f97316' : i === aktifC ? '#d946ef' : '#94a3b8',
                backgroundColor: 'rgba(5, 7, 15, 0.85)',
                padding: '2px 4px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255, 255, 255, 0.05)'
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

// ==========================================
// 2. HALAMAN UTAMA APLIKASI
// ==========================================
export default function GeoCircleDashboard() {
  const [showSimulasi, setShowSimulasi] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State menu HP
  const [sudutB, setSudutB] = useState(0);    
  const [sudutC, setSudutC] = useState(340);    
  const [sudutA, setSudutA] = useState(170);   
  const [targetSumbu, setTargetSumbu] = useState('B'); 
  
  const [expandedFitur, setExpandedFitur] = useState({});
  const [expandedMateri, setExpandedMateri] = useState({});

  const [textInputB, setTextInputB] = useState("0");
  const [textInputC, setTextInputC] = useState("340");

  useEffect(() => {
    setTextInputB(sudutB.toString());
  }, [sudutB]);

  useEffect(() => {
    setTextInputC(sudutC.toString());
  }, [sudutC]);

  const styleInteraktifButton = {
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  };

  const handleMouseEnter = (e, shadowColor = 'rgba(168, 85, 247, 0.4)', scale = '1.04') => {
    e.currentTarget.style.transform = `translateY(-4px) scale(${scale})`;
    e.currentTarget.style.boxShadow = `0 12px 30px -4px ${shadowColor}`;
  };

  const handleMouseLeave = (e, defaultShadow = 'none') => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = defaultShadow;
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)';
  };

  const toggleExpandFitur = (id) => {
    setExpandedFitur(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandMateri = (id) => {
    setExpandedMateri(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const radius = 3; 
  const rPaku = radius - 0.2;

  const homeRef = useRef(null);
  const timRef = useRef(null);
  const fiturRef = useRef(null);
  const panduanRef = useRef(null);
  const materiRef = useRef(null);

  const [revealedSections, setRevealedSections] = useState({});
  
  useEffect(() => {
    const sections = [homeRef, timRef, fiturRef, panduanRef, materiRef];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.findIndex(ref => ref.current === entry.target);
            if (index !== -1) {
              setRevealedSections(prev => ({ ...prev, [index]: true }));
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    sections.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      sections.forEach(ref => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  const getRevealStyle = (index) => ({
    opacity: revealedSections[index] ? 1 : 0,
    transform: revealedSections[index] ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.85s cubic-bezier(0.215, 0.610, 0.355, 1.000)',
  });

  const scrollToSection = (elementRef) => {
    setMobileMenuOpen(false); // Tutup menu HP saat diklik
    window.scrollTo({
      top: elementRef.current.offsetTop - 70, 
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    let diff = sudutC - sudutB;
    if (diff < 0) diff += 360;

    let sudutTengah;
    if (diff > 180) {
      sudutTengah = sudutB + (diff / 2);
    } else {
      sudutTengah = sudutC + ((360 - diff) / 2);
    }
    
    let hasilSudut = Math.round(sudutTengah) % 360;
    setSudutA(hasilSudut);
  }, [sudutB, sudutC]);

  const getKoordinat = (derajat) => {
    const radianKoding = (90 - derajat) * Math.PI / 180;
    return new THREE.Vector3(rPaku * Math.cos(radianKoding), rPaku * Math.sin(radianKoding), 0.06);
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

  const handleCustomInputChange = (type, value) => {
    if (type === 'B') setTextInputB(value);
    if (type === 'C') setTextInputC(value);

    if (value === "") return;

    let num = parseInt(value, 10);
    if (!isNaN(num)) {
      const derajatValid = ((num % 360) + 360) % 360;
      if (type === 'B') setSudutB(derajatValid);
      if (type === 'C') setSudutC(derajatValid);
    }
  };

  const handleInputBlur = (type, currentSudut) => {
    if (type === 'B' && textInputB === "") setTextInputB(currentSudut.toString());
    if (type === 'C' && textInputC === "") setTextInputC(currentSudut.toString());
  };

  const MathBlurBackground = () => (
    <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <div style={{ position: 'absolute', top: '15%', left: '5%', fontSize: '40pt', fontWeight: '800', color: 'rgba(168, 85, 247, 0.03)', filter: 'blur(4px)', transform: 'rotate(-12deg)', fontFamily: 'monospace' }}>∠BOC = 2∠BAC</div>
      <div style={{ position: 'absolute', bottom: '25%', right: '8%', fontSize: '50pt', fontWeight: '800', color: 'rgba(6, 182, 212, 0.03)', filter: 'blur(5px)', transform: 'rotate(18deg)', fontFamily: 'monospace' }}>r = 2.8px</div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#050811', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f8fafc', letterSpacing: '-0.2px', overflowX: 'hidden' }}>
      
      {/* CSS MEDIA QUERIES KOREKSI TOTAL */}
      <style>{`
        @media (max-width: 768px) {
          nav { padding: 0 20px !important; height: 65px !important; }
          .desktop-menu { display: none !important; } 
          .hamburger-btn { display: flex !important; }
          section { padding: 60px 20px !important; }
          .hero-section { flex-direction: column-reverse !important; text-align: center !important; padding-top: 100px !important; }
          .hero-text h1 { font-size: 28pt !important; }
          .hero-text p { max-width: 100% !important; }
          .grid-responsive { grid-template-columns: 1fr !important; }
          
          /* LAYOUT MODAL SIMULATOR DI HP */
          .sim-container-fix { flex-direction: column !important; overflow-y: auto !important; overflow-x: hidden !important; padding: 10px !important; gap: 10px !important; }
          .sim-panel-fix { width: 100% !important; min-width: 100% !important; height: auto !important; max-height: none !important; margin: 0 !important; order: 2 !important; }
          .sim-canvas-fix { width: 100% !important; height: 380px !important; min-height: 380px !important; order: 1 !important; border-radius: 12px !important; overflow: hidden !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '75px', backgroundColor: 'rgba(5, 8, 17, 0.75)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px', zIndex: 100, borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div style={{ fontWeight: '900', fontSize: '12pt', color: '#ffffff', cursor: 'pointer', letterSpacing: '1.5px' }} onClick={() => scrollToSection(homeRef)}>
          GEO CIRCLE <span style={{ background: 'linear-gradient(to right, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3D</span>
        </div>
        
        {/* Menu Navigasi Desktop */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '35px' }}>
          {['Tim Pengembang', 'Fitur Utama', 'Panduan', 'Materi Dasar'].map((text, index) => {
            const refs = [timRef, fiturRef, panduanRef, materiRef];
            return (
              <span 
                key={text}
                onClick={() => scrollToSection(refs[index])} 
                style={{ 
                  position: 'relative', cursor: 'pointer', fontSize: '8.5pt', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 0', transition: 'color 0.25s ease' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                {text}
              </span>
            );
          })}
        </div>

        {/* Tombol Menu Hamburger (Hanya muncul di HP) */}
        <button 
          className="hamburger-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', zIndex: 110, outline: 'none'
          }}
        >
          <span style={{ width: '22px', height: '2px', backgroundColor: '#ffffff', borderRadius: '2px', transition: '0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translateY(5px)' : 'none' }} />
          <span style={{ width: '22px', height: '2px', backgroundColor: '#ffffff', borderRadius: '2px', transition: '0.3s', opacity: mobileMenuOpen ? 0 : 1 }} />
          <span style={{ width: '22px', height: '2px', backgroundColor: '#ffffff', borderRadius: '2px', transition: '0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-5px)' : 'none' }} />
        </button>
      </nav>

      {/* LACI NAVIGASI MENU HP (MOBILE SIDEBAR DRAWER) */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '260px', height: '100vh', backgroundColor: '#070b18', zIndex: 105, borderLeft: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', padding: '90px 24px 30px 24px', boxSizing: 'border-box', gap: '20px', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'
      }}>
        {['Tim Pengembang', 'Fitur Utama', 'Panduan', 'Materi Dasar'].map((text, index) => {
          const refs = [timRef, fiturRef, panduanRef, materiRef];
          return (
            <button
              key={text}
              onClick={() => scrollToSection(refs[index])}
              style={{
                background: 'none', border: 'none', color: '#94a3b8', fontSize: '10pt', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)'
              }}
              onClassName={(e) => e.currentTarget.style.color = '#ffffff'}
            >
              {text}
            </button>
          );
        })}
      </div>
      
      {/* Overlay Background Gelap saat Menu HP Terbuka */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 102 }}
        />
      )}

      {/* HERO SECTION */}
      <section ref={homeRef} className="hero-section" style={{ ...getRevealStyle(0), position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '100px 8% 40px 8%', background: 'radial-gradient(circle at 15% 30%, rgba(168, 85, 247, 0.06) 0%, rgba(5, 8, 17, 1) 60%)', gap: '40px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <MathBlurBackground />
        
        <div className="hero-text" style={{ zIndex: 2, position: 'relative', flex: '1.2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '42pt', fontWeight: '900', color: '#ffffff', marginBottom: '20px', letterSpacing: '-2px', lineHeight: '1.1' }}>
            GEO CIRCLE <span style={{ background: 'linear-gradient(to right, #a855f7, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3D</span>
          </h1>
          <p style={{ fontSize: '11pt', color: '#94a3b8', maxWidth: '500px', lineHeight: '1.75', marginBottom: '40px', fontWeight: '400' }}>
            Aplikasi papan paku matematika digital dalam bentuk 3D. Membantu kamu memahami rumus <span style={{ color: '#f97316', fontWeight: '600' }}>Sudut Pusat</span> dan <span style={{ color: '#06b6d4', fontWeight: '600' }}>Sudut Keliling</span> lingkaran dengan interaktif.
          </p>
          <div>
            <button 
              onClick={() => setShowSimulasi(true)}
              onMouseEnter={(e) => handleMouseEnter(e, 'rgba(168, 85, 247, 0.5)', '1.05')}
              onMouseLeave={(e) => handleMouseLeave(e)}
              onMouseDown={handleMouseDown}
              style={{ ...styleInteraktifButton, padding: '16px 44px', fontSize: '10pt', fontWeight: '700', color: '#ffffff', backgroundColor: '#a855f7', border: 'none', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.3)' }}
            >
              ▶ Mulai Simulasi
            </button>
          </div>
        </div>

        <div style={{ flex: '0.8', position: 'relative', width: '100%', height: '400px', zIndex: 2, cursor: 'grab' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }} style={{ width: '100%', height: '100%' }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[2, 2, 2]} intensity={0.8} />
              <RodaDekorasiOtomatis />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
        </div>
      </section>

      {/* TIM PENGEMBANG */}
      <section ref={timRef} style={{ ...getRevealStyle(1), position: 'relative', padding: '100px 50px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>Tim Pengembang</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '10pt', marginBottom: '60px', fontWeight: '500' }}>Kelompok 3 Program Studi Pendidikan Matematika FKIP Universitas Jember 2026</p>
        
        <h3 style={{ fontSize: '11pt', fontWeight: '700', color: '#a855f7', borderBottom: '1px solid #111827', paddingBottom: '10px', marginBottom: '25px', letterSpacing: '1px' }}>DOSEN PEMBIMBING</h3>
        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '60px' }}>
          <div style={{ background: '#090d16', padding: '30px', borderRadius: '12px', border: '1px solid #111827', borderLeft: '4px solid #a855f7' }}>
            <h4 style={{ fontSize: '11.5pt', margin: '0 0 6px 0', fontWeight: '700', color: '#ffffff' }}>Dr. Abi Suwito, S.Pd., M.Pd.</h4>
            <span style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: '700', fontFamily: 'monospace' }}>NIP. 198502112012121001</span>
          </div>
          <div style={{ background: '#090d16', padding: '30px', borderRadius: '12px', border: '1px solid #111827', borderLeft: '4px solid #a855f7' }}>
            <h4 style={{ fontSize: '11.5pt', margin: '0 0 6px 0', fontWeight: '700', color: '#ffffff' }}>Dr. Frenza Fairuz Firmansyah, S.Stat., M.Stat.</h4>
            <span style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: '700', fontFamily: 'monospace' }}>NIP. 199511112024061002</span>
          </div>
        </div>

        <h3 style={{ fontSize: '11pt', fontWeight: '700', color: '#a855f7', borderBottom: '1px solid #111827', paddingBottom: '10px', marginBottom: '25px', letterSpacing: '1px' }}>ANGGOTA KELOMPOK</h3>
        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            { nama: "Arif Luqman Hakim", nim: "250210101104" },
            { nama: "Dita Rohmawati", nim: "250210101113" },
            { nama: "Revanny Izzy Aulia", nim: "250210101115" },
            { nama: "Callista Veda Venindra", nim: "250210101124" },
            { nama: "Delila Nasyidah", nim: "250210101125" },
            { nama: "Nurul Azidah Azzahro", nim: "250210101127" },
          ].map((mhs, idx) => (
            <div key={idx} style={{ background: '#090d16', padding: '25px', borderRadius: '12px', border: '1px solid #111827', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.06)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontWeight: '800', fontSize: '11pt', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                {idx + 1}
              </div>
              <h4 style={{ fontSize: '10.5pt', margin: '0 0 4px 0', fontWeight: '700', color: '#ffffff' }}>{mhs.nama}</h4>
              <p style={{ fontSize: '9pt', color: '#64748b', margin: 0, fontFamily: 'monospace' }}>NIM. {mhs.nim}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FITUR UTAMA */}
      <section ref={fiturRef} style={{ ...getRevealStyle(2), position: 'relative', padding: '100px 50px', backgroundColor: '#03060d' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>Fitur Utama</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '10pt', marginBottom: '60px' }}>Mengapa belajar menggunakan Geo Circle 3D jauh lebih mudah?</p>
          
          <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '25px' }}>
            {[
              { id: 'f1', title: 'Papan Paku Bisa Diputar dari Segala Arah', detail: 'Tidak hanya melihat gambar lingkaran mati dari satu sisi saja. Papan ini bisa diputar ke atas, bawah, kiri, kanan, serta diperbesar atau diperkecil untuk melihat bentuk asli tiang paku dan ikatan karetnya secara lebih nyata.' },
              { id: 'f2', title: 'Klik Paku untuk Memasang Karet', detail: 'Sama seperti papan paku kayu di sekolah, dengan hanya mengarahkan kursor dan mengklik paku mana saja pada lingkaran, tali karet otomatis langsung terpasang rapi mengikuti paku yang dipilih.' },
              { id: 'f3', title: 'Input Angka Derajat Langsung', detail: 'Jika ingin memasang karet dengan presisi tepat di angka derajat tertentu, cukup ketikkan angka derajatnya (0° sampai 359°) pada kotak input yang tersedia. Karet akan langsung berubah ke posisi paku yang sesuai dengan angka tersebut.' },
              { id: 'f4', title: 'Hitung Ukuran Sudut Otomatis Sekaligus', detail: 'Setiap kali paku oranye atau ungu digeser, angka derajat sudut pusat dan sudut keliling di layar akan langsung berubah secara otomatis, sehingga tidak perlu lagi repot menghitung manual pakai busur derajat.' },
            ].map((item, idx) => (
              <div key={item.id} onClick={() => toggleExpandFitur(item.id)} style={{ background: '#090d16', padding: '30px', borderRadius: '12px', border: '1px solid #111827', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: '800', color: '#06b6d4', fontSize: '12pt', fontFamily: 'monospace' }}>[0{idx + 1}]</span>
                    <h3 style={{ fontSize: '11pt', fontWeight: '700', margin: 0, color: '#ffffff' }}>{item.title}</h3>
                  </div>
                  <span style={{ color: '#a855f7', fontSize: '14pt', fontWeight: '700' }}>{expandedFitur[item.id] ? '−' : '+'}</span>
                </div>
                <div style={{ height: expandedFitur[item.id] ? 'auto' : '0px', overflow: 'hidden', marginTop: expandedFitur[item.id] ? '20px' : '0px', transition: 'all 0.3s' }}>
                  <p style={{ fontSize: '9.5pt', color: '#94a3b8', lineHeight: '1.7', margin: 0, borderTop: '1px solid #111827', paddingTop: '15px' }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PANDUAN BELAJAR */}
      <section ref={panduanRef} style={{ ...getRevealStyle(3), padding: '100px 50px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>Panduan</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '10pt', marginBottom: '60px' }}>Ikuti langkah berikut untuk membuktikan rumus lingkaran di dalam simulator.</p>
        
        <div style={{ background: '#090d16', padding: '40px', borderRadius: '16px', border: '1px solid #111827' }}>
          {[
            { step: "1", title: "Pilih Karet yang Ingin Digeser", desc: "Klik tombol 'SET PAKU ORANYE' atau 'SET PAKU UNGU' pada menu bagian kiri untuk menentukan karet mana yang akan pindahkan." },
            { step: "2", title: "Klik Derajat di Lingkaran", desc: "Arahkan kursor ke papan paku lingkaran 3D, lalu klik pada salah satu derajat yang diinginkan untuk menempelkan ujung karet." },
            { step: "3", title: "Input Angka Derajatnya", desc: "Jika kesulitan mengklik paku, bisa langsung mengetikkan angka derajatnya (0° sampai 359°) pada kotak input di menu bagian bawah." },
            { step: "4", title: "Lihat Hasil Perbandingannya", desc: "Perhatikan kotak hasil di sebelah kiri. Ukuran Sudut Pusat (Karet Oranye-Ungu) pasti selalu berukuran tepat 2 kali lipat dari ukuran Sudut Keliling (Karet Biru)." }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '25px', marginBottom: idx === 3 ? 0 : '30px' }}>
              <div style={{ fontWeight: '800', color: '#a855f7', fontSize: '14pt', fontFamily: 'monospace', marginTop: '2px' }}>{item.step}</div>
              <div>
                <h4 style={{ fontWeight: '700', fontSize: '11pt', marginBottom: '6px', color: '#ffffff' }}>{item.title}</h4>
                <p style={{ fontSize: '9.5pt', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MATERI DASAR LINGKARAN */}
      <section ref={materiRef} style={{ ...getRevealStyle(4), position: 'relative', padding: '100px 50px 120px 50px', backgroundColor: '#03060d' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '22pt', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>Materi Dasar Matematika</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '10pt', marginBottom: '60px' }}>Klik judul materi di bawah ini untuk membaca penjelasan lengkapnya.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { 
                id: 'm1', 
                title: 'Apa itu Sudut Pusat Lingkaran (∠BOC)?', 
                detail: 'Sudut Pusat adalah sudut yang terbentuk di dalam lingkaran, di mana titik sudut atau pojok bangun sudutnya terletak tepat di titik pusat lingkaran (Titik O). Sementara itu, kedua kaki sudutnya merupakan garis jari-jari lingkaran yang membentang dari pusat menuju ke arah tepi atau keliling lingkaran (Garis OB dan Garis OC). Ukuran sudut pusat ini dibatasi oleh busur lingkaran yang terbentuk di antara kedua kaki sudutnya tersebut.',
                imageUrl: 'https://i0.wp.com/rumushitung.com/wp-content/uploads/2014/12/sudut-pusat-dan-sudut-keliling-lingkaran.png?ssl=1', 
                sumberNama: 'RumusHitung.com', 
                sumberUrl: 'https://i0.wp.com/rumushitung.com/wp-content/uploads/2014/12/sudut-pusat-dan-sudut-keliling-lingkaran.png?ssl=1',
                keterangan: (
                  <>
                    <span style={{color: '#ffffff', fontWeight: 'bold'}}>KOMPONEN SUDUT PUSAT DI SIMULATOR:</span><br/>
                    • <b style={{color: '#ffffff'}}>Titik O (Paku Tengah)</b> = Berperan sebagai pusat lingkaran sekaligus titik pojok dari Sudut Pusat.<br/>
                    • <b style={{color: '#ffffff'}}>Garis OB (Karet Oranye)</b> = Jari-jari lingkaran pertama yang mengarah ke paku pembatas B.<br/>
                    • <b style={{color: '#ffffff'}}>Garis OC (Karet Ungu)</b> = Jari-jari lingkaran kedua yang mengarah ke paku pembatas C.<br/>
                    • <b style={{color: '#ffffff'}}>∠BOC (Sudut Pusat)</b> = Daerah ruang sudut yang terbentuk tepat di tengah-tengah papan paku.
                  </>
                )
              },
              { 
                id: 'm2', 
                title: 'Apa itu Sudut Keliling Lingkaran (∠BAC)?', 
                detail: 'Sudut Keliling adalah sudut yang dibentuk di dalam lingkaran, namun berbeda dengan sudut pusat, titik pojok atau titik sudutnya berada pas menempel di sepanjang garis tepi atau keliling lingkaran (Titik A). Kedua kaki sudut yang memanjang dari titik pojok ini tidak menggunakan jari-jari, sondern tali busur lingkaran, yaitu Garis AB dan Garis AC.',
                imageUrl: 'https://imgix2.ruangguru.com/assets/miscellaneous/png_3mkh9n_9866.png', 
                sumberNama: 'roboguru.ruangguru.com', 
                sumberUrl: 'https://imgix2.ruangguru.com/assets/miscellaneous/png_3mkh9n_9866.png', 
                keterangan: (
                  <>
                    <span style={{color: '#ffffff', fontWeight: 'bold'}}>KOMPONEN SUDUT KELILING DI SIMULATOR:</span><br/>
                    • <b style={{color: '#ffffff'}}>Titik A (Paku Biru otomatis)</b> = Titik sudut keliling yang posisinya selalu menyesuaikan di seberang busur.<br/>
                    • <b style={{color: '#ffffff'}}>Garis AB & AC (Karet Biru)</b> = Dua buah tali busur lingkaran yang menjulur membentuk kaki Sudut Keliling.<br/>
                    • <b style={{color: '#ffffff'}}>∠BAC (Sudut Keliling)</b> = Daerah ruang sudut tajam yang terbentuk tepat di tepi keliling lingkaran.
                  </>
                )
              },
              { 
                id: 'm3', 
                title: 'Hubungan Sudut Pusat dan Sudut Keliling', 
                detail: 'Ketika sebuah Sudut Pusat (∠BOC) dan Sudut Keliling (∠BAC) berada di dalam lingkaran yang sama dan keduanya menghadap arah lengkungan/busur lingkaran yang sama (dalam simulator ini yaitu busur BC), berlaku sebuah sifat mutlak matematika: Besar ukuran Sudut Pusat nilainya akan selalu tepat 2 kali lipat lebih besar dibandingkan ukuran Sudut Keliling. Sebaliknya, ukuran Sudut Keliling bernilai tepat setengah (1/2) dari ukuran Sudut Pusat.',
                imageUrl: 'https://www.geogebra.org/resource/AtUcVfSe/bpa1Q1zY4oMQeTDE/material-AtUcVfSe.png', 
                sumberNama: 'geogebra.org', 
                sumberUrl: 'https://www.geogebra.org/resource/AtUcVfSe/bpa1Q1zY4oMQeTDE/material-AtUcVfSe.png', 
                keterangan: (
                  <>
                    <span style={{color: '#ffffff', fontWeight: 'bold'}}>RUMUS HUBUNGAN & APRESIASI MATEMATIKA:</span><br/>
                    • <b style={{color: '#ffffff'}}>Syarat Utama</b> = Sudut karet Oranye-Ungu dan Sudut karet Biru harus sama-sama berhenti di paku B dan paku C.<br/>
                    • <b style={{color: '#ffffff'}}>Rumus Eksperimen</b> = <code style={{background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#34d399'}}>Sudut Pusat = 2 × Sudut Keliling</code>.<br/>
                    • <b style={{color: '#ffffff'}}>Bukti Nyata</b> = Jika kamu geser paku B atau C hingga nilai sudut keliling terbaca 45° di panel simulasi, maka sudut pusat otomatis mendeteksi angka 90° secara presisi.
                  </>
                )
              }
            ].map((item, idx) => (
              <div key={item.id} onClick={() => toggleExpandMateri(item.id)} style={{ background: '#090d16', padding: '30px', borderRadius: '12px', border: '1px solid #111827', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: '800', color: '#d946ef', fontSize: '11pt', fontFamily: 'monospace' }}>MATERI 0{idx + 1}</span>
                    <h3 style={{ fontSize: '11pt', fontWeight: '700', margin: 0, color: '#ffffff' }}>{item.title}</h3>
                  </div>
                  <span style={{ color: '#06b6d4', fontSize: '14pt', fontWeight: '700' }}>{expandedMateri[item.id] ? '−' : '+'}</span>
                </div>
                <div style={{ height: expandedMateri[item.id] ? 'auto' : '0px', overflow: 'hidden', marginTop: expandedMateri[item.id] ? '20px' : '0px', transition: 'all 0.3s' }}>
                  <div style={{ fontSize: '9.5pt', color: '#94a3b8', lineHeight: '1.75', margin: 0, borderTop: '1px solid #111827', paddingTop: '15px', textAlign: 'justify' }}>
                    <p style={{ margin: '0 0 20px 0' }}>{item.detail}</p>
                    {item.imageUrl && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', objectFit: 'contain', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
                        <span style={{ fontSize: '8pt', color: '#475569', marginTop: '8px' }}>Sumber: <a href={item.sumberUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none' }}>{item.sumberNama}</a></span>
                      </div>
                    )}
                    {item.keterangan && (
                      <div style={{ padding: '16px 20px', background: '#050811', borderRadius: '8px', border: '1px solid #111827', fontSize: '8.5pt', color: '#64748b' }}>
                        {item.keterangan}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: '#02040a', color: '#475569', padding: '35px 50px', textAlign: 'center', fontSize: '8.5pt', borderTop: '1px solid #090d16' }}>
        &copy; {new Date().getFullYear()} GEO CIRCLE 3D. All rights reserved.
      </footer>

      {/* MODAL SIMULATOR */}
      {showSimulasi && (
        <div className="sim-container-fix" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#050811', zIndex: 1000, overflowX: 'hidden', overflowY: 'hidden', display: 'flex', flexDirection: 'row', padding: '15px', boxSizing: 'border-box' }}>
          
          {/* PANEL KONTROL KIRI */}
          <div className="sim-panel-fix" style={{ position: 'relative', zIndex: 1010, backgroundColor: '#050915', padding: '20px', borderRadius: '12px', color: '#e2e8f0', width: '350px', minWidth: '350px', height: '100%', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '10pt', color: '#ffffff', letterSpacing: '0.5px' }}>GEO CIRCLE 3D</div>
                <div style={{ fontSize: '7pt', fontWeight: '700', color: '#06b6d4', letterSpacing: '1.2px', marginTop: '1px' }}>Alat Peraga Simulasi 3D</div>
              </div>
              <button onClick={() => setShowSimulasi(false)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '6px 14px', borderRadius: '6px', fontSize: '7.5pt', fontWeight: '700', cursor: 'pointer' }}>KEMBALI</button>
            </div>

            <p style={{ fontSize: '8pt', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>Klik lingkaran 3D atau ketik derajat pada input di bawah.</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setTargetSumbu('B')} style={{ background: targetSumbu === 'B' ? '#f97316' : '#0f172a', color: targetSumbu === 'B' ? 'white' : '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '10px 0', borderRadius: '8px', fontWeight: '800', fontSize: '7.5pt', flex: 1, cursor: 'pointer' }}>SET PAKU ORANYE</button>
              <button onClick={() => setTargetSumbu('C')} style={{ background: targetSumbu === 'C' ? '#d946ef' : '#0f172a', color: targetSumbu === 'C' ? 'white' : '#d946ef', border: '1px solid rgba(217, 70, 239, 0.3)', padding: '10px 0', borderRadius: '8px', fontWeight: '800', fontSize: '7.5pt', flex: 1, cursor: 'pointer' }}>SET PAKU UNGU</button>
            </div>

            <div style={{ background: 'rgba(6, 182, 212, 0.04)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#06b6d4' }} /><span style={{ fontSize: '7pt', color: '#06b6d4', fontWeight: '800' }}>PAKU A - TERKUNCI OTOMATIS</span></div>
              <p style={{ fontSize: '8pt', color: '#94a3b8', margin: 0, paddingLeft: '10px', marginTop: '2px' }}>Posisi seimbang di seberang busur: <b style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{sudutA}°</b></p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#090f20', border: '1px solid #1e293b', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: '700' }}>SUDUT PUSAT (∠BOC)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#d946ef' }} /><span style={{ color: '#ffffff', fontSize: '20pt', fontWeight: '900', fontFamily: 'monospace' }}>{sudutPusat}°</span></div>
              </div>
              <div style={{ background: '#090f20', border: '1px solid #1e293b', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: '700' }}>SUDUT KELILING (∠BAC)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#06b6d4' }} /><span style={{ color: '#ffffff', fontSize: '20pt', fontWeight: '900', fontFamily: 'monospace' }}>{sudutKeliling}°</span></div>
              </div>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.15)', fontSize: '9.5pt', fontWeight: '700', color: '#c084fc', fontFamily: 'monospace' }}>
              {sudutPusat}° = 2 × {sudutKeliling}° <span style={{ color: '#34d399', marginLeft: '3px' }}>✓</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '7pt', color: '#f97316', fontWeight: '800' }}>PAKU ORANYE (°)</span>
                <input type="text" inputMode="numeric" value={textInputB} onChange={(e) => handleCustomInputChange('B', e.target.value)} onBlur={() => handleInputBlur('B', sudutB)} style={{ background: '#090f20', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '6px', color: '#ffffff', fontSize: '9pt', padding: '8px', width: '100%', boxSizing: 'border-box', fontWeight: '700', textAlign: 'center', outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '7pt', color: '#d946ef', fontWeight: '800' }}>PAKU UNGU (°)</span>
                <input type="text" inputMode="numeric" value={textInputC} onChange={(e) => handleCustomInputChange('C', e.target.value)} onBlur={() => handleInputBlur('C', sudutC)} style={{ background: '#090f20', border: '1px solid rgba(217, 70, 239, 0.25)', borderRadius: '6px', color: '#ffffff', fontSize: '9pt', padding: '8px', width: '100%', boxSizing: 'border-box', fontWeight: '700', textAlign: 'center', outline: 'none', fontFamily: 'monospace' }} />
              </div>
            </div>
          </div>

          {/* AREA CANVAS 3D SIMULATOR */}
          <div className="sim-canvas-fix" style={{ flex: 1, height: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 5.5], fov: 46 }} style={{ display: 'block', width: '100%', height: '100%' }}>
              <color attach="background" args={['#050811']} />
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.9} />
              <pointLight position={[-5, -5, 3]} intensity={0.6} color="#a855f7" />
              
              <Center>
                <JajaranPaku radius={radius} onSelectPaku={handlePakuClick} aktifB={sudutB} aktifC={sudutC} aktifA={sudutA} targetSumbu={targetSumbu} />
                <mesh position={[0, 0, 0.05]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} /></mesh>
                <Line points={[posO, posB]} color="#f97316" lineWidth={4.5} /> 
                <Line points={[posO, posC]} color="#d946ef" lineWidth={4.5} /> 
                <Line points={[posB, posA, posC]} color="#06b6d4" lineWidth={4.5} /> 
              </Center>
              <OrbitControls enablePan={false} enableZoom={true} minDistance={4} maxDistance={10} makeDefault />
            </Canvas>
          </div>
        </div>
      )}
    </div>
  );
}