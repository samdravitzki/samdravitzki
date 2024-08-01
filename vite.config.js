import { defineConfig } from 'vite'


export default defineConfig({
    test: {
        environment: 'jsdom',
        coverage: {
            enabled: true,
            provider: 'v8',
        }
    }
}) 