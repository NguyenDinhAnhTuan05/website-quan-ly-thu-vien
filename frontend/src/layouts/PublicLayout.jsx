import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import AIChatWidget from "../components/AIChatWidget";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
