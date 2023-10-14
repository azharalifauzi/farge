import {
  Alpha,
  AlphaContainer,
  AlphaPointer,
  Canvas,
  CanvasContainer,
  ColorPicker,
  ColorPointer,
  HueCanvas,
  HueContainer,
  HuePointer,
} from '@farge/picker'

export default function Page() {
  return (
    <>
      <h1>Color Picker Project</h1>
      <ColorPicker color="hsva(355,100,100,0.75)">
        <CanvasContainer style={{ width: 250, height: 250 }}>
          <Canvas style={{ width: '100%', height: '100%' }} />
          <ColorPointer
            style={{
              width: 12,
              height: 12,
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          />
        </CanvasContainer>
        <HueContainer
          style={{
            width: 200,
            height: 12,
            marginTop: 8,
            marginLeft: 50,
            marginBottom: 8,
          }}
        >
          <HueCanvas
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 999,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <HuePointer
            style={{
              width: 10,
              height: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: '50%',
              cursor: 'pointer',
              border: '2px solid white',
            }}
          />
        </HueContainer>
        <AlphaContainer style={{ width: 200, height: 12, marginLeft: 50 }}>
          <Alpha
            style={{
              width: '100%',
              height: 12,
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 999,
            }}
          />
          <AlphaPointer
            style={{
              width: 10,
              height: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: '50%',
              cursor: 'pointer',
              border: '2px solid white',
            }}
          />
        </AlphaContainer>
      </ColorPicker>
    </>
  )
}
