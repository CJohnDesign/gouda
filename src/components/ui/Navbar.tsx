import { Menu } from "./Menu"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="mx-auto px-4">
        <div className="h-16 flex items-center">
          <Menu />
        </div>
      </div>
    </header>
  )
}

