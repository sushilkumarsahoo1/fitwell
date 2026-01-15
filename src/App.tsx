import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@context/AuthContext";
import { RootNavigator } from "./RootNavigator";
import { queryClient } from "./queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
