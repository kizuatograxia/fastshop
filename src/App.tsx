import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { UserRafflesProvider } from "@/contexts/UserRafflesContext";
import { RaffleEventsProvider } from "@/contexts/RaffleEventsContext";
import { GlobalEventsListener } from "@/components/GlobalEventsListener";
import { RaffleParticipationWidget } from "@/components/RaffleParticipationWidget";
import MainLayout from "@/components/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RaffleDetails from "./pages/RaffleDetails";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import WinnersFeed from "./pages/WinnersFeed";
import Sorteios from "./pages/Sorteios";
import NFTs from "./pages/NFTs";
import ComoFunciona from "./pages/ComoFunciona";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/Register";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CPFGate } from "@/components/gate/CPFGate";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <AuthProvider>
          <WalletProvider>
            <UserRafflesProvider>
              <RaffleEventsProvider>
                <GlobalEventsListener />
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Main Layout Routes */}
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/feed" element={<WinnersFeed />} />
                        <Route path="/sorteios" element={<Sorteios />} />
                        <Route path="/nfts" element={<NFTs />} />
                        <Route path="/como-funciona" element={<ComoFunciona />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/raffle/:id" element={<RaffleDetails />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/winners" element={<WinnersFeed />} />
                      </Route>

                      {/* Standalone Routes */}
                      <Route path="/auth" element={<RegisterPage />} />
                      <Route path="/login" element={<RegisterPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/admin" element={<Admin />} />

                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <RaffleParticipationWidget />
                  </BrowserRouter>
                </TooltipProvider>
              </RaffleEventsProvider>
            </UserRafflesProvider>
          </WalletProvider>
        </AuthProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
