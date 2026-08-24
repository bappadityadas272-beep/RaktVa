import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { useVoiceInput } from '@/hooks/use-voice';
import { generateDoctorPDF } from '@/lib/pdf';
import { addScan, getScans } from '@/lib/storage';
import {
  Activity, ArrowLeft, ArrowUpRight, BarChart3, Bell, Camera, Check,
  ChevronDown, ClipboardCheck, FileText, Flame, HeartPulse, Leaf, LoaderCircle,
  LockKeyhole, MapPin,
  Menu, Mic, Moon, MoreHorizontal, Navigation, Search, ShieldCheck,
  Siren, Sun, Upload, UserRound, Users, X, type LucideIcon
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Page = 'dashboard' | 'diagnosis' | 'nutrition' | 'briefing' | 'watchlist' | 'vault';
type Tone = 'red' | 'orange' | 'yellow' | 'green';
type Module = { id: Exclude<Page, 'dashboard'>; icon: LucideIcon; number: string; title: string; description: string; tone: string };

const ScanIcon: LucideIcon = ClipboardCheck;

const modules: Module[] = [
  { id: 'diagnosis', icon: ScanIcon, number: '01', title: 'Medical report diagnosis', description: 'Vision OCR and deterministic CBC triage', tone: 'bg-[#3a1e23]' },
  { id: 'nutrition', icon: Leaf, number: '02', title: 'Nutrition & food synergy', description: 'Local meals that make iron work harder', tone: 'bg-[#18352f]' },
  { id: 'briefing', icon: FileText, number: '03', title: 'Doctor briefing repository', description: 'One-page clinical context, ready to share', tone: 'bg-[#292442]' },
  { id: 'watchlist', icon: MapPin, number: '04', title: 'PHC watchlist & care locator', description: 'Find risk pockets and the next care point', tone: 'bg-[#3b2b17]' },
  { id: 'vault', icon: LockKeyhole, number: '05', title: 'Authentication & DB vault', description: 'Role-based access to the care network', tone: 'bg-[#1d303a]' },
];

const riskData = [
  { label: 'Pregnant women', color: '#ff7b70', points: [[4.5, 26], [5.1, 40], [5.8, 20], [6.4, 56], [7.1, 34], [7.8, 68], [8.6, 43], [9.3, 78], [10.2, 52], [11.1, 86]] },
  { label: 'Children 6–59m', color: '#f7ad69', points: [[4.2, 68], [4.9, 52], [5.5, 82], [6.2, 44], [6.8, 73], [7.4, 24], [8.1, 59], [8.9, 36], [9.8, 71], [10.8, 46]] },
  { label: 'Adolescent girls', color: '#73dfad', points: [[4.6, 47], [5.3, 76], [6.0, 35], [6.7, 64], [7.3, 48], [8.0, 83], [8.7, 28], [9.5, 61], [10.4, 39], [11.5, 72]] },
];

function Badge({ children, tone = 'red' }: { children: ReactNode; tone?: Tone }) {
  const styles: Record<Tone, string> = {
    red: 'bg-[#51242a] text-[#ff8f86]', orange: 'bg-[#51351f] text-[#f7ad69]',
    green: 'bg-[#1d443a] text-[#73dfad]', yellow: 'bg-[#4a401b] text-[#f2d66d]',
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${styles[tone]}`}>{children}</span>;
}

function Header({ dark, setDark }: { dark: boolean; setDark: (value: boolean) => void }) {
  const [role, setRole] = useState('Clinical lead');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [, setLocation] = useLocation();
  return (
    <header className="relative z-30 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 sm:px-6 lg:px-9">
      <button data-testid="button-logo-dashboard" onClick={() => setLocation('/')} className="flex items-center gap-3 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c0392b] text-white shadow-[0_0_24px_rgba(192,57,43,.25)]"><HeartPulse size={21} /></span>
        <span><span className="block font-display text-xl font-extrabold tracking-[-.05em]">RaktVa<span className="text-[#e67e22]">.Ai</span></span><span className="block text-[9px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Smart anemia co-pilot</span></span>
      </button>
      <div className="hidden items-center gap-6 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))] xl:flex"><span><b className="text-[hsl(var(--foreground))]">160</b> PHCs monitored</span><span><b className="text-[hsl(var(--foreground))]">1.2M</b> women & children screened</span></div>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="role-select">Workspace role</label>
        <select id="role-select" data-testid="select-workspace-role" value={role} onChange={(event) => setRole(event.target.value)} className="field hidden rounded-lg px-3 py-2 text-xs outline-none sm:block">
          <option>Clinical lead</option><option>ASHA worker</option><option>Caregiver view</option>
        </select>
        <button data-testid="button-toggle-theme" onClick={() => setDark(!dark)} className="field rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        <button data-testid="button-notifications" onClick={() => setNotice(!notice)} className="field relative rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" aria-label="View notifications"><Bell size={16} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#e67e22]" /></button>
        <button data-testid="button-header-menu" onClick={() => setMenuOpen(!menuOpen)} className="field rounded-lg p-2 text-[hsl(var(--muted-foreground))] sm:block" aria-label="Open workspace menu"><Menu size={16} /></button>
      </div>
      {notice && <div data-testid="status-notification" className="absolute right-14 top-[66px] w-64 rounded-xl border border-[#e67e22]/30 bg-[#261d17] p-4 text-xs shadow-2xl"><div className="flex items-center gap-2 font-bold text-[#f7ad69]"><Siren size={14} /> 3 cases need review</div><p className="mt-2 leading-relaxed text-slate-400">The severe-risk queue was updated 8 minutes ago.</p><Link href="/watchlist" className="mt-3 block font-bold text-[#ff9b92]">Open watchlist</Link></div>}
      {menuOpen && <div data-testid="status-header-menu" className="absolute right-4 top-[66px] w-52 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-2xl"><Link href="/vault" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-white/5">Account & vault</Link><button onClick={() => setMenuOpen(false)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-[hsl(var(--muted-foreground))] hover:bg-white/5">Close menu</button></div>}
    </header>
  );
}

function SideNav() {
  const [location] = useLocation();
  const isActive = (path: string) => path === '/' ? location === '/' : location.startsWith(path);
  return <aside className="hidden w-60 shrink-0 border-r border-[hsl(var(--border))] p-5 lg:block">
    <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Workspace</p>
    <nav className="space-y-1" aria-label="Primary navigation">
      <NavItem href="/" icon={BarChart3} active={isActive('/')} label="Executive overview" testId="link-nav-dashboard" />
      {modules.map((item) => <NavItem key={item.id} href={`/${item.id}`} icon={item.icon} active={isActive(`/${item.id}`)} label={item.title} testId={`link-nav-${item.id}`} />)}
    </nav>
    <div className="mt-10 rounded-xl border border-[#2e3540] bg-[#171a20] p-3"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#73dfad]"><ShieldCheck size={14} /> Rules engine online</div><p className="text-[11px] leading-relaxed text-slate-500">WHO / ICMR thresholds are loaded and deterministic.</p></div>
    <div className="mt-4 flex items-center gap-2 px-3 text-[10px] text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-[#73dfad]" /> Last sync 08:42 IST</div>
  </aside>;
}

function NavItem({ href, icon: Icon, active, label, testId }: { href: string; icon: LucideIcon; active: boolean; label: string; testId: string }) {
  return <Link data-testid={testId} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold transition ${active ? 'bg-[#c0392b]/15 text-[#ff8f86]' : 'text-[hsl(var(--muted-foreground))] hover:bg-white/5 hover:text-[hsl(var(--foreground))]'}`}><Icon size={15} /> {label}</Link>;
}

function StatCard({ label, value, subtext, tone, icon: Icon }: { label: string; value: string; subtext: string; tone: Tone; icon: LucideIcon }) {
  const colors: Record<Tone, string> = { red: 'text-[#ff7b70] bg-[#51242a]', orange: 'text-[#f7ad69] bg-[#51351f]', yellow: 'text-[#f2d66d] bg-[#4a401b]', green: 'text-[#73dfad] bg-[#1d443a]' };
  return <div data-testid={`card-stat-${label.toLowerCase().replaceAll(' ', '-')}`} className="panel animate-rise rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-white/20"><div className="mb-5 flex items-start justify-between"><p className="max-w-[150px] text-[10px] font-bold uppercase leading-relaxed tracking-[.12em] text-[hsl(var(--muted-foreground))]">{label}</p><span className={`rounded-lg p-2 ${colors[tone]}`}><Icon size={15} /></span></div><div className="font-display text-2xl font-bold tracking-[-.04em]">{value}</div><p className={`mt-1 text-[11px] font-semibold ${colors[tone].split(' ')[0]}`}>{subtext}</p></div>;
}

function Distribution() {
  const [mode, setMode] = useState('Risk mode by patient type');
  const [open, setOpen] = useState(false);
  const modes = ['Risk mode by patient type', 'Age-range distribution mode', 'Geographic / location risk mode'];
  return <section data-testid="section-risk-distribution" className="panel rounded-xl p-4 sm:p-5 lg:p-6">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e67e22]">Live distribution</p><h2 className="mt-1 font-display text-xl font-bold">Anemia risk by population</h2></div><div className="relative z-10"><button data-testid="button-distribution-mode" onClick={() => setOpen(!open)} className="field flex min-w-[220px] items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-[11px] font-bold outline-none" aria-expanded={open}>{mode}<ChevronDown size={14} className={open ? 'rotate-180' : ''} /></button>{open && <div className="absolute right-0 top-full mt-2 min-w-[250px] overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[#20232a] p-1 shadow-2xl">{modes.map((item) => <button data-testid={`button-mode-${item.slice(0, 4)}`} key={item} onClick={() => { setMode(item); setOpen(false); }} className={`block w-full rounded-md px-3 py-2.5 text-left text-[11px] font-bold ${mode === item ? 'bg-[#c0392b]/20 text-[#ff8f86]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}>{item}</button>)}</div>}</div></div>
    {mode === modes[2] ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{['Bihar', 'Uttar Pradesh', 'Rajasthan', 'Odisha', 'Jharkhand', 'Madhya Pradesh', 'West Bengal', 'Assam'].map((state, index) => <div data-testid={`card-region-${state}`} key={state} className="subtle-panel rounded-lg p-3"><div className="mb-4 flex items-center justify-between"><MapPin size={14} className={index < 3 ? 'text-[#ff7b70]' : 'text-[#73dfad]'} /><Badge tone={index < 2 ? 'red' : index < 4 ? 'orange' : 'green'}>{index < 2 ? 'High' : index < 4 ? 'Watch' : 'Stable'}</Badge></div><p className="text-xs font-bold">{state}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{index < 3 ? '32–41%' : '12–22%'} severe burden</p></div>)}</div> : <div className="grid gap-5 lg:grid-cols-[1fr_190px]"><div className="relative h-80 min-h-[330px] w-full rounded-lg bg-[#111318] p-3 sm:p-4"><svg viewBox="0 0 800 260" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Scatter plot of anemia risk by hemoglobin level"><g stroke="#333" strokeDasharray="3 3" opacity=".7">{[0, 1, 2, 3, 4].map((line) => <line key={`h-${line}`} x1="42" x2="780" y1={22 + line * 52} y2={22 + line * 52} />)}{[0, 1, 2, 3, 4].map((line) => <line key={`v-${line}`} x1={42 + line * 184.5} x2={42 + line * 184.5} y1="22" y2="230" />)}</g><line x1="319" x2="319" y1="12" y2="238" stroke="#c0392b" strokeDasharray="6 5" strokeWidth="2" /><text x="324" y="18" fill="#ff8f86" fontSize="10" fontWeight="700" letterSpacing="1">CRITICAL &lt; 7.0</text>{riskData.map((series, seriesIndex) => series.points.map(([hb, density], pointIndex) => { const x = 42 + ((hb - 4) / 8) * 738; const y = 230 - (density / 100) * 198; const color = hb < 7 ? '#c0392b' : hb < 10 ? '#e67e22' : '#2ecc71'; return <circle key={`${seriesIndex}-${pointIndex}`} cx={x} cy={y} r="5.5" fill={color} opacity=".88" stroke="#0d0f12" strokeWidth="2" />; }))}</svg><div className="absolute bottom-2 left-8 right-3 flex justify-between text-[9px] text-slate-600"><span>4.0 Hb</span><span>7.0</span><span>10.0</span><span>12.0 g/dL</span></div><div className="absolute bottom-7 left-2 top-8 flex flex-col justify-between text-[9px] text-slate-600"><span>High</span><span>Density</span><span>Low</span></div></div><div className="space-y-3">{riskData.map((item) => <div data-testid={`legend-${item.label}`} key={item.label} className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</div>)}<div className="mt-8 border-t border-[hsl(var(--border))] pt-3 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">Reference line shows the deterministic severe-risk threshold.</div></div></div>}
  </section>;
}

function Dashboard() {
  return <main className="dashboard-scroll flex-1 overflow-auto p-4 sm:p-5 lg:p-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-rise"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e67e22]">Wednesday · 19 Aug 2026</p><h1 className="mt-1 font-display text-3xl font-extrabold tracking-[-.055em] sm:text-4xl">Good morning, Dr. Meera.</h1><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Here’s what needs your attention across the network.</p></div><Link data-testid="link-start-triage" href="/diagnosis" className="flex items-center gap-2 rounded-lg bg-[#c0392b] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_22px_rgba(192,57,43,.22)] hover:bg-[#d74a3b]"><ScanIcon size={15} /> Start a new triage</Link></div><div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="High severe risk" value="6.7K cases" subtext="+621 vs 4 wks ago" tone="red" icon={Flame} /><StatCard label="Critical PHCs at risk" value="28 districts" subtext="+1 vs 4 wks ago" tone="orange" icon={MapPin} /><StatCard label="Median hemoglobin (Hb)" value="8.8 g/dL" subtext="+0.2 vs 4 wks ago" tone="yellow" icon={Activity} /><StatCard label="Upcoming re-screens · 30 days" value="8.4K cases" subtext="54 ASHA sectors" tone="green" icon={Users} /></div><Distribution /><div className="mt-7"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Care network</p><h2 className="mt-1 font-display text-xl font-bold">Open a workspace</h2></div><span className="text-[11px] text-[hsl(var(--muted-foreground))]">5 modules · role: clinical lead</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{modules.map((item, index) => { const Icon = item.icon; return <Link data-testid={`card-module-${item.id}`} href={`/${item.id}`} key={item.id} className={`group min-h-[190px] rounded-xl border border-white/10 ${item.tone} p-4 text-left transition hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl animate-rise delay-${index % 4}`}><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"><Icon size={17} /></span><span className="font-mono text-[10px] text-white/40">{item.number}</span></div><div className="mt-12"><p className="text-sm font-bold leading-tight text-white">{item.title}</p><p className="mt-2 text-[11px] leading-relaxed text-white/55">{item.description}</p><ArrowUpRight className="mt-4 text-white/40 transition group-hover:translate-x-1 group-hover:-translate-y-1" size={15} /></div></Link>; })}</div></div></main>;
}

function PageBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="relative mb-7 flex flex-wrap items-center justify-between gap-3"><Link data-testid="link-back-dashboard" href="/" className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><ArrowLeft size={15} /> Back to dashboard</Link><div className="flex items-center gap-2"><Badge tone="green"><Check size={10} className="mr-1 inline" /> Deterministic engine on</Badge><button data-testid="button-module-menu" onClick={() => setMenuOpen(!menuOpen)} className="field rounded-lg p-2 text-[hsl(var(--muted-foreground))]" aria-label="More module options" aria-expanded={menuOpen}><MoreHorizontal size={15} /></button></div>{menuOpen && <div data-testid="status-module-menu" className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-xs shadow-2xl"><p className="font-bold">Module context</p><p className="mt-1 leading-relaxed text-[hsl(var(--muted-foreground))]">Rules and demo data are running locally in this browser.</p><button onClick={() => setMenuOpen(false)} className="mt-3 font-bold text-[#ff8f86]">Dismiss</button></div>}</div>;
}

function PageIntro({ config }: { config: Module }) {
  const Icon = config.icon;
  return <div className="mb-6 flex items-start gap-3"><span className="rounded-xl bg-white/10 p-3 text-[#e67e22]"><Icon size={20} /></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e67e22]">Module {config.number} · care network</p><h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-.04em] sm:text-3xl">{config.title}</h1><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{config.description}</p></div></div>;
}

function Safety() {
  return <div className="mt-7 flex items-start gap-3 rounded-lg border border-[#e67e22]/20 bg-[#271f18] px-4 py-3 text-[10px] leading-relaxed text-slate-400"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#f7ad69]" /><span><b className="text-[#f7ad69]">Determinism guarantee:</b> severity classifications strictly adhere to WHO / ICMR standard tables. Clinical rules contain no generative diagnosis.</span></div>;
}

function DiagnosisPage() {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => setHistory(getScans()), []);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploaded(true);
    setFileName(file.name);
    setScanning(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Call API
        const res = await fetch('/api/parse-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });

        const data = await res.json();

        if (data.success && data.data?.hb) {
          // Get severity from rule engine
          const { getSeverity } = await import('../core/ruleEngine');
          const config = await import('../config/adultThresholds.json');
          const severity = getSeverity(data.data.hb, config);

          setResult({ ...data.data, severity });
          addScan({
            hb: data.data.hb,
            timestamp: new Date().toISOString(),
            severity: severity.level,
            color: severity.color
          });
          setHistory(getScans());
        } else {
          // Fallback: manual entry needed
          alert('Could not extract values. Please enter Hb manually.');
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Scan error:', err);
      setScanning(false);
    }
  };
  const config = modules[0];
  return <ModuleShell config={config}><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><div className="space-y-4"><label data-testid="dropzone-report" className="block cursor-pointer rounded-xl border border-dashed border-[#c0392b]/60 bg-[#24191c] p-8 text-center transition hover:bg-[#2c1d21]"><input data-testid="input-report-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFile} className="sr-only" /><Upload className="mx-auto mb-3 text-[#ff8f86]" size={25} /><p className="text-sm font-bold text-slate-100">{uploaded ? 'Report ready for triage' : 'Drop a report photo here'}</p><p className="mt-1 text-xs text-slate-500">{fileName || 'JPG, PNG or PDF · up to 10 MB'}</p><span className="mt-5 inline-flex rounded-lg bg-[#c0392b] px-4 py-2 text-xs font-bold text-white">{uploaded ? 'Replace report' : 'Choose report'}</span></label><button data-testid="button-demo-report" onClick={() => { setUploaded(true); setFileName('sample-cbc-sita-devi.pdf'); }} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5"><LoaderCircle size={14} /> {uploaded ? 'Load a different demo' : 'Load sample demo report'}</button><div className="panel rounded-xl p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Test patient</p><p className="mt-1 text-sm font-bold text-slate-100">Sita Devi, 28y <span className="font-normal text-slate-500">| Pregnant · 2nd trimester</span></p></div><Badge tone="red">Severe risk</Badge></div>{[['Hemoglobin (Hb)', '6.2 g/dL', '28%', 'Severe anemia'], ['MCV', '68 fL', '34%', 'Microcytic pattern'], ['Ferritin', '10 ng/mL', '42%', 'Depleted stores']].map(([name, value, width, status]) => <div key={name} className="mb-4 last:mb-0"><div className="mb-2 flex justify-between text-xs"><span className="font-bold text-slate-300">{name}</span><span className="font-mono text-slate-400">{value}</span></div><div className="h-2 rounded-full bg-[#2b3039]"><div className="h-2 rounded-full bg-[#c0392b]" style={{ width }} /></div><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#ff8f86]">{status}</p></div>)}</div></div><div className="panel rounded-xl p-5"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Clinical interpretation</p><h2 className="mt-1 font-display text-xl font-bold">What this means</h2></div><span className="rounded-full bg-[#51242a] px-3 py-1.5 text-xs font-bold text-[#ff8f86]">Iron deficiency · 89%</span></div><div className="space-y-3"><div className="rounded-lg border border-[#c0392b]/20 bg-[#24191c] p-4"><p className="text-sm font-bold text-[#ff9b92]">Severe low hemoglobin</p><p className="mt-2 text-xs leading-relaxed text-slate-400">Oxygen-carrying capacity is dangerously low. Escalate to a clinician today.</p></div><div className="rounded-lg border border-[#e67e22]/20 bg-[#2a2119] p-4"><p className="text-sm font-bold text-[#f7ad69]">Microcytic pattern</p><p className="mt-2 text-xs leading-relaxed text-slate-400">Small red blood cells point toward iron deficiency; confirm with clinical context.</p></div><div className="flex items-center gap-3 rounded-lg border border-[#2ecc71]/20 bg-[#18271f] p-4"><ShieldCheck className="text-[#73dfad]" size={20} /><p className="text-xs leading-relaxed text-slate-400"><b className="text-[#73dfad]">No hallucination fallback:</b> output is classified against WHO / ICMR standard tables.</p></div></div><Link data-testid="link-create-briefing" href="/briefing" className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#c0392b] py-3 text-xs font-bold text-white hover:bg-[#d74a3b]">Create doctor briefing <ArrowUpRight size={14} /></Link></div></div><Safety /></ModuleShell>;
}

function NutritionPage() {
  const [food, setFood] = useState('Jaggery-Chana');
  const [message, setMessage] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const { transcript, isListening, start } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      setVoiceText(transcript);

      // Use food synergy matcher
      import('../core/foodSynergy.js').then(({ getFoodTip }) => {
        import('../config/foodSynergyTable.json').then((config) => {
          const result = getFoodTip(transcript, config.default);

          if (result.type === 'inhibitor') {
            setMessage(`⚠️ ${result.tip}`);
          } else if (result.type === 'enhancer') {
            setMessage(`✅ ${result.tip}`);
          } else {
            setMessage(`Heard: "${transcript}"`);
          }
        });
      });
    }
  }, [transcript]);

  const options = { 'Jaggery-Chana': 'Affordable iron-rich option for this meal.', 'Moringa leaves': 'Pair with lemon and lentils for stronger absorption.', Amla: 'A vitamin C partner that helps non-heme iron work harder.', 'Sesame / Til': 'A practical source of iron and healthy fats.' };
  const config = modules[1];
  return <ModuleShell config={config}><div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="space-y-5"><div className="panel rounded-xl p-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Tell us about the meal</p><div className="flex flex-wrap gap-2"><button data-testid="button-speak-meal" onClick={start} disabled={isListening} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-xs font-bold ${isListening ? 'bg-[#2ecc71] text-white' : 'bg-[#20232a] text-slate-300'}`}><Mic size={15} className={isListening ? 'text-white' : 'text-[#73dfad]'} /> {isListening ? 'Listening...' : 'Speak in Hindi / Hinglish'}</button><button data-testid="button-photo-meal" onClick={() => setMessage('Photo capture is ready. Choose a meal image from your device.')} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#20232a] px-4 py-3 text-xs font-bold text-slate-300"><Camera size={15} className="text-[#e67e22]" /> Add meal photo</button></div><p data-testid="text-meal-message" className="mt-3 text-[10px] text-[#73dfad]">{message || 'Try: “Khane ke baad chai pi thi”'}</p></div><div className="panel rounded-xl p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Regional food swapper</p><div className="mt-4 flex flex-wrap gap-2">{Object.keys(options).map((item) => <button data-testid={`button-food-${item.replaceAll(' ', '-').replaceAll('/', '')}`} key={item} onClick={() => setFood(item)} className={`rounded-full px-3 py-2 text-xs font-bold ${food === item ? 'bg-[#2ecc71] text-[#10231d]' : 'bg-[#202b25] text-[#73dfad]'}`}>{item}</button>)}</div><div className="mt-5 flex items-center gap-4 rounded-lg bg-[#1b2b24] p-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2ecc71]/15 text-[#73dfad]"><Leaf size={20} /></div><div><p className="text-sm font-bold text-slate-100">{food}</p><p className="mt-1 text-xs text-slate-500">{options[food as keyof typeof options]}</p></div></div></div></div><div className="space-y-3"><div className="rounded-xl border border-[#c0392b]/20 bg-[#24191c] p-5"><div className="flex items-center gap-2 text-[#ff8f86]"><X size={16} /><p className="text-[10px] font-bold uppercase tracking-[.16em]">Inhibitor detected</p></div><h3 className="mt-4 font-display text-xl font-bold">Tea after a meal</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">Tea consumed immediately post-meal can block a meaningful share of iron absorption. Keep a 60–90 minute gap.</p></div><div className="rounded-xl border border-[#2ecc71]/20 bg-[#18271f] p-5"><div className="flex items-center gap-2 text-[#73dfad]"><Check size={16} /><p className="text-[10px] font-bold uppercase tracking-[.16em]">Enhancer suggestion</p></div><h3 className="mt-4 font-display text-xl font-bold">Add a vitamin C partner</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">Add lemon to green leafy vegetables to improve iron absorption.</p></div></div></div><Safety /></ModuleShell>;
}

function BriefingPage() {
  const [imported, setImported] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const config = modules[2];
  return <ModuleShell config={config}><div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><div className="panel rounded-xl p-5"><div className="mb-4 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Patient history vault</p><Search size={15} className="text-slate-600" /></div><div className="overflow-hidden rounded-lg border border-white/10"><table className="w-full text-left text-xs"><thead className="bg-[#20232a] text-[9px] uppercase tracking-wider text-slate-500"><tr><th className="p-3">Visit</th><th className="p-3">Symptoms</th><th className="p-3">Hb</th></tr></thead><tbody className="divide-y divide-white/10 text-slate-300">{[['19 Aug 26', 'Dizziness · 3 days', '6.2'], ['08 Jul 26', 'Fatigue', '7.1'], ['11 Jun 26', 'No symptoms', '8.4']].map((row) => <tr data-testid={`row-history-${row[0]}`} key={row[0]}><td className="p-3">{row[0]}</td><td className="p-3">{row[1]}</td><td className="p-3 text-[#ff8f86]">{row[2]}</td></tr>)}</tbody></table></div><button data-testid="button-import-history" onClick={() => setImported(!imported)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5"><Upload size={14} /> {imported ? 'History imported' : 'Import patient history'}</button></div><div className="rounded-xl border border-white/10 bg-[#e8e1d2] p-5 text-[#1a1d23] shadow-2xl"><div className="flex items-start justify-between border-b border-[#1a1d23]/15 pb-4"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#c0392b]">RaktVa.Ai · clinical handoff</p><h2 className="mt-2 font-display text-2xl font-extrabold">One-page doctor briefing</h2><p className="mt-1 text-xs text-[#5f625f]">Patient ID RV-028-SD · Generated 19 Aug 2026</p></div><button data-testid="button-download-briefing" onClick={() => {
  setDownloaded(true);
  generateDoctorPDF({ name: 'Sita Devi', age: 28, condition: 'Pregnant · 2nd trimester', hb: 6.2, mcv: 68, ferritin: 10, severity: 'SEVERE ANEMIA' });
}} className="rounded-lg bg-[#c0392b] px-3 py-2 text-[10px] font-bold text-white">{downloaded ? 'PDF Downloaded' : 'Download PDF'}</button></div><div className="grid gap-4 py-5 sm:grid-cols-2"><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#74766e]">Patient demographics</p><p className="mt-2 text-sm font-bold">Sita Devi · 28 years</p><p className="text-xs text-[#5f625f]">Pregnant · second trimester</p></div><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#74766e]">Rule-based severity</p><p className="mt-2 inline-block rounded-full bg-[#f6d9d4] px-2 py-1 text-[10px] font-bold text-[#b6382c]">SEVERE ANEMIA</p></div></div><div className="rounded-lg border border-[#1a1d23]/10 bg-white/45 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-[#74766e]">Extracted CBC values</p><div className="mt-3 grid grid-cols-3 gap-3 text-center">{[['6.2', 'Hb g/dL'], ['68', 'MCV fL'], ['10', 'Ferritin ng/mL']].map(([value, label]) => <div key={label}><p className="text-lg font-black">{value}</p><p className="text-[9px] text-[#74766e]">{label}</p></div>)}</div></div><div className="mt-4"><p className="text-[9px] font-bold uppercase tracking-wider text-[#74766e]">Doctor action checklist</p><div className="mt-2 space-y-2 text-xs"><p><Check size={13} className="mr-2 inline text-[#2c8c64]" /> Escalate for same-day clinical review</p><p><Check size={13} className="mr-2 inline text-[#2c8c64]" /> Confirm iron therapy adherence and dose</p><p><Check size={13} className="mr-2 inline text-[#2c8c64]" /> Schedule re-screen in 30 days</p></div></div></div></div><Safety /></ModuleShell>;
}

function WatchlistPage() {
  const [selected, setSelected] = useState('PHC Gaya Central');
  const [exported, setExported] = useState(false);
  const rows = [['PHC Gaya Central', 'Bihar', '4,820', '8.1', '184', '62%'], ['CHC Barabanki', 'UP', '3,940', '8.4', '126', '71%'], ['PHC Dausa North', 'Rajasthan', '2,870', '8.8', '92', '84%'], ['PHC Koraput', 'Odisha', '2,410', '9.2', '61', '91%']];
  const config = modules[3];
  return <ModuleShell config={config}><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><div className="panel overflow-hidden rounded-xl"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Priority PHC watchlist</p><p className="mt-1 text-xs text-slate-600">Sorted by severe burden and follow-up gap</p></div><button data-testid="button-export-watchlist" onClick={() => setExported(true)} className="rounded-lg bg-[#c0392b] px-3 py-2 text-[10px] font-bold text-white">{exported ? 'List ready' : 'Export list'}</button></div><div className="overflow-auto"><table className="min-w-[680px] w-full text-left text-xs"><thead className="bg-[#20232a] text-[9px] uppercase tracking-wider text-slate-500"><tr><th className="p-3">PHC name</th><th className="p-3">District</th><th className="p-3">Patients</th><th className="p-3">Avg Hb</th><th className="p-3">Severe</th><th className="p-3">IFA</th></tr></thead><tbody className="divide-y divide-white/10 text-slate-300">{rows.map((row) => <tr data-testid={`row-phc-${row[0]}`} key={row[0]} onClick={() => setSelected(row[0])} className={`cursor-pointer hover:bg-white/5 ${selected === row[0] ? 'bg-[#c0392b]/10' : ''}`}>{row.map((cell, index) => <td key={cell} className={`p-3 ${index === 4 ? 'text-[#ff8f86]' : index === 5 ? 'text-[#73dfad]' : ''}`}>{cell}</td>)}</tr>)}</tbody></table></div></div><div className="panel rounded-xl p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Care locator</p><h2 className="mt-1 font-display text-xl font-bold">{selected}</h2></div><MapPin size={18} className="text-[#e67e22]" /></div><div className="grid-paper relative h-64 overflow-hidden rounded-lg bg-[#13252a]"><div className="absolute left-[25%] top-[35%] h-3 w-3 rounded-full bg-[#ff7b70] shadow-[0_0_0_8px_#ff7b7025]" /><div className="absolute left-[67%] top-[58%] h-3 w-3 rounded-full bg-[#73dfad] shadow-[0_0_0_8px_#73dfad25]" /><div className="absolute left-[48%] top-[21%] h-3 w-3 rounded-full bg-[#f7ad69] shadow-[0_0_0_8px_#f7ad6925]" /><div className="absolute bottom-3 left-3 rounded bg-[#111820cc] px-2 py-1 text-[9px] text-slate-400">Live care network · Bihar</div></div><div className="mt-4 space-y-3 text-xs"><button data-testid="button-locator-phc" onClick={() => setSelected('PHC Gaya Central')} className="flex w-full items-center gap-2 text-left text-slate-400 hover:text-white"><span className="h-2 w-2 rounded-full bg-[#ff7b70]" /> PHC · 2.4 km away <Navigation size={12} className="ml-auto" /></button><button data-testid="button-locator-pharmacy" onClick={() => setSelected('Janaushadhi Kendra')} className="flex w-full items-center gap-2 text-left text-slate-400 hover:text-white"><span className="h-2 w-2 rounded-full bg-[#f7ad69]" /> Janaushadhi Kendra · 3.1 km <Navigation size={12} className="ml-auto" /></button><button data-testid="button-locator-telemedicine" onClick={() => setSelected('eSanjeevani telemedicine')} className="flex w-full items-center gap-2 text-left text-slate-400 hover:text-white"><span className="h-2 w-2 rounded-full bg-[#73dfad]" /> eSanjeevani telemedicine · 4.8 km <Navigation size={12} className="ml-auto" /></button></div></div></div><Safety /></ModuleShell>;
}

function VaultPage() {
  const [tab, setTab] = useState<'signin' | 'create'>('signin');
  const [role, setRole] = useState('Independent woman / caregiver');
  const [identifier, setIdentifier] = useState('');
  const [connected, setConnected] = useState(false);
  const config = modules[4];
  return <ModuleShell config={config}><div className="panel mx-auto max-w-2xl rounded-xl p-5 sm:p-6"><div className="mb-6 flex gap-2 rounded-lg bg-[#20232a] p-1"><button data-testid="button-vault-signin" onClick={() => setTab('signin')} className={`flex-1 rounded-md py-2 text-xs font-bold ${tab === 'signin' ? 'bg-[#c0392b] text-white' : 'text-slate-500'}`}>Sign in</button><button data-testid="button-vault-create" onClick={() => setTab('create')} className={`flex-1 rounded-md py-2 text-xs font-bold ${tab === 'create' ? 'bg-[#c0392b] text-white' : 'text-slate-500'}`}>Create account</button></div><div className="mb-5 flex items-center gap-3 rounded-lg border border-[#2ecc71]/20 bg-[#18271f] p-3 text-xs text-[#73dfad]"><LockKeyhole size={16} /> {connected ? 'Local vault session active · encrypted' : 'Encrypted local vault ready for a secure session'}</div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Choose your access</p><div className="mb-5 grid gap-2 sm:grid-cols-2"><button data-testid="button-role-caregiver" onClick={() => setRole('Independent woman / caregiver')} className={`rounded-lg p-4 text-left ${role === 'Independent woman / caregiver' ? 'border border-[#c0392b] bg-[#51242a]' : 'border border-white/10 bg-[#20232a]'}`}><UserRound className="mb-3 text-[#ff8f86]" size={18} /><p className="text-xs font-bold text-slate-100">Independent woman / caregiver</p><p className="mt-1 text-[10px] text-slate-500">Private self-service triage</p></button><button data-testid="button-role-asha" onClick={() => setRole('ASHA / health worker ID')} className={`rounded-lg p-4 text-left ${role === 'ASHA / health worker ID' ? 'border border-[#e67e22] bg-[#51351f]' : 'border border-white/10 bg-[#20232a]'}`}><Users className="mb-3 text-[#f7ad69]" size={18} /><p className="text-xs font-bold text-slate-100">ASHA / health worker ID</p><p className="mt-1 text-[10px] text-slate-500">Door-to-door care workflow</p></button></div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500" htmlFor="vault-identifier">Email or health worker ID</label><input data-testid="input-vault-identifier" id="vault-identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="field mb-4 w-full rounded-lg px-3 py-3 text-sm outline-none focus:border-[#c0392b]" placeholder="you@example.com" /><button data-testid="button-vault-continue" onClick={() => setConnected(true)} className="w-full rounded-lg bg-[#c0392b] py-3 text-xs font-bold text-white hover:bg-[#d74a3b]">{tab === 'signin' ? 'Continue securely' : 'Create secure profile'}</button><p className="mt-4 text-center text-[10px] leading-relaxed text-slate-600">{identifier ? `Access selected: ${role}` : 'Your records are encrypted and never shared without consent.'}</p></div><Safety /></ModuleShell>;
}

function ModuleShell({ config, children }: { config: Module; children: ReactNode }) {
  return <main className="dashboard-scroll flex-1 overflow-auto p-4 sm:p-5 lg:p-8"><PageBar /><PageIntro config={config} />{children}</main>;
}

function MobileNav() {
  const [location] = useLocation();
  return <nav aria-label="Mobile workspace navigation" className="dashboard-scroll flex gap-1 overflow-x-auto border-b border-[hsl(var(--border))] px-3 py-2 lg:hidden"><NavItem href="/" icon={BarChart3} active={location === '/'} label="Overview" testId="link-mobile-overview" />{modules.map((item) => <NavItem key={item.id} href={`/${item.id}`} icon={item.icon} active={location.startsWith(`/${item.id}`)} label={item.id} testId={`link-mobile-${item.id}`} />)}</nav>;
}

function Workspace() {
  const [dark, setDark] = useState(true);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); document.documentElement.classList.toggle('light', !dark); }, [dark]);
  return <div className="noise min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"><Header dark={dark} setDark={setDark} /><MobileNav /><div className="flex min-h-[calc(100dvh-72px)]"><SideNav /><Switch><Route path="/" component={Dashboard} /><Route path="/diagnosis" component={DiagnosisPage} /><Route path="/nutrition" component={NutritionPage} /><Route path="/briefing" component={BriefingPage} /><Route path="/watchlist" component={WatchlistPage} /><Route path="/vault" component={VaultPage} /><Route component={NotFound} /></Switch></div></div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Workspace /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;