import { Button } from './ui/button'
import { Card } from './ui/card'
import { Separator } from './ui/separator'
import { Square, Circle, Diamond, MousePointer, Move } from 'lucide-react'
import { Tool } from './DiagramBuilder'

interface ToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
}

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select' },
    { id: 'pan' as Tool, icon: Move, label: 'Pan' },
  ]

  const shapes = [
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'diamond' as Tool, icon: Diamond, label: 'Diamond' },
  ]

  return (
    <Card className="w-16 m-2 p-2 flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            className="w-full h-10 p-0"
            onClick={() => onToolChange(tool.id)}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
      
      <Separator />
      
      <div className="flex flex-col gap-1">
        {shapes.map((shape) => (
          <Button
            key={shape.id}
            variant={activeTool === shape.id ? 'default' : 'ghost'}
            size="sm"
            className="w-full h-10 p-0"
            onClick={() => onToolChange(shape.id)}
            title={shape.label}
          >
            <shape.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    </Card>
  )
}