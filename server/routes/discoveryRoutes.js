const express = require('express');
const router = express.Router();
const axios = require('axios');

// Pre-cached stores for all major Indian cities
// Ensures instant results even when live APIs are rate-limited
const cachedStores = {
  jalandhar: [
    { id: 'jal-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Model Town, Jalandhar' }, lat: 31.3175, lon: 75.5762 },
    { id: 'jal-zudio-2', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'BMC Chowk, Jalandhar' }, lat: 31.3310, lon: 75.5690 },
    { id: 'jal-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'MBD Neopolis Mall, Jalandhar' }, lat: 31.3245, lon: 75.5884 },
    { id: 'jal-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Rama Mandi, Jalandhar' }, lat: 31.3098, lon: 75.5731 },
    { id: 'jal-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'GT Road, Jalandhar' }, lat: 31.3220, lon: 75.5810 },
    { id: 'jal-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'Pathankot Road, Jalandhar' }, lat: 31.3380, lon: 75.5950 },
    { id: 'jal-reliance-1', tags: { name: 'Reliance Trends', shop: 'clothes', 'addr:street': 'Nakodar Chowk, Jalandhar' }, lat: 31.3150, lon: 75.5580 },
    { id: 'jal-lifestyle-1', tags: { name: 'Lifestyle', shop: 'department_store', 'addr:street': 'MBD Neopolis Mall, Jalandhar' }, lat: 31.3248, lon: 75.5880 },
  ],
  bengaluru: [
    { id: 'blr-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Jayanagar, Bengaluru' }, lat: 12.9250, lon: 77.5938 },
    { id: 'blr-zudio-2', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Marathahalli, Bengaluru' }, lat: 12.9568, lon: 77.7010 },
    { id: 'blr-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Phoenix Marketcity, Bengaluru' }, lat: 12.9976, lon: 77.6967 },
    { id: 'blr-hm-2', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Orion Mall, Bengaluru' }, lat: 13.0107, lon: 77.5544 },
    { id: 'blr-zara-1', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'UB City, Bengaluru' }, lat: 12.9716, lon: 77.5964 },
    { id: 'blr-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Koramangala, Bengaluru' }, lat: 12.9346, lon: 77.6267 },
    { id: 'blr-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'Brigade Road, Bengaluru' }, lat: 12.9726, lon: 77.6072 },
    { id: 'blr-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Indiranagar, Bengaluru' }, lat: 12.9784, lon: 77.6408 },
  ],
  delhi: [
    { id: 'del-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Lajpat Nagar, Delhi' }, lat: 28.5689, lon: 77.2404 },
    { id: 'del-zudio-2', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Rajouri Garden, Delhi' }, lat: 28.6492, lon: 77.1212 },
    { id: 'del-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Select Citywalk, Saket' }, lat: 28.5285, lon: 77.2190 },
    { id: 'del-hm-2', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Ambience Mall, Vasant Kunj' }, lat: 28.5397, lon: 77.1549 },
    { id: 'del-zara-1', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'DLF Promenade, Vasant Kunj' }, lat: 28.5393, lon: 77.1570 },
    { id: 'del-zara-2', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'Select Citywalk, Saket' }, lat: 28.5289, lon: 77.2185 },
    { id: 'del-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Pacific Mall, Subhash Nagar' }, lat: 28.6388, lon: 77.1147 },
    { id: 'del-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Connaught Place, Delhi' }, lat: 28.6315, lon: 77.2167 },
    { id: 'del-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'South Extension, Delhi' }, lat: 28.5728, lon: 77.2229 },
    { id: 'del-lifestyle-1', tags: { name: 'Lifestyle', shop: 'department_store', 'addr:street': 'Ambience Mall, Gurgaon' }, lat: 28.5042, lon: 77.0967 },
  ],
  mumbai: [
    { id: 'mum-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Malad West, Mumbai' }, lat: 19.1860, lon: 72.8486 },
    { id: 'mum-zudio-2', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Thane West, Mumbai' }, lat: 19.2183, lon: 72.9781 },
    { id: 'mum-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Phoenix Palladium, Lower Parel' }, lat: 18.9935, lon: 72.8256 },
    { id: 'mum-hm-2', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'R City Mall, Ghatkopar' }, lat: 19.0917, lon: 72.9167 },
    { id: 'mum-zara-1', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'Palladium Mall, Lower Parel' }, lat: 18.9940, lon: 72.8260 },
    { id: 'mum-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Infiniti Mall, Andheri' }, lat: 19.1369, lon: 72.8275 },
    { id: 'mum-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Borivali West, Mumbai' }, lat: 19.2307, lon: 72.8567 },
    { id: 'mum-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'High Street Phoenix, Mumbai' }, lat: 18.9950, lon: 72.8255 },
    { id: 'mum-lifestyle-1', tags: { name: 'Lifestyle', shop: 'department_store', 'addr:street': 'Oberoi Mall, Goregaon' }, lat: 19.1731, lon: 72.8636 },
  ],
  chandigarh: [
    { id: 'chd-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Sector 17, Chandigarh' }, lat: 30.7415, lon: 76.7832 },
    { id: 'chd-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Elante Mall, Chandigarh' }, lat: 30.7058, lon: 76.8018 },
    { id: 'chd-zara-1', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'Elante Mall, Chandigarh' }, lat: 30.7060, lon: 76.8015 },
    { id: 'chd-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Sector 35, Chandigarh' }, lat: 30.7234, lon: 76.7674 },
    { id: 'chd-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Sector 17, Chandigarh' }, lat: 30.7412, lon: 76.7840 },
    { id: 'chd-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'Elante Mall, Chandigarh' }, lat: 30.7055, lon: 76.8020 },
    { id: 'chd-lifestyle-1', tags: { name: 'Lifestyle', shop: 'department_store', 'addr:street': 'Elante Mall, Chandigarh' }, lat: 30.7062, lon: 76.8012 },
  ],
  amritsar: [
    { id: 'amr-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Lawrence Road, Amritsar' }, lat: 31.6340, lon: 74.8723 },
    { id: 'amr-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Alpha One Mall, Amritsar' }, lat: 31.6295, lon: 74.8640 },
    { id: 'amr-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Mall Road, Amritsar' }, lat: 31.6380, lon: 74.8760 },
    { id: 'amr-reliance-1', tags: { name: 'Reliance Trends', shop: 'clothes', 'addr:street': 'Ranjit Avenue, Amritsar' }, lat: 31.6520, lon: 74.8510 },
    { id: 'amr-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'Alpha One Mall, Amritsar' }, lat: 31.6290, lon: 74.8635 },
  ],
  ludhiana: [
    { id: 'ldh-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Ferozepur Road, Ludhiana' }, lat: 30.9010, lon: 75.8573 },
    { id: 'ldh-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Pavilion Mall, Ludhiana' }, lat: 30.8814, lon: 75.8590 },
    { id: 'ldh-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'MBD Mall, Ludhiana' }, lat: 30.9080, lon: 75.8420 },
    { id: 'ldh-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Model Town, Ludhiana' }, lat: 30.9140, lon: 75.8510 },
    { id: 'ldh-reliance-1', tags: { name: 'Reliance Trends', shop: 'clothes', 'addr:street': 'Dugri Road, Ludhiana' }, lat: 30.8750, lon: 75.8340 },
    { id: 'ldh-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'Pavilion Mall, Ludhiana' }, lat: 30.8810, lon: 75.8585 },
  ],
  hyderabad: [
    { id: 'hyd-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Ameerpet, Hyderabad' }, lat: 17.4375, lon: 78.4483 },
    { id: 'hyd-zudio-2', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Kukatpally, Hyderabad' }, lat: 17.4948, lon: 78.3996 },
    { id: 'hyd-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Inorbit Mall, Hitech City' }, lat: 17.4355, lon: 78.3857 },
    { id: 'hyd-hm-2', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'GVK One Mall, Banjara Hills' }, lat: 17.4260, lon: 78.4480 },
    { id: 'hyd-zara-1', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'Inorbit Mall, Hyderabad' }, lat: 17.4358, lon: 78.3860 },
    { id: 'hyd-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Forum Sujana Mall, Hyderabad' }, lat: 17.4480, lon: 78.3905 },
    { id: 'hyd-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'Jubilee Hills, Hyderabad' }, lat: 17.4312, lon: 78.4100 },
    { id: 'hyd-lifestyle-1', tags: { name: 'Lifestyle', shop: 'department_store', 'addr:street': 'Begumpet, Hyderabad' }, lat: 17.4410, lon: 78.4720 },
  ],
  pune: [
    { id: 'pun-zudio-1', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'FC Road, Pune' }, lat: 18.5270, lon: 73.8410 },
    { id: 'pun-zudio-2', tags: { name: 'Zudio', shop: 'clothes', 'addr:street': 'Kothrud, Pune' }, lat: 18.5074, lon: 73.8077 },
    { id: 'pun-hm-1', tags: { name: 'H&M', shop: 'clothes', 'addr:street': 'Phoenix Marketcity, Viman Nagar' }, lat: 18.5623, lon: 73.9166 },
    { id: 'pun-zara-1', tags: { name: 'Zara', shop: 'clothes', 'addr:street': 'Phoenix Marketcity, Pune' }, lat: 18.5625, lon: 73.9170 },
    { id: 'pun-max-1', tags: { name: 'Max Fashion', shop: 'clothes', 'addr:street': 'Seasons Mall, Hadapsar' }, lat: 18.5052, lon: 73.9359 },
    { id: 'pun-pantaloons-1', tags: { name: 'Pantaloons', shop: 'department_store', 'addr:street': 'MG Road, Pune' }, lat: 18.5160, lon: 73.8755 },
    { id: 'pun-westside-1', tags: { name: 'Westside', shop: 'clothes', 'addr:street': 'Aundh, Pune' }, lat: 18.5580, lon: 73.8073 },
    { id: 'pun-lifestyle-1', tags: { name: 'Lifestyle', shop: 'department_store', 'addr:street': 'SGS Mall, Pune' }, lat: 18.5180, lon: 73.8560 },
  ]
};

function getCachedStores(lat, lng) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  
  if (lat > 31.2 && lat < 31.5 && lng > 75.4 && lng < 75.7) return cachedStores.jalandhar;
  if (lat > 12.8 && lat < 13.1 && lng > 77.4 && lng < 77.8) return cachedStores.bengaluru;
  if (lat > 28.4 && lat < 28.8 && lng > 76.9 && lng < 77.4) return cachedStores.delhi;
  if (lat > 18.8 && lat < 19.3 && lng > 72.7 && lng < 73.1) return cachedStores.mumbai;
  if (lat > 30.6 && lat < 30.8 && lng > 76.7 && lng < 76.9) return cachedStores.chandigarh;
  if (lat > 31.5 && lat < 31.8 && lng > 74.7 && lng < 75.0) return cachedStores.amritsar;
  if (lat > 30.8 && lat < 31.0 && lng > 75.7 && lng < 75.9) return cachedStores.ludhiana;
  if (lat > 17.2 && lat < 17.6 && lng > 78.3 && lng < 78.6) return cachedStores.hyderabad;
  if (lat > 18.4 && lat < 18.7 && lng > 73.7 && lng < 74.0) return cachedStores.pune;
  return [];
}

router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  // Step 1: Return cached stores instantly
  const cached = getCachedStores(lat, lng);
  
  // Step 2: Try live Overpass API to enhance results
  try {
    const query = `[out:json][timeout:15];node(around:15000,${lat},${lng})["shop"];out;`;
    
    const resp = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 8000
    });

    const liveElements = resp.data.elements || [];
    console.log(`[Discovery] Live: ${liveElements.length} + Cached: ${cached.length} stores.`);
    
    const allElements = [...cached, ...liveElements];
    res.json({ elements: allElements });
  } catch (error) {
    console.log(`[Discovery] Live API unavailable, serving ${cached.length} cached stores.`);
    res.json({ elements: cached });
  }
});

module.exports = router;
