import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import Home from "@/pages/Home";
import AdminPage from "@/pages/AdminPage";
import CustomerAuthPage from "@/pages/CustomerAuthPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/login" component={CustomerAuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SiteSettingsProvider>
          <OrdersProvider>
            <ProductsProvider>
              <CustomerAuthProvider>
                <CartProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <Router />
                  </WouterRouter>
                  <Toaster />
                </CartProvider>
              </CustomerAuthProvider>
            </ProductsProvider>
          </OrdersProvider>
        </SiteSettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
