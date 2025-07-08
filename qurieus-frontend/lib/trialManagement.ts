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
    
    // Get trials expiring in 1, 3, and 7 days
    const warningDays = [1, 3, 7];
    
    for (const days of warningDays) {
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + days);
      
      const expiringTrials = await prisma.userSubscription.findMany({
        where: {
          plan: {
            name: "Free Trial"
          },
          currentPeriodEnd: {
            gte: new Date(warningDate.getTime() - 24 * 60 * 60 * 1000), // Within 24 hours of warning date
            lt: new Date(warningDate.getTime() + 24 * 60 * 60 * 1000)
          },
          status: "active"
        },
        include: {
          plan: true,
          user: true
        }
      });

      for (const trial of expiringTrials) {
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