'use client'

export function TeamLogo({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="w-6 h-6 rounded-full bg-zinc-800/60 ring-1 ring-white/5 overflow-hidden shrink-0 flex items-center justify-center">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={24} height={24}
          className="w-[18px] h-[18px] object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
    </div>
  )
}
