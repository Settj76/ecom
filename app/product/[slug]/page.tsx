import pb from '@/lib/pocketbase';
import { Product } from '@/components/ProductCard'; // Reuse the Product type
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartForm from '@/components/AddToCartForm';

// This tells Next.js to fetch data dynamically on every request.
export const dynamic = 'force-dynamic';

/**
 * --- SERVER-SIDE DATA FETCHING ---
 * Fetches the details for a single product from PocketBase using its unique slug.
 */
async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        // Use getFirstListItem with a filter to find the product by its slug.
        const record = await pb.collection('products').getFirstListItem<Product>(`slug="${slug}"`);
        return record;
    } catch (error) {
        // If PocketBase throws an error (especially a 404), it means the product wasn't found.
        console.error(`Product with slug "${slug}" not found:`, error);
        return null;
    }
}

/**
 * --- PRODUCT DETAIL PAGE ---
 * This is an async Server Component that displays a single product.
 * It now uses `params.slug` to fetch the product data.
 */
export default async function Page({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);

    // If the product is not found, render the 404 page.
    if (!product) {
        notFound();
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_PB_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`;

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="bg-white">
            <div className="pt-6">
                <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
                    {/* Left Column: Product Image */}
                    <div className="lg:col-span-1 lg:border-r lg:border-gray-200 lg:pr-8">
                        <div className="aspect-h-4 aspect-w-3 overflow-hidden rounded-lg">
                            <Image
                                src={imageUrl}
                                alt={product.name}
                                width={800}
                                height={1000}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="mt-4 lg:row-span-3 lg:mt-0">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>

                        <p className="text-3xl tracking-tight text-gray-900 mt-4">{formatPrice(product.price)}</p>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div
                                className="space-y-6 text-base text-gray-900"
                                // Using dangerouslySetInnerHTML is okay here if you trust the source of your descriptions.
                                // For user-generated content, you should use a library like 'dompurify' to sanitize it.
                                dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}
                            />
                        </div>

                        {/* Add to Cart Form (Client Component) */}
                        <div className="mt-10">
                            <AddToCartForm product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
