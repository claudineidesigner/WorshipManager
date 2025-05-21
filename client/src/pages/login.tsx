import React, { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/useAuth";

const Login: React.FC = () => {
  const { login } = useLogin();
  
  // Iniciar login imediatamente
  useEffect(() => {
    const timer = setTimeout(() => {
      login();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <img 
              src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
              alt="WorshipManager logo" 
              className="h-12 w-12 rounded-md"
            />
            <span className="text-primary-600 font-semibold text-3xl">WorshipManager</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Entrar na sua conta</CardTitle>
            <CardDescription className="text-center">
              Redirecionando para o sistema de login...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-center text-sm text-muted-foreground">
              Você será redirecionado automaticamente para o login.
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={() => login()}
            >
              Entrar agora
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 py-4">
            <p className="text-sm text-gray-600">
              Novo por aqui?{" "}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Criar conta
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
