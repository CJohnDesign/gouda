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

    return (
        <>
            <button
                className="p-2 hover:bg-black/5 rounded-lg transition-colors z-50 relative"
                onClick={toggleMenu}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <MenuIcon className="h-7 w-7 text-[#262223] font-bold " />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-[#272322] bg-opacity-96 z-40 flex items-center justify-center"
                    >
                        <nav className="flex flex-col gap-8 items-center">
                            {user ? (
                                <>
                                    <Link
                                        href="/account"
                                        className="text-3xl font-bold text-white hover:text-[#de9c0e] transition-colors"
                                        onClick={toggleMenu}
                                    >
                                        Account
                                    </Link>
                                    <Link
                                        href="/studio"
                                        className="text-3xl font-bold text-white hover:text-[#de9c0e] transition-colors"
                                        onClick={toggleMenu}
                                    >
                                        Studio
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                        }}
                                        className="text-3xl font-bold text-white hover:text-[#de9c0e] transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-8 items-center">
                                    <Link 
                                        href="/" 
                                        className="text-3xl font-bold text-white hover:text-[#de9c0e] transition-colors"
                                        onClick={toggleMenu}
                                    >
                                        Home
                                    </Link>
                                    
                                    <Link 
                                        href="/login" 
                                        className="text-3xl font-bold text-white hover:text-[#de9c0e] transition-colors"
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

