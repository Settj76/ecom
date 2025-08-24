import HeroSlider from "@/components/HeroSlider";
import ProductCard, { Product } from "@/components/ProductCard"; // Import ProductCard and its type
import pb from '@/lib/pocketbase'; // Import your PocketBase client

/**
 * --- NEXT.JS PAGE CONFIGURATION ---
 * 'force-dynamic' tells Next.js to fetch data on every request, ensuring
 * your homepage always shows the most up-to-date product list.
 * For better performance in production, you might consider time-based revalidation:
 * export const revalidate = 300; // Re-fetch data at most once every 5 minutes (300 seconds)
 */
export const dynamic = 'force-dynamic';

/**
 * --- SERVER-SIDE DATA FETCHING ---
 * This async function runs on the server to get products from your PocketBase collection.
 */
async function getFeaturedProducts(): Promise<Product[]> {
    try {
        // Fetch the first 8 products, sorted by the most recently created.
        const resultList = await pb.collection('products').getList<Product>(1, 8, {
            sort: '-created',
        });
        return resultList.items;
    } catch (error: any) { // Using 'any' to inspect the error object more freely
        // --- ENHANCED ERROR LOGGING ---
        // This will print a detailed debug guide to your server console (the terminal where you ran `npm run dev`).
        console.error("\n--- POCKETBASE FETCH ERROR ---");
        console.error("Failed to fetch featured products. This is often a connection or configuration issue.");
        console.error("Please check the following:");
        console.error(`1. Is your PocketBase server running at the correct address?`);
        console.error(`2. Is the URL in your .env.local file correct? It's currently set to: '${process.env.NEXT_PUBLIC_PB_URL}'`);
        console.error("3. In your PocketBase Admin UI, are the API Rules for the 'products' collection set to allow public 'List' and 'View' access?");
        console.error("\nFull error object for debugging:");
        console.error(error);
        if (error.originalError) {
            console.error("\nOriginal underlying error:");
            console.error(error.originalError);
        }
        console.error("--- END POCKETBASE FETCH ERROR ---\n");

        // Return an empty array to prevent the page from crashing.
        return [];
    }
}

/**
 * --- HOMEPAGE COMPONENT ---
 * This is an async Server Component. It fetches data before rendering the page.
 */
export default async function Page() {
    // Call the data fetching function and wait for the products to be returned.
    const featuredProducts = await getFeaturedProducts();

    return (
        <div>
            {/* The Hero Slider will be displayed at the top of the homepage */}
            <HeroSlider />

            {/* Main content area for featured products */}
            <div className="bg-white">
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
                        Featured Products
                    </h2>

                    {/* Conditional Rendering:
                      - If products are found, display them in a grid.
                      - If the featuredProducts array is empty, display a message.
                    */}
                    {featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {/* Map over the array of products and render a ProductCard for each one */}
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            <p className="text-lg font-medium">Could Not Load Products</p>
                            <p>Please check the server console for error details and try again later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
