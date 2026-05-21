import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  splitting: false,
  external: ["react", "react-dom"],
  loader: {
    ".css": "copy",
  },
  publicDir: false,
  async onSuccess() {
    const { cp, readFile, writeFile } = await import("node:fs/promises");
    await cp("src/styles.css", "dist/styles.css");

    const directive = '"use client";\n';
    for (const file of ["dist/index.js", "dist/index.cjs"]) {
      try {
        const content = await readFile(file, "utf8");
        if (!content.startsWith('"use client"')) {
          await writeFile(file, directive + content);
        }
      } catch {
        // file may not exist for a given format; ignore
      }
    }
  },
});
