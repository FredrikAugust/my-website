'use client'

import Zoom from 'react-medium-image-zoom'
import type { ReactNode } from 'react'

export function ImageZoom({ children, src }: { children: ReactNode; src: string }) {
  return (
    <Zoom zoomMargin={24} zoomImg={{ src }} classDialog="image-spotlight">
      {children}
    </Zoom>
  )
}
