interface HeroTitleProps {
  title?: string | null
  descriptor?: string | null
}

export function HeroTitle({ title, descriptor }: HeroTitleProps) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
      {title && (
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-primary-foreground tracking-tight">
          {title}
        </h1>
      )}
      {descriptor && (
        <p className="mt-4 text-sm md:text-base uppercase tracking-[0.3em] text-primary-foreground/80">
          {descriptor}
        </p>
      )}
    </div>
  )
}
