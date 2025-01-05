'use client'

import { useState, useEffect } from 'react'
import { MenuIcon, X } from 'lucide-react'
import Link from "next/link"
import { motion, AnimatePresence } from 'framer-motion'
import { getAuth, signOut, User } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import { useRouter } from 'next/navigation'

export function Menu() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()
    const auth = getAuth(app)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user)
        })

        return () => unsubscribe()
    }, [auth])

    const toggleMenu = () => setIsOpen(!isOpen)

    const handleLogout = async () => {
        try {
            await signOut(auth)
            router.push('/') // Redirect to home after logout
            setIsOpen(false)
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const menuLinkClasses = "text-3xl font-bold text-white hover:text-primary transition-colors"

    return (
        <>
            <button
                className="p-2 hover:bg-muted rounded-lg transition-colors z-50 relative"
                onClick={toggleMenu}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-foreground" />
                ) : (
                    <MenuIcon className="h-6 w-6 text-foreground" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-[hsl(220,13%,8%)] z-40 flex items-center justify-center"
                    >
                        <nav className="flex flex-col gap-8 items-center">
                            {user ? (
                                <>
                                    <Link 
                                        href="/songbook" 
                                        className={menuLinkClasses}
                                        onClick={toggleMenu}
                                    >
                                        Songbook
                                    </Link>
                                    <Link
                                        href="/account/profile"
                                        className={menuLinkClasses}
                                        onClick={toggleMenu}
                                    >
                                        Account
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className={menuLinkClasses}
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-8 items-center">
                                    <Link 
                                        href="/songbook" 
                                        className={menuLinkClasses}
                                        onClick={toggleMenu}
                                    >
                                        Songbook
                                    </Link>
                                    <Link 
                                        href="/" 
                                        className={menuLinkClasses}
                                        onClick={toggleMenu}
                                    >
                                        Home
                                    </Link>
                                    <Link 
                                        href="/login" 
                                        className={menuLinkClasses}
                                        onClick={toggleMenu}
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

