'use client'

import { useState } from 'react'
import { ImageComponentProps } from '../types'

export default function ImageComponent({ src, alt, style }: ImageComponentProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <span>No Image</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}