import { Menu } from "./Menu"

export function Navbar() {
  return (
    <nav className="h-16 bg-background border-b border-primary/30">
      <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Menu />
      </div>
    </nav>
  )
}

