"use client";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="h-screen flex flex-col justify-center items-center px-4 text-center">
      <motion.h1
        className="text-5xl font-bold text-accent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Harsh Baldaniya
      </motion.h1>
      <motion.p
        className="text-gray-400 mt-4 max-w-xl text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Full Stack Developer 🚗 Driving Code Like a BMW – Smooth, Fast, and
        Efficient.
      </motion.p>
    </section>
  );
};

export default Hero;
