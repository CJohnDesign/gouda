import { Menu } from "./Menu"

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="px-4 h-16 flex items-center">
        <Menu />
      </div>
    </div>
  )
}

