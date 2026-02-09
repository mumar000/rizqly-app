"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  formatPKR,
} from "@/utils/expenseParser";

interface SpendingData {
  name: string;
  value: number;
}

interface SpendingPieChartProps {
  data: Record<string, number>;
  totalSpent: number;
  title?: string;
}

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0 0 12px ${fill})`,
          transition: "all 0.3s ease",
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 15}
        outerRadius={outerRadius + 18}
        fill={fill}
        style={{ opacity: 0.3 }}
      />
    </g>
  );
};

export function SpendingPieChart({
  data,
  totalSpent,
  title = "Monthly Spending",
}: SpendingPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Convert data to chart format
  const chartData: SpendingData[] = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[24px] p-6 text-center"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
        }}
      >
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-white/80 mb-2">
          No spending yet
        </h3>
        <p className="text-sm text-white/40">
          Add your first expense to see the chart!
        </p>
      </motion.div>
    );
  }

  const activeCategory = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-[24px] p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-[#CCFF00] font-bold">
          {formatPKR(totalSpent)}
        </span>
      </div>

      {/* Pie Chart */}
      <div className="relative h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`gradient-${entry.name}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CATEGORY_COLORS[entry.name] || "#8884d8"}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={CATEGORY_COLORS[entry.name] || "#8884d8"}
                    stopOpacity={0.6}
                  />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${entry.name})`}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {activeCategory ? (
              <motion.div
                key={activeCategory.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-3xl mb-1">
                  {CATEGORY_EMOJIS[activeCategory.name] || "📦"}
                </div>
                <div className="text-white font-bold text-lg">
                  {activeCategory.name}
                </div>
                <div className="text-[#CCFF00] font-semibold">
                  {formatPKR(activeCategory.value)}
                </div>
                <div className="text-white/40 text-xs">
                  {((activeCategory.value / totalSpent) * 100).toFixed(1)}%
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">
                  Total
                </div>
                <div className="text-white font-bold text-xl">
                  {formatPKR(totalSpent)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {chartData.slice(0, 6).map((entry, index) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-xl"
            style={{
              background:
                activeIndex === index ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="text-xl">
              {CATEGORY_EMOJIS[entry.name] || "📦"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {entry.name}
              </div>
              <div className="text-white/40 text-xs">
                {formatPKR(entry.value)}
              </div>
            </div>
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: CATEGORY_COLORS[entry.name] || "#8884d8" }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
