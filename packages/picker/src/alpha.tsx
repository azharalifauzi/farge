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

export interface AlphaPointerProps {
  className?: string
  style?: React.CSSProperties
}

export const AlphaPointer: React.FC<AlphaPointerProps> = ({
  style,
  className,
}) => {
  const { alphaPointerX, onChangeColor, alpha, onChangeColorComplete, hsv } =
    useColorPicker()
  const [isMouseDown, setMouseDown] = useState(false)
  const alphaPointerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const alphaPointerEl = alphaPointerRef.current
    const canvasEl = (alphaPointerEl?.previousElementSibling ??
      alphaPointerEl?.nextElementSibling) as HTMLCanvasElement

    function updateAlphaPointerCoord(e: MouseEvent) {
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
      updateAlphaPointerCoord(e)
    }

    function handleMouseMove(e: MouseEvent) {
      if (isMouseDown) {
        updateAlphaPointerCoord(e)
      }
    }

    function handleMouseUp() {
      setMouseDown(false)

      const { h, s, v } = hsv

      if (onChangeColorComplete && isMouseDown) {
        onChangeColorComplete({ h, s, v, a: alpha })
      }
    }

    if (alphaPointerEl) {
      alphaPointerEl.addEventListener('mousedown', handleMouseDown)
    }

    if (canvasEl) {
      canvasEl.addEventListener('mousedown', handleMouseDown)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (alphaPointerEl) {
        alphaPointerEl.removeEventListener('mousedown', handleMouseDown)
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
      ref={alphaPointerRef}
      className={className}
      style={{
        position: 'absolute',
        top: '50%',
        transform: `translate(-${alphaPointerX}%, -50%)`,
        left: `${alphaPointerX}%`,
        ...style,
      }}
    />
  )
}
