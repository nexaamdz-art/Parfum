import { useState } from "react";
import TopNav from "./components/TopNav.jsx";
import CinematicIntro from "./components/CinematicIntro.jsx";
import ProductSection from "./components/ProductSection.jsx";
import NotesPyramid from "./components/NotesPyramid.jsx";
import ArtisanshipSection from "./components/ArtisanshipSection.jsx";
import DiscoverySet from "./components/DiscoverySet.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleAddToCart = (newItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.id === newItem.id && it.monogram === newItem.monogram
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQty = (itemId, newQty) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it))
    );
  };

  const handleRemoveItem = (itemId) => {
    setCart((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="site-wrapper">
      <TopNav
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollTo={handleScrollTo}
      />

      <div id="hero">
        <CinematicIntro />
      </div>

      <ProductSection onAddToCart={handleAddToCart} />

      <NotesPyramid />

      <ArtisanshipSection />

      <DiscoverySet onAddToCart={handleAddToCart} />

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
