import { defineConfig } from "vite"

export default defineConfig({
  css: {
    transformer: "lightningcss"
  },
  server: {
    proxy: {
      "/ws/layers": {
        target: "ws://led-wall-pi.bean.systems:42025",
        ws: true
      }
    }
  }
})
