export default function BrandLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <img
        src="/monkey.gif.gif"
        alt="Loading..."
        className={`${sizes[size]} object-contain`}
      />
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></div>
      </div>
    </div>
  );
}
