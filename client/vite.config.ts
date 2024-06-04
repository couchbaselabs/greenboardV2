import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const certPath = process.env['VITE_APP_SSL_CERTIFICATE'];
const keyPath = process.env['VITE_APP_SSL_CERTIFICATE_KEY'];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
        https: {
            key: fs.readFileSync(path.resolve(__dirname, keyPath)),
            cert: fs.readFileSync(path.resolve(__dirname, certPath)),
        },
    },
  optimizeDeps: {
    include : [
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@mui/icons-material/',
        "recharts"
    ]
  }
})
