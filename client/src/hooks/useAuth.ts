import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Hook para autenticação usando Replit Auth
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// Função para navegar para a rota de login Replit
export function useLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const login = () => {
    // Com Replit Auth, a autenticação é feita redirecionando para a rota de login
    window.location.href = "/api/login";
  };

  return { login };
}

// Função para logout
export function useLogout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const logout = () => {
    // Com Replit Auth, o logout é feito redirecionando para a rota de logout
    window.location.href = "/api/logout";
  };

  return { logout };
}
