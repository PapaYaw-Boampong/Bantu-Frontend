"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  {
    name: "Jan",
    contributions: 220,
    completions: 180,
  },
  {
    name: "Feb",
    contributions: 300,
    completions: 250,
  },
  {
    name: "Mar",
    contributions: 280,
    completions: 210,
  },
  {
    name: "Apr",
    contributions: 320,
    completions: 290,
  },
  {
    name: "May",
    contributions: 400,
    completions: 350,
  },
  {
    name: "Jun",
    contributions: 450,
    completions: 410,
  },
  {
    name: "Jul",
    contributions: 500,
    completions: 460,
  },
  {
    name: "Aug",
    contributions: 480,
    completions: 420,
  },
  {
    name: "Sep",
    contributions: 520,
    completions: 480,
  },
  {
    name: "Oct",
    contributions: 580,
    completions: 540,
  },
  {
    name: "Nov",
    contributions: 620,
    completions: 570,
  },
  {
    name: "Dec",
    contributions: 700,
    completions: 650,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Bar
          dataKey="contributions"
          fill="#adfa1d"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Bar
          dataKey="completions"
          fill="#0ea5e9"
          radius={[4, 4, 0, 0]}
          className="fill-blue-500"
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 