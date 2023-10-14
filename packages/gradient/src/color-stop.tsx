import { TinyColor } from '@ctrl/tinycolor'
import React, { useEffect, useMemo, useRef } from 'react'
import { drawTransparentBg } from './utils'

interface ColorStopProps {
  position: number
  color: string
  isActive: boolean
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const ColorStop: React.FC<ColorStopProps> = ({
  color,
  isActive,
  position,
  onClick,
  onMouseDown,
}) => {
  const outline = isActive ? '2px solid #469BE9' : '1px solid #bbb'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current

    if (canvasEl) {
      drawTransparentBg(canvasEl, 6)
    }
  }, [])

  const { rgb, alpha } = useMemo(() => {
    const { r, g, b, a } = new TinyColor(color).toRgb()

    return {
      alpha: a,
      rgb: `rgb(${r}, ${g}, ${b})`,
    }
  }, [color])

  return (
    <div
      style={{
        position: 'absolute',
        left: position * 100 + '%',
        top: -32,
        height: 16,
        width: 16,
        transform: 'translateX(-50%)',
        outline,
        borderRadius: 2,
        padding: 3,
        cursor: 'pointer',
        background: 'white',
        zIndex: isActive ? 99999 : 1,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        style={{
          background: rgb,
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: rgb,
            opacity: alpha,
            position: 'absolute',
            width: '50%',
            left: '50%',
            height: '100%',
            zIndex: 1,
          }}
        />
        {alpha < 1 && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'relative',
              width: '50%',
              left: '50%',
              height: '100%',
            }}
          />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'white',
          zIndex: 1,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          bottom: -4,
          height: 6,
          width: 6,
          borderRight: outline,
          borderBottom: outline,
          background: isActive ? '#469BE9' : 'white',
        }}
      />
    </div>
  )
}

export default ColorStop
