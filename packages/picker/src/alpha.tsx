import React, { useEffect, useRef, useState } from 'react'
import { drawAlpha, minmax } from './utils'
import { useColorPicker } from './hooks'

function getAlphaCoordOnMouseEvent(canvas: HTMLCanvasElement, e: MouseEvent) {
  const canvasBbox = canvas.getBoundingClientRect()

  let localX = e.clientX - canvasBbox.left
  localX = minmax(localX, 0, canvasBbox.width)

  return parseFloat((localX / canvasBbox.width).toFixed(2))
}

export interface AlphaContainerProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const AlphaContainer: React.FC<AlphaContainerProps> = ({
  className,
  style,
  children,
}) => {
  return (
    <div
      style={{ position: 'relative', userSelect: 'none', ...style }}
      className={className}
    >
      {children}
    </div>
  )
}

export interface AlphaProps {
  className?: string
  style?: React.CSSProperties
  fill?: string
}

export const Alpha: React.FC<AlphaProps> = ({
  className,
  style,
  fill = '#d9d9d9',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current

    if (canvasEl) {
      drawAlpha(canvasEl, fill)
    }
  }, [fill])

  return (
    <canvas
      draggable="false"
      ref={canvasRef}
      className={className}
      style={{
        ...style,
      }}
    />
  )
}

export interface AlphaSelectorProps {
  className?: string
  style?: React.CSSProperties
}

export const AlphaSelector: React.FC<AlphaSelectorProps> = ({
  style,
  className,
}) => {
  const { alphaSelectorX, onChangeColor, alpha, onChangeColorComplete, hsv } =
    useColorPicker()
  const [isMouseDown, setMouseDown] = useState(false)
  const alphaSelectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const alphaSelectorEl = alphaSelectorRef.current
    const canvasEl = (alphaSelectorEl?.previousElementSibling ??
      alphaSelectorEl?.nextElementSibling) as HTMLCanvasElement

    function updateAlphaSelectorCoord(e: MouseEvent) {
      if (!canvasEl || canvasEl.tagName !== 'CANVAS') {
        return
      }

      const alpha = getAlphaCoordOnMouseEvent(canvasEl, e)
      const { h, s, v } = hsv

      if (onChangeColor) {
        onChangeColor({ h, s, v, a: alpha })
      }
    }

    function handleMouseDown(e: MouseEvent) {
      setMouseDown(true)
      updateAlphaSelectorCoord(e)
    }

    function handleMouseMove(e: MouseEvent) {
      if (isMouseDown) {
        updateAlphaSelectorCoord(e)
      }
    }

    function handleMouseUp() {
      setMouseDown(false)

      const { h, s, v } = hsv

      if (onChangeColorComplete && isMouseDown) {
        onChangeColorComplete({ h, s, v, a: alpha })
      }
    }

    if (alphaSelectorEl) {
      alphaSelectorEl.addEventListener('mousedown', handleMouseDown)
    }

    if (canvasEl) {
      canvasEl.addEventListener('mousedown', handleMouseDown)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (alphaSelectorEl) {
        alphaSelectorEl.removeEventListener('mousedown', handleMouseDown)
      }

      if (canvasEl) {
        canvasEl.removeEventListener('mousedown', handleMouseDown)
      }

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [hsv, isMouseDown, alpha])

  return (
    <div
      ref={alphaSelectorRef}
      className={className}
      style={{
        position: 'absolute',
        top: '50%',
        transform: `translate(-${alphaSelectorX}%, -50%)`,
        left: `${alphaSelectorX}%`,
        ...style,
      }}
    />
  )
}
