import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { subDays } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const timeRange = searchParams.get('timeRange') || '30d';
    const type = searchParams.get('type') || 'all'; // all, documents, queries, visitors

    // Calculate date range
    const now = new Date();
    const startDate = subDays(now, timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7);

    // Fetch data based on type
    let data: any = {};
    
    if (type === 'all' || type === 'documents') {
      data.documents = await prisma.documentAnalytics.findMany({
        where: {
          document: {
            userId,
            uploadedAt: { gte: startDate }
          }
        },
        include: {
          document: true
        }
      });
    }

    if (type === 'all' || type === 'queries') {
      data.queries = await prisma.queryAnalytics.findMany({
        where: {
          document: {
            userId,
            uploadedAt: { gte: startDate }
          }
        },
        include: {
          document: true
        }
      });
    }

    if (type === 'all' || type === 'visitors') {
      data.visitors = await prisma.visitorSession.findMany({
        where: {
          userId,
          startTime: { gte: startDate }
        }
      });
    }

    // Format data for export
    let exportData: any;
    let filename: string;
    let contentType: string;

    switch (format.toLowerCase()) {
      case 'csv':
        const parser = new Parser();
        exportData = parser.parse(data);
        filename = `analytics-${type}-${timeRange}.csv`;
        contentType = 'text/csv';
        break;

      case 'excel':
        const workbook = new ExcelJS.Workbook();
        
        // Add documents sheet
        if (data.documents) {
          const documentsSheet = workbook.addWorksheet('Documents');
          documentsSheet.columns = [
            { header: 'Document', key: 'fileName' },
            { header: 'Views', key: 'views' },
            { header: 'Queries', key: 'queries' },
            { header: 'Last Viewed', key: 'lastViewed' }
          ];
          documentsSheet.addRows(data.documents.map((d: any) => ({
            fileName: d.document.fileName,
            views: d.views,
            queries: d.queries,
            lastViewed: d.lastViewed
          })));
        }

        // Add queries sheet
        if (data.queries) {
          const queriesSheet = workbook.addWorksheet('Queries');
          queriesSheet.columns = [
            { header: 'Document', key: 'fileName' },
            { header: 'Query', key: 'query' },
            { header: 'Response Time', key: 'responseTime' },
            { header: 'Success', key: 'success' },
            { header: 'Date', key: 'createdAt' }
          ];
          queriesSheet.addRows(data.queries.map((q: any) => ({
            fileName: q.document.fileName,
            query: q.query,
            responseTime: q.responseTime,
            success: q.success,
            createdAt: q.createdAt
          })));
        }

        // Add visitors sheet
        if (data.visitors) {
          const visitorsSheet = workbook.addWorksheet('Visitors');
          visitorsSheet.columns = [
            { header: 'Start Time', key: 'startTime' },
            { header: 'Duration', key: 'duration' },
            { header: 'Page Views', key: 'pageViews' },
            { header: 'Queries', key: 'queries' },
            { header: 'Device', key: 'deviceType' }
          ];
          visitorsSheet.addRows(data.visitors.map((v: any) => ({
            startTime: v.startTime,
            duration: v.duration,
            pageViews: v.pageViews,
            queries: v.queries,
            deviceType: v.deviceInfo?.type || 'unknown'
          })));
        }

        const buffer = await workbook.xlsx.writeBuffer();
        exportData = buffer;
        filename = `analytics-${type}-${timeRange}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

    // Return the file
    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: `Failed to export analytics: ${error.message}` },
      { status: 500 }
    );
  }
} 