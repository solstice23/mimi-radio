import { blurHash } from 'vite-plugin-blurhash-sharp-fix-fork'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		blurHash({
			imageDir: '/src/data/covers',
			mapPath: '/blurhash-map.json'
			//mapPath: undefined
		}),
		ViteImageOptimizer({
  			test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
			png: {
				quality: 80,
			},
			jpg: {
				quality: 80,
			},
		}),
	],
})
