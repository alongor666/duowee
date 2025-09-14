"use client";
import React from "react";
import { AppProvider } from "@/context/AppContext";
import DataLoader from "@/components/common/DataLoader";
import DimensionSelector from "@/components/selectors/DimensionSelector";
import MetricSelector from "@/components/selectors/MetricSelector";
import ChartSelector from "@/components/selectors/ChartSelector";
import KPIGrid from "@/components/dashboard/KPIGrid";
import AIInsights from "@/components/dashboard/AIInsights";
import ChartCanvas from "@/components/charts/ChartCanvas";
import DataAlerts from "@/components/common/DataAlerts";

export default function Page() {
  return (
    <AppProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <DataLoader />
          <DimensionSelector />
          <MetricSelector />
          <ChartSelector />
        </div>

        <DataAlerts />

        <KPIGrid />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCanvas />
          </div>
          <AIInsights />
        </div>
      </div>
    </AppProvider>
  );
}
