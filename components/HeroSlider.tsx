"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Define the structure for a single slide
interface Slide {
    imageUrl: string;
    title: string;
    subtitle: string;
    link: string;
    alt: string;
}

// Array of slides with placeholder content and images
const slides: Slide[] = [
    {
        imageUrl: 'https://placehold.co/1200x500/3498db/ffffff?text=Summer+Sale',
        title: 'Huge Summer Sale!',
        subtitle: 'Up to 50% off on selected items. Dont miss out!',
        link: '/products/sale',
        alt: 'Summer sale promotion'
    },
    {
        imageUrl: 'https://placehold.co/1200x500/2ecc71/ffffff?text=New+Arrivals',
        title: 'Check Out Our New Arrivals',
        subtitle: 'The latest trends in fashion and electronics.',
        link: '/products/new',
        alt: 'New arrivals promotion'
    },
    {
        imageUrl: 'https://placehold.co/1200x500/e74c3c/ffffff?text=Free+Shipping',
        title: 'Free Shipping On All Orders',
        subtitle: 'Get your items delivered to your doorstep for free.',
        link: '/cart',
        alt: 'Free shipping promotion'
    },
];

// Animation variants for the slide transitions
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
};

export default function HeroSlider() {
    const [[page, direction], setPage] = useState([0, 0]);

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };

    // Wrap the page index for infinite looping
    const imageIndex = (page % slides.length + slides.length) % slides.length;

    // Automatically advance to the next slide every 5 seconds
    useEffect(() => {
        const slideInterval = setInterval(() => paginate(1), 5000);
        return () => clearInterval(slideInterval);
    }, [page]);

    return (
        <div className="relative w-full h-[500px] mx-auto overflow-hidden rounded-lg shadow-2xl flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    className="absolute w-full h-full"
                >
                    <div className="relative w-full h-full">
                        <img
                            src={slides[imageIndex].imageUrl}
                            alt={slides[imageIndex].alt}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src='https://placehold.co/1200x500/cccccc/ffffff?text=Image+Not+Found';
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50 p-4">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
                            >
                                {slides[imageIndex].title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-lg md:text-xl mb-6 max-w-2xl drop-shadow-md"
                            >
                                {slides[imageIndex].subtitle}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <Link href={slides[imageIndex].link}>
                  <span className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                    Shop Now
                  </span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                onClick={() => paginate(-1)}
                className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-800 p-2 rounded-full shadow-md transition"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
                onClick={() => paginate(1)}
                className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-800 p-2 rounded-full shadow-md transition"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setPage([index, index > imageIndex ? 1 : -1])}
                        className={`w-3 h-3 rounded-full transition ${imageIndex === index ? 'bg-blue-600' : 'bg-white/50'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
