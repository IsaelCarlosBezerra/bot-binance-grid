import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/start': 'http://localhost:8080',
            '/stop': 'http://localhost:8080',
            '/status': 'http://localhost:8080',
            '/config': 'http://localhost:8080'
        }
    }
})
