import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { LoginPage } from './pages/LoginPage';

// Pages
import { HomePage } from './pages/HomePage';
import { MyProperties } from './pages/client/MyProperties';
import { RequestsPage } from './pages/client/RequestsPage';

// Agent Pages
import { AgentPortal } from './pages/agent/AgentPortal';
import { AgentClients } from './pages/agent/AgentClients';
import { AgentOffers } from './pages/agent/AgentOffers';

// Inspector Pages
import { InspectorPortal } from './pages/inspector/InspectorPortal';
import { InspectionRequests } from './pages/inspector/InspectionRequests';
import { InspectionReports } from './pages/inspector/InspectionReports';

// Admin Pages
import { AdminPortal } from './pages/admin/AdminPortal';
import { AdminForReview } from './pages/admin/AdminForReview';
import { AdminReviewed } from './pages/admin/AdminReviewed';

// Vendor Pages
import { VendorPortal } from './pages/vendor/VendorPortal';
import { QuoteRequests } from './pages/vendor/QuoteRequests';

// Wholesaler Pages
import { WholesalerPortal } from './pages/wholesaler/WholesalerPortal';
import { SubmitProperty } from './pages/wholesaler/SubmitProperty';
import { ListingsPage } from './pages/wholesaler/ListingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          {/* Client Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/requests" element={<RequestsPage />} />

          {/* Agent Routes */}
          <Route path="/agent" element={<AgentPortal />} />
          <Route path="/agent/clients" element={<AgentClients />} />
          <Route path="/agent/offers" element={<AgentOffers />} />

          {/* Inspector Routes */}
          <Route path="/inspector" element={<InspectorPortal />} />
          <Route path="/inspector/requests" element={<InspectionRequests />} />
          <Route path="/inspector/reports" element={<InspectionReports />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/for-review" element={<AdminForReview />} />
          <Route path="/admin/reviewed" element={<AdminReviewed />} />

          {/* Vendor Routes */}
          <Route path="/vendor" element={<VendorPortal />} />
          <Route path="/vendor/quotes" element={<QuoteRequests />} />

          {/* Wholesaler Routes */}
          <Route path="/wholesaler" element={<WholesalerPortal />} />
          <Route path="/wholesaler/submit" element={<SubmitProperty />} />
          <Route path="/wholesaler/listings" element={<ListingsPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;