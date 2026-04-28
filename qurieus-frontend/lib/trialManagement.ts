import { prisma } from "@/utils/prismaDB";

// Function to check and expire trials
export async function checkTrialExpiration() {
  try {
    
    const expiredTrials = await prisma.userSubscription.findMany({
      where: {
        plan: {
          name: "Free Trial"
        },
        currentPeriodEnd: {
          lt: new Date()
        },
        status: "active"
      },
      include: {
        plan: true,
        user: true
      }
    });

    for (const trial of expiredTrials) {
      await prisma.userSubscription.update({
        where: {
          id: trial.id
        },
        data: {
          status: "expired"
        }
      });

      
      // Check if user has a paid subscription before sending expired email
      const hasPaidSubscription = await checkIfUserHasPaidSubscription(trial.userId);
      if (hasPaidSubscription) {
        continue;
      }
      
      // Send trial expired email using existing email service
      try {
        const { sendTrialExpiredEmail } = await import("@/lib/email");
        await sendTrialExpiredEmail({
          email: trial.user.email,
          name: trial.user.name || trial.user.email,
          trial_end_date: trial.currentPeriodEnd.toLocaleDateString(),
        });
      } catch (emailError) {
      }
    }

  } catch (error) {
  }
}

// Function to send trial expiring warnings
export async function sendTrialExpiringWarnings() {
  try {
    
    // Product requirement: free trial reminders at 2 days before and on last day.
    const warningDays = [2, 0];
    
    for (const days of warningDays) {
      let targetDate: Date;
      
      if (days === 0) {
        // For day of expiration, check trials that expire today
        targetDate = new Date();
        targetDate.setHours(0, 0, 0, 0); // Start of today
      } else {
        // For future warnings, check trials expiring in X days
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        targetDate.setHours(0, 0, 0, 0); // Start of that day
      }
      
      const expiringTrials = await prisma.userSubscription.findMany({
        where: {
          plan: {
            name: "Free Trial"
          },
          currentPeriodEnd: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours of target date
          },
          status: "active"
        },
        include: {
          plan: true,
          user: true
        }
      });

      for (const trial of expiringTrials) {
        // Check if user has a paid subscription before sending warning email
        const hasPaidSubscription = await checkIfUserHasPaidSubscription(trial.userId);
        if (hasPaidSubscription) {
          continue;
        }

        
        try {
          const { sendTrialExpiringEmail } = await import("@/lib/email");
          await sendTrialExpiringEmail({
            email: trial.user.email,
            name: trial.user.name || trial.user.email,
            days_left: days,
            trial_end_date: trial.currentPeriodEnd.toLocaleDateString(),
          });
        } catch (emailError) {
        }
      }
    }
  } catch (error) {
  }
}

// Function to send paid subscription renewal warnings
export async function sendPaidSubscriptionRenewalWarnings() {
  try {

    // Product requirement: paid reminders "few days before" (configurable by super admin)
    // and on the last day.
    const configuredDaysBefore = await getPaidRenewalReminderDaysBefore();
    const reminderDays = [configuredDaysBefore, 0];

    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);

      const expiringPaidSubscriptions = await prisma.userSubscription.findMany({
        where: {
          status: "active",
          plan: {
            name: {
              not: "Free Trial"
            }
          },
          currentPeriodEnd: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        include: {
          plan: true,
          user: true
        }
      });

      for (const subscription of expiringPaidSubscriptions) {

        try {
          const { sendPaidSubscriptionRenewalEmail } = await import("@/lib/email");
          await sendPaidSubscriptionRenewalEmail({
            email: subscription.user.email,
            name: subscription.user.name || subscription.user.email,
            days_left: days,
            renewal_date: subscription.currentPeriodEnd.toLocaleDateString(),
            plan_name: subscription.plan.name
          });
        } catch (emailError) {
        }
      }
    }
  } catch (error) {
  }
}

async function getPaidRenewalReminderDaysBefore(): Promise<number> {
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { key: "paid_renewal_reminder_days_before" },
      select: { value: true },
    });
    const parsed = Number(row?.value ?? "3");
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 30) {
      return parsed;
    }
    return 3;
  } catch (error) {
    return 3;
  }
}

// Helper function to check if user has a paid subscription
async function checkIfUserHasPaidSubscription(userId: string): Promise<boolean> {
  try {
    // Check for any active paid subscription (not Free Trial)
    const paidSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: "active",
        plan: {
          name: {
            not: "Free Trial"
          }
        }
      }
    });

    return !!paidSubscription;
  } catch (error) {
    return false; // Default to false to ensure emails are sent if there's an error
  }
} 