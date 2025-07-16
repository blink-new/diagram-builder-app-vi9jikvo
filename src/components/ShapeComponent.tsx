import { Shape } from './DiagramBuilder'

interface ShapeComponentProps {
  shape: Shape
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onDoubleClick: () => void
}

export function ShapeComponent({ 
  shape, 
  isSelected, 
  onMouseDown, 
  onMouseMove, 
  onDoubleClick 
}: ShapeComponentProps) {
  const { x, y, width, height, fill, stroke, strokeWidth, text, type } = shape

  const renderShape = () => {
    const commonProps = {
      fill,
      stroke,
      strokeWidth,
      className: `cursor-move ${isSelected ? 'drop-shadow-lg' : ''}`,
      onMouseDown,
      onMouseMove,
      onDoubleClick
    }

    switch (type) {
      case 'rectangle':
        return (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={4}
            {...commonProps}
          />
        )
      
      case 'circle':
        return (
          <ellipse
            cx={x + width / 2}
            cy={y + height / 2}
            rx={width / 2}
            ry={height / 2}
            {...commonProps}
          />
        )
      
      case 'diamond': {
        const centerX = x + width / 2
        const centerY = y + height / 2
        const points = `${centerX},${y} ${x + width},${centerY} ${centerX},${y + height} ${x},${centerY}`
        return (
          <polygon
            points={points}
            {...commonProps}
          />
        )
      }
      
      default:
        return null
    }
  }

  return (
    <g>
      {renderShape()}
      
      {/* Text */}
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-sm font-medium pointer-events-none select-none"
        style={{ fontSize: '14px' }}
      >
        {text}
      </text>
      
      {/* Selection outline */}
      {isSelected && (
        <>
          <rect
            x={x - 2}
            y={y - 2}
            width={width + 4}
            height={height + 4}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="pointer-events-none"
          />
          
          {/* Resize handles */}
          {[
            { x: x - 4, y: y - 4 }, // top-left
            { x: x + width - 4, y: y - 4 }, // top-right
            { x: x - 4, y: y + height - 4 }, // bottom-left
            { x: x + width - 4, y: y + height - 4 }, // bottom-right
            { x: x + width / 2 - 4, y: y - 4 }, // top-center
            { x: x + width / 2 - 4, y: y + height - 4 }, // bottom-center
            { x: x - 4, y: y + height / 2 - 4 }, // left-center
            { x: x + width - 4, y: y + height / 2 - 4 }, // right-center
          ].map((handle, index) => (
            <rect
              key={index}
              x={handle.x}
              y={handle.y}
              width={8}
              height={8}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="1"
              className="cursor-nw-resize"
            />
          ))}
        </>
      )}
    </g>
  )
}