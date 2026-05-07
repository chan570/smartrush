/**
 * Calculates the distance between two points in km using the Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Estimates travel time in minutes based on distance and average traffic speed (e.g., 20km/h for urban)
 */
export const estimateTravelTime = (distanceKm) => {
  const avgSpeedKmh = 20; 
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60);
};
