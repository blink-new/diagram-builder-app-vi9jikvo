import { forwardRef, useCallback, useRef, useState, useEffect } from 'react'
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

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>((props, ref) => {
  const {
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
  } = props

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragShape, setDragShape] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom
    }
  }, [zoom, pan])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    if (activeTool === 'pan') {
      setIsPanning(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [activeTool, pan])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && activeTool === 'pan') {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
    
    if (dragShape && activeTool === 'select') {
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      onUpdateShape(dragShape, { 
        x: canvasPos.x - dragStart.x, 
        y: canvasPos.y - dragStart.y 
      })
    }
  }, [isPanning, activeTool, dragStart, onPanChange, dragShape, screenToCanvas, onUpdateShape])

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false)
    setIsDragging(false)
    setDragShape(null)
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || isPanning) return
    
    const canvasPos = screenToCanvas(e.clientX, e.clientY)

    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond') {
      onAddShape(activeTool, canvasPos.x, canvasPos.y)
    } else if (activeTool === 'select') {
      onSelectShape(null)
    }
  }, [activeTool, screenToCanvas, onAddShape, onSelectShape, isDragging, isPanning])

  const handleShapeMouseDown = useCallback((e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation()
    
    if (activeTool === 'select') {
      onSelectShape(shapeId)
      setDragShape(shapeId)
      setIsDragging(true)
      
      const shape = shapes.find(s => s.id === shapeId)
      if (shape) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY)
        setDragStart({
          x: canvasPos.x - shape.x,
          y: canvasPos.y - shape.y
        })
      }
    }
  }, [activeTool, onSelectShape, shapes, screenToCanvas])

  // Add global mouse event listeners for better drag handling
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning && activeTool === 'pan') {
        onPanChange({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
      
      if (dragShape && activeTool === 'select') {
        const canvasPos = screenToCanvas(e.clientX, e.clientY)
        onUpdateShape(dragShape, { 
          x: canvasPos.x - dragStart.x, 
          y: canvasPos.y - dragStart.y 
        })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsPanning(false)
      setIsDragging(false)
      setDragShape(null)
    }

    if (isPanning || dragShape) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isPanning, dragShape, activeTool, dragStart, onPanChange, screenToCanvas, onUpdateShape])

  // Grid pattern
  const gridSize = 20 * zoom
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

  const getCursor = () => {
    if (activeTool === 'pan') return isPanning ? 'grabbing' : 'grab'
    if (activeTool === 'select') return dragShape ? 'grabbing' : 'default'
    return 'crosshair'
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-background overflow-hidden relative"
      style={{ cursor: getCursor() }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onClick={handleCanvasClick}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {gridPattern}
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#grid)" 
          className="pointer-events-none" 
        />
        
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
            onDoubleClick={() => {
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

Canvas.displayName = 'Canvas'