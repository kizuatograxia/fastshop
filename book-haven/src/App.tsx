import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Store from "./pages/Store";
import BookDetail from "./pages/BookDetail";
import Authors from "./pages/Authors";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBooks from "./pages/AdminBooks";
import Cart from "./pages/Cart";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AuthorDetail from "./pages/AuthorDetail";
import MyLibrary from "./pages/MyLibrary";
import Reader from "./pages/Reader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/store" element={<Store />} />
            <Route path="/books" element={<Store />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/author/:slug" element={<AuthorDetail />} />
            <Route path="/about" element={<About />} />

            {/* Protected/User Routes */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="/read/:bookId" element={<Reader />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/success" element={<OrderSuccess />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="users" element={<div>Users Management (Coming Soon)</div>} />
              <Route path="orders" element={<div>Orders Management (Coming Soon)</div>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
