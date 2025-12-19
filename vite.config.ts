import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // 🔴 مهم جدًا لـ GitHub Pages
    // غيّر REPO_NAME لاسم الريبو بالظبط
    base: "/REPO_NAME/",

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    /**
     * ⚠️ ملاحظة مهمة:
     * Vite لا يدعم process.env في المتصفح
     * لذلك نعرّف المتغيرات بطريقة آمنة متوافقة مع Vite
     */
    define: {
      __GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
