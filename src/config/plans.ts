export interface PlanConfig {
  id: "starter" | "business" | "advanced" | "free" | "custom";
  name: string;
  maxAgents: number;
  monthlyMessageLimit: number;
  knowledgeItemsLimit: number;
  documentUploadEnabled: boolean;
  removePoweredBy: boolean;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter Agent",
    maxAgents: 1,
    monthlyMessageLimit: 500,
    knowledgeItemsLimit: 50,
    documentUploadEnabled: false,
    removePoweredBy: false,
  },
  business: {
    id: "business",
    name: "Business Agent",
    maxAgents: 3,
    monthlyMessageLimit: 3000,
    knowledgeItemsLimit: 300,
    documentUploadEnabled: true,
    removePoweredBy: false,
  },
  advanced: {
    id: "advanced",
    name: "Advanced Agent",
    maxAgents: 10,
    monthlyMessageLimit: 10000,
    knowledgeItemsLimit: 1000,
    documentUploadEnabled: true,
    removePoweredBy: true,
  },
  free: {
    id: "free",
    name: "Free Plan",
    maxAgents: 1,
    monthlyMessageLimit: 100,
    knowledgeItemsLimit: 10,
    documentUploadEnabled: false,
    removePoweredBy: false,
  },
  custom: {
    id: "custom",
    name: "Custom Plan",
    maxAgents: 100,
    monthlyMessageLimit: 100000,
    knowledgeItemsLimit: 10000,
    documentUploadEnabled: true,
    removePoweredBy: true,
  },
};

export const getPlanConfig = (planId: string = "starter"): PlanConfig => {
  return PLAN_CONFIGS[planId] || PLAN_CONFIGS.starter;
};
