'use client'; // Mark this as a Client Component because it contains interactive elements.

import Link from 'next/link';
import Image from 'next/image';

/**
 * --- UPDATED TYPE DEFINITION ---
 * The Product interface now includes the 'slug' field.
 */
export interface Product {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    slug: string; // The new slug field
}

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = `${process.env.NEXT_PUBLIC_PB_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`;

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log(`Added ${product.name} to cart!`);
        // Add your cart logic here
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
            {/* --- UPDATED LINK --- */}
            {/* The link now uses the product's slug for a clean, SEO-friendly URL. */}
            <Link href={`/product/${product.slug}`} className="flex flex-col h-full">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                    <Image
                        src={imageUrl}
                        alt={`Image of ${product.name}`}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-85"
                        onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/400x400/f3f4f6/9ca3af?text=Image+Not+Found`;
                        }}
                    />
                </div>

                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-gray-800" title={product.name}>
                        {product.name}
                    </h3>
                    <div className="flex-grow" />
                    <p className="mt-2 text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                    </p>
                </div>
            </Link>

            <div className="p-4 pt-0 mt-auto">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="w-full rounded-md border border-transparent bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
