'use client'
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full px-6 py-4 z-50 bg-black/80 backdrop-blur-md text-white flex justify-between items-center">
      <h1 className="text-lg font-bold text-accent">Harsh-DevDrive</h1>
      <ul className="flex gap-6 text-sm">
        <li><Link href="#about">About</Link></li>
        <li><Link href="#projects">Projects</Link></li>
        <li><Link href="#resume">Resume</Link></li>
        <li><Link href="#testimonials">Testimonials</Link></li>
        <li><Link href="#contact">Contact</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar
