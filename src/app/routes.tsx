import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DiscoverPage } from "../pages/DiscoverPage";
import { OpportunityPage } from "../pages/OpportunityPage";
import { ShortlistPage } from "../pages/ShortlistPage";
import { ComparePage } from "../pages/ComparePage";
import { ExplainabilityPage } from "../pages/ExplainabilityPage";
import { AdminPage } from "../pages/AdminPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/opportunity/:id" element={<OpportunityPage />} />
        <Route path="/shortlist" element={<ShortlistPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/how-it-works" element={<ExplainabilityPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
