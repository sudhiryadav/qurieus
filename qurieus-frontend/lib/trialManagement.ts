import { prisma } from "@/utils/prismaDB";

// Function to check and expire trials
export async function checkTrialExpiration() {
  try {
    console.log("[TRIAL] Checking trial expiration...");
    
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

      console.log(`[TRIAL] Trial expired for user: ${trial.user.email}`);
      
      // Check if user has a paid subscription before sending expired email
      const hasPaidSubscription = await checkIfUserHasPaidSubscription(trial.userId);
      if (hasPaidSubscription) {
        console.log(`[TRIAL] Skipping expired email for ${trial.user.email} - user has paid subscription`);
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
        console.error(`[TRIAL] Failed to send expired email to ${trial.user.email}:`, emailError);
      }
    }

    console.log(`[TRIAL] Expired ${expiredTrials.length} trials`);
  } catch (error) {
    console.error("[TRIAL] Error checking trial expiration:", error);
  }
}

// Function to send trial expiring warnings
export async function sendTrialExpiringWarnings() {
  try {
    console.log("[TRIAL] Checking for trials expiring soon...");
    
    // Get trials expiring in 1, 3 days, and the day of expiration (0 days)
    const warningDays = [1, 3, 0];
    
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
          console.log(`[TRIAL] Skipping ${days}-day warning for ${trial.user.email} - user has paid subscription`);
          continue;
        }

        console.log(`[TRIAL] Sending ${days}-day warning to: ${trial.user.email}`);
        
        try {
          const { sendTrialExpiringEmail } = await import("@/lib/email");
          await sendTrialExpiringEmail({
            email: trial.user.email,
            name: trial.user.name || trial.user.email,
            days_left: days,
            trial_end_date: trial.currentPeriodEnd.toLocaleDateString(),
          });
        } catch (emailError) {
          console.error(`[TRIAL] Failed to send ${days}-day warning to ${trial.user.email}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error("[TRIAL] Error sending trial expiring warnings:", error);
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
    console.error("[TRIAL] Error checking paid subscription:", error);
    return false; // Default to false to ensure emails are sent if there's an error
  }
} 