import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: '0.0.0.0', // Listen on all addresses, including LAN
    port: 5173,      // Or any port you like
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'key/key.pem')), // Path to your private key
      cert: fs.readFileSync(path.resolve(__dirname, 'key/cert.pem')), // Path to your certificate
      passphrase: '1234'
    },
  },
})