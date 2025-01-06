export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Gouda. All rights reserved.
        </p>
      </div>
    </footer>
  )
} 