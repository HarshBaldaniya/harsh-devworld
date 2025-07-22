"use client";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col justify-center items-center text-white">
      <motion.img
        src="/car-loader.svg"
        alt="Car Loader"
        className="w-24 h-24"
        initial={{ y: 150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.h2
        className="mt-6 text-lg tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Starting Engine...
      </motion.h2>
    </div>
  );
};

export default Loader;
