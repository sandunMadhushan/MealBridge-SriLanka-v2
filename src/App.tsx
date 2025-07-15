import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import FindFood from "./pages/FindFood";
import Donate from "./pages/Donate";
import Community from "./pages/Community";
import Impact from "./pages/Impact";
import Auth from "./pages/Auth";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-food" element={<FindFood />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/community" element={<Community />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
