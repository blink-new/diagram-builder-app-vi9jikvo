import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { DiagramBuilder } from './components/DiagramBuilder'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background">
        <DiagramBuilder />
      </div>
    </ThemeProvider>
  )
}

export default App