import { useState } from "react";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Classes from "./components/Classes";
import Products from "./components/Products";
import Lifestyle from "./components/Lifestyle";
import YoYogi from "./components/YoYogi";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ScrollProgress from "./components/ScrollProgress";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import AmbientMusic from "./components/AmbientMusic";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function App() {
  const { isAuthenticated, authPhone, authName, login, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuth = () => setIsAuthModalOpen(true);
  const closeAuth = () => setIsAuthModalOpen(false);

  const handleAuthSuccess = (phone, token, name) => {
    login(phone, token, name);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="App">
      <Toaster position="top-center" richColors closeButton />
      <ScrollProgress />
      <FloatingWhatsApp />
      <AmbientMusic />
      <Navbar
        isAuthenticated={isAuthenticated}
        authPhone={authPhone}
        authName={authName}
        onLoginClick={openAuth}
        onLogout={logout}
      />
      <main>
        <Hero onExploreClasses={() => scrollTo("classes")} />
        <About />
        <Classes />
        <Products />
        <Lifestyle />
        <YoYogi isAuthenticated={isAuthenticated} onLoginClick={openAuth} />
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuth} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}
