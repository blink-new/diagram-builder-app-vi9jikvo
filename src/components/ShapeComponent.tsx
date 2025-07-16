import { Shape } from './DiagramBuilder'

interface ShapeComponentProps {
  shape: Shape
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onDoubleClick: () => void
}

export function ShapeComponent({ 
  shape, 
  isSelected, 
  onMouseDown, 
  onDoubleClick 
}: ShapeComponentProps) {
  const { x, y, width, height, fill, stroke, strokeWidth, text, type } = shape

  const renderShape = () => {
    const commonProps = {
      fill,
      stroke,
      strokeWidth,
      className: `cursor-move transition-all duration-150 ${isSelected ? 'drop-shadow-lg' : ''}`,
      onMouseDown,
      onDoubleClick,
      style: { userSelect: 'none' as const }
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
        style={{ 
          fontSize: Math.max(12, Math.min(16, width / 8)),
          userSelect: 'none'
        }}
      >
        {text}
      </text>
      
      {/* Selection outline and handles */}
      {isSelected && (
        <>
          {/* Selection outline */}
          <rect
            x={x - 2}
            y={y - 2}
            width={width + 4}
            height={height + 4}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="pointer-events-none animate-pulse"
            rx={type === 'rectangle' ? 6 : 0}
          />
          
          {/* Resize handles */}
          {[
            { x: x - 4, y: y - 4, cursor: 'nw-resize' }, // top-left
            { x: x + width - 4, y: y - 4, cursor: 'ne-resize' }, // top-right
            { x: x - 4, y: y + height - 4, cursor: 'sw-resize' }, // bottom-left
            { x: x + width - 4, y: y + height - 4, cursor: 'se-resize' }, // bottom-right
            { x: x + width / 2 - 4, y: y - 4, cursor: 'n-resize' }, // top-center
            { x: x + width / 2 - 4, y: y + height - 4, cursor: 's-resize' }, // bottom-center
            { x: x - 4, y: y + height / 2 - 4, cursor: 'w-resize' }, // left-center
            { x: x + width - 4, y: y + height / 2 - 4, cursor: 'e-resize' }, // right-center
          ].map((handle, index) => (
            <rect
              key={index}
              x={handle.x}
              y={handle.y}
              width={8}
              height={8}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
              className="cursor-pointer hover:scale-110 transition-transform"
              style={{ cursor: handle.cursor }}
              rx={1}
            />
          ))}
        </>
      )}
    </g>
  )
}