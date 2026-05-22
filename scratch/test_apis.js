const axios = require('axios');

async function test() {
  try {
    const bal = await axios.get('http://localhost:5000/api/hassala/balance');
    console.log('Balance API:', bal.data);
    
    const hist = await axios.get('http://localhost:5000/api/hassala');
    console.log('History API (first 2):', hist.data.slice(0, 2));
    
    const today = await axios.get('http://localhost:5000/api/hassala/today');
    console.log('Today API:', today.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
