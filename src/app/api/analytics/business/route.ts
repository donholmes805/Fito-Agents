import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { AnalyticsService, TimeRange } from '@/services/analytics.server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');
    const timeRange = (url.searchParams.get('timeRange') || 'billing') as TimeRange;

    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    // Verify user has access to this business
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();
    
    // Only owner/admin or the business owner can view
    if (userData?.role !== 'owner' && userData?.role !== 'admin' && userData?.businessId !== businessId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await AnalyticsService.getBusinessAnalytics(businessId, timeRange);
    
    if (!data) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
