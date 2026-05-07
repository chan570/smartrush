const axios = require('axios');

async function testGeoapify() {
  // Geoapify Places API - Free tier: 3000 req/day, no credit card needed
  // Sign up at https://www.geoapify.com/ to get a key
  // For now, testing with their demo
  
  const lat = 31.3260;
  const lng = 75.5762;
  
  // Try Foursquare (no key needed for basic search)
  try {
    console.log('Testing Foursquare...');
    const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=15000&categories=17033&limit=10`;
    const resp = await axios.get(url, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': 'fsq3placeholder'  // Needs real key
      },
      timeout: 5000
    });
    console.log('Foursquare:', resp.data);
  } catch(e) {
    console.log('Foursquare needs API key:', e.response?.status);
  }

  // Try OpenTripMap (free, no key for basic)
  try {
    console.log('\nTesting OpenTripMap...');
    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon=${lng}&lat=${lat}&kinds=shops&format=json&limit=10`;
    const resp = await axios.get(url, { timeout: 8000 });
    console.log(`OpenTripMap found ${resp.data?.length || 0} places`);
    resp.data?.slice(0, 5).forEach(p => console.log(`  - ${p.name} (${p.point?.lat}, ${p.point?.lon})`));
  } catch(e) {
    console.log('OpenTripMap error:', e.response?.status || e.message);
  }

  // Try Photon (Komoot's geocoder, based on OSM)
  try {
    console.log('\nTesting Photon (Komoot)...');
    const brands = ['Zudio Jalandhar', 'H&M Jalandhar', 'Zara Jalandhar'];
    for (const q of brands) {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=2&lat=${lat}&lon=${lng}`;
      const resp = await axios.get(url, { timeout: 5000 });
      const features = resp.data?.features || [];
      if (features.length > 0) {
        features.forEach(f => {
          const coords = f.geometry?.coordinates;
          console.log(`  FOUND: ${f.properties?.name || q} at (${coords?.[1]}, ${coords?.[0]}) - ${f.properties?.city || ''}`);
        });
      } else {
        console.log(`  No results for: ${q}`);
      }
      await new Promise(r => setTimeout(r, 500));
    }
  } catch(e) {
    console.log('Photon error:', e.message);
  }
}

testGeoapify();
