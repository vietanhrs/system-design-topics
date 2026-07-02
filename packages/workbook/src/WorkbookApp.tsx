import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Dumbbell,
  FlaskConical,
  Gauge,
  Home,
  Layers,
  Network,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { readProgress, writeProgress } from './storage';
import type { DiagramKind, Level, Priority, Subsection, WorkbookContent } from './types';

type Tab = 'theory' | 'example' | 'exercise';

interface RouteState {
  levelId?: string;
  subsectionId?: string;
}

interface FlatSubsection {
  level: Level;
  subsection: Subsection;
}

const priorities: Priority[] = ['P0', 'P1', 'P2'];

function parseHash(): RouteState {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { levelId: parts[0], subsectionId: parts[1] };
}

function navigate(levelId?: string, subsectionId?: string) {
  if (!levelId) {
    window.location.hash = '#/';
    return;
  }
  window.location.hash = subsectionId ? `#/${levelId}/${subsectionId}` : `#/${levelId}`;
}

function priorityLabel(priority: Priority) {
  if (priority === 'P0') return '24h';
  if (priority === 'P1') return 'Core';
  return 'Depth';
}

function iconForLevel(order: number) {
  const icons = [Gauge, Layers, Network, Star, BookOpen, ShieldCheck, Clock, Dumbbell];
  return icons[(order - 1) % icons.length];
}

interface DiagramNode {
  id: string;
  label: string;
  step: number;
  x: number;
  y: number;
  role?: 'center' | 'support';
}

interface DiagramEdge {
  from: DiagramNode;
  to: DiagramNode;
  curved?: boolean;
}

function pathBetween(from: DiagramNode, to: DiagramNode, curved = false) {
  const horizontalOffset = from.x <= to.x ? 11 : -11;
  const verticalOffset = from.y <= to.y ? 8 : -8;
  const startX = from.x + horizontalOffset;
  const startY = from.y;
  const endX = to.x - horizontalOffset;
  const endY = to.y;

  if (Math.abs(from.x - to.x) < 1) {
    return `M ${from.x} ${from.y + verticalOffset} L ${to.x} ${to.y - verticalOffset}`;
  }

  if (Math.abs(from.y - to.y) < 1) {
    return `M ${startX} ${from.y} L ${endX} ${to.y}`;
  }

  if (curved || Math.abs(from.x - to.x) > 44 || Math.abs(from.y - to.y) > 34) {
    return `M ${startX} ${startY} C ${startX} ${startY + verticalOffset}, ${endX} ${endY - verticalOffset}, ${endX} ${endY}`;
  }

  return `M ${startX} ${startY} L ${endX} ${endY}`;
}

function flattenDiagramRows(rows: string[][]) {
  return rows.flatMap((row) => row);
}

function buildDiagramLayout(rows: string[][], kind: DiagramKind, focus?: string) {
  const labels = flattenDiagramRows(rows);
  const makeNode = (label: string, index: number, x: number, y: number, role?: DiagramNode['role']) => ({
    id: `${index}-${label}`,
    label,
    step: index + 1,
    x,
    y,
    role,
  });

  if (kind === 'hub') {
    const focusIndex = focus ? labels.findIndex((label) => label === focus) : -1;
    const centerIndex = focusIndex >= 0 ? focusIndex : Math.min(4, labels.length - 1);
    const center = makeNode(labels[centerIndex], centerIndex, 50, 50, 'center');
    const ringPositions = [
      [50, 12],
      [84, 24],
      [84, 76],
      [50, 86],
      [16, 76],
      [16, 24],
      [18, 50],
      [82, 50],
    ];
    const nodes = labels.map((label, index) => {
      if (index === centerIndex) return center;
      const position = ringPositions[index > centerIndex ? index - 1 : index] ?? [50, 50];
      return makeNode(label, index, position[0], position[1], 'support');
    });
    const edges: DiagramEdge[] = nodes
      .filter((node) => node.id !== center.id)
      .map((node) => ({ from: center, to: node }));
    return { nodes, edges };
  }

  if (kind === 'cycle') {
    const positions = [
      [50, 12],
      [78, 22],
      [86, 50],
      [78, 78],
      [50, 88],
      [22, 78],
      [14, 50],
      [22, 22],
      [50, 50],
    ];
    const nodes = labels.map((label, index) => {
      const position = positions[index] ?? [50, 50];
      return makeNode(label, index, position[0], position[1], index === labels.length - 1 ? 'center' : undefined);
    });
    const edgeNodes = nodes.filter((node) => node.role !== 'center');
    const edges = edgeNodes.map((node, index) => ({
      from: node,
      to: edgeNodes[(index + 1) % edgeNodes.length],
      curved: true,
    }));
    if (nodes.some((node) => node.role === 'center')) {
      const center = nodes.find((node) => node.role === 'center');
      if (center) edges.push(...edgeNodes.slice(0, 4).map((node) => ({ from: node, to: center, curved: true })));
    }
    return { nodes, edges };
  }

  if (kind === 'layered') {
    const xPositions = [18, 50, 82];
    const yPositions = [17, 50, 83];
    const nodes = rows.flatMap((row, rowIndex) =>
      row.map((label, colIndex) =>
        makeNode(label, rows.slice(0, rowIndex).reduce((sum, current) => sum + current.length, 0) + colIndex, xPositions[colIndex] ?? 50, yPositions[rowIndex] ?? 50),
      ),
    );
    const byPosition = (rowIndex: number, colIndex: number) =>
      nodes.find((node) => node.step === rows.slice(0, rowIndex).reduce((sum, current) => sum + current.length, 0) + colIndex + 1);
    const edges: DiagramEdge[] = [];
    rows.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const from = byPosition(rowIndex, colIndex);
        const to = rowIndex < rows.length - 1 ? byPosition(rowIndex + 1, colIndex) : undefined;
        if (from && to) edges.push({ from, to });
      });
    });
    rows.forEach((row, rowIndex) => {
      row.slice(0, -1).forEach((_, colIndex) => {
        const from = byPosition(rowIndex, colIndex);
        const to = byPosition(rowIndex, colIndex + 1);
        if (from && to) edges.push({ from, to });
      });
    });
    return { nodes, edges };
  }

  if (kind === 'pipeline') {
    const positions = [
      [13, 28],
      [38, 28],
      [63, 28],
      [87, 28],
      [25, 62],
      [50, 62],
      [75, 62],
      [38, 86],
      [62, 86],
    ];
    const nodes = labels.map((label, index) => {
      const position = positions[index] ?? [50, 50];
      return makeNode(label, index, position[0], position[1], index > 6 ? 'support' : undefined);
    });
    const main = nodes.filter((node) => node.role !== 'support');
    const edges: DiagramEdge[] = main.slice(0, -1).map((node, index) => ({ from: node, to: main[index + 1] }));
    const supportAnchor = main[Math.max(main.length - 2, 0)];
    edges.push(...nodes.filter((node) => node.role === 'support').map((node) => ({ from: supportAnchor, to: node, curved: true })));
    return { nodes, edges };
  }

  const positions = [
    [14, 20],
    [50, 20],
    [86, 20],
    [86, 50],
    [50, 50],
    [14, 50],
    [14, 80],
    [50, 80],
    [86, 80],
  ];
  const nodes = labels.map((label, index) => {
    const position = positions[index] ?? [50, 50];
    return makeNode(label, index, position[0], position[1]);
  });
  const edges = nodes.slice(0, -1).map((node, index) => ({
    from: node,
    to: nodes[index + 1],
    curved: node.y !== nodes[index + 1].y,
  }));
  return { nodes, edges };
}

function Diagram({ rows, kind, focus }: { rows: string[][]; kind: DiagramKind; focus?: string }) {
  const { nodes, edges } = buildDiagramLayout(rows, kind, focus);

  return (
    <div className={`diagram diagram-${kind}`} aria-label={`${kind} architecture diagram`}>
      <svg className="diagram-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <marker
            id="diagram-arrow"
            markerHeight="5"
            markerWidth="5"
            orient="auto"
            refX="4"
            refY="2.5"
          >
            <path d="M 0 0 L 5 2.5 L 0 5 z" />
          </marker>
        </defs>
        {edges.map((edge) => (
          <path
            d={pathBetween(edge.from, edge.to, edge.curved)}
            key={`${edge.from.id}-${edge.to.id}`}
            markerEnd="url(#diagram-arrow)"
          />
        ))}
      </svg>
      {nodes.map((node) => {
        return (
          <div
            className={`diagram-node ${node.role ? `diagram-node-${node.role}` : ''}`}
            key={node.id}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
          >
            <span className="diagram-step">{node.step}</span>
            <span>{node.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function parseMarkdownTable(block: string) {
  const lines = block.trim().split('\n').filter(Boolean);
  if (lines.length < 3 || !lines[0].startsWith('|') || !lines[1].includes('---')) return undefined;

  const cells = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  return {
    headers: cells(lines[0]),
    rows: lines.slice(2).map(cells),
  };
}

function TheoryBlock({ block }: { block: string }) {
  const trimmed = block.trim();

  if (trimmed.startsWith('```')) {
    const code = trimmed
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/\n?```$/, '');
    return <pre className="theory-code"><code>{code}</code></pre>;
  }

  const table = parseMarkdownTable(trimmed);
  if (table) {
    return (
      <div className="theory-table-wrap">
        <table className="theory-table">
          <thead>
            <tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.join('-')}`}>
                {row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p>{block}</p>;
}

function useRoute() {
  const [route, setRoute] = useState<RouteState>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

function Sidebar({
  content,
  active,
  progress,
}: {
  content: WorkbookContent;
  active?: FlatSubsection;
  progress: Set<string>;
}) {
  const total = content.levels.reduce((sum, level) => sum + level.subsections.length, 0);
  const done = progress.size;

  return (
    <aside className="sidebar">
      <button className="home-button" onClick={() => navigate()} title="Workbook home">
        <Home size={17} />
        <span>System Design Topics</span>
      </button>

      <div className="progress-block">
        <div className="progress-copy">
          <span>{done}/{total} complete</span>
          <strong>{Math.round((done / Math.max(total, 1)) * 100)}%</strong>
        </div>
        <div className="progress-track">
          <div style={{ width: `${(done / Math.max(total, 1)) * 100}%` }} />
        </div>
      </div>

      <nav className="level-nav" aria-label="Workbook levels">
        {content.levels.map((level) => {
          const LevelIcon = iconForLevel(level.order);
          return (
            <section key={level.id} className="nav-section">
              <button
                className={`level-link ${active?.level.id === level.id ? 'active' : ''}`}
                onClick={() => navigate(level.id)}
              >
                <LevelIcon size={16} />
                <span>
                  <b>Level {level.order}</b>
                  {level.title}
                </span>
              </button>
              <div className="sub-nav">
                {level.subsections.map((subsection) => {
                  const selected =
                    active?.level.id === level.id && active.subsection.id === subsection.id;
                  return (
                    <button
                      key={subsection.id}
                      className={`sub-link ${selected ? 'selected' : ''}`}
                      onClick={() => navigate(level.id, subsection.id)}
                    >
                      <span>{subsection.title}</span>
                      <i className={`priority-dot ${subsection.priority.toLowerCase()}`}>
                        {subsection.priority}
                      </i>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}

function HomeOverview({
  content,
  flattened,
  progress,
}: {
  content: WorkbookContent;
  flattened: FlatSubsection[];
  progress: Set<string>;
}) {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('P0');

  const filtered = flattened.filter(({ subsection }) => {
    const haystack = [
      subsection.title,
      subsection.summary,
      subsection.tags.join(' '),
      subsection.fastTrack.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    return (
      (priority === 'all' || subsection.priority === priority) &&
      haystack.includes(query.trim().toLowerCase())
    );
  });

  const p0Count = flattened.filter(({ subsection }) => subsection.priority === 'P0').length;
  const completeP0 = flattened.filter(
    ({ level, subsection }) => subsection.priority === 'P0' && progress.has(`${level.id}:${subsection.id}`),
  ).length;

  return (
    <main className="content">
      <header className="hero">
        <div>
          <p className="eyebrow">Feature architecture interview workbook</p>
          <h1>{content.title}</h1>
          <p className="subtitle">{content.subtitle}</p>
        </div>
        <div className="hero-stats" aria-label="Study stats">
          <div>
            <strong>{content.levels.length}</strong>
            <span>levels</span>
          </div>
          <div>
            <strong>{flattened.length}</strong>
            <span>subsections</span>
          </div>
          <div>
            <strong>{completeP0}/{p0Count}</strong>
            <span>P0 done</span>
          </div>
        </div>
      </header>

      <section className="study-plan" aria-label="24-hour fast track">
        <div>
          <h2>24-hour fast track</h2>
          <p>
            Start with P0. Practice each topic as a spoken design answer: requirements, API,
            data model, read/write flow, scale bottlenecks, failures, and trade-offs.
          </p>
        </div>
        <div className="plan-grid">
          {[
            ['0-3h', 'Interview loop, requirements, estimates, contracts'],
            ['3-8h', 'Storage, cache, queue, partitioning, indexing'],
            ['8-14h', 'Social graph, recommendations, ranking, privacy filters'],
            ['14-20h', 'Feature cases: feed, notifications, chat, search, rate limiter'],
            ['20-24h', 'Mock answers, follow-ups, SLOs, failure modes'],
          ].map(([time, label]) => (
            <button className="plan-item" key={time} onClick={() => setPriority('P0')}>
              <Clock size={16} />
              <strong>{time}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="toolbar" aria-label="Workbook filters">
        <label className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics, signals, queues, cache, graph..."
          />
        </label>
        <div className="segmented">
          <button className={priority === 'all' ? 'active' : ''} onClick={() => setPriority('all')}>
            All
          </button>
          {priorities.map((p) => (
            <button className={priority === p ? 'active' : ''} key={p} onClick={() => setPriority(p)}>
              {p} {priorityLabel(p)}
            </button>
          ))}
        </div>
      </section>

      <section className="level-grid">
        {content.levels.map((level) => {
          const LevelIcon = iconForLevel(level.order);
          return (
            <button className="level-card" key={level.id} onClick={() => navigate(level.id)}>
              <span className="level-card-icon">
                <LevelIcon size={19} />
              </span>
              <span className="level-card-copy">
                <b>Level {level.order}</b>
                <strong>{level.title}</strong>
                <small>{level.outcome}</small>
              </span>
              <ArrowRight size={17} />
            </button>
          );
        })}
      </section>

      <section className="topic-list" aria-label="Subsections">
        {filtered.map(({ level, subsection }) => (
          <button
            className="topic-row"
            key={`${level.id}:${subsection.id}`}
            onClick={() => navigate(level.id, subsection.id)}
          >
            <span className={`priority-badge ${subsection.priority.toLowerCase()}`}>
              {subsection.priority}
            </span>
            <span>
              <b>{subsection.title}</b>
              <small>Level {level.order}: {level.title}</small>
            </span>
            <span>{subsection.duration}</span>
            {progress.has(`${level.id}:${subsection.id}`) && <CheckCircle2 size={17} />}
          </button>
        ))}
      </section>
    </main>
  );
}

function LevelOverview({ level }: { level: Level }) {
  const LevelIcon = iconForLevel(level.order);

  return (
    <main className="content">
      <section className="level-hero">
        <div className="level-symbol">
          <LevelIcon size={28} />
        </div>
        <div>
          <p className="eyebrow">Level {level.order}</p>
          <h1>{level.title}</h1>
          <p className="subtitle">{level.tagline}</p>
          <p className="outcome">{level.outcome}</p>
        </div>
      </section>
      <section className="topic-list">
        {level.subsections.map((subsection) => (
          <button
            className="topic-row"
            key={subsection.id}
            onClick={() => navigate(level.id, subsection.id)}
          >
            <span className={`priority-badge ${subsection.priority.toLowerCase()}`}>
              {subsection.priority}
            </span>
            <span>
              <b>{subsection.title}</b>
              <small>{subsection.summary}</small>
            </span>
            <span>{subsection.duration}</span>
          </button>
        ))}
      </section>
    </main>
  );
}

function DetailPage({
  item,
  tab,
  setTab,
  progress,
  setProgress,
  flattened,
}: {
  item: FlatSubsection;
  tab: Tab;
  setTab: (tab: Tab) => void;
  progress: Set<string>;
  setProgress: (progress: Set<string>) => void;
  flattened: FlatSubsection[];
}) {
  const key = `${item.level.id}:${item.subsection.id}`;
  const done = progress.has(key);
  const currentIndex = flattened.findIndex(
    ({ level, subsection }) => level.id === item.level.id && subsection.id === item.subsection.id,
  );
  const previous = currentIndex > 0 ? flattened[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < flattened.length - 1 ? flattened[currentIndex + 1] : undefined;

  function toggleDone() {
    const nextProgress = new Set(progress);
    if (nextProgress.has(key)) nextProgress.delete(key);
    else nextProgress.add(key);
    setProgress(nextProgress);
    writeProgress(nextProgress);
  }

  return (
    <main className="content">
      <article className="detail">
        <header className="detail-header">
          <div>
            <p className="eyebrow">
              Level {item.level.order} / {item.level.title}
            </p>
            <h1>{item.subsection.title}</h1>
            <p className="subtitle">{item.subsection.summary}</p>
            <div className="tag-row">
              <span className={`priority-badge ${item.subsection.priority.toLowerCase()}`}>
                {item.subsection.priority} {priorityLabel(item.subsection.priority)}
              </span>
              <span className="duration">
                <Clock size={14} /> {item.subsection.duration}
              </span>
              {item.subsection.tags.map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <button className={`complete-button ${done ? 'done' : ''}`} onClick={toggleDone} title="Mark complete">
            <CheckCircle2 size={18} />
            {done ? 'Complete' : 'Mark done'}
          </button>
        </header>

        <section className="must-know">
          <div>
            <Star size={18} />
            <h2>24h Must Know</h2>
          </div>
          <ul>
            {item.subsection.fastTrack.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <div className="tabs" role="tablist" aria-label="Subsection tabs">
          {[
            ['theory', BookOpen, 'Theory'],
            ['example', FlaskConical, 'Example'],
            ['exercise', Dumbbell, 'Exercise'],
          ].map(([value, Icon, label]) => {
            const TabIcon = Icon as typeof BookOpen;
            return (
              <button
                className={tab === value ? 'active' : ''}
                key={String(value)}
                onClick={() => setTab(value as Tab)}
                role="tab"
                aria-selected={tab === value}
              >
                <TabIcon size={16} />
                {String(label)}
              </button>
            );
          })}
        </div>

        {tab === 'theory' && (
          <section className="panel prose">
            <h2>Theory</h2>
            {item.subsection.theory.map((block) => (
              <TheoryBlock block={block} key={block} />
            ))}
          </section>
        )}

        {tab === 'example' && (
          <section className="panel split-panel">
            <div className="prose">
              <h2>Example</h2>
              <p>{item.subsection.example.scenario}</p>
              <h3>Architecture</h3>
              <ul>{item.subsection.example.architecture.map((point) => <li key={point}>{point}</li>)}</ul>
              <h3>Request and data flow</h3>
              <ol>{item.subsection.example.flow.map((point) => <li key={point}>{point}</li>)}</ol>
              <h3>Trade-offs</h3>
              <ul>{item.subsection.example.tradeoffs.map((point) => <li key={point}>{point}</li>)}</ul>
              <h3>Failure modes</h3>
              <ul>{item.subsection.example.failureModes.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <Diagram
              rows={item.subsection.example.diagram}
              kind={item.subsection.example.diagramKind}
              focus={item.subsection.example.diagramFocus}
            />
          </section>
        )}

        {tab === 'exercise' && (
          <section className="panel prose">
            <h2>Exercise</h2>
            <p>{item.subsection.exercise.prompt}</p>
            <h3>Tasks</h3>
            <ul>{item.subsection.exercise.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
            <h3>Expected checkpoints</h3>
            <ul>{item.subsection.exercise.expected.map((point) => <li key={point}>{point}</li>)}</ul>
          </section>
        )}

        <footer className="pager">
          <button disabled={!previous} onClick={() => previous && navigate(previous.level.id, previous.subsection.id)}>
            <ArrowLeft size={16} />
            {previous ? previous.subsection.title : 'Start'}
          </button>
          <button disabled={!next} onClick={() => next && navigate(next.level.id, next.subsection.id)}>
            {next ? next.subsection.title : 'End'}
            <ArrowRight size={16} />
          </button>
        </footer>
      </article>
    </main>
  );
}

export function WorkbookApp({ content }: { content: WorkbookContent }) {
  const route = useRoute();
  const [tab, setTab] = useState<Tab>('theory');
  const [progress, setProgress] = useState<Set<string>>(() => readProgress());

  const flattened = useMemo(
    () =>
      content.levels.flatMap((level) =>
        level.subsections.map((subsection) => ({ level, subsection })),
      ),
    [content.levels],
  );

  const active = flattened.find(
    ({ level, subsection }) => level.id === route.levelId && subsection.id === route.subsectionId,
  );
  const activeLevel = content.levels.find((level) => level.id === route.levelId);

  useEffect(() => {
    setTab('theory');
  }, [route.levelId, route.subsectionId]);

  return (
    <div className="app-shell">
      <Sidebar content={content} active={active} progress={progress} />
      {active ? (
        <DetailPage
          item={active}
          tab={tab}
          setTab={setTab}
          progress={progress}
          setProgress={setProgress}
          flattened={flattened}
        />
      ) : activeLevel ? (
        <LevelOverview level={activeLevel} />
      ) : (
        <HomeOverview content={content} flattened={flattened} progress={progress} />
      )}
    </div>
  );
}
