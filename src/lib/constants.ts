export const BRAND = {
  name: "Source 1 Auto Group",
  phoneDisplay: "(602) 243-3458",
  phoneHref: "tel:+16022433458",
  whatsappNumber: "16022433458",
  tagline: "Driven By Performance. Built On Trust.",
  logo: "/media/logo.jpg",
  // Hours and social URLs are placeholders: replace with the real details.
  addressLine1: "3620 S Central",
  addressLine2: "Phoenix, AZ",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=3620+S+Central+Phoenix+AZ",
  hours: [
    { days: "Monday - Friday", time: "9:00 AM - 7:00 PM" },
    { days: "Saturday", time: "9:00 AM - 6:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  socials: {
    instagram: "https://www.instagram.com/source1autogroup/",
    instagramHandle: "@source1autogroup",
  },
} as const;

export const DEFAULT_APR = 7.9;
export const LOAN_TERM_MONTHS = 60;

export const HOTSPOT_STYLES = {
  cosmetic: { label: "Cosmetic Wear", color: "#FFB020" },
  upgrade: { label: "Aftermarket Upgrade", color: "#0066FF" },
  repaired: { label: "Repaired", color: "#FF1E38" },
} as const;
