import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import api, { type ListingDto } from "@/lib/api";
import { resolveAvatar } from "@/lib/avatar";
import { toast } from "@/components/ui/sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  MAD: "Dh",
};

const AMENITIES = [
  { key: "hasWifi", emoji: "📶", label: "WiFi" },
  { key: "hasKitchen", emoji: "🍳", label: "Kitchen" },
  { key: "hasLaundry", emoji: "🧺", label: "Laundry" },
  { key: "hasMetroNearby", emoji: "🚇", label: "Metro nearby" },
  { key: "hasGarden", emoji: "🌳", label: "Garden" },
  { key: "hasParking", emoji: "🅿️", label: "Parking" },
  { key: "petsOK", emoji: "🐕", label: "Pets OK" },
  { key: "hasGym", emoji: "🏋️", label: "Gym" },
  { key: "hasAC", emoji: "❄️", label: "AC" },
  { key: "isSecure", emoji: "🔒", label: "Secure" },
] as const;

const toImageSrc = (value: string) => {
  if (!value) return "/placeholder.svg";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${window.location.origin}${normalized}`;
};

const toCardListing = (listing: ListingDto) => ({
  id: listing.id,
  title: listing.title,
  location: listing.location,
  image: toImageSrc(listing.images?.[0] || ""),
  price: `${CURRENCY_SYMBOLS[listing.currency] || listing.currency}${listing.price}/mo`,
  posterId: listing.user?.id,
  postedBy: listing.user?.name || listing.user?.username || "Unknown",
  posterAvatar: resolveAvatar(listing.user?.avatar),
  roommatesWanted: listing.spotsTotal,
  roommatesFound: listing.spotsFilled,
  availableDate: String(listing.availableDate || "").slice(0, 10),
  amenities: AMENITIES.filter((item) => Boolean(listing[item.key])).map(({ emoji, label }) => ({
    emoji,
    label,
  })),
});

const Listings = () => {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const [listings, setListings] = useState<ReturnType<typeof toCardListing>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ id?: string | number; name: string; avatar: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.fetchAllListings();
        setListings(data.map(toCardListing));
      } catch (err: any) {
        setError(err?.message || "Could not load listings.");
      }
    })();
  }, []);

  const handleChatFromListing = (listing: ReturnType<typeof toCardListing>) => {
    if (!isLoggedIn) {
      toast.error("Please log in to start chatting.");
      return;
    }

    if (!listing.posterId) {
      toast.error("This listing owner cannot be contacted right now.");
      return;
    }

    if (Number(user?.id) === listing.posterId) {
      toast.error("You cannot chat with your own listing.");
      return;
    }

    setChatUser({
      id: listing.posterId,
      name: listing.postedBy,
      avatar: listing.posterAvatar,
    });
    setChatOpen(true);
  };

  return (
    <PageLayout>
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 sm:mb-3">
              Housing Listings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find available apartments and rooms near 42 campus
            </p>
          </div>

          {/* Listing Cards */}
          {listings.length > 0 ? (
            <div className="space-y-6">
              {listings.map((listing, index) => (
                <ListingCard
                  key={listing.id ?? index}
                  listing={listing}
                  transparentBackground
                  insetImage
                  showChatButton
                  chatDisabled={!isLoggedIn || !listing.posterId || Number(user?.id) === listing.posterId}
                  onChatClick={handleChatFromListing}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                {error || "No listings available right now."}
              </p>
            </div>
          )}

          {!isLoggedIn && (
            <div className="text-center mt-6">
              <Button
                asChild
                className="bg-primary hover:bg-black text-black hover:text-primary border-black hover:border-black font-semibold px-8 rounded-none"
              >
                <Link to="/login">Log in to create a listing</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <ChatPopup
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        user={chatUser}
      />
    </PageLayout>
  );
};

export default Listings;
