export type TransportType = 'plane' | 'train' | 'ship';

export interface Coords {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  type: TransportType;
  fromCoords: Coords;
  toCoords: Coords;
  fromName: string;
  toName: string;
  status: 'active' | 'delayed' | 'scheduled';
  cargo?: string;
  departureTime: string;
  arrivalTime: string;
  progress: number; // 0 to 1
  speed: number; // unit per update
}

export interface UserProfile {
  uid: string;
  email: string;
  favorites: string[];
}

export interface TransportNotification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'departure' | 'arrival' | 'delay';
}
