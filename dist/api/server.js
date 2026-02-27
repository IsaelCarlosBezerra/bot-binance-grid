import cors from "cors";
import express from "express";
//import path from "path"
import { registerRoutes } from "./routes.js";
export function startApi(port) {
    const app = express();
    app.use(cors());
    app.use(express.json());
    // 🔹 Servir UI
    //const uiPath = path.resolve(process.cwd(), "src/ui")
    //app.use(express.static(uiPath))
    registerRoutes(app);
    app.listen(port, () => console.log(`🌐 API rodando em PORT:${port}`));
}
//# sourceMappingURL=server.js.map