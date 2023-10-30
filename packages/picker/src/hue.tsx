/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { RefObject, useEffect, useState } from 'react'
import { drawHue, minmax } from './utils'
import { useColorPicker } from './hooks'

export interface HueContainerProps {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const HueContainer: React.FC<HueContainerProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{ position: 'relative', userSelect: 'none', ...style }}
    >
      {children}
    </div>
  )
}

// @ts-ignore
HueContainer.id = 'HueContainer'
HueContainer.displayName = 'HueContainer'

function getHueOnMouseEvent(canvas: HTMLCanvasElement, e: MouseEvent) {
  const canvasBbox = canvas.getBoundingClientRect()

  let localHueX = e.clientX - canvasBbox.left
  localHueX = minmax(localHueX, 0, canvasBbox.width)
  const hue = Math.round((localHueX / canvasBbox.width) * 360)

  return { hue }
}

export interface HueProps {
  className?: string
  style?: React.CSSProperties
}

export const HueCanvas: React.FC<HueProps> = ({ className, style }) => {
  const { hueCanvasRef: canvasRef } = useColorPicker()

  useEffect(() => {
    const canvasEl = canvasRef.current

    if (canvasEl) {
      const { height, width } = canvasEl.getBoundingClientRect()
      canvasEl.width = width
      canvasEl.height = height

      drawHue(canvasEl)
    }
  }, [])

  return (
    <canvas
      tabIndex={0}
      draggable="false"
      ref={canvasRef}
      className={className}
      style={style}
    />
  )
}

export interface HuePointerProps {
  className?: string
  style?: React.CSSProperties
}

export const HuePointer: React.FC<HuePointerProps> = ({ className, style }) => {
  const {
    hsv,
    onChangeColor,
    onChangeColorComplete,
    huePointerX,
    alpha,
    huePointerRef,
    hueCanvasRef,
  } = useColorPicker()
  const [isMouseDown, setMouseDown] = useState(false)

  useEffect(() => {
    const huePointerEl = huePointerRef.current
    const canvasEl = hueCanvasRef.current

    function updateHuePointerCoord(e: MouseEvent) {
      if (!canvasEl || canvasEl.tagName !== 'CANVAS') {
        return
      }

      const { hue } = getHueOnMouseEvent(canvasEl, e)

      if (onChangeColor) {
        onChangeColor({ h: hue, s: hsv.s, v: hsv.v, a: alpha })
      }
    }

    function handleMouseDown(e: MouseEvent) {
      setMouseDown(true)
      updateHuePointerCoord(e)
    }

    function handleMouseMove(e: MouseEvent) {
      if (isMouseDown) {
        updateHuePointerCoord(e)
      }
    }

    function handleMouseUp() {
      setMouseDown(false)

      const { h, s, v } = hsv

      if (onChangeColorComplete && isMouseDown) {
        onChangeColorComplete({ h, s, v, a: alpha })
      }
    }

    if (canvasEl) {
      canvasEl.addEventListener('mousedown', handleMouseDown)
    }

    if (huePointerEl) {
      huePointerEl.addEventListener('mousedown', handleMouseDown)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (canvasEl) {
        canvasEl.removeEventListener('mousedown', handleMouseDown)
      }

      if (huePointerEl) {
        huePointerEl.removeEventListener('mousedown', handleMouseDown)
      }

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [hsv, isMouseDown, alpha, onChangeColor, onChangeColorComplete])

  return (
    <div
      ref={huePointerRef as RefObject<HTMLDivElement>}
      className={className}
      style={{
        position: 'absolute',
        transform: `translate(0, -50%)`,
        top: '50%',
        left: `${huePointerX}%`,
        ...style,
      }}
    />
  )
}

// @ts-ignore
HuePointer.id = 'HuePointer'
