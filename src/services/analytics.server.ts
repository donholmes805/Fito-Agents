import { adminDb } from '@/lib/firebase/admin';
import { Agent, Business, Conversation, Lead, UsageLog } from '@/types';
import { getPlanConfig } from '@/config/plans';

export type TimeRange = '7d' | '30d' | 'billing' | 'all';

export const AnalyticsService = {
  /**
   * Main function to get all analytics for a business
   */
  async getBusinessAnalytics(businessId: string, timeRange: TimeRange = 'billing') {
    if (!adminDb) return null;

    const businessDoc = await adminDb.collection('businesses').doc(businessId).get();
    if (!businessDoc.exists) return null;
    const business = businessDoc.data() as Business;

    let startDate: Date | null = null;
    const now = new Date();

    if (timeRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'billing') {
      // Use lastUsageResetAt or fallback to 30 days
      if (business.lastUsageResetAt) {
        startDate = new Date(business.lastUsageResetAt);
      } else {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Since we're doing client-side aggregation for MVP, let's fetch the data
    // For large volumes, we should use server-side aggregation or summary documents
    let usageQuery = adminDb.collection('usageLogs').where('businessId', '==', businessId);
    let leadsQuery = adminDb.collection('leads').where('businessId', '==', businessId);
    let convsQuery = adminDb.collection('conversations').where('businessId', '==', businessId);
    
    // We cannot easily do range queries if createdAt is not consistently indexed or if we need multiple inequality queries, 
    // but we can fetch all for the business and filter in memory since volume is small for MVP,
    // OR we can rely on proper indexes. Assuming we just fetch all for now and filter.
    // Actually, let's try to query if possible, or just fetch all and filter in memory to avoid index errors for now.
    
    const [usageSnap, leadsSnap, convsSnap, agentsSnap] = await Promise.all([
      usageQuery.get(),
      leadsQuery.get(),
      convsQuery.get(),
      adminDb.collection('agents').where('businessId', '==', businessId).get()
    ]);

    const allUsage = usageSnap.docs.map(d => {
        const data = d.data();
        return {
            ...data,
            // Handle both Firestore Timestamp and string formats
            createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt)
        } as UsageLog & { createdAt: Date };
    });

    const allLeads = leadsSnap.docs.map(d => ({
        ...d.data(),
        createdAt: new Date(d.data().createdAt)
    })) as (Lead & { createdAt: Date })[];

    const allConvs = convsSnap.docs.map(d => ({
        ...d.data(),
        createdAt: new Date(d.data().createdAt)
    })) as (Conversation & { createdAt: Date })[];

    const agents = agentsSnap.docs.map(d => d.data() as Agent);

    // Filter by date
    const usage = startDate ? allUsage.filter(u => u.createdAt >= startDate!) : allUsage;
    const leads = startDate ? allLeads.filter(l => l.createdAt >= startDate!) : allLeads;
    const convs = startDate ? allConvs.filter(c => c.createdAt >= startDate!) : allConvs;

    // Aggregate Metrics
    const totalMessages = usage.filter(u => u.type === 'message').reduce((sum, u) => sum + (u.messagesUsed || 0), 0);
    const totalConversations = convs.length;
    const totalLeads = leads.length;
    const conversionRate = totalConversations > 0 ? (totalLeads / totalConversations) * 100 : 0;
    
    // Usage Percentage
    const planConfig = getPlanConfig(business.plan);
    const usagePercentage = Math.min(Math.round(((business.monthlyMessagesUsed || 0) / planConfig.monthlyMessageLimit) * 100), 100);

    // Top Source
    const sourceCount: Record<string, number> = {};
    convs.forEach(c => {
        sourceCount[c.source] = (sourceCount[c.source] || 0) + 1;
    });
    let topSource = 'N/A';
    let maxCount = 0;
    Object.entries(sourceCount).forEach(([source, count]) => {
        if (count > maxCount) {
            maxCount = count;
            topSource = source;
        }
    });

    // Chart Data: Messages over time
    const messagesByDay = this.groupByDay(usage.filter(u => u.type === 'message'), startDate);
    
    // Chart Data: Leads over time
    const leadsByDay = this.groupByDay(leads, startDate);
    
    // Merge for primary chart
    const timelineData = Object.keys(messagesByDay).map(date => ({
        date,
        messages: messagesByDay[date].length > 0 ? messagesByDay[date].reduce((sum: number, u: any) => sum + (u.messagesUsed || 0), 0) : 0,
        leads: leadsByDay[date]?.length || 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Chart Data: Sources
    const sourceData = Object.entries(sourceCount).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

    // Chart Data: Lead Status
    const statusCount: Record<string, number> = {};
    leads.forEach(l => {
        statusCount[l.status] = (statusCount[l.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Agent Performance
    const agentPerformance = agents.map(agent => {
        const agentUsage = usage.filter(u => u.agentId === agent.id && u.type === 'message');
        const agentConvs = convs.filter(c => c.agentId === agent.id);
        const agentLeads = leads.filter(l => l.agentId === agent.id);
        
        return {
            id: agent.id,
            name: agent.name,
            status: agent.status,
            messagesUsed: agentUsage.reduce((sum, u) => sum + (u.messagesUsed || 0), 0),
            conversations: agentConvs.length,
            leads: agentLeads.length,
            conversionRate: agentConvs.length > 0 ? (agentLeads.length / agentConvs.length) * 100 : 0
        };
    });

    return {
        metrics: {
            totalMessages,
            totalConversations,
            totalLeads,
            conversionRate,
            activeAgents: agents.filter(a => a.status === 'active').length,
            topSource,
            usagePercentage
        },
        charts: {
            timelineData,
            sourceData,
            statusData
        },
        agentPerformance
    };
  },

  groupByDay(items: any[], minDate: Date | null) {
      const grouped: Record<string, any[]> = {};
      
      // Initialize with 0s if minDate provided
      if (minDate) {
          let curr = new Date(minDate);
          const end = new Date();
          while (curr <= end) {
              const dateStr = curr.toISOString().split('T')[0];
              grouped[dateStr] = [];
              curr.setDate(curr.getDate() + 1);
          }
      }

      items.forEach(item => {
          if (!item.createdAt) return;
          const dateStr = item.createdAt.toISOString().split('T')[0];
          if (!grouped[dateStr]) grouped[dateStr] = [];
          grouped[dateStr].push(item);
      });

      return grouped;
  }
};
