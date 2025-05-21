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

// Wrapper components for routes
const DashboardRouteComponent = () => (
  <Layout>
    <Dashboard />
  </Layout>
);

const ScheduleRouteComponent = () => (
  <Layout>
    <Schedule />
  </Layout>
);

const SongsRouteComponent = () => (
  <Layout>
    <Songs />
  </Layout>
);

const TeamRouteComponent = () => (
  <Layout>
    <Team />
  </Layout>
);

const MessagesRouteComponent = () => (
  <Layout>
    <Messages />
  </Layout>
);

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/" component={DashboardRouteComponent} />
      <Route path="/schedule" component={ScheduleRouteComponent} />
      <Route path="/songs" component={SongsRouteComponent} />
      <Route path="/team" component={TeamRouteComponent} />
      <Route path="/messages" component={MessagesRouteComponent} />
      
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
