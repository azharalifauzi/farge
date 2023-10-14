import React, { RefObject, useEffect, useState } from 'react'
import { drawAlpha, minmax } from './utils'
import { useColorPicker } from './hooks'

function getAlphaCoordOnMouseEvent(
  canvas: HTMLCanvasElement,
  pointerEl: HTMLElement,
  e: MouseEvent
) {
  const canvasBbox = canvas.getBoundingClientRect()

  let localAlphaX = e.clientX - canvasBbox.left
  localAlphaX = minmax(localAlphaX, 0, canvasBbox.width)

  let localPointerX = e.clientX - canvasBbox.left - pointerEl.offsetWidth / 2
  localPointerX = minmax(
    localPointerX,
    -pointerEl.offsetWidth / 2,
    canvasBbox.width - pointerEl.offsetWidth
  )

  let pointerX = (localPointerX / canvasBbox.width) * 100
  pointerX = minmax(pointerX, 0, 100)

  const alpha = parseFloat((localAlphaX / canvasBbox.width).toFixed(2))

  return { alpha, pointerX }
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
  const { alphaCanvasRef: canvasRef } = useColorPicker()

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
  const {
    alphaPointerX,
    onChangeColor,
    alpha,
    onChangeColorComplete,
    hsv,
    alphaPointerRef,
    alphaCanvasRef,
  } = useColorPicker()
  const [isMouseDown, setMouseDown] = useState(false)

  useEffect(() => {
    const alphaPointerEl = alphaPointerRef.current
    const canvasEl = alphaCanvasRef.current

    function updateAlphaPointerCoord(e: MouseEvent) {
      if (!canvasEl || canvasEl.tagName !== 'CANVAS' || !alphaPointerEl) {
        return
      }

      const { alpha, pointerX } = getAlphaCoordOnMouseEvent(
        canvasEl,
        alphaPointerEl,
        e
      )
      const { h, s, v } = hsv

      if (onChangeColor) {
        onChangeColor({ h, s, v, a: alpha }, undefined, pointerX)
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
      ref={alphaPointerRef as RefObject<HTMLDivElement>}
      className={className}
      style={{
        position: 'absolute',
        top: '50%',
        transform: `translate(0, -50%)`,
        left: `${alphaPointerX}%`,
        ...style,
      }}
    />
  )
}
