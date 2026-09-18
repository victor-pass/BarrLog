import { createContext, useContext } from "solid-js";
import type { ApiClient } from "@/api";
import type { TimeAPI } from "@/TimeAPI";

export interface AppContextValue {
  api: ApiClient;
  time: TimeAPI;
}

export const AppContext = createContext<AppContextValue>();

export function context(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("context must be used within App");
  return value;
}
