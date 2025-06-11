"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartProps {
  data: any[];
  xField: string;
  yField: string;
  nameField?: string;
  valueField?: string;
}

export const LineChart: React.FC<ChartProps> = ({ data, xField, yField }) => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: data.map(item => item[xField]),
    },
    stroke: {
      curve: 'smooth',
    },
  };

  const series = [{
    name: yField,
    data: data.map(item => item[yField]),
  }];

  return <Chart options={options} series={series} type="line" height={350} />;
};

export const BarChart: React.FC<ChartProps> = ({ data, xField, yField }) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: data.map(item => item[xField]),
    },
  };

  const series = [{
    name: yField,
    data: data.map(item => item[yField]),
  }];

  return <Chart options={options} series={series} type="bar" height={350} />;
};

export const PieChart: React.FC<ChartProps> = ({ data, nameField = 'name', valueField = 'value' }) => {
  const options: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: data.map(item => item[nameField]),
  };

  const series = data.map(item => item[valueField]);

  return <Chart options={options} series={series} type="pie" height={350} />;
}; 