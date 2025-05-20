import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "./pages/dashboard";
import Schedule from "./pages/schedule";
import Songs from "./pages/songs";
import Team from "./pages/team";
import Messages from "./pages/messages";
import Login from "./pages/login";
import Register from "./pages/register";
import NotFound from "./pages/not-found";
import Layout from "./components/ui/layout";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      
      <Route path="/schedule">
        <Layout>
          <Schedule />
        </Layout>
      </Route>
      
      <Route path="/songs">
        <Layout>
          <Songs />
        </Layout>
      </Route>
      
      <Route path="/team">
        <Layout>
          <Team />
        </Layout>
      </Route>
      
      <Route path="/messages">
        <Layout>
          <Messages />
        </Layout>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
