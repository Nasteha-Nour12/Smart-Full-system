import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App.jsx";
import store from "./app/store.jsx";
import AppInitializer from "./AppInitializer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AppInitializer>
        <App />
      </AppInitializer>
    </Provider>
  </StrictMode>
);
