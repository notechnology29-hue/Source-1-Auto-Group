import type { VehicleWithMedia } from "@/types/database";

const ts = "2026-10-01T00:00:00Z";

/** Placeholder art served by /placeholder (swap for Cloudinary URLs once media is uploaded). */
const img = (color: string, label: string) =>
  `/placeholder?c=${color.replace("#", "")}&label=${encodeURIComponent(label)}`;

interface SeedInput {
  n: number;
  stock: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  mileage: number;
  color: string;
  hex: string;
  drivetrain: string;
  engine: string;
  features: string[];
  carfax: boolean;
  condition?: "excellent" | "good" | "fair";
  status?: "available" | "pending";
}

function build(s: SeedInput): VehicleWithMedia {
  const id = `seed-veh-${s.n}`;
  return {
    id,
    stock_number: s.stock,
    vin: s.vin,
    year: s.year,
    make: s.make,
    model: s.model,
    trim: s.trim,
    condition: s.condition ?? "excellent",
    status: s.status ?? "available",
    price: s.price,
    mileage: s.mileage,
    exterior_color: s.color,
    drivetrain: s.drivetrain,
    engine: s.engine,
    features: s.features,
    clean_carfax: s.carfax,
    created_at: ts,
    updated_at: ts,
    vehicle_media: [
      { id: `${id}-m1`, vehicle_id: id, url: img(s.hex, "Front 3/4"), is_primary: true, media_type: "image", created_at: ts },
      { id: `${id}-m2`, vehicle_id: id, url: img(s.hex, "Side Profile"), is_primary: false, media_type: "image", created_at: ts },
    ],
    transparency_hotspots: [],
  };
}

const hs = (
  vid: string,
  media: "m1" | "m2",
  n: number,
  x: number,
  y: number,
  severity: "cosmetic" | "upgrade" | "repaired",
  title: string,
  description: string,
) => ({
  id: `${vid}-h${n}`,
  vehicle_id: vid,
  media_id: `${vid}-${media}`,
  x_coordinate: x,
  y_coordinate: y,
  title,
  description,
  severity,
  created_at: ts,
});

const vehicles: VehicleWithMedia[] = [
  build({ n: 1, stock: "S1-1001", vin: "1C6SRFFT5NN123456", year: 2022, make: "Ram", model: "1500", trim: "Rebel Crew Cab", price: 41995, mileage: 31200, color: "Flame Red", hex: "#B3122B", drivetrain: "4WD", engine: "5.7L V8 HEMI", features: ["Heated Seats", "Tow Package", "Apple CarPlay", "Lift Kit"], carfax: true }),
  build({ n: 2, stock: "S1-1002", vin: "WBS8M9C50J5K12345", year: 2018, make: "BMW", model: "M3", trim: "Competition", price: 44900, mileage: 38750, color: "Alpine White", hex: "#E8ECF2", drivetrain: "RWD", engine: "3.0L Twin-Turbo I6", features: ["Performance Package", "Carbon Roof", "Harman Kardon", "Performance Exhaust"], carfax: true }),
  build({ n: 3, stock: "S1-1003", vin: "1HGCV1F34MA012345", year: 2021, make: "Honda", model: "Accord", trim: "Sport 2.0T", price: 23995, mileage: 42100, color: "Modern Steel", hex: "#6B7385", drivetrain: "FWD", engine: "2.0L Turbo I4", features: ["Adaptive Cruise", "Sunroof", "Apple CarPlay"], carfax: true, condition: "good" }),
  build({ n: 4, stock: "S1-1004", vin: "1FTFW1E50MFA01234", year: 2021, make: "Ford", model: "F-150", trim: "XLT SuperCrew", price: 36500, mileage: 52400, color: "Agate Black", hex: "#2A2F40", drivetrain: "4WD", engine: "5.0L V8", features: ["Backup Camera", "Bed Liner", "Tow Package"], carfax: false, condition: "good" }),
  build({ n: 5, stock: "S1-1005", vin: "1G1YY2D79H5101234", year: 2017, make: "Chevrolet", model: "Corvette", trim: "Stingray Z51", price: 49995, mileage: 27800, color: "Torch Red", hex: "#FF1E38", drivetrain: "RWD", engine: "6.2L V8", features: ["Z51 Performance Package", "Magnetic Ride", "Targa Top"], carfax: true, status: "pending" }),
  build({ n: 6, stock: "S1-1006", vin: "JTMRFREV5KD012345", year: 2019, make: "Toyota", model: "RAV4", trim: "XLE AWD", price: 21850, mileage: 61300, color: "Blueprint", hex: "#0066FF", drivetrain: "AWD", engine: "2.5L I4", features: ["Blind Spot Monitor", "Power Liftgate", "Toyota Safety Sense"], carfax: true, condition: "good" }),
];

const v1 = vehicles[0].id;
const v2 = vehicles[1].id;
vehicles[0].transparency_hotspots = [
  hs(v1, "m1", 1, 24, 62, "upgrade", "2\" Leveling Lift", "Aftermarket suspension lift professionally installed. Alignment performed afterward."),
  hs(v1, "m1", 2, 52, 36, "cosmetic", "Hood Stone Chips", "Several small paint chips near the leading edge. Touched up, still visible on close inspection."),
  hs(v1, "m1", 3, 82, 58, "repaired", "Rear Bumper Repaint", "Minor parking scuff professionally refinished in 2024. Color matched, documented."),
  hs(v1, "m2", 4, 60, 70, "cosmetic", "Rocker Panel Scratches", "Light trail scratches along the passenger side rocker."),
];
vehicles[1].transparency_hotspots = [
  hs(v2, "m1", 1, 30, 70, "cosmetic", "Curb Rash — Front Right Wheel", "Light scuffing on the wheel lip. Does not affect balance or sealing."),
  hs(v2, "m1", 2, 70, 64, "upgrade", "Aftermarket Exhaust", "Catback performance exhaust. Stock exhaust included with the vehicle."),
  hs(v2, "m1", 3, 50, 28, "repaired", "Windshield Replaced", "OEM-spec glass replaced after a chip crack. Calibrated and documented."),
];

export const SEED_VEHICLES = vehicles;
