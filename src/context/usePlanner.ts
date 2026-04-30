/**
 * Convenience hook for reading the planner store.
 * Throws if used outside `<PlannerProvider>`, which surfaces wiring bugs at
 * mount time instead of producing silent undefined behaviour.
 */
import { useContext } from "react";
import { PlannerContext } from "./plannerStoreContext";

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner must be used within PlannerProvider");
  }
  return context;
}
