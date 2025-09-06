import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "./contexts/provider.tsx";
import { HashRouter, Route, Routes } from "react-router-dom";

import Menu from './features/menu/Menu.tsx';
import BlogMenu from "./features/blog/BlogPage.tsx";
import BlogViewer from "./features/blog/BlogViewer.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <HashRouter>
            <Provider>
                <Routes>
                    <Route index element={<Menu />} />
                </Routes>
            </Provider>
        </HashRouter>
    </StrictMode>

);
