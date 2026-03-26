import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { ScrollToTop } from "@/components/shop/ScrollToTop";
import { BodyScrollUnlockOnRoute } from "@/components/shop/BodyScrollUnlockOnRoute";

export const dynamic = "force-dynamic";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F4F4]">
      <BodyScrollUnlockOnRoute />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
