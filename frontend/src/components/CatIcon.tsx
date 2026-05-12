export default function CatIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Ears */}
      <path d="M3 14c-1.5-4 1-8 4-8s5 2 5 2" />
      <path d="M21 14c1.5-4-1-8-4-8s-5 2-5 2" />
      
      {/* Head Top */}
      <path d="M7 6c2-1 8-1 10 0" />
      
      {/* Face Outline */}
      <path d="M3 14c0 4.5 4 8 9 8s9-3.5 9-8" />
      
      {/* Eyes with blink animation */}
      <g className="cat-eyes">
        <circle cx="8" cy="14" r="1" fill="currentColor" className="cat-eye-left" />
        <circle cx="16" cy="14" r="1" fill="currentColor" className="cat-eye-right" />
      </g>
      
      {/* Nose & Mouth */}
      <path d="M12 16v1" />
      <path d="M10 18.5c1 1 3 1 4 0" />
      
      {/* Whiskers */}
      <path d="M3 15h3" />
      <path d="M18 15h3" />
      <path d="M4 17h2" />
      <path d="M18 17h2" />

      <style>{`
        @keyframes cat-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .cat-eye-left, .cat-eye-right {
          transform-origin: center;
          animation: cat-blink 4s infinite;
        }
      `}</style>
    </svg>
  );
}
