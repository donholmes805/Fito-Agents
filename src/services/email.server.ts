import { resend, RESEND_FROM_EMAIL } from '@/lib/resend';
import { Business, Agent, Lead } from '@/types';

/**
 * Email Service (Server-side only)
 */
export const EmailService = {
  /**
   * Send notification to business owner when a new lead is captured
   */
  async sendNewLeadNotification(params: {
    business: Business;
    agent: Agent;
    lead: Lead;
    recipientEmail: string;
  }) {
    const { business, agent, lead, recipientEmail } = params;

    if (!resend) {
      console.warn('Resend is not configured. Skipping email notification.');
      return { success: false, error: 'Resend not configured' };
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://fitoagents.com'}/dashboard/leads`;
    const leadDate = new Date(lead.createdAt).toLocaleString();

    const subject = `New Lead Captured by Your Fito Agent: ${agent.name}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #030816; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #0356ff; margin: 0; font-size: 24px;">Fito Agents</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eef0f4; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="margin-top: 0; color: #111;">You have a new lead!</h2>
          <p>Your AI Agent <strong>${agent.name}</strong> just captured a new lead for <strong>${business.name}</strong>.</p>
          
          <div style="background-color: #f8faff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${lead.name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${lead.email}</p>
            ${lead.phone ? `<p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${lead.phone}</p>` : ''}
            ${lead.serviceRequested ? `<p style="margin: 0 0 10px 0;"><strong>Interested In:</strong> ${lead.serviceRequested}</p>` : ''}
            <p style="margin: 0 0 10px 0;"><strong>Source:</strong> ${lead.source?.replace('_', ' ') || 'Website'}</p>
            <p style="margin: 0;"><strong>Date:</strong> ${leadDate}</p>
          </div>
          
          ${lead.message ? `
          <div style="margin: 20px 0;">
            <p style="margin-bottom: 5px;"><strong>Lead Message:</strong></p>
            <blockquote style="margin: 0; padding: 15px; background: #fff; border-left: 4px solid #0356ff; font-style: italic;">
              ${lead.message}
            </blockquote>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${dashboardUrl}" style="background-color: #0356ff; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Lead in Dashboard
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #888;">
          <p>© ${new Date().getFullYear()} Fito Technology, LLC. All rights reserved.</p>
        </div>
      </div>
    `;

    const textContent = `
      New Lead Captured by ${agent.name} for ${business.name}
      
      Name: ${lead.name}
      Email: ${lead.email}
      ${lead.phone ? `Phone: ${lead.phone}` : ''}
      ${lead.serviceRequested ? `Interested In: ${lead.serviceRequested}` : ''}
      Source: ${lead.source || 'Website'}
      Date: ${leadDate}
      
      ${lead.message ? `Message: ${lead.message}` : ''}
      
      View Lead: ${dashboardUrl}
    `;

    try {
      const data = await resend.emails.send({
        from: `Fito Agents <${RESEND_FROM_EMAIL}>`,
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      if (data.error) {
        console.error('Resend error:', data.error);
        return { success: false, error: data.error.message };
      }

      return { success: true, id: data.data?.id };
    } catch (error: any) {
      console.error('Email service exception:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  },

  /**
   * Send usage warning email (80% threshold)
   */
  async sendUsageWarningEmail(params: {
    business: Business;
    recipientEmail: string;
    used: number;
    limit: number;
    nextResetDate?: string;
  }) {
    const { business, recipientEmail, used, limit, nextResetDate } = params;
    if (!resend) return { success: false, error: 'Resend not configured' };

    const percent = Math.round((used / limit) * 100);
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://fitoagents.com'}/dashboard/billing`;
    const subject = `Your Fito Agent Has Used ${percent}% of This Month’s Messages`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #030816; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #0356ff; margin: 0; font-size: 24px;">Fito Agents</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eef0f4; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="margin-top: 0; color: #111;">Approaching Message Limit</h2>
          <p>This is a friendly reminder that <strong>${business.name}</strong> is nearing its monthly message limit.</p>
          
          <div style="background-color: #f8faff; padding: 25px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <div style="margin-bottom: 15px;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Current Usage</span>
              <div style="font-size: 24px; font-weight: 800; color: #0356ff;">${used.toLocaleString()} / ${limit.toLocaleString()}</div>
            </div>
            
            <div style="height: 12px; width: 100%; background-color: #e2e8f0; border-radius: 6px; overflow: hidden;">
              <div style="height: 100%; width: ${percent}%; background-color: #0356ff;"></div>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
              Usage resets on: <strong>${nextResetDate ? new Date(nextResetDate).toLocaleDateString() : 'Next billing cycle'}</strong>
            </p>
          </div>
          
          <p>To avoid service interruption for your website visitors, consider upgrading your plan.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${dashboardUrl}" style="background-color: #0356ff; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Upgrade Now
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #888;">
          <p>© ${new Date().getFullYear()} Fito Technology, LLC. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: `Fito Agents <${RESEND_FROM_EMAIL}>`,
        to: [recipientEmail],
        subject,
        html: htmlContent,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Usage warning email error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send usage limit reached email (100% threshold)
   */
  async sendUsageLimitReachedEmail(params: {
    business: Business;
    recipientEmail: string;
    limit: number;
    nextResetDate?: string;
  }) {
    const { business, recipientEmail, limit, nextResetDate } = params;
    if (!resend) return { success: false, error: 'Resend not configured' };

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://fitoagents.com'}/dashboard/billing`;
    const subject = `Your Fito Agent Has Reached Its Monthly Message Limit`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #030816; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ff3333; margin: 0; font-size: 24px;">Fito Agents</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eef0f4; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="margin-top: 0; color: #111;">Limit Reached!</h2>
          <p>Your AI Agent for <strong>${business.name}</strong> has reached the monthly limit of <strong>${limit.toLocaleString()}</strong> messages.</p>
          
          <div style="background-color: #fff1f1; padding: 25px; border-radius: 12px; margin: 20px 0; border: 1px solid #ffcccc;">
            <p style="margin: 0; color: #cc0000; font-weight: bold;">AI Responses Paused</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #660000;">
              Your agent will now use its fallback message and will not generate AI responses until the next cycle or until you upgrade.
            </p>
          </div>
          
          <p style="font-size: 14px;">Next reset date: <strong>${nextResetDate ? new Date(nextResetDate).toLocaleDateString() : 'Next billing cycle'}</strong></p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${dashboardUrl}" style="background-color: #0356ff; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Upgrade to Restore Access
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #888;">
          <p>© ${new Date().getFullYear()} Fito Technology, LLC. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: `Fito Agents <${RESEND_FROM_EMAIL}>`,
        to: [recipientEmail],
        subject,
        html: htmlContent,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Usage limit email error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Placeholder for billing issue notifications
   */
  async sendBillingIssueNotificationPlaceholder() {
    return { success: true, message: 'Not implemented yet' };
  },

  /**
   * Placeholder for plan upgrade notifications
   */
  async sendPlanUpgradeNotificationPlaceholder() {
    return { success: true, message: 'Not implemented yet' };
  }
};
