import Gradient from '@farge/gradient'
import FigmaColorPicker from '@/components/figma-color-picker'

export default function Page() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Color Picker Project</h1>
      <div style={{ width: 250, height: 16, marginBottom: 12 }}>
        <Gradient />
      </div>
      <FigmaColorPicker />
    </div>
  )
}
