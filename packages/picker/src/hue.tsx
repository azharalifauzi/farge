import React, { useEffect, useRef, useState } from 'react'
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

function getHueOnMouseEvent(canvas: HTMLCanvasElement, e: MouseEvent) {
  const canvasBbox = canvas.getBoundingClientRect()

  let localX = e.clientX - canvasBbox.left
  localX = minmax(localX, 0, canvasBbox.width)

  const hue = Math.round((localX / canvasBbox.width) * 360)
  return hue
}

export interface HueProps {
  className?: string
  style?: React.CSSProperties
}

export const HueCanvas: React.FC<HueProps> = ({ className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

export interface HueSelectorProps {
  className?: string
  style?: React.CSSProperties
}

export const HueSelector: React.FC<HueSelectorProps> = ({
  className,
  style,
}) => {
  const { hsv, onChangeColor, onChangeColorComplete, hueSelectorX, alpha } =
    useColorPicker()
  const [isMouseDown, setMouseDown] = useState(false)

  const hueSelectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hueSelectorEl = hueSelectorRef.current
    const canvasEl = (hueSelectorEl?.nextElementSibling ||
      hueSelectorEl?.previousElementSibling) as HTMLCanvasElement

    function updateHueSelectorCoord(e: MouseEvent) {
      if (!canvasEl || canvasEl.tagName !== 'CANVAS') {
        return
      }

      const hue = getHueOnMouseEvent(canvasEl, e)

      if (onChangeColor) {
        onChangeColor({ h: hue, s: hsv.s, v: hsv.v, a: alpha })
      }
    }

    function handleMouseDown(e: MouseEvent) {
      setMouseDown(true)
      updateHueSelectorCoord(e)
    }

    function handleMouseMove(e: MouseEvent) {
      if (isMouseDown) {
        updateHueSelectorCoord(e)
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

    if (hueSelectorEl) {
      hueSelectorEl.addEventListener('mousedown', handleMouseDown)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (canvasEl) {
        canvasEl.removeEventListener('mousedown', handleMouseDown)
      }

      if (hueSelectorEl) {
        hueSelectorEl.removeEventListener('mousedown', handleMouseDown)
      }

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [hsv, isMouseDown, alpha])

  return (
    <div
      ref={hueSelectorRef}
      className={className}
      style={{
        position: 'absolute',
        transform: `translate(-${hueSelectorX}%, -50%)`,
        top: '50%',
        left: `${hueSelectorX}%`,
        ...style,
      }}
    />
  )
}
