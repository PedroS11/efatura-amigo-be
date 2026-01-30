import type { Stack } from "aws-cdk-lib";
import * as budgets from "aws-cdk-lib/aws-budgets";

export const createNoCostsBudget = (stack: Stack) => {
  new budgets.CfnBudget(stack, "ZeroSpendBudget", {
    budget: {
      budgetType: "COST",
      budgetName: "StayFreeTierBudget",
      budgetLimit: {
        amount: 0.01, // Trigger alert at 1 cent
        unit: "USD"
      },
      timeUnit: "MONTHLY"
    },
    notificationsWithSubscribers: [
      {
        notification: {
          comparisonOperator: "GREATER_THAN",
          notificationType: "FORECASTED", // Alert based on expected end-of-month cost
          threshold: 100 // Alert when forecast hits 100% of the $0.01 limit
        },
        subscribers: [
          {
            subscriptionType: "EMAIL",
            address: "pedrosilva1137work@gmail.com" // CHANGE THIS
          }
        ]
      }
    ]
  });
};
