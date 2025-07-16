import { useState, useRef, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { 
  Sun, 
  Moon, 
  Square, 
  Circle, 
  Diamond, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Move,
  MousePointer
} from 'lucide-react'
import { Canvas } from './Canvas'
import { Toolbar } from './Toolbar'
import { PropertiesPanel } from './PropertiesPanel'

export interface Shape {
  id: string
  type: 'rectangle' | 'circle' | 'diamond'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  text: string
}

export interface Connection {
  id: string
  from: string
  to: string
  fromPoint: { x: number; y: number }
  toPoint: { x: number; y: number }
}

export type Tool = 'select' | 'rectangle' | 'circle' | 'diamond' | 'pan'

export function DiagramBuilder() {
  const { theme, setTheme } = useTheme()
  const [shapes, setShapes] = useState<Shape[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedShape = shapes.find(shape => shape.id === selectedShapeId)

  const handleAddShape = useCallback((type: Shape['type'], x: number, y: number) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type,
      x: x - 50,
      y: y - 25,
      width: 100,
      height: 50,
      fill: theme === 'dark' ? '#374151' : '#f3f4f6',
      stroke: theme === 'dark' ? '#6b7280' : '#9ca3af',
      strokeWidth: 2,
      text: type.charAt(0).toUpperCase() + type.slice(1)
    }
    setShapes(prev => [...prev, newShape])
    setSelectedShapeId(newShape.id)
  }, [theme])

  const handleUpdateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes(prev => prev.map(shape => 
      shape.id === id ? { ...shape, ...updates } : shape
    ))
  }, [])

  const handleDeleteShape = useCallback((id: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== id))
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id))
    if (selectedShapeId === id) {
      setSelectedShapeId(null)
    }
  }, [selectedShapeId])

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))

  const handleExport = () => {
    const data = { shapes, connections, zoom, pan }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Diagram Builder</h1>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Button
              variant={activeTool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('select')}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'pan' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTool('pan')}
            >
              <Move className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
            <Moon className="w-4 h-4" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas
            ref={canvasRef}
            shapes={shapes}
            connections={connections}
            selectedShapeId={selectedShapeId}
            activeTool={activeTool}
            zoom={zoom}
            pan={pan}
            onAddShape={handleAddShape}
            onSelectShape={setSelectedShapeId}
            onUpdateShape={handleUpdateShape}
            onDeleteShape={handleDeleteShape}
            onPanChange={setPan}
          />
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel
          selectedShape={selectedShape}
          onUpdateShape={handleUpdateShape}
          onDeleteShape={handleDeleteShape}
        />
      </div>
    </div>
  )
}