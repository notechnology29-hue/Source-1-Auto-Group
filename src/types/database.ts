export type VehicleStatus = "available" | "pending" | "sold";
export type VehicleCondition = "excellent" | "good" | "fair";
export type MediaType = "image" | "video";
export type HotspotSeverity = "cosmetic" | "upgrade" | "repaired";
export type InquiryType = "hold_ride" | "test_drive";
export type LeadStatus = "new" | "contacted";

export type Vehicle = {
  id: string;
  stock_number: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  condition: VehicleCondition;
  status: VehicleStatus;
  price: number;
  mileage: number;
  exterior_color: string | null;
  drivetrain: string | null;
  engine: string | null;
  features: string[];
  clean_carfax: boolean;
  created_at: string;
  updated_at: string;
};

export type VehicleMedia = {
  id: string;
  vehicle_id: string;
  url: string;
  is_primary: boolean;
  media_type: MediaType;
  created_at: string;
};

export type TransparencyHotspot = {
  id: string;
  vehicle_id: string;
  media_id: string;
  x_coordinate: number;
  y_coordinate: number;
  title: string;
  description: string;
  severity: HotspotSeverity;
  created_at: string;
};

export type Lead = {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  inquiry_type: InquiryType;
  status: LeadStatus;
  created_at: string;
};

type Insertable<T, Optional extends keyof T> = Omit<T, Optional> & Partial<Pick<T, Optional>>;

export type VehicleInsert = Insertable<
  Vehicle,
  "id" | "created_at" | "updated_at" | "status" | "condition" | "features" | "clean_carfax" | "trim" | "exterior_color" | "drivetrain" | "engine"
>;
export type VehicleMediaInsert = Insertable<VehicleMedia, "id" | "created_at" | "is_primary" | "media_type">;
export type HotspotInsert = Insertable<TransparencyHotspot, "id" | "created_at" | "description" | "severity">;
export type LeadInsert = Pick<Lead, "vehicle_id" | "customer_name" | "customer_email" | "customer_phone" | "inquiry_type">;

/** Supabase typed-client schema. */
export interface Database {
  public: {
    Tables: {
      vehicles: { Row: Vehicle; Insert: VehicleInsert; Update: Partial<VehicleInsert>; Relationships: [] };
      vehicle_media: { Row: VehicleMedia; Insert: VehicleMediaInsert; Update: Partial<VehicleMediaInsert>; Relationships: [] };
      transparency_hotspots: { Row: TransparencyHotspot; Insert: HotspotInsert; Update: Partial<HotspotInsert>; Relationships: [] };
      leads: { Row: Lead; Insert: LeadInsert; Update: Partial<Pick<Lead, "status">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      vehicle_status: VehicleStatus;
      vehicle_condition: VehicleCondition;
      media_type: MediaType;
      hotspot_severity: HotspotSeverity;
      inquiry_type: InquiryType;
      lead_status: LeadStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Vehicle joined with media + hotspots, as rendered by the storefront. */
export interface VehicleWithMedia extends Vehicle {
  vehicle_media: VehicleMedia[];
  transparency_hotspots: TransparencyHotspot[];
}

export interface DecodedVin {
  year: number | null;
  make: string;
  model: string;
  trim: string;
  engine: string;
  drivetrain: string;
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
