import { useState, useEffect } from 'react';

export default function BigAnimatedCat({ isDarkMode }: { isDarkMode: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Eye movement limits
  const eyeX = mousePos.x * 3;
  const eyeY = mousePos.y * 2;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-12">
      {/* Background Glow */}
      <div className={`absolute w-[400px] h-[400px] rounded-full filter blur-[80px] transition-colors duration-1000 ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-400/20'}`}></div>
      
      <svg 
        viewBox="0 0 200 200" 
        className="w-full max-w-[350px] relative z-10 drop-shadow-2xl transition-transform duration-300"
        style={{ transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px) rotate(${mousePos.x * 2}deg)` }}
      >
        {/* Ears */}
        <path 
          d="M40 80 L20 20 L80 60" 
          fill={isDarkMode ? "#1e293b" : "#f1f5f9"} 
          stroke={isDarkMode ? "#334155" : "#e2e8f0"} 
          strokeWidth="4" 
          strokeLinejoin="round" 
        />
        <path 
          d="M160 80 L180 20 L120 60" 
          fill={isDarkMode ? "#1e293b" : "#f1f5f9"} 
          stroke={isDarkMode ? "#334155" : "#e2e8f0"} 
          strokeWidth="4" 
          strokeLinejoin="round" 
        />
        
        {/* Face Outline */}
        <path 
          d="M30 100 C30 40 170 40 170 100 C170 160 140 190 100 190 C60 190 30 160 30 100 Z" 
          fill={isDarkMode ? "#0f172a" : "#ffffff"} 
          stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} 
          strokeWidth="4" 
        />
        
        {/* Eyes (Outer) */}
        <circle cx="70" cy="100" r="15" fill={isDarkMode ? "#1e293b" : "#f8fafc"} />
        <circle cx="130" cy="100" r="15" fill={isDarkMode ? "#1e293b" : "#f8fafc"} />
        
        {/* Pupils (Tracking Mouse) */}
        <g style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}>
          <circle cx="70" cy="100" r="6" fill="#1A73E8" />
          <circle cx="70.5" cy="98.5" r="2.5" fill="white" fillOpacity="0.8" />
          
          <circle cx="130" cy="100" r="6" fill="#1A73E8" />
          <circle cx="130.5" cy="98.5" r="2.5" fill="white" fillOpacity="0.8" />
        </g>
        
        {/* Nose */}
        <path d="M95 125 L105 125 L100 132 Z" fill="#f472b6" />
        
        {/* Mouth */}
        <path d="M85 145 C90 155 110 155 115 145" fill="none" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="3" strokeLinecap="round" />
        
        {/* Whiskers */}
        <g stroke={isDarkMode ? "#334155" : "#e2e8f0"} strokeWidth="2" strokeLinecap="round">
          <line x1="40" y1="130" x2="10" y2="125" />
          <line x1="40" y1="140" x2="5" y2="145" />
          <line x1="160" y1="130" x2="190" y2="125" />
          <line x1="160" y1="140" x2="195" y2="145" />
        </g>

        {/* Dynamic Blushing (if mouse is close) */}
        <circle cx="50" cy="130" r="8" fill="#f472b6" fillOpacity={Math.abs(mousePos.x) > 0.5 ? "0.1" : "0"} />
        <circle cx="150" cy="130" r="8" fill="#f472b6" fillOpacity={Math.abs(mousePos.x) > 0.5 ? "0.1" : "0"} />
      </svg>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-1 h-1 rounded-full ${isDarkMode ? 'bg-blue-500/30' : 'bg-blue-400/20'} animate-pulse`}
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-12 text-center">
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>
          KarkTech Security System Active
        </p>
      </div>
    </div>
  );
}
