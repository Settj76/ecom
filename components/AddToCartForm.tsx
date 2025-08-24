'use client'; // This is a client component for state and user interactions.

import { useState } from 'react';
import { Product } from './ProductCard'; // Assuming Product type is exported from here
import { ShoppingCart, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * --- ADD TO CART FORM ---
 * A client component that handles adding a product to the cart.
 * It manages quantity and provides user feedback on success.
 */
const AddToCartForm = ({ product }: { product: Product }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        // In a real app, this would dispatch an action to a global cart context/store.
        console.log(`Added ${quantity} of ${product.name} to cart.`);

        // Provide user feedback
        toast.success(`${product.name} added to cart!`);
        setIsAdded(true);

        // Reset the "Added" state after a couple of seconds
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-medium text-gray-900">
                    Quantity
                </label>
                <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                >
                    {/* Generate options from 1 up to the available stock, max 10 */}
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdded}
                className={`flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isAdded
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : product.stock > 0
                        ? 'bg-slate-800 hover:bg-slate-900 focus:ring-slate-500'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                {isAdded ? (
                    <>
                        <Check className="mr-2 h-5 w-5" />
                        Added!
                    </>
                ) : product.stock > 0 ? (
                    <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </>
                ) : (
                    'Out of Stock'
                )}
            </button>
        </div>
    );
};

export default AddToCartForm;
