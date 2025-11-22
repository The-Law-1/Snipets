import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

export default () => {
	return defineConfig({

		plugins: [vue(), tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)) // Alias for src folder
			}
		},
		server: {
			port: 3000
		}
	});
};
