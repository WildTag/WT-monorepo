import { MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import App from "./Router";
import "./styles/globals.css";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <MantineProvider
    withCSSVariables
    withGlobalStyles
    withNormalizeCSS
    theme={{
      colorScheme: "dark",
    }}
  >
    <Notifications limit={99} />
    <ModalsProvider>
      <App />
    </ModalsProvider>
  </MantineProvider>
);
