import { forwardRef, useCallback, useRef, useState } from 'react'
import { Shape, Connection, Tool } from './DiagramBuilder'
import { ShapeComponent } from './ShapeComponent'

interface CanvasProps {
  shapes: Shape[]
  connections: Connection[]
  selectedShapeId: string | null
  activeTool: Tool
  zoom: number
  pan: { x: number; y: number }
  onAddShape: (type: Shape['type'], x: number, y: number) => void
  onSelectShape: (id: string | null) => void
  onUpdateShape: (id: string, updates: Partial<Shape>) => void
  onDeleteShape: (id: string) => void
  onPanChange: (pan: { x: number; y: number }) => void
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  shapes,
  connections,
  selectedShapeId,
  activeTool,
  zoom,
  pan,
  onAddShape,
  onSelectShape,
  onUpdateShape,
  onDeleteShape,
  onPanChange
}, ref) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragShape, setDragShape] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom

    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond') {
      onAddShape(activeTool, x, y)
    } else if (activeTool === 'select') {
      onSelectShape(null)
    }
  }, [activeTool, zoom, pan, onAddShape, onSelectShape, isDragging])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [activeTool, pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && activeTool === 'pan') {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, activeTool, dragStart, onPanChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragShape(null)
  }, [])

  const handleShapeMouseDown = useCallback((e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation()
    if (activeTool === 'select') {
      onSelectShape(shapeId)
      setDragShape(shapeId)
      const rect = e.currentTarget.getBoundingClientRect()
      const shape = shapes.find(s => s.id === shapeId)
      if (shape) {
        setDragStart({
          x: e.clientX - shape.x * zoom - pan.x,
          y: e.clientY - shape.y * zoom - pan.y
        })
      }
    }
  }, [activeTool, onSelectShape, shapes, zoom, pan])

  const handleShapeMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragShape && activeTool === 'select') {
      const newX = (e.clientX - dragStart.x - pan.x) / zoom
      const newY = (e.clientY - dragStart.y - pan.y) / zoom
      onUpdateShape(dragShape, { x: newX, y: newY })
    }
  }, [dragShape, activeTool, dragStart, pan, zoom, onUpdateShape])

  // Grid pattern
  const gridSize = 20
  const gridPattern = (
    <defs>
      <pattern
        id="grid"
        width={gridSize}
        height={gridSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-muted-foreground/20"
        />
      </pattern>
    </defs>
  )

  return (
    <div
      ref={ref}
      className="w-full h-full bg-background cursor-crosshair overflow-hidden"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: activeTool === 'pan' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {gridPattern}
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Render connections */}
        {connections.map((connection) => (
          <line
            key={connection.id}
            x1={connection.fromPoint.x}
            y1={connection.fromPoint.y}
            x2={connection.toPoint.x}
            y2={connection.toPoint.y}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
            markerEnd="url(#arrowhead)"
          />
        ))}
        
        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="currentColor"
              className="text-foreground"
            />
          </marker>
        </defs>
        
        {/* Render shapes */}
        {shapes.map((shape) => (
          <ShapeComponent
            key={shape.id}
            shape={shape}
            isSelected={selectedShapeId === shape.id}
            onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
            onMouseMove={handleShapeMouseMove}
            onDoubleClick={() => {
              // Enable text editing
              const newText = prompt('Enter text:', shape.text)
              if (newText !== null) {
                onUpdateShape(shape.id, { text: newText })
              }
            }}
          />
        ))}
      </svg>
    </div>
  )
})