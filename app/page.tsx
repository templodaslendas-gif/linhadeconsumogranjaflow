"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  curveData,
  finalCurveTotal,
  phaseForDay,
  phases,
  weeklyData,
  type CurvePoint,
} from "./curve-data";

type ChartMode = "daily" | "accumulated";
const visiblePhases = phases.filter((phase) => !phase.unclassified);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function Icon({ name }: { name: "play" | "pause" }) {
  const paths = {
    play: <path d="m9 7 9 5-9 5V7Z" />,
    pause: <><path d="M9 7v10" /><path d="M15 7v10" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function MainCurveChart({
  mode,
  currentDay,
  activePhase,
  onDayChange,
}: {
  mode: ChartMode;
  currentDay: number;
  activePhase: string;
  onDayChange: (day: number) => void;
}) {
  const [hovered, setHovered] = useState<CurvePoint | null>(null);
  const width = 920;
  const height = 330;
  const padding = { top: 26, right: 30, bottom: 44, left: 64 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxY = mode === "daily" ? 3.5 : 280;
  const ticks = mode === "daily" ? [0, 0.7, 1.4, 2.1, 2.8, 3.5] : [0, 56, 112, 168, 224, 280];
  const x = (day: number) => padding.left + ((day - 1) / 111) * plotWidth;
  const y = (value: number) => padding.top + plotHeight - (value / maxY) * plotHeight;
  const valueFor = (point: CurvePoint) => mode === "daily" ? point.daily : point.accumulated;
  const visibleData = curveData.filter((point) => point.day <= currentDay);
  const linePath = visibleData
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.day)} ${y(valueFor(point))}`)
    .join(" ");
  const areaPath = visibleData.length
    ? `${linePath} L ${x(visibleData.at(-1)!.day)} ${padding.top + plotHeight} L ${x(1)} ${padding.top + plotHeight} Z`
    : "";
  const current = curveData[currentDay - 1];

  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = ((event.clientX - rect.left) / rect.width) * width;
    const rawDay = Math.round(((relative - padding.left) / plotWidth) * 111 + 1);
    const day = Math.min(112, Math.max(1, rawDay));
    setHovered(curveData[day - 1]);
  };

  const tooltipPoint = hovered ?? current;
  const tooltipX = x(tooltipPoint.day);
  const tooltipY = y(valueFor(tooltipPoint));

  return (
    <div className="chart-wrap">
      <svg
        className="main-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Curva de consumo ${mode === "daily" ? "diário" : "acumulado"} por dia`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHovered(null)}
        onPointerDown={(event) => {
          handleMove(event);
          if (hovered) onDayChange(hovered.day);
        }}
      >
        <defs>
          <linearGradient id="curveArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#009B3A" stopOpacity=".34" />
            <stop offset="100%" stopColor="#009B3A" stopOpacity=".02" />
          </linearGradient>
          <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {visiblePhases.map((phase) => (
          <rect
            key={phase.name}
            x={x(phase.startDay)}
            y={padding.top}
            width={Math.max(x(phase.endDay) - x(phase.startDay), 1)}
            height={plotHeight}
            fill={activePhase === phase.name ? phase.pale : "transparent"}
            opacity={activePhase === phase.name ? 0.65 : 0}
            className="phase-band"
          />
        ))}

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              className="chart-grid"
            />
            <text x={padding.left - 14} y={y(tick) + 4} textAnchor="end" className="chart-axis">
              {mode === "daily" ? tick.toFixed(1) : tick}
            </text>
          </g>
        ))}

        {[1, 14, 28, 42, 56, 70, 84, 98, 112].map((day) => (
          <g key={day}>
            <line
              x1={x(day)}
              x2={x(day)}
              y1={padding.top + plotHeight}
              y2={padding.top + plotHeight + 5}
              className="chart-tick"
            />
            <text x={x(day)} y={height - 15} textAnchor="middle" className="chart-axis">
              {day}
            </text>
          </g>
        ))}

        <text x={padding.left} y={height - 1} className="chart-caption">Dia do lote</text>
        <path d={areaPath} fill="url(#curveArea)" className="curve-area" />
        <path d={linePath} className="curve-line" />

        <line
          x1={x(currentDay)}
          x2={x(currentDay)}
          y1={padding.top}
          y2={padding.top + plotHeight}
          className="current-guide"
        />
        <circle cx={x(current.day)} cy={y(valueFor(current))} r="6" className="current-point" filter="url(#pointGlow)" />

        {tooltipPoint && (
          <g className="chart-tooltip">
            <circle cx={tooltipX} cy={tooltipY} r="5" />
            <g transform={`translate(${Math.min(width - 190, Math.max(70, tooltipX - 82))} ${Math.max(10, tooltipY - 82)})`}>
              <rect width="164" height="64" rx="11" />
              <text x="12" y="20">Dia {tooltipPoint.day} · Semana {tooltipPoint.week}</text>
              <text x="12" y="40" className="chart-tooltip__value">
                {formatNumber(valueFor(tooltipPoint))} {mode === "daily" ? "kg/animal/dia" : "kg/animal"}
              </text>
              {!phaseForDay(tooltipPoint.day).unclassified && (
                <text x="12" y="56" className="chart-tooltip__phase">{phaseForDay(tooltipPoint.day).shortName}</text>
              )}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

function WeeklyBarChart({ currentWeek }: { currentWeek: number }) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const max = Math.max(...weeklyData.map((week) => week.total));
  const selectedWeek = hoveredWeek ?? currentWeek;
  const selected = weeklyData[selectedWeek - 1];

  return (
    <article className="analytics-card weekly-card">
      <div className="analytics-card__heading">
        <div>
          <span className="section-kicker">Ritmo do lote</span>
          <h2>Evolução semanal</h2>
          <p className="chart-description">
            Cada barra soma a quantidade de ração prevista para um animal durante aquela semana.
          </p>
        </div>
        <div className="mini-stat">
          <span>Semana {selected.week}</span>
          <strong>{formatNumber(selected.total)} kg/animal</strong>
        </div>
      </div>
      <div className="weekly-bars" role="img" aria-label="Consumo total por semana">
        {weeklyData.map((week) => (
          <button
            key={week.week}
            className={selectedWeek === week.week ? "active" : ""}
            onMouseEnter={() => setHoveredWeek(week.week)}
            onMouseLeave={() => setHoveredWeek(null)}
            onFocus={() => setHoveredWeek(week.week)}
            onBlur={() => setHoveredWeek(null)}
            onClick={() => setHoveredWeek(week.week)}
            aria-label={`Semana ${week.week}: ${formatNumber(week.total)} kg por animal`}
          >
            <span className="weekly-bars__value">{formatNumber(week.total)} kg/animal</span>
            <i style={{ height: `${(week.total / max) * 100}%` }} />
            <small>{week.week}</small>
          </button>
        ))}
      </div>
      <div className="chart-footnote">
        <span>1</span>
        <strong>Total previsto por animal em cada semana</strong>
        <span>16</span>
      </div>
    </article>
  );
}

function PhaseComparison({
  activePhase,
  onSelect,
}: {
  activePhase: string;
  onSelect: (phase: string) => void;
}) {
  const max = Math.max(...visiblePhases.map((phase) => phase.officialTotal));

  return (
    <article className="analytics-card phase-card">
      <div className="analytics-card__heading">
        <div>
          <span className="section-kicker">Distribuição</span>
          <h2>Consumo por fase</h2>
          <p className="chart-description">
            Cada barra mostra o total de ração previsto para um animal durante todos os dias da fase.
          </p>
        </div>
        <div className="unit-badge">
          <span>Unidade</span>
          <strong>kg/animal</strong>
        </div>
      </div>
      <div className="phase-bars">
        {visiblePhases.map((phase) => (
          <button
            key={phase.name}
            className={`${activePhase === phase.name ? "active" : ""} ${phase.unclassified ? "warning" : ""}`}
            onClick={() => onSelect(phase.name)}
            aria-label={`${phase.shortName}: ${formatNumber(phase.officialTotal)} kg por animal`}
          >
            <span className="phase-bars__label">
              <strong>{phase.shortName}</strong>
              <small>{phase.endDay - phase.startDay + 1} dias</small>
            </span>
            <span className="phase-bars__track">
              <i
                style={{
                  width: `${(phase.officialTotal / max) * 100}%`,
                  background: phase.color,
                }}
              />
            </span>
            <b>
              <span>{formatNumber(phase.officialTotal)}</span>
              <small>kg/animal</small>
            </b>
          </button>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  const [currentDay, setCurrentDay] = useState(112);
  const [mode, setMode] = useState<ChartMode>("daily");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhase, setActivePhase] = useState("TODAS");
  const current = curveData[currentDay - 1];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentDay((day) => {
        if (day >= 112) {
          setIsPlaying(false);
          return 112;
        }
        return day + 1;
      });
    }, 95);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const filteredLabel = useMemo(
    () => activePhase === "TODAS" ? "Curva completa" : phaseForDay(currentDay).shortName,
    [activePhase, currentDay],
  );

  const selectPhase = (phaseName: string) => {
    setActivePhase(phaseName);
    if (phaseName === "TODAS") {
      setCurrentDay(112);
      return;
    }
    const phase = phases.find((item) => item.name === phaseName);
    if (phase) setCurrentDay(phase.endDay);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <img src="/granjaflow-logo.jpeg" alt="Logo GranjaFlow" />
          </span>
          <div>
            <strong>GranjaFlow</strong>
            <span>Inteligência de Consumo</span>
          </div>
        </div>
        <div className="topbar__meta">
          <span className="topbar__source">
            <span className="live-dot" />
            Curva liberada pela integradora · 112 dias
          </span>
          <a className="download-button" href="/downloads/Curva_Consumo_GranjaFlow.xlsx" download>
            <span aria-hidden="true">↓</span>
            Baixar Excel
          </a>
        </div>
      </header>

      <div className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">Curva oficial do integrador</p>
            <h1>A curva liberada pela integradora, transformada em gráficos.</h1>
            <p>
              Entenda quanto cada animal deveria consumir por dia, por semana e por fase,
              seguindo a referência técnica enviada pela integradora.
            </p>
          </div>
        </section>

        <section className="official-document" aria-label="Identificação da curva enviada pela integradora">
          <div className="official-document__brand">
            <span className="official-document__icon">
              <img src="/granjaflow-logo.jpeg" alt="" />
            </span>
            <div>
              <small>GranjaFlow</small>
              <strong>Curva Oficial do Integrador</strong>
            </div>
          </div>
          <div className="official-document__field">
            <small>Origem dos dados</small>
            <strong>Integradora</strong>
          </div>
          <div className="official-document__field">
            <small>Período técnico</small>
            <strong>16 semanas</strong>
          </div>
          <div className="official-document__seal">
            <span>Curva completa</span>
            <strong>112 dias</strong>
          </div>
        </section>

        <section className="interpretation-panel" aria-labelledby="interpretation-title">
          <div className="interpretation-panel__intro">
            <span className="section-kicker">Entenda a curva</span>
            <h2 id="interpretation-title">Como interpretar os números</h2>
            <p>
              Esta é uma referência de consumo planejado por animal. Ela indica quanto cada animal
              deveria consumir segundo a integradora — não representa o consumo real medido na granja.
            </p>
          </div>
          <div className="interpretation-grid">
            <article>
              <span>kg/animal/dia</span>
              <strong>Consumo diário previsto</strong>
              <p>Quantidade de ração indicada para um animal no dia selecionado.</p>
            </article>
            <article>
              <span>kg/animal acumulado</span>
              <strong>Consumo acumulado previsto</strong>
              <p>Soma da ração indicada por animal desde o dia 1 até o dia consultado.</p>
            </article>
            <article>
              <span>kg/animal na fase</span>
              <strong>Total previsto por fase</strong>
              <p>Soma da ração indicada para um animal durante todos os dias daquela fase.</p>
            </article>
          </div>
          <p className="interpretation-panel__value">
            <strong>Como usar:</strong> compare a referência da integradora com o consumo real do lote
            para identificar desvios e apoiar o planejamento de ração.
          </p>
        </section>

        <section className="primary-card">
          <div className="card-heading">
            <div>
              <span className="section-kicker">{filteredLabel} · dados oficiais da integradora</span>
              <h2>Evolução do consumo</h2>
            </div>
            <div className="segmented" role="tablist" aria-label="Tipo de consumo">
              <button className={mode === "daily" ? "active" : ""} onClick={() => setMode("daily")}>Diário</button>
              <button className={mode === "accumulated" ? "active" : ""} onClick={() => setMode("accumulated")}>Acumulado</button>
            </div>
          </div>

          <div className="chart-explanation" aria-live="polite">
            <div>
              <strong>{mode === "daily" ? "Leitura diária" : "Leitura acumulada"}</strong>
              <span>
                {mode === "daily"
                  ? "Cada ponto mostra quantos quilogramas de ração um animal deveria consumir naquele dia."
                  : "Cada ponto soma o consumo previsto de um animal desde o dia 1 até o dia selecionado."}
              </span>
            </div>
            <small>{mode === "daily" ? "Unidade: kg/animal/dia" : "Unidade: kg/animal"}</small>
          </div>

          <div className="phase-filter" aria-label="Filtrar por fase">
            <button className={activePhase === "TODAS" ? "active" : ""} onClick={() => selectPhase("TODAS")}>
              Todas
            </button>
            {visiblePhases.map((phase) => (
              <button
                key={phase.name}
                className={activePhase === phase.name ? "active" : ""}
                style={{ "--phase-color": phase.color } as React.CSSProperties}
                onClick={() => selectPhase(phase.name)}
              >
                <span />
                {phase.shortName}
              </button>
            ))}
          </div>

          <MainCurveChart
            mode={mode}
            currentDay={currentDay}
            activePhase={activePhase}
            onDayChange={setCurrentDay}
          />

          <div className="playback">
            <button
              className="play-button"
              onClick={() => {
                if (!isPlaying && currentDay === 112) setCurrentDay(1);
                setIsPlaying((value) => !value);
              }}
              aria-label={isPlaying ? "Pausar animação" : "Reproduzir curva"}
            >
              <Icon name={isPlaying ? "pause" : "play"} />
              {isPlaying ? "Pausar" : "Reproduzir curva"}
            </button>
            <label className="day-slider">
              <span>Dia 1</span>
              <input
                type="range"
                min="1"
                max="112"
                value={currentDay}
                onChange={(event) => {
                  setIsPlaying(false);
                  setCurrentDay(Number(event.target.value));
                  setActivePhase("TODAS");
                }}
                style={{ "--progress": `${((currentDay - 1) / 111) * 100}%` } as React.CSSProperties}
                aria-label="Selecionar dia da curva"
              />
              <span>Dia 112</span>
            </label>
            <div className="playback-total">
              <span>Curva completa</span>
              <strong>{formatNumber(finalCurveTotal)} kg/animal</strong>
            </div>
          </div>
        </section>

        <section className="phase-timeline" aria-label="Linha do tempo das fases">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Jornada produtiva</span>
              <h2>Linha do tempo das fases</h2>
            </div>
            <p>Selecione uma etapa para avançar diretamente ao último dia da fase.</p>
          </div>
          <div className="timeline-track">
            {visiblePhases.map((phase) => (
              <button
                key={phase.name}
                className={`${activePhase === phase.name ? "active" : ""} ${phase.unclassified ? "warning" : ""}`}
                style={{
                  "--phase-color": phase.color,
                  "--phase-width": `${((phase.endDay - phase.startDay + 1) / 112) * 100}%`,
                } as React.CSSProperties}
                onClick={() => selectPhase(phase.name)}
              >
                <span className="timeline-track__bar" />
                <strong>{phase.shortName}</strong>
                <small>Dias {phase.startDay}–{phase.endDay}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="analytics-grid">
          <WeeklyBarChart currentWeek={current.week} />
          <PhaseComparison activePhase={activePhase} onSelect={selectPhase} />
        </section>
      </div>
    </main>
  );
}
