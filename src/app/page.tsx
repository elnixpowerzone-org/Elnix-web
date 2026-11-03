import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import PopularProductsSection from '@/components/home/PopularProductsSection';
import AboutSection from '@/components/home/AboutSection';
import LocationSection from '@/components/home/LocationSection';
import CtaBanner from '@/components/home/CtaBanner';
import { getCategories, getProducts, getBrands, getHeroSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fetch fresh settings on refresh

export default async function HomePage() {
  const [categories, products, brands, heroSettings] = await Promise.all([
    getCategories(),
    getProducts({ featured: true }),
    getBrands(),
    getHeroSettings(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection hero={heroSettings} />
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
