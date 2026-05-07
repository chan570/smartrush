const axios = require('axios');

async function testOrder() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hmindiranagar@owner.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Get a store and inventory
    const storesRes = await axios.get('http://localhost:5000/api/stores');
    const store = storesRes.data[0];
    
    const inventoryRes = await axios.get(`http://localhost:5000/api/stores/${store._id}/inventory`);
    const item = inventoryRes.data[0];

    // 3. Create COD Order
    console.log("Testing COD Order...");
    const orderRes = await axios.post('http://localhost:5000/api/payments/create-order', {
      storeId: store._id,
      items: [{
        product: item.product._id,
        inventoryId: item._id,
        name: item.product.name,
        price: item.product.price,
        quantity: 1
      }],
      totalAmount: item.product.price,
      customerDetails: { name: 'Test User', address: '123 Test St' },
      paymentMethod: 'COD'
    }, config);

    console.log("SUCCESS:", orderRes.data.message);
  } catch (error) {
    console.error("FAILED:", error.response?.data?.message || error.message);
  }
}

testOrder();
