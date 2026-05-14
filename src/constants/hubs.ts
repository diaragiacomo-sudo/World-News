export interface Hub {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'airport' | 'port' | 'city';
}

export const MAJOR_HUBS: Hub[] = [
  { id: 'JFK', name: 'New York JFK', lat: 40.6413, lng: -73.7781, type: 'airport' },
  { id: 'LHR', name: 'London Heathrow', lat: 51.4700, lng: -0.4543, type: 'airport' },
  { id: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lng: 139.7798, type: 'airport' },
  { id: 'SIN', name: 'Singapore Changi', lat: 1.3644, lng: 103.9915, type: 'airport' },
  { id: 'DXB', name: 'Dubai International', lat: 25.2532, lng: 55.3657, type: 'airport' },
  { id: 'ROT', name: 'Port of Rotterdam', lat: 51.9485, lng: 4.1450, type: 'port' },
  { id: 'SHA', name: 'Port of Shanghai', lat: 31.2222, lng: 121.4581, type: 'port' },
  { id: 'SGP', name: 'Port of Singapore', lat: 1.2640, lng: 103.8400, type: 'port' },
  { id: 'LOS', name: 'Port of Los Angeles', lat: 33.7288, lng: -118.2620, type: 'port' },
  { id: 'GIB', name: 'Gibraltar Strait', lat: 35.9811, lng: -5.4651, type: 'port' },
  { id: 'ROM', name: 'Roma', lat: 41.9028, lng: 12.4964, type: 'city' },
  { id: 'PAR', name: 'Paris', lat: 48.8566, lng: 2.3522, type: 'city' },
  { id: 'MIL', name: 'Milano Centrale', lat: 45.4850, lng: 9.2035, type: 'city' },
  { id: 'AMS', name: 'Amsterdam Centraal', lat: 52.3791, lng: 4.9003, type: 'city' },
  { id: 'BER', name: 'Berlin Hbf', lat: 52.5250, lng: 13.3694, type: 'city' },
];
