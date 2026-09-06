import type { CustomerSlice, GeoPoint, RestaurantSlice } from "./types.ts";
import { displayNameFromFull, maskPhone } from "./privacy.ts";

/** Karimganj / Sribhumi reference points — public geography, not competitor data. */
export const KARIMGANJ: GeoPoint = { lat: 24.869, lng: 92.355 };

export const RESTAURANTS: RestaurantSlice[] = [
  {
    id: "rst_spice_house",
    name: "The Spice House",
    area: "Station Road",
    address: "Station Road, Karimganj",
    location: { lat: 24.8704, lng: 92.3571 },
    phoneMasked: "•••• 2140",
    specialPickupInstructions: "Counter on the left. Ask for Roshoi bag.",
    preparationStatus: "PREPARING",
  },
  {
    id: "rst_al_amin",
    name: "Al-Amin Hotel",
    area: "Main Road",
    address: "Main Road, Karimganj",
    location: { lat: 24.8682, lng: 92.3528 },
    phoneMasked: "•••• 5512",
    specialPickupInstructions: "Back entrance after 9pm.",
    preparationStatus: "READY",
  },
  {
    id: "rst_niramish",
    name: "Niramish Bhoj",
    area: "Court Road",
    address: "Court Road, Karimganj",
    location: { lat: 24.8721, lng: 92.3544 },
    phoneMasked: "•••• 8831",
    specialPickupInstructions: "Veg thali — keep upright.",
    preparationStatus: "PREPARING",
  },
  {
    id: "rst_tea_meals",
    name: "Sribhumi Meals",
    area: "Sribhumi Chowk",
    address: "Sribhumi Chowk",
    location: { lat: 24.8655, lng: 92.3602 },
    phoneMasked: "•••• 4419",
    specialPickupInstructions: "Packed in steel tiffin. Return empty next day if marked.",
    preparationStatus: "READY",
  },
];

const CUSTOMERS: Array<{
  full: string;
  area: string;
  address: string;
  phone: string;
  instructions: string;
  location: GeoPoint;
}> = [
  {
    full: "Amina Khan",
    area: "Longai Road",
    address: "House 12, Longai Road",
    phone: "6001122334",
    instructions: "Call on arrival. Gate on the lane side.",
    location: { lat: 24.8748, lng: 92.3499 },
  },
  {
    full: "Rafiq Ahmed",
    area: "Railway Colony",
    address: "Qtr 4B, Railway Colony",
    phone: "9435011223",
    instructions: "Leave with security if no answer after wait policy.",
    location: { lat: 24.8619, lng: 92.3512 },
  },
  {
    full: "Priya Das",
    area: "Mission Road",
    address: "Mission Road, near church",
    phone: "7086019988",
    instructions: "Second floor. No lift.",
    location: { lat: 24.8699, lng: 92.3476 },
  },
  {
    full: "Himangshu Roy",
    area: "Stadium area",
    address: "Lane 3, Stadium",
    phone: "8011122233",
    instructions: "COD. Count notes in front of customer.",
    location: { lat: 24.8772, lng: 92.3588 },
  },
];

export function simulatedRestaurant(): RestaurantSlice {
  return structuredClone(RESTAURANTS[Math.floor(Math.random() * RESTAURANTS.length)]!);
}

export function simulatedCustomer(): { slice: CustomerSlice; location: GeoPoint } {
  const c = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)]!;
  return {
    location: c.location,
    slice: {
      displayName: displayNameFromFull(c.full),
      area: c.area,
      address: c.address,
      contactMasked: maskPhone(c.phone),
      contactAllowed: true,
      instructions: c.instructions,
    },
  };
}

export const ZONES = [
  "Station Road",
  "Main Road",
  "Court Road",
  "Longai Road",
  "Sribhumi Chowk",
  "Badarpur Road",
];
