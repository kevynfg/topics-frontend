import { Route, Routes } from "react-router-dom";
import './App.css';
import Layout from "./components/ui/layout";
import { WebSocketProvider } from "./context/websocket";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import NotFound from "./pages/NotFound";
import Room from "./pages/Room";

function App() {
  return (
    <Layout>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </WebSocketProvider>
    </Layout>
  )
}

export default App;
