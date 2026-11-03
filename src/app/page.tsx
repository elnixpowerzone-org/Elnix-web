import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import PopularProductsSection from '@/components/home/PopularProductsSection';
import AboutSection from '@/components/home/AboutSection';
import LocationSection from '@/components/home/LocationSection';
import CtaBanner from '@/components/home/CtaBanner';
import { getCategories, getProducts, getBrands } from '@/lib/store';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [categories, products, brands] = await Promise.all([
    getCategories(),
    getProducts({ featured: true }),
    getBrands(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection categories={categories} brands={brands} />
        <PopularProductsSection products={products} />
        <AboutSection />
        <LocationSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
