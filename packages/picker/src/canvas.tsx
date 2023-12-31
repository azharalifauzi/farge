import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { useColorPicker } from './hooks'
import { drawCanvas, minmax } from './utils'
import { hsvToRgb } from '@ctrl/tinycolor'

export interface CanvasContainerProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const CanvasContainer = forwardRef<HTMLDivElement, CanvasContainerProps>(
  ({ children, style, ...otherProps }, ref) => {
    return (
      <div
        ref={ref}
        style={{ position: 'relative', userSelect: 'none', ...style }}
        {...otherProps}
      >
        {children}
      </div>
    )
  }
)

function getSaturationAndValueOnMouseEvent(
  canvasEl: HTMLCanvasElement,
  e: MouseEvent
) {
  const canvasBbox = canvasEl.getBoundingClientRect()

  let localX = e.clientX - canvasBbox.x
  let localY = e.clientY - canvasBbox.y

  localX = minmax(localX, 0, canvasBbox.width)
  localY = minmax(localY, 0, canvasBbox.height)

  const s = Math.round((localX / canvasBbox.width) * 100)
  const v = Math.round(100 - (localY / canvasBbox.height) * 100)

  return { s, v }
}

export interface CanvasProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  > {}

export const Canvas: React.FC<CanvasProps> = (props) => {
  const { hsv } = useColorPicker()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (canvas) {
      const { r, g, b } = hsvToRgb(hsv.h, 100, 1000)
      drawCanvas(canvas, `rgb(${r}, ${g}, ${b})`)
    }
  }, [hsv.h])

  return <canvas draggable="false" ref={canvasRef} {...props} />
}

export interface ColorSelectorProps {
  className?: string
  style?: React.CSSProperties
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  className,
  style,
}) => {
  const {
    colorSelector,
    onChangeColor,
    onChangeColorComplete,
    hsv,
    rgb,
    alpha,
  } = useColorPicker()
  const colorSelectorRef = useRef<HTMLDivElement>(null)
  const [isMouseDown, setMouseDown] = useState(false)

  useEffect(() => {
    const colorSelectorEl = colorSelectorRef.current
    const canvasEl = (colorSelectorEl?.nextElementSibling ??
      colorSelectorEl?.previousElementSibling) as HTMLCanvasElement

    function updateColorSelectorCoord(e: MouseEvent) {
      if (!canvasEl || canvasEl.tagName !== 'CANVAS') {
        return
      }

      const { s, v } = getSaturationAndValueOnMouseEvent(canvasEl, e)

      if (onChangeColor) {
        onChangeColor({ h: hsv.h, s, v, a: alpha })
      }
    }

    function handleMouseDown(e: MouseEvent) {
      setMouseDown(true)
      updateColorSelectorCoord(e)
    }

    function handleMouseMove(e: MouseEvent) {
      if (isMouseDown) {
        updateColorSelectorCoord(e)
      }
    }

    function handleMouseUp() {
      setMouseDown(false)

      const { h, s, v } = hsv

      if (onChangeColorComplete && isMouseDown) {
        onChangeColorComplete({ h, s, v, a: alpha })
      }
    }

    if (colorSelectorEl) {
      colorSelectorEl.addEventListener('mousedown', handleMouseDown)
    }

    if (canvasEl) {
      canvasEl.addEventListener('mousedown', handleMouseDown)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      if (colorSelectorEl) {
        colorSelectorEl.removeEventListener('mousedown', handleMouseDown)
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
      ref={colorSelectorRef}
      className={className}
      style={{
        top: `${colorSelector.y}%`,
        left: `${colorSelector.x}%`,
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        background: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        ...style,
      }}
    />
  )
}
