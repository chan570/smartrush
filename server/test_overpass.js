const axios = require('axios');

async function testOverpass() {
  const query = '[out:json][timeout:10];node(around:5000,28.6139,77.2090)["shop"="clothes"];out;';
  
  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const mirror of mirrors) {
    try {
      console.log(`Testing ${mirror}...`);
      const resp = await axios.post(mirror, `data=${encodeURIComponent(query)}`, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 12000
      });
      console.log(`SUCCESS from ${mirror}: ${resp.data.elements?.length || 0} stores found`);
      resp.data.elements?.slice(0, 3).forEach(el => {
        console.log(`  - ${el.tags?.name || 'Unknown'} (${el.lat}, ${el.lon})`);
      });
      return;
    } catch (err) {
      console.log(`FAILED ${mirror}: ${err.response?.status || err.message}`);
    }
  }
  console.log('All mirrors failed.');
}

testOverpass();
