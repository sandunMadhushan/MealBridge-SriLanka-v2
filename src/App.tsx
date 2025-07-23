import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import FindFood from "./pages/FindFood";
import Donate from "./pages/Donate";
import Community from "./pages/Community";
import Impact from "./pages/Impact";
import Auth from "./pages/Auth";
import DonorDashboard from "./pages/DonorDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import HelpCenter from "./pages/HelpCenter";
import FoodSafety from "./pages/FoodSafety";
import Guidelines from "./pages/Guidelines";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

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
            <Route path="/dashboard/donor" element={<DonorDashboard />} />
            <Route
              path="/dashboard/recipient"
              element={<RecipientDashboard />}
            />
            <Route
              path="/dashboard/volunteer"
              element={<VolunteerDashboard />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<FoodSafety />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
