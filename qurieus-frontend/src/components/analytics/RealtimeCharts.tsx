import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table, Image, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { exportToCSV, exportToExcel, exportToPDF, exportChartImage, downloadFile, ExportOptions } from '@/utils/exportData';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function RealtimeCharts() {
  const { data } = useRealtimeAnalytics();
  const [chartData, setChartData] = useState<any>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dateFormat: 'local',
    numberFormat: 'formatted',
    includeCharts: true,
    filter: {
      successOnly: false,
      minResponseTime: 0,
      minViews: 0
    }
  });
  const visitorsChartRef = useRef<HTMLDivElement>(null);
  const queriesChartRef = useRef<HTMLDivElement>(null);
  const viewsChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;

    setChartData({
      visitors: {
        options: {
          chart: {
            type: 'line',
            animations: {
              enabled: false
            }
          },
          xaxis: {
            categories: [new Date(data.timestamp).toLocaleTimeString()]
          },
          yaxis: {
            min: 0,
            tickAmount: 5
          }
        },
        series: [{
          name: 'Active Visitors',
          data: [data.activeVisitors]
        }]
      },
      queries: {
        options: {
          chart: {
            type: 'bar'
          },
          xaxis: {
            categories: data.recentQueries.map(q => q.document)
          },
          colors: data.recentQueries.map(q => q.success ? '#4CAF50' : '#F44336')
        },
        series: [{
          name: 'Response Time (ms)',
          data: data.recentQueries.map(q => q.responseTime)
        }]
      },
      views: {
        options: {
          chart: {
            type: 'donut'
          },
          labels: data.documentViews.map(v => v.document)
        },
        series: data.documentViews.map(v => v.views)
      }
    });
  }, [data]);

  const handleExport = async (format: 'json' | 'csv' | 'excel' | 'pdf' | 'image') => {
    if (!data) return;

    const timestamp = new Date().toISOString();
    const exportData = {
      timestamp: data.timestamp,
      activeVisitors: data.activeVisitors,
      recentQueries: data.recentQueries.map(q => ({
        document: q.document,
        query: q.query,
        responseTime: q.responseTime,
        success: q.success,
        createdAt: q.createdAt
      })),
      documentViews: data.documentViews.map(v => ({
        document: v.document,
        views: v.views,
        queries: v.queries,
        lastViewed: v.lastViewed
      }))
    };

    switch (format) {
      case 'json':
        downloadFile(
          JSON.stringify(exportData, null, 2),
          `analytics-export-${timestamp}.json`,
          'application/json'
        );
        break;
      case 'csv':
        downloadFile(
          exportToCSV(exportData, exportOptions),
          `analytics-export-${timestamp}.csv`,
          'text/csv'
        );
        break;
      case 'excel':
        downloadFile(
          exportToExcel(exportData, exportOptions),
          `analytics-export-${timestamp}.xlsx`,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        break;
      case 'pdf':
        const pdf = await exportToPDF(exportData, exportOptions);
        downloadFile(
          pdf,
          `analytics-export-${timestamp}.pdf`,
          'application/pdf'
        );
        break;
      case 'image':
        if (visitorsChartRef.current && queriesChartRef.current && viewsChartRef.current) {
          const [visitorsImage, queriesImage, viewsImage] = await Promise.all([
            exportChartImage(visitorsChartRef.current),
            exportChartImage(queriesChartRef.current),
            exportChartImage(viewsChartRef.current)
          ]);

          // Create a zip file with all chart images
          const zip = new JSZip();
          zip.file('visitors-chart.png', visitorsImage.split(',')[1], { base64: true });
          zip.file('queries-chart.png', queriesImage.split(',')[1], { base64: true });
          zip.file('views-chart.png', viewsImage.split(',')[1], { base64: true });

          const content = await zip.generateAsync({ type: 'blob' });
          downloadFile(
            content,
            `analytics-charts-${timestamp}.zip`,
            'application/zip'
          );
        }
        break;
    }
  };

  if (!data || !chartData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={exportOptions.dateFormat}
                  onValueChange={(value: 'iso' | 'local' | 'relative') =>
                    setExportOptions(prev => ({ ...prev, dateFormat: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso">ISO</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number Format</Label>
                <Select
                  value={exportOptions.numberFormat}
                  onValueChange={(value: 'raw' | 'formatted') =>
                    setExportOptions(prev => ({ ...prev, numberFormat: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw">Raw</SelectItem>
                    <SelectItem value="formatted">Formatted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Minimum Response Time (ms)</Label>
                <Input
                  type="number"
                  value={exportOptions.filter?.minResponseTime}
                  onChange={(e) =>
                    setExportOptions(prev => ({
                      ...prev,
                      filter: { ...prev.filter, minResponseTime: Number(e.target.value) }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Views</Label>
                <Input
                  type="number"
                  value={exportOptions.filter?.minViews}
                  onChange={(e) =>
                    setExportOptions(prev => ({
                      ...prev,
                      filter: { ...prev.filter, minViews: Number(e.target.value) }
                    }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={exportOptions.filter?.successOnly}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({
                      ...prev,
                      filter: { ...prev.filter, successOnly: checked }
                    }))
                  }
                />
                <Label>Success Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={exportOptions.includeCharts}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeCharts: checked }))
                  }
                />
                <Label>Include Charts</Label>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              <FileText className="w-4 h-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Table className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <Table className="w-4 h-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('image')}>
              <Image className="w-4 h-4 mr-2" />
              Export Charts as Images
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Visitors Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={visitorsChartRef}>
              <Chart
                options={chartData.visitors.options}
                series={chartData.visitors.series}
                type="line"
                height={300}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Response Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={queriesChartRef}>
              <Chart
                options={chartData.queries.options}
                series={chartData.queries.series}
                type="bar"
                height={300}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Views Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={viewsChartRef}>
              <Chart
                options={chartData.views.options}
                series={chartData.views.series}
                type="donut"
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 