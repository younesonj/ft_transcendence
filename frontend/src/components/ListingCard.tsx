import { MapPin, Users, Calendar, Euro } from "lucide-react";

interface ListingData {
  title: string;
  location: string;
  image: string;
  price: string;
  postedBy: string;
  posterAvatar: string;
  roommatesWanted: number;
  roommatesFound: number;
  availableDate: string;
  amenities: { emoji: string; label: string }[];
}

interface ListingCardProps {
  listing: ListingData;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const spotsLeft = listing.roommatesWanted - listing.roommatesFound;
  const isFull = spotsLeft === 0;

  return (
    <div className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {/* Roommate counter badge */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-2 ${
          isFull 
            ? 'bg-destructive/90 text-destructive-foreground' 
            : 'bg-primary/90 text-primary-foreground'
        }`}>
          <Users className="w-4 h-4" />
          <span className="font-bold text-sm">
            {listing.roommatesFound}/{listing.roommatesWanted}
          </span>
        </div>
        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="font-bold text-primary">{listing.price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Location */}
        <h3 className="text-lg font-bold text-foreground mb-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3 h-3" />
          <span>{listing.location}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {listing.amenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs"
            >
              <span>{amenity.emoji}</span>
              <span className="text-muted-foreground">{amenity.label}</span>
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {/* Posted by */}
          <div className="flex items-center gap-2">
            <img 
              src={listing.posterAvatar} 
              alt={listing.postedBy}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground">{listing.postedBy}</span>
          </div>
          {/* Available date */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{listing.availableDate}</span>
          </div>
        </div>

        {/* Status message */}
        <div className={`mt-4 text-center py-2 rounded-lg text-sm font-medium ${
          isFull 
            ? 'bg-destructive/10 text-destructive border border-destructive/20' 
            : 'bg-primary/10 text-primary border border-primary/20'
        }`}>
          {isFull 
            ? '⊘ No spots available' 
            : `✦ ${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} remaining`
          }
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
