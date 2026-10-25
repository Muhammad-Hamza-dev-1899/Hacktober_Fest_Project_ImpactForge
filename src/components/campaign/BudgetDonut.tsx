"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Campaign } from "@/lib/schema";
import { SERIES_VAR } from "@/lib/themes";
import { cn, formatPKR } from "@/lib/utils";

/** Transparent budget: donut + labeled legend (the legend doubles as the data table). */
export function BudgetDonut({ campaign }: { campaign: Campaign }) {
  const [active, setActive] = useState<number | null>(null);
  const data = campaign.budget.map((b) => ({ name: b.category, value: b.percent, pkr: (campaign.goalPKR * b.percent) / 100 }));
  const shown = active ?? 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--raised)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              animationDuration={1200}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={SERIES_VAR[i % SERIES_VAR.length]} opacity={active === null || active === i ? 1 : 0.35} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ active: a, payload }) =>
                a && payload?.[0] ? (
                  <div className="rounded-xl bg-raised px-3 py-2 text-xs text-ink shadow-xl ring-1 ring-line/60">
                    <p className="font-medium text-ink">{payload[0].name}</p>
                    <p className="text-ink-2">
                      {payload[0].value}% · {formatPKR(Number(payload[0].payload.pkr), { compact: true })}
                    </p>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-3xl font-semibold tabular-nums">{data[shown].value}%</span>
          <span className="max-w-[7.5rem] text-[11px] leading-tight text-ink-2">{data[shown].name}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5" aria-label="Budget breakdown">
        {data.map((d, i) => (
          <li
            key={d.name}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", active === i && "bg-mist")}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SERIES_VAR[i % SERIES_VAR.length] }} />
            <span className="flex-1 text-ink">{d.name}</span>
            <span className="tabular-nums text-ink-2">{formatPKR(d.pkr, { compact: true })}</span>
            <span className="w-10 text-right font-medium tabular-nums text-ink">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
