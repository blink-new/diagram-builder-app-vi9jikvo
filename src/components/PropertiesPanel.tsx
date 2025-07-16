import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Trash2 } from 'lucide-react'
import { Shape } from './DiagramBuilder'

interface PropertiesPanelProps {
  selectedShape: Shape | undefined
  onUpdateShape: (id: string, updates: Partial<Shape>) => void
  onDeleteShape: (id: string) => void
}

export function PropertiesPanel({ 
  selectedShape, 
  onUpdateShape, 
  onDeleteShape 
}: PropertiesPanelProps) {
  if (!selectedShape) {
    return (
      <Card className="w-80 m-2">
        <CardHeader>
          <CardTitle className="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a shape to edit its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleInputChange = (field: keyof Shape, value: string | number) => {
    onUpdateShape(selectedShape.id, { [field]: value })
  }

  return (
    <Card className="w-80 m-2">
      <CardHeader>
        <CardTitle className="text-sm">Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shape Info */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Shape Type
          </Label>
          <p className="text-sm capitalize">{selectedShape.type}</p>
        </div>

        <Separator />

        {/* Text */}
        <div className="space-y-2">
          <Label htmlFor="text" className="text-xs font-medium">
            Text
          </Label>
          <Input
            id="text"
            value={selectedShape.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Enter text..."
          />
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="x" className="text-xs font-medium">
              X Position
            </Label>
            <Input
              id="x"
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="y" className="text-xs font-medium">
              Y Position
            </Label>
            <Input
              id="y"
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="width" className="text-xs font-medium">
              Width
            </Label>
            <Input
              id="width"
              type="number"
              value={selectedShape.width}
              onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height" className="text-xs font-medium">
              Height
            </Label>
            <Input
              id="height"
              type="number"
              value={selectedShape.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <Label htmlFor="fill" className="text-xs font-medium">
            Fill Color
          </Label>
          <div className="flex gap-2">
            <Input
              id="fill"
              type="color"
              value={selectedShape.fill}
              onChange={(e) => handleInputChange('fill', e.target.value)}
              className="w-12 h-8 p-1 border rounded"
            />
            <Input
              value={selectedShape.fill}
              onChange={(e) => handleInputChange('fill', e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stroke" className="text-xs font-medium">
            Stroke Color
          </Label>
          <div className="flex gap-2">
            <Input
              id="stroke"
              type="color"
              value={selectedShape.stroke}
              onChange={(e) => handleInputChange('stroke', e.target.value)}
              className="w-12 h-8 p-1 border rounded"
            />
            <Input
              value={selectedShape.stroke}
              onChange={(e) => handleInputChange('stroke', e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="strokeWidth" className="text-xs font-medium">
            Stroke Width
          </Label>
          <Input
            id="strokeWidth"
            type="number"
            value={selectedShape.strokeWidth}
            onChange={(e) => handleInputChange('strokeWidth', parseInt(e.target.value) || 0)}
            min="0"
            max="10"
          />
        </div>

        <Separator />

        {/* Actions */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteShape(selectedShape.id)}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Shape
        </Button>
      </CardContent>
    </Card>
  )
}