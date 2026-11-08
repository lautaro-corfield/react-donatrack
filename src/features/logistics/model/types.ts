export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Shipment {
  id: string;
  trackingCode: string;
  destination: string;
  category: string;
  quantityUnits: number;
  status: ShipmentStatus;
  updatedAt: string;
}
