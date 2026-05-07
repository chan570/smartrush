const axios = require('axios');

async function testNominatim() {
  const brands = ['Zudio', 'H&M', 'Zara', 'Pantaloons', 'Max Fashion'];
  const city = 'Jalandhar';
  
  for (const brand of brands) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(brand + ' ' + city)}&format=json&limit=3`;
      console.log(`Searching: ${brand} in ${city}...`);
      const resp = await axios.get(url, {
        headers: { 'User-Agent': 'SmartRush/1.0 (student-project)' }
      });
      
      if (resp.data.length > 0) {
        resp.data.forEach(r => {
          console.log(`  FOUND: ${r.display_name.substring(0, 60)} (${r.lat}, ${r.lon})`);
        });
      } else {
        console.log(`  No results for ${brand}`);
      }
      
      // Respect rate limit: 1 request per second
      await new Promise(r => setTimeout(r, 1100));
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }
}

testNominatim();
