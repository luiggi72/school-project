// API Configuration
// Replace with your computer's local IP if testing on physical device

// For iOS Simulator: 'http://localhost:3000/api'
// For Android Emulator: 'http://10.0.2.2:3000/api'
// For Physical Device: 'http://<YOUR_LOCAL_IP>:3000/api'

// 1. AWS Production (Default - Publicly accessible)
const API_URL = 'http://192.168.10.181:3000/api';

// 2. Android Emulator (Standard Loopback)
// const API_URL = 'http://10.0.2.2:3000/api';

// 3. iOS Simulator (Standard Loopback)
// const API_URL = 'http://localhost:3000/api';

// 4. Physical Device (Local Network - Replace <YOUR_LOCAL_IP>)
// const API_URL = 'http://192.168.1.X:3000/api';

export default API_URL;
