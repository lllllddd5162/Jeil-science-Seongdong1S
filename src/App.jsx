import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 

  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Users, BookOpen, CheckCircle2, Circle, Clock, Plus, Trash2, BarChart3, 
  Beaker, Trophy, ClipboardCheck, Calculator, Calendar, 
  MessageSquare, Search, AlertCircle, X as LucideX, History, 
  Edit2, Layers, UserPlus, Info, ListChecks, 
  StickyNote, Bookmark, UserCheck, MinusCircle, 
  BrainCircuit, Zap, Activity, FileText, Save, CheckCircle,
  GraduationCap, UserCog, ChevronRight, LogOut, ShieldCheck,
  KeyRound, AlertTriangle, Fingerprint, School, UserCircle2, FileSearch, ClipboardList, Loader2,
  Tag, TrendingUp, Printer, Sparkles, Copy, ChevronDown, Bot, RefreshCw
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = { apiKey: "AIzaSyBaWWriu3X7iVQnglR5XcA0Mqqc736VopM", authDomain: "science-academy-13dda.firebaseapp.com", projectId: "science-academy-13dda", storageBucket: "science-academy-13dda.firebasestorage.app", messagingSenderId: "449626746191", appId: "1:449626746191:web:73885c6bb862a07655293a", measurementId: "G-4W0B7CX2DX" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'Jeil-science-Seongdong1S';

// --- Constants & Configuration ---
const SUBJECTS = ['물리', '화학', '생명과학', '지구과학', '통합과학'];
const DIFFICULTIES = ['하', '중하', '중', '중상', '상', '극상'];
const ASSIGNMENT_LEVELS = ['기초', '기본', '심화', '최고난도'];

const MEMO_STATUS_ORDER = ['not_started', 'round_1', 'round_2', 'round_3', 'round_4'];
const MEMO_STATUS_CONFIG = {
  not_started: { label: '시작 전', color: 'text-slate-300', bg: 'bg-slate-50', icon: Circle },
  round_1: { label: '1회독', color: 'text-cyan-500', bg: 'bg-cyan-50', icon: Zap },
  round_2: { label: '2회독', color: 'text-blue-500', bg: 'bg-blue-50', icon: Activity },
  round_3: { label: '3회독', color: 'text-purple-600', bg: 'bg-purple-50', icon: Layers },
  round_4: { label: '4회독', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
};

const ASSIGN_STATUS_ORDER = ['not_started', 'in_progress', 'incomplete_red', 'completed', 'exempt'];
const ASSIGN_LABELS = {
  in_progress: '진행 중',
  incomplete_red: '미완료',
  completed: '완료',
  exempt: '해당 없음'
};
const ASSIGN_STATUS_CONFIG = {
  not_started: { label: '시작 전', color: 'text-slate-300', bg: 'bg-slate-50', icon: Circle },
  in_progress: { label: '진행 중', color: 'text-slate-900', bg: 'bg-slate-100', icon: Clock },
  incomplete_red: { label: '미완료', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
  completed: { label: '완료', color: 'text-blue-500', bg: 'bg-blue-50', icon: CheckCircle2 },
  exempt: { label: '해당 없음', color: 'text-slate-400', bg: 'bg-slate-100/50', icon: MinusCircle }
};

const STATUS_COLORS = {
  completed: 'text-blue-500 bg-blue-50',
  late_completed: 'text-orange-500 bg-orange-50',
  in_progress: 'text-slate-900 bg-slate-100',
  incomplete_red: 'text-red-500 bg-red-50',
  not_started: 'text-slate-300 bg-slate-50',
  exempt: 'text-slate-400 bg-slate-100/50 border border-dashed border-slate-200'
};

const LESSON_TYPES = [
  { id: '진도',        color: 'bg-indigo-500',  light: 'bg-indigo-50 text-indigo-700 border-indigo-200',  calChip: 'bg-indigo-100 text-indigo-700' },
  { id: '암기',        color: 'bg-purple-500',  light: 'bg-purple-50 text-purple-700 border-purple-200',  calChip: 'bg-purple-100 text-purple-700' },
  { id: '문제풀이',    color: 'bg-orange-500',  light: 'bg-orange-50 text-orange-700 border-orange-200',  calChip: 'bg-orange-100 text-orange-700' },
  { id: '중간 테스트', color: 'bg-blue-500',    light: 'bg-blue-50 text-blue-700 border-blue-200',        calChip: 'bg-blue-100 text-blue-700' },
  { id: '시험 직전 대비', color: 'bg-red-600',  light: 'bg-red-50 text-red-700 border-red-200',           calChip: 'bg-red-100 text-red-700' },
];

const DEFAULT_GRADE_SCALES = [
  { id: 'g1', label: '우수', min: 90, color: 'bg-indigo-500', icon: '🔥' },
  { id: 'g2', label: '보통', min: 70, color: 'bg-emerald-500', icon: '⭐' },
  { id: 'g3', label: '노력', min: 50, color: 'bg-yellow-500', icon: '📝' },
  { id: 'g4', label: '부진', min: 0, color: 'bg-red-500', icon: '⚠️' }
];

// --- CSS Color Variable Injector ---
function SiteColorStyle({ color }) {
  const hex = color || '#3730a3';
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const lighten = (amt) => {
    const nr = Math.min(255, r + amt), ng = Math.min(255, g + amt), nb = Math.min(255, b + amt);
    return '#' + [nr,ng,nb].map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  const darken = (amt) => {
    const nr = Math.max(0, r - amt), ng = Math.max(0, g - amt), nb = Math.max(0, b - amt);
    return '#' + [nr,ng,nb].map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  const alpha = (a) => `rgba(${r},${g},${b},${a})`;
  return (
    <style>{`
      :root {
        --sc: ${hex};
        --sc-dark: ${darken(30)};
        --sc-darker: ${darken(55)};
        --sc-light: ${lighten(180)};
        --sc-faint: ${alpha(0.08)};
        --sc-faint2: ${alpha(0.15)};
        --sc-text: ${alpha(0.9)};
      }
      @media print {
        body * { visibility: hidden; }
        #print-report, #print-report * { visibility: visible; }
        #print-report { position: fixed; top: 0; left: 0; width: 100%; }
        @page { margin: 1.5cm; }
      }
    `}</style>
  );
}

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div className="p-10 text-center font-bold text-red-500 bg-white m-4 rounded-3xl shadow-sm border">시스템 로딩 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.</div>;
    return this.props.children;
  }
}

// --- useWindowSize Hook ---
function useWindowSize() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

// --- Helper Functions ---
const calculateRoundProgress = (students, items, submissionData, statusOrder, labels) => {
  return students.reduce((acc, s) => {
    const rel = items.filter(a => a.type === 'all' || (a.targetStudents && a.targetStudents.includes(s.id)));
    const initialCount = rel.length;
    if (initialCount === 0) { acc[s.id] = { label: "미부여", percent: "0.0" }; return acc; }

    const exemptCount = rel.filter(item => (submissionData[`${s.id}-${item.id}`]?.status === 'exempt')).length;
    const effectiveTotal = initialCount - exemptCount;
    if (effectiveTotal <= 0) { acc[s.id] = { label: "제외됨", percent: "100.0" }; return acc; }

    const actualStages = statusOrder.slice(1).filter(st => st !== 'exempt');

    // 암기용: 현재 최저 회독 기준으로 진척도 계산
    // 예) 1회독1개, 2회독1개, 3회독1개 → "1회독 33%" (아직 1회독 못한 게 있으면 1회독 기준)
    // 모두 1회독 이상이면 "2회독 X%" 방식
    if (!labels) {
      // 각 단계별 도달 수 계산
      for (let i = 0; i < actualStages.length; i++) {
        const stage = actualStages[i];
        const countReached = rel.filter(item => {
          const status = submissionData[`${s.id}-${item.id}`]?.status || 'not_started';
          if (status === 'exempt') return false;
          return statusOrder.indexOf(status) >= statusOrder.indexOf(stage);
        }).length;
        const pct = ((countReached / effectiveTotal) * 100).toFixed(1);
        // 이 단계가 100% 미만이면 현재 진행 중인 단계
        if (pct !== "100.0") {
          acc[s.id] = { label: `${i + 1}회독`, percent: pct };
          return acc;
        }
        // 마지막 단계까지 100%면 완료
        if (i === actualStages.length - 1) {
          acc[s.id] = { label: `${actualStages.length}회독`, percent: "100.0" };
          return acc;
        }
      }
      acc[s.id] = { label: "1회독", percent: "0.0" };
      return acc;
    }

    // 과제용: 기존 로직 유지
    let displayLabel = labels[actualStages[0]] || "진행 중";
    let displayPercent = "0.0";
    for (let i = 0; i < actualStages.length; i++) {
      const currentStageKey = actualStages[i];
      const countReached = rel.filter(item => {
        const status = submissionData[`${s.id}-${item.id}`]?.status || 'not_started';
        if (status === 'exempt') return false;
        return statusOrder.indexOf(status) >= statusOrder.indexOf(currentStageKey);
      }).length;
      const percent = ((countReached / effectiveTotal) * 100).toFixed(1);
      displayLabel = labels[currentStageKey] || "진행 중";
      displayPercent = percent;
      if (percent !== "100.0") break;
      if (i < actualStages.length - 1) continue;
    }
    acc[s.id] = { label: displayLabel, percent: displayPercent };
    return acc;
  }, {});
};

// --- [FIX 1] getTargetStudentNamesLocal 함수 추가 ---
// 원본 코드에서 호출은 하지만 정의가 없어 런타임 에러 발생하던 함수
const getTargetStudentNamesLocal = (students, ids) =>
  students.filter(s => ids?.includes(s.id)).map(s => s.name).join(', ') || '없음';

// --- Shared UI Components ---
const BufferedInput = ({ value, onSave, placeholder, className, type = "text", disabled = false }) => {
  const [temp, setTemp] = useState(value || '');
  useEffect(() => { setTemp(value || ''); }, [value]);
  const handleBlur = () => { if (!disabled && temp !== value) onSave(temp); };
  return (
    <input type={type} value={temp} onChange={(e) => setTemp(e.target.value)} onBlur={handleBlur} disabled={disabled}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} placeholder={placeholder} className={`${className} select-text`} />
  );
};

const BufferedTextarea = ({ value, onSave, placeholder, className, disabled = false }) => {
  const [temp, setTemp] = useState(value || '');
  useEffect(() => { setTemp(value || ''); }, [value]);
  const handleBlur = () => { if (!disabled && temp !== value) onSave(temp); };
  return (
    <textarea value={temp} onChange={(e) => setTemp(e.target.value)} onBlur={handleBlur} disabled={disabled}
      placeholder={placeholder} className={`${className} select-text`} />
  );
};

// --- Progress Mini Calendar Component ---
function ProgressMiniCalendar({ progressPlans, progressCalMonth, setProgressCalMonth, kstToday, attendance, students, makeupDates, onDateSelect, highlightFrom, highlightTo }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (dateStr, dim) => {
    if (dim) setProgressCalMonth(dateStr.slice(0, 7));
    if (onDateSelect) {
      // 리포트 탭: 외부에서 관리, selectedDate는 highlightFrom 기준
      onDateSelect(dateStr);
    } else {
      // 출결/진도 탭: 내부 selectedDate 토글
      setSelectedDate(prev => prev === dateStr ? null : dateStr);
    }
  };

  const [calYear, calMonthIdx] = progressCalMonth.split('-').map(Number);
  const firstDay = new Date(calYear, calMonthIdx - 1, 1).getDay();
  const daysInMonth = new Date(calYear, calMonthIdx, 0).getDate();
  const plansByDate = progressPlans.reduce((acc, p) => {
    if (!acc[p.date]) acc[p.date] = [];
    acc[p.date].push(p);
    return acc;
  }, {});
  const prevMonth = () => {
    let y = calYear, m = calMonthIdx - 1;
    if (m < 1) { m = 12; y -= 1; }
    setProgressCalMonth(`${y}-${String(m).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    let y = calYear, m = calMonthIdx + 1;
    if (m > 12) { m = 1; y += 1; }
    setProgressCalMonth(`${y}-${String(m).padStart(2, '0')}`);
  };
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];

  const renderCell = (dateStr, day, colIdx, extra = {}) => {
    const dayPlans = plansByDate[dateStr] || [];
    const isToday = kstToday === dateStr;
    const isFrom = !!highlightFrom && dateStr === highlightFrom;
    const isTo = !!highlightTo && dateStr === highlightTo;
    const isInRange = !!highlightFrom && !!highlightTo && dateStr > highlightFrom && dateStr < highlightTo;
    // highlightFrom 없으면 내부 selectedDate 사용 (출결/진도 탭)
    const isSelected = !highlightFrom && selectedDate === dateStr;
    const { dim = false } = extra;
    return (
      <div
        key={`cell-${dateStr}-${dim?'dim':''}`}
        onClick={() => handleDateClick(dateStr, dim)}
        className={`border-b border-r border-slate-50 min-h-[60px] p-1.5 transition-all cursor-pointer
          ${isFrom ? 'bg-blue-100' : isTo ? 'bg-blue-900/10' : isInRange ? 'bg-blue-50/60' : isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : dim ? 'bg-slate-50/30 hover:bg-slate-100/50' : 'hover:bg-slate-50/60'}`}
      >
        <div className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded-full mb-1
          ${isFrom
            ? (isToday ? 'bg-blue-400 text-white ring-2 ring-emerald-400 ring-offset-1' : 'bg-blue-400 text-white')
            : isTo
              ? (isToday ? 'bg-blue-800 text-white ring-2 ring-emerald-400 ring-offset-1' : 'bg-blue-800 text-white')
              : isToday
                ? 'bg-emerald-500 text-white'
                : isSelected
                  ? 'bg-blue-500 text-white'
                  : dim
                    ? (colIdx===0?'text-red-200':colIdx===6?'text-blue-200':'text-slate-300')
                    : colIdx===0?'text-red-400':colIdx===6?'text-blue-400':'text-slate-600'}`}>
          {day}
        </div>
        {dayPlans.length > 0 && (
          <div className="space-y-0.5">
            {dayPlans.slice(0, 2).map(p => {
              const lt = LESSON_TYPES.find(l => l.id === (p.lessonType || '진도')) || LESSON_TYPES[0];
              return <div key={p.id} className={`text-[8px] font-black px-1 py-0.5 rounded leading-none truncate ${dim ? 'opacity-30' : (p.done ? 'opacity-50 line-through ' : '') + lt.calChip}`}>{p.subject} {p.unit}</div>;
            })}
            {dayPlans.length > 2 && <div className="text-[8px] text-slate-400 font-bold px-1">+{dayPlans.length - 2}</div>}
          </div>
        )}
      </div>
    );
  };

  // 선택된 날짜 상세 데이터
  const selectedPlans = selectedDate ? (plansByDate[selectedDate] || []) : [];
  const selectedAttList = selectedDate && students ? students.map(s => ({
    s,
    att: attendance?.[`${s.id}-${selectedDate}`] || { status: 'none', makeup: false },
    makeupDate: makeupDates?.[`${s.id}-${selectedDate}`] || '',
  })) : [];
  const hasData = selectedPlans.length > 0 || selectedAttList.some(x => x.att.status !== 'none');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <button onClick={prevMonth} className="px-2 py-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 font-black text-sm">&#8249; 이전</button>
        <span className="font-black text-slate-800 text-sm">{calYear}년 {calMonthIdx}월</span>
        <button onClick={nextMonth} className="px-2 py-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 font-black text-sm">다음 &#8250;</button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100">
        {dayLabels.map((d, i) => (
          <div key={d} className={`py-1.5 text-center text-[10px] font-black ${i===0?'text-red-400':i===6?'text-blue-400':'text-slate-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => {
          const prevMonthDays = new Date(calYear, calMonthIdx - 1, 0).getDate();
          const day = prevMonthDays - firstDay + i + 1;
          let pY = calYear, pM = calMonthIdx - 1;
          if (pM < 1) { pM = 12; pY -= 1; }
          const dateStr = `${pY}-${String(pM).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          return renderCell(dateStr, day, i % 7, { dim: true });
        })}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${calYear}-${String(calMonthIdx).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const colIdx = (firstDay + i) % 7;
          return renderCell(dateStr, day, colIdx);
        })}
        {Array.from({ length: (7 - (firstDay + daysInMonth) % 7) % 7 }).map((_, i) => {
          const day = i + 1;
          let nY = calYear, nM = calMonthIdx + 1;
          if (nM > 12) { nM = 1; nY += 1; }
          const dateStr = `${nY}-${String(nM).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const colIdx = (firstDay + daysInMonth + i) % 7;
          return renderCell(dateStr, day, colIdx, { dim: true });
        })}
      </div>
      {/* 범례 */}
      <div className="px-4 py-2.5 border-t border-slate-50 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-[7px] font-black">18</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400">오늘</span>
        </div>
        {highlightFrom ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center">
                <span className="text-white text-[7px] font-black">●</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">시작</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-800 flex items-center justify-center">
                <span className="text-white text-[7px] font-black">●</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">종료</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-[7px] font-black">●</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400">선택</span>
          </div>
        )}
        <div className="w-px h-3 bg-slate-200"/>
        {LESSON_TYPES.map(lt => (
          <span key={lt.id} className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${lt.light}`}>{lt.id}</span>
        ))}
      </div>

      {/* 선택 날짜 상세 패널 */}
      {selectedDate && (
        <div className="border-t border-slate-100">
          <div className="px-4 py-3 flex items-center justify-between" style={{background:'var(--sc-faint)'}}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{background:'var(--sc)'}}/>
              <span className="font-black text-sm" style={{color:'var(--sc)'}}>{selectedDate}</span>
              <span className="text-[11px] font-bold text-slate-400">{DOW[new Date(selectedDate).getDay()]}요일</span>
            </div>
            <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-lg font-black leading-none">×</button>
          </div>

          {!hasData ? (
            <div className="px-4 py-6 text-center text-slate-400 text-[11px] font-bold">이 날의 수업·출결 기록이 없습니다.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* 수업 내용 */}
              {selectedPlans.length > 0 && (
                <div className="px-4 py-3 space-y-1.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><span style={{color:'var(--sc)'}}>●</span> 수업 내용</p>
                  {selectedPlans.map(p => {
                    const lt = LESSON_TYPES.find(l => l.id === (p.lessonType || '진도')) || LESSON_TYPES[0];
                    return (
                      <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-50 ${p.done ? 'opacity-60' : ''}`}>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border shrink-0 ${lt.light}`}>{p.lessonType || '진도'}</span>
                        <span className="text-[10px] font-black text-slate-500 shrink-0">{p.subject}</span>
                        <span className={`text-[11px] font-black text-slate-700 flex-1 min-w-0 truncate ${p.done ? 'line-through' : ''}`}>{p.unit}</span>
                        {p.done && <span className="text-[9px] font-black text-teal-500 shrink-0">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* 출결 현황 */}
              {students && selectedAttList.some(x => x.att.status !== 'none') && (
                <div className="px-4 py-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><span style={{color:'var(--sc)'}}>●</span> 출결 현황</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedAttList.filter(x => x.att.status !== 'none').map(({ s, att, makeupDate }) => {
                      const sm = { present: { l: '출석', c: 'text-emerald-600 bg-emerald-50 border-emerald-100' }, late: { l: '지각', c: 'text-amber-600 bg-amber-50 border-amber-100' }, absent: { l: '결석', c: 'text-red-500 bg-red-50 border-red-100' } }[att.status] || { l: '-', c: 'text-slate-300 bg-slate-50 border-slate-100' };
                      return (
                        <div key={s.id} className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-[10px] font-black ${sm.c}`}>
                          <span>{s.name}</span>
                          <div className="flex items-center gap-1">
                            <span>{sm.l}</span>
                            {att.makeup && <span className="text-[8px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded font-black">{makeupDate ? makeupDate.slice(5)+'보충' : '보충'}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matrix');

  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 768;

  // RBAC State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [myStudentId, setMyStudentId] = useState(null);
  const [siteTitle, setSiteTitle] = useState('Science Academy');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [siteColor, setSiteColor] = useState('#3730a3');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [reportRange, setReportRange] = useState({ from: '', to: '' });
  const [reportText, setReportText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportViewMode, setReportViewMode] = useState('summary');

  // Auth Overlay
  const [showPasswordInput, setShowPasswordInput] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Core Data
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [memoItems, setMemoItems] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [memoSubmissions, setMemoSubmissions] = useState({});
  const [tests, setTests] = useState([]);
  const [testScores, setTestScores] = useState({});
  const [attendance, setAttendance] = useState({});
  const [attendanceNotes, setAttendanceNotes] = useState({});
  const [makeupDates, setMakeupDates] = useState({});
  const [studentNotes, setStudentNotes] = useState({});
  const [studentScoreData, setStudentScoreData] = useState({});
  const [subjects, setSubjects] = useState(['물리', '화학', '생명과학', '지구과학', '통합과학']);
  const [editingSubjects, setEditingSubjects] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');
  const [progressPlans, setProgressPlans] = useState([]);
  const [progressCalMonth, setProgressCalMonth] = useState(() => {
    const k = new Date(Date.now() + 9*60*60*1000);
    return k.toISOString().slice(0, 7);
  });
  const [progressSelectedDate, setProgressSelectedDate] = useState(() => {
    return new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
  });
  const [newPlan, setNewPlan] = useState({ subject: '물리', unit: '', memo: '', lessonType: '진도' });
  const [editPlanId, setEditPlanId] = useState(null);
  const [editPlanData, setEditPlanData] = useState(null);

  const [matrixHideDone, setMatrixHideDone] = useState(false);
  const [collapsedWeeks, setCollapsedWeeks] = useState({});

  // UI Support
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  });
  const [regCategory, setRegCategory] = useState('assignment');
  const [openBulkMenu, setOpenBulkMenu] = useState(null);
  const [bulkDatePopup, setBulkDatePopup] = useState(null);
  const [bulkSelectedStatus, setBulkSelectedStatus] = useState(null);
  const [bulkSelectedDate, setBulkSelectedDate] = useState(() => { const k = new Date(Date.now() + 9*60*60*1000); return k.toISOString().split('T')[0]; });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isTestEditMode, setIsTestEditMode] = useState(false);
  const [bulkStudentInput, setBulkStudentInput] = useState('');
  const [inlineDateEditKey, setInlineDateEditKey] = useState(null);
  const [statusMenu, setStatusMenu] = useState(null);

  const [editStudentId, setEditStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState({ name: '', studentCode: '', homeroomTeacher: '', highSchool: '', group: '' });
  const [editItemId, setEditItemId] = useState(null);
  const [editItemData, setEditItemData] = useState(null);

  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '물리', level: '기본', type: 'all', targetStudents: [], deadline: '' });
  const [newTest, setNewTest] = useState({ 
    title: '', source: '', difficulty: '중', description: '', 
    date: new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0], 
    scales: DEFAULT_GRADE_SCALES,
    testType: '중간 테스트'
  });

  // --- Logic Hooks ---
  const visibleStudentsFiltered = useMemo(() => {
    if (userRole === 'student' && myStudentId) return students.filter(s => s.id === myStudentId);
    return students;
  }, [students, userRole, myStudentId]);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { assign: {}, memo: {}, studentTestAverages: {}, testAverages: {} };

    const assign = calculateRoundProgress(students, assignments, submissions, ASSIGN_STATUS_ORDER, ASSIGN_LABELS);
    const memo = calculateRoundProgress(students, memoItems, memoSubmissions, MEMO_STATUS_ORDER, null);

    // 평균은 중간 테스트만
    const mainTests = tests.filter(t => !t.testType || t.testType === '중간 테스트');

    return {
      assign, memo,
      studentTestAverages: students.reduce((acc, s) => {
        const scs = mainTests.map(t => testScores[`${s.id}-${t.id}`]?.score).filter(v => v !== null && v !== undefined);
        acc[s.id] = scs.length ? (scs.reduce((a, b) => a + b, 0) / scs.length).toFixed(1) : "0.0";
        return acc;
      }, {}),
      testAverages: tests.reduce((acc, t) => {
        const scs = students.map(s => testScores[`${s.id}-${t.id}`]?.score).filter(v => v !== null && v !== undefined);
        acc[t.id] = scs.length ? (scs.reduce((a, b) => a + b, 0) / scs.length).toFixed(1) : "0.0";
        return acc;
      }, {})
    };
  }, [students, assignments, memoItems, submissions, memoSubmissions, tests, testScores]);

  // --- Handlers ---
  const handleLogin = (role, sId = null) => {
    setUserRole(role);
    setMyStudentId(sId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setMyStudentId(null);
    setActiveTab('matrix');
  };

  const handleLoginAttempt = (role) => {
    setShowPasswordInput(role);
    setPasswordInput('');
    setStudentCodeInput('');
    setLoginError(false);
  };

  const handleAuthSubmit = () => {
    const passwords = { master: '71207179', teacher: '26350' };
    if (showPasswordInput === 'student') {
      const found = students.find(s => s.studentCode && s.studentCode.trim() === studentCodeInput.trim());
      if (found) { handleLogin('student', found.id); setShowPasswordInput(null); }
      else { setLoginError(true); }
    } else if (passwordInput === passwords[showPasswordInput]) {
      handleLogin(showPasswordInput);
      setShowPasswordInput(null);
    } else {
      setLoginError(true);
    }
  };

  const saveSiteTitle = async (newTitle) => {
    if (userRole !== 'master') return;
    setSiteTitle(newTitle);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { siteTitle: newTitle }, { merge: true });
    setIsEditingTitle(false);
  };

  const saveStudentNote = async (studentId, note) => {
    if (userRole !== 'master') return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notes', studentId), { note }, { merge: true });
  };

  // --- Report Generator ---
  const generateReport = () => {
    const { from, to } = reportRange;
    const fromDate = from || '0000-00-00';
    const toDate = to && to >= from ? to : from ? from : '9999-99-99';
    const inRange = (date) => !date || (date >= fromDate && date <= toDate);

    const lines = [];
    const now = new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
    lines.push(`===== 학원 학습 종합 리포트 =====`);
    lines.push(`생성일: ${now}  |  기간: ${from || '전체'} ~ ${to || '전체'}`);
    lines.push(`학생 수: ${students.length}명\n`);

    // ── 과제 현황 ──
    lines.push(`[과제 현황]`);
    const rangedAssign = assignments.filter(a => inRange(a.deadline));
    rangedAssign.forEach(a => {
      lines.push(`\n• ${a.subject} / ${a.level} — ${a.title}${a.deadline ? ` (마감: ${a.deadline})` : ''}`);
      students.forEach(s => {
        if (!(a.type === 'all' || (a.targetStudents && a.targetStudents.includes(s.id)))) return;
        const sub = submissions[`${s.id}-${a.id}`] || {};
        const status = ASSIGN_STATUS_CONFIG[sub.status || 'not_started']?.label || '-';
        lines.push(`  ${s.name}: ${status}${sub.completionDate ? ` (완료일: ${sub.completionDate})` : ''}`);
      });
    });
    if (rangedAssign.length === 0) lines.push('  (해당 기간 과제 없음)');

    // ── 암기 현황 ──
    lines.push(`\n[암기 현황]`);
    const rangedMemo = memoItems;
    rangedMemo.forEach(m => {
      lines.push(`\n• ${m.subject} / ${m.level} — ${m.title}`);
      students.forEach(s => {
        if (!(m.type === 'all' || (m.targetStudents && m.targetStudents.includes(s.id)))) return;
        const sub = memoSubmissions[`${s.id}-${m.id}`] || {};
        const status = MEMO_STATUS_CONFIG[sub.status || 'not_started']?.label || '-';
        lines.push(`  ${s.name}: ${status}`);
      });
    });
    if (rangedMemo.length === 0) lines.push('  (암기 항목 없음)');

    // ── 성적표 ──
    lines.push(`\n[성적표]`);
    const rangedTests = tests.filter(t => inRange(t.date));
    if (rangedTests.length === 0) {
      lines.push('  (해당 기간 시험 없음)');
    } else {
      lines.push(`  시험 수: ${rangedTests.length}개`);
      rangedTests.forEach(t => {
        const avg = stats.testAverages[t.id] || '0.0';
        lines.push(`\n• [${t.date}] ${t.title}  난이도: ${t.difficulty || '-'}  출처: ${t.source || '-'}  반평균: ${avg}점`);
        students.forEach(s => {
          const sc = testScores[`${s.id}-${t.id}`];
          if (sc?.score !== null && sc?.score !== undefined) {
            lines.push(`  ${s.name}: ${sc.score}점${sc.plan ? `  (계획: ${sc.plan})` : ''}`);
          }
        });
      });
      lines.push(`\n  학생별 시험 평균:`);
      students.forEach(s => {
        lines.push(`  ${s.name}: ${stats.studentTestAverages[s.id] || '0.0'}점`);
      });
    }

    // ── 출결 ──
    lines.push(`\n[출결 현황]`);
    const attKeys = Object.keys(attendance).filter(k => {
      const d = k.split('-').slice(1).join('-');
      return inRange(d);
    });
    if (attKeys.length === 0) {
      lines.push('  (해당 기간 출결 기록 없음)');
    } else {
      students.forEach(s => {
        const myKeys = attKeys.filter(k => k.startsWith(`${s.id}-`));
        const present = myKeys.filter(k => attendance[k]?.status === 'present').length;
        const late = myKeys.filter(k => attendance[k]?.status === 'late').length;
        const absent = myKeys.filter(k => attendance[k]?.status === 'absent').length;
        const makeup = myKeys.filter(k => attendance[k]?.makeup).length;
        if (myKeys.length > 0) lines.push(`  ${s.name}: 출석 ${present}  지각 ${late}  결석 ${absent}  보충 ${makeup}`);
      });
    }

    // ── 진도 관리 ──
    lines.push(`\n[진도 관리]`);
    const rangedPlans = progressPlans.filter(p => inRange(p.date));
    if (rangedPlans.length === 0) {
      lines.push('  (해당 기간 진도 계획 없음)');
    } else {
      const jinDoRanged = rangedPlans.filter(p => !p.lessonType || p.lessonType === '진도');
      const totalP = jinDoRanged.length;
      const doneP = jinDoRanged.filter(p => p.done).length;
      lines.push(`  전체 진도율 (진도 수업 기준): ${totalP > 0 ? Math.round(doneP/totalP*100) : 0}%  (${doneP}/${totalP} 완료)`);
      subjects.forEach(sub => {
        const subPlans = jinDoRanged.filter(p => p.subject === sub);
        if (subPlans.length === 0) return;
        const subDone = subPlans.filter(p => p.done).length;
        lines.push(`  ${sub}: ${Math.round(subDone/subPlans.length*100)}%  (${subDone}/${subPlans.length})`);
        subPlans.forEach(p => lines.push(`    [${p.date}${p.done ? ' ✓' : ''}] ${p.unit}${p.memo ? `  — ${p.memo}` : ''}`));
      });
      // 진도 외 수업 현황
      const etcPlans = rangedPlans.filter(p => p.lessonType && p.lessonType !== '진도');
      if (etcPlans.length > 0) {
        lines.push(`\n  [기타 수업 현황]`);
        ['암기','문제풀이','중간 테스트','시험 직전 대비'].forEach(lt => {
          const lPlans = etcPlans.filter(p => p.lessonType === lt);
          if (lPlans.length === 0) return;
          lines.push(`  ${lt}: ${lPlans.filter(p=>p.done).length}/${lPlans.length} 완료`);
        });
      }
    }

    lines.push(`\n================================`);
    const text = lines.join('\n');
    setReportText(text);
    setReportGenerated(true);
    setAiAnalysis('');
  };

  const requestAiAnalysis = async () => {
    if (!reportText || aiLoading) return;
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `당신은 학원 학습 데이터 분석 전문가입니다. 아래 학습 리포트를 분석하고, 다음 항목에 대해 한국어로 구체적이고 실질적인 개선점을 제안해 주세요:\n\n1. 📚 과제 이행률 및 완료 패턴 분석\n2. 📖 암기 학습 진척도 분석\n3. 📊 성적 추이 및 개선 필요 학생\n4. 🗓️ 출결 패턴 분석\n5. 📈 진도 관리 현황 분석\n6. 💡 종합 개선 제언 (우선순위 3가지)\n\n리포트:\n${reportText}`
          }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || '').join('');
      setAiAnalysis(text || '분석 결과를 받아오지 못했습니다.');
    } catch (e) {
      setAiAnalysis('AI 분석 중 오류가 발생했습니다: ' + e.message);
    }
    setAiLoading(false);
  };

    const saveSiteColor = async (color) => {
    if (userRole !== 'master') return;
    setSiteColor(color);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { siteColor: color }, { merge: true });
    setShowColorPicker(false);
  };

  const handleStatusSelect = async (sid, itemId, category, nextStatus) => {
    if (userRole !== 'master') return;
    const key = `${sid}-${itemId}`;
    const coll = category === 'assignment' ? 'submissions' : 'memoSubmissions';
    let date = null;
    if (nextStatus === 'completed' || nextStatus === 'round_4') date = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, key), { status: nextStatus, completionDate: date }, { merge: true });
    setStatusMenu(null);
  };

  const bulkUpdateStatus = async (item, nextStatus, category) => {
    if (userRole !== 'master') return;
    const batch = writeBatch(db);
    const coll = category === 'assignment' ? 'submissions' : 'memoSubmissions';
    const actualDate = (nextStatus === 'completed' || nextStatus === 'round_4') ? bulkSelectedDate : null;
    students.forEach(s => {
      if (item.type === 'all' || (item.targetStudents && item.targetStudents.includes(s.id))) {
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', coll, `${s.id}-${item.id}`), { status: nextStatus, completionDate: actualDate }, { merge: true });
      }
    });
    await batch.commit();
    setOpenBulkMenu(null);
    setBulkDatePopup(null);
  };

  const addAssignment = async () => {
    if (userRole !== 'master' || !newAssignment.title.trim()) return;
    const coll = regCategory === 'assignment' ? 'assignments' : 'memoItems';
    const id = (regCategory === 'assignment' ? 'a' : 'm') + Date.now();
    const list = (regCategory === 'assignment' ? assignments : memoItems);
    const sortOrder = list.length > 0 ? Math.max(...list.map(x => x.sortOrder || 0)) + 1 : 0;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, id), { ...newAssignment, sortOrder, category: regCategory });
    setNewAssignment(prev => ({ ...prev, title: '' }));
  };

  const addTest = async () => {
    if (userRole !== 'master' || !newTest.title.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', 't' + Date.now()), { ...newTest });
    setNewTest(prev => ({ ...prev, title: '', description: '' }));
  };

  const updateTestDetails = async () => {
    if (userRole !== 'master' || !selectedTest) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', selectedTest.id), selectedTest, { merge: true });
    setIsTestEditMode(false);
  };

  const saveEditItem = async () => {
    if (userRole !== 'master' || !editItemData?.title.trim()) return;
    const coll = editItemData.category === 'assignment' ? 'assignments' : 'memoItems';
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, editItemId), editItemData, { merge: true });
    setEditItemId(null);
    setEditItemData(null);
  };

  const deleteItem = async (coll, id) => {
    if (userRole !== 'master') return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, id));
  };

  const moveItem = async (direction, item) => {
    if (userRole !== 'master') return;
    const coll = regCategory === 'assignment' ? 'assignments' : 'memoItems';
    const list = regCategory === 'assignment' ? assignments : memoItems;
    const idx = list.findIndex(x => x.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx], b = list[swapIdx];
    const aOrder = a.sortOrder ?? idx;
    const bOrder = b.sortOrder ?? swapIdx;
    const batch = writeBatch(db);
    batch.set(doc(db, 'artifacts', appId, 'public', 'data', coll, a.id), { sortOrder: bOrder }, { merge: true });
    batch.set(doc(db, 'artifacts', appId, 'public', 'data', coll, b.id), { sortOrder: aOrder }, { merge: true });
    await batch.commit();
  };

  const saveStudentDetails = async () => {
    if (userRole !== 'master') return;
    if (!editStudentId || !editStudentData.name.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', editStudentId), editStudentData, { merge: true });
    setEditStudentId(null);
  };

  const updateAttendance = async (sid, type) => {
    if (userRole !== 'master') return;
    const key = `${sid}-${currentDate}`;
    const cur = attendance[key] || { status: 'none', makeup: false };
    const update = type === 'makeup' ? { ...cur, makeup: !cur.makeup } : { ...cur, status: cur.status === type ? 'none' : type };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', key), update);
  };

  const updateMakeupDateValue = async (sid, attDate, mDate) => {
    if (userRole !== 'master') return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'makeupDates', `${sid}-${attDate}`), { date: mDate });
  };

  const handleBulkAttendanceToggle = async () => {
    if (userRole !== 'master' || students.length === 0) return;
    const areAllPresent = students.every(s => attendance[`${s.id}-${currentDate}`]?.status === 'present');
    const nextStatus = areAllPresent ? 'none' : 'present';
    const batch = writeBatch(db);
    students.forEach(s => {
      const key = `${s.id}-${currentDate}`;
      const cur = attendance[key] || { status: 'none', makeup: false };
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'attendance', key), { ...cur, status: nextStatus }, { merge: true });
    });
    await batch.commit();
  };

  const addPlan = async () => {
    if (userRole !== 'master' || !newPlan.unit.trim()) return;
    const id = 'p' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', id), {
      ...newPlan, date: progressSelectedDate, done: false
    });
    setNewPlan(prev => ({ ...prev, unit: '', memo: '' }));
  };

  const togglePlanDone = async (plan) => {
    if (userRole !== 'master') return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', plan.id), { done: !plan.done }, { merge: true });
  };

  const saveEditPlan = async () => {
    if (userRole !== 'master' || !editPlanId || !editPlanData?.unit.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', editPlanId), editPlanData, { merge: true });
    setEditPlanId(null);
    setEditPlanData(null);
  };

  const deletePlan = async (id) => {
    if (userRole !== 'master') return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressPlans', id));
  };

    const updateCompletionDate = async (sid, itemId, date, category) => {
    if (userRole !== 'master') return;
    const coll = category === 'assignment' ? 'submissions' : 'memoSubmissions';
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', coll, `${sid}-${itemId}`), { completionDate: date }, { merge: true });
    setInlineDateEditKey(null);
  };

  // --- Sync Effects ---
  useEffect(() => {
    let unsubscribers = [];
    // [FIX 3] setLoading(false)를 notes 콜백에만 의존하지 않도록
    // 모든 구독 등록 후 별도로 처리
    let loadingDone = false;

    const initApp = async () => {
      try {
        
        await signInAnonymously(auth);

        onAuthStateChanged(auth, (u) => {
          setUser(u);
          if (u) {
            const basePath = ['artifacts', appId, 'public', 'data'];
            unsubscribers.push(onSnapshot(doc(db, ...basePath, 'settings', 'config'), snap => { if (snap.exists()) { setSiteTitle(snap.data().siteTitle || 'Science Academy'); if (snap.data().siteColor) setSiteColor(snap.data().siteColor); if (snap.data().subjects) setSubjects(snap.data().subjects); } }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'students')), s => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name, 'ko')))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'assignments')), s => setAssignments(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'memoItems')), s => setMemoItems(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'submissions')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setSubmissions(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'memoSubmissions')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setMemoSubmissions(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'tests')), s => setTests(s.docs.map(d => ({ id: d.id, ...d.data() })))));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'testScores')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setTestScores(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'attendance')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setAttendance(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'attendanceNotes')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data().note); setAttendanceNotes(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'makeupDates')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data().date); setMakeupDates(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'notes')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data().note); setStudentNotes(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'studentScores')), s => { const d = {}; s.docs.forEach(x => d[x.id] = x.data()); setStudentScoreData(d); }));
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'progressPlans')), s => setProgressPlans(s.docs.map(d => ({ id: d.id, ...d.data() })))));

            // [FIX 3] notes 콜백 의존 제거: 인증 완료 후 바로 로딩 해제
            if (!loadingDone) {
              loadingDone = true;
              setLoading(false);
            }
          }
        });
      } catch (e) {
        console.error(e);
        setLoading(false); // 에러 시에도 로딩 해제
      }
    };
    initApp();
    return () => unsubscribers.forEach(u => u());
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
    </div>
  );

  // --- Auth Render ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans text-slate-900 font-black">
        <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl p-12 border border-slate-200 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10 text-center font-black">
            <div className="rounded-[2.2rem] text-white mb-6 shadow-2xl p-6" style={{background:siteColor}}><Beaker size={48} /></div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none text-center">{siteTitle}</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-3">시스템 접속 권한 인증</p>
          </div>
          <div className="space-y-4 max-w-sm mx-auto font-black">
            <button onClick={() => handleLoginAttempt('master')} className="w-full group flex items-center justify-between p-6 rounded-[1.8rem] text-white shadow-lg transition-all active:scale-95" style={{background:siteColor}}>
              <div className="flex items-center gap-4 text-left"><ShieldCheck size={24} /><div><p className="font-black text-lg leading-none">마스터 로그인</p><p className="text-xs text-indigo-100 font-medium mt-1">관리 및 모든 수정 권한</p></div></div>
              <ChevronRight size={20} className="opacity-40" />
            </button>
            <button onClick={() => handleLoginAttempt('teacher')} className="w-full group flex items-center justify-between p-6 bg-white border-2 rounded-[1.8rem] shadow-sm transition-all active:scale-95" style={{color:siteColor, borderColor:siteColor+'22'}}>
              <div className="flex items-center gap-4 text-left"><UserCog size={24} /><div><p className="font-black text-lg leading-none">선생님 / 실장님</p><p className="text-xs text-indigo-300 font-medium mt-1">전체 조회 전용 모드</p></div></div>
              <ChevronRight size={20} className="opacity-40" />
            </button>
            <div className="relative py-6"><div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 tracking-[0.3em]">Student Portal</div></div>
            <button onClick={() => handleLoginAttempt('student')} className="w-full group flex items-center justify-between p-6 bg-emerald-600 rounded-[1.8rem] text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
              <div className="flex items-center gap-4 text-left"><Fingerprint size={24} /><div><p className="font-black text-lg">학생 / 학부모 포털</p><p className="text-xs text-emerald-100 font-medium mt-1">학생 코드로 접속</p></div></div>
              <ChevronRight size={20} className="opacity-40" />
            </button>
          </div>
        </div>
        {showPasswordInput && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-[2.8rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex flex-col items-center text-center mb-8 font-black">
                <div className={`p-4 rounded-2xl mb-4 ${showPasswordInput === 'student' ? 'bg-emerald-100 text-emerald-600' : showPasswordInput === 'master' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                  {showPasswordInput === 'student' ? <Fingerprint size={32} /> : <KeyRound size={32} />}
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase">{showPasswordInput === 'student' ? 'Student' : showPasswordInput === 'master' ? 'Master' : 'Manager'} 인증</h3>
                <p className="text-sm text-slate-400 font-bold mt-1">정보를 입력하세요.</p>
              </div>
              <div className="space-y-4 font-black">
                <input
                  type={showPasswordInput === 'student' ? 'text' : 'password'} autoFocus placeholder={showPasswordInput === 'student' ? "학생 코드" : "Password"}
                  value={showPasswordInput === 'student' ? studentCodeInput : passwordInput}
                  onChange={(e) => { if (showPasswordInput === 'student') setStudentCodeInput(e.target.value); else setPasswordInput(e.target.value); setLoginError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                  className={`w-full p-4 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black tracking-widest outline-none transition-all ${loginError ? 'border-red-500 bg-red-50 animate-shake' : 'border-transparent focus:border-indigo-500'}`}
                />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => setShowPasswordInput(null)} className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black transition">취소</button>
                  <button onClick={handleAuthSubmit} className="py-4 text-white rounded-2xl font-black shadow-lg" style={{background: showPasswordInput === 'student' ? '#059669' : siteColor}}>입장</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Main App UI ---
  return (
    <ErrorBoundary>
      <SiteColorStyle color={siteColor} />
      {/* [FIX 2] 최상위에만 font-black 유지, 하위 요소에서 중복 제거 */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 select-none overflow-x-hidden font-black">
        <header className="text-white shadow-lg sticky top-0 z-40" style={{background:'var(--sc-darker)'}}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Beaker className="w-7 h-7" /></div>
              <div>
                <div className="flex items-center gap-2">
                  {isEditingTitle && userRole === 'master' ? (
                    <BufferedInput value={siteTitle} onSave={saveSiteTitle} className="bg-indigo-900/50 text-white border-none text-xl font-black uppercase tracking-tight px-2 rounded outline-none" autoFocus />
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => userRole === 'master' && setIsEditingTitle(true)}>
                      <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">{siteTitle}</h1>
                      {userRole === 'master' && <Edit2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 leading-none text-[9px]">
                  <span className={`px-2 py-0.5 rounded font-black uppercase border ${userRole === 'master' ? 'bg-blue-500 border-blue-400' : userRole === 'teacher' ? 'bg-amber-500 border-amber-400' : 'bg-emerald-500 border-emerald-400'}`}>
                    {userRole}
                  </span>
                  <p className="text-white/50 tracking-widest uppercase ml-1">v17.49 master</p>
                  {userRole === 'master' && (
                    <div className="relative ml-2">
                      <button onClick={() => setShowColorPicker(v => !v)} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[9px] font-black text-white leading-none">
                        <span style={{background:siteColor}} className="w-3 h-3 rounded-full border border-white/40 inline-block" />
                        색상
                      </button>
                      {showColorPicker && (
                        <div className="absolute top-7 left-0 z-[300] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-64 animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">추천 색상</p>
                          <div className="grid grid-cols-5 gap-2 mb-3">
                            {[['#3730a3','인디고'],['#1d4ed8','블루'],['#0f766e','틸'],['#7c3aed','바이올렛'],['#b91c1c','레드'],['#c2410c','오렌지'],['#15803d','그린'],['#1e3a5f','네이비'],['#4a1d96','퍼플'],['#374151','그레이']].map(([c,n])=>(
                              <button key={c} onClick={()=>saveSiteColor(c)} title={n}
                                className="w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 shadow-sm"
                                style={{background:c, borderColor: siteColor===c ? '#fff' : 'transparent', outline: siteColor===c ? '2px solid '+c : 'none'}} />
                            ))}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">직접 입력</p>
                          <div className="flex gap-2 items-center">
                            <input type="color" value={siteColor} onChange={e=>setSiteColor(e.target.value)} className="w-10 h-10 rounded-xl border-2 border-slate-100 cursor-pointer bg-white p-0.5" />
                            <input type="text" value={siteColor} onChange={e=>{ if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setSiteColor(e.target.value); }}
                              className="flex-1 px-3 py-2 border-2 border-slate-100 rounded-xl font-mono text-sm font-bold text-slate-700 outline-none focus:border-slate-400" placeholder="#3730a3" />
                            <button onClick={()=>saveSiteColor(siteColor)} className="px-3 py-2 bg-slate-800 text-white rounded-xl font-black text-xs hover:bg-slate-700 transition-all">적용</button>
                          </div>
                          <button onClick={()=>setShowColorPicker(false)} className="w-full mt-3 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">닫기</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <nav className="flex bg-white/10 p-1 rounded-xl items-center overflow-x-auto max-w-full no-scrollbar">
              {[{ id: 'matrix', l: '과제 현황', i: BarChart3 }, { id: 'memorization', l: '암기 현황', i: BrainCircuit }, { id: 'tests', l: '성적표', i: Trophy }, { id: 'attendance', l: '출결 관리', i: Calendar }, { id: 'progress', l: '진도 관리', i: TrendingUp }, { id: 'students', l: '학생 관리', i: Users, h: userRole === 'student' }, { id: 'report', l: '리포트', i: Printer, h: userRole === 'student' }, { id: 'assignments', l: '항목 등록', i: BookOpen, h: userRole === 'student' }].filter(t => !t.h).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md font-black' : 'hover:bg-white/10 text-white'}`}><tab.i size={16} />{tab.l}</button>
              ))}
              <button onClick={handleLogout} className="ml-2 p-2 hover:bg-white/20 rounded-lg text-white transition"><LogOut size={18} /></button>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
          {/* 현황 매트릭스 */}
          {(activeTab === 'matrix' || activeTab === 'memorization') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-left">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 leading-none"><Info size={20} /> 상태 가이드</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-slate-700">
                  {activeTab === 'matrix' ? (
                    [{ l: '시작 전', c: 'bg-slate-50 text-slate-300', i: Circle }, { l: '진행 중', c: 'bg-slate-100 text-slate-900', i: Clock }, { l: '미완료', c: 'bg-red-50 text-red-500', i: AlertCircle }, { l: '완료', c: 'bg-blue-50 text-blue-500', i: CheckCircle2 }, { l: '지각 완료', c: 'bg-orange-50 text-orange-500', i: History }, { l: '해당 없음', c: 'bg-slate-100 text-slate-400', i: MinusCircle }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-center"><div className={`p-2 rounded-xl ${item.c}`}><item.i size={20} /></div><p className="text-[11px] font-black">{item.l}</p></div>
                    ))
                  ) : (
                    MEMO_STATUS_ORDER.map(k => (
                      <div key={k} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-center">
                        <div className={`p-2 rounded-xl ${MEMO_STATUS_CONFIG[k].bg} ${MEMO_STATUS_CONFIG[k].color}`}>{React.createElement(MEMO_STATUS_CONFIG[k].icon, { size: 20 })}</div>
                        <p className="text-[11px] font-black">{MEMO_STATUS_CONFIG[k].label}</p>
                      </div>
                    ))
                  )}
                </div>
                {activeTab === 'matrix' && (
                  <div className="mt-4 px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-2.5">
                    <Calculator size={14} className="text-indigo-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-[11px] font-black text-indigo-700 mb-1">진척도 % 계산 방식</p>
                      <p className="text-[10px] font-bold text-indigo-500 leading-relaxed">
                        <span className="bg-white px-1.5 py-0.5 rounded-lg border border-indigo-100 mr-1">완료 ÷ (완료 + 미완료) × 100</span>
                        시작 전 · 진행 중 · 해당 없음은 계산에서 제외됩니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center bg-white">
                  <h2 className="text-base font-bold flex items-center gap-2 shrink-0">
                    {activeTab === 'matrix' ? <ClipboardCheck size={18}/> : <BrainCircuit size={18}/>}
                    {userRole === 'student' ? '나의 실시간 학습 현황' : '전체 학습 진척도'}
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    <Users size={11}/>{visibleStudentsFiltered.length}명
                  </span>
                  {userRole !== 'student' && (
                    <div className="ml-auto">
                      <button onClick={() => setMatrixHideDone(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${matrixHideDone ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                        <CheckCircle2 size={12}/>{matrixHideDone ? '완료 숨김 중' : '완료 숨기기'}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 모바일: 카드형 뷰 ── */}
                {isMobile ? (
                  (() => {
                    // 주차 계산 헬퍼
                    const getWeekKeyM = (dateStr) => {
                      if (!dateStr) return 'no-deadline';
                      const d = new Date(dateStr);
                      const day = d.getDay();
                      const mon = new Date(d);
                      mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
                      return mon.toISOString().slice(0, 10);
                    };
                    const getWeekLabelM = (wk) => {
                      if (wk === 'no-deadline') return '마감일 미정';
                      const mon = new Date(wk); const sun = new Date(wk); sun.setDate(mon.getDate() + 6);
                      const fmt = d => `${d.getMonth()+1}/${d.getDate()}`;
                      return `${fmt(mon)} ~ ${fmt(sun)}`;
                    };
                    const todayKst = new Date(Date.now() + 9*60*60*1000).toISOString().slice(0, 10);
                    const thisWeekKeyM = getWeekKeyM(todayKst);

                    // matrix 탭만 주차 그룹핑
                    const allItemsM = activeTab === 'matrix' ? assignments : memoItems;
                    const weekGroupsM = activeTab === 'matrix' ? (() => {
                      const wm = {};
                      allItemsM.forEach(as => { const wk = getWeekKeyM(as.deadline); if (!wm[wk]) wm[wk] = []; wm[wk].push(as); });
                      return Object.entries(wm)
                        .sort(([a],[b]) => a === 'no-deadline' ? 1 : b === 'no-deadline' ? -1 : a.localeCompare(b))
                        .map(([wk, items]) => ({ wk, label: getWeekLabelM(wk), items, isThisWeek: wk === thisWeekKeyM }));
                    })() : [];
                    const isWeekCollapsedM = (wk, isThisWeek) => collapsedWeeks[wk] !== undefined ? collapsedWeeks[wk] : !isThisWeek;
                    const visibleItemsM = activeTab === 'matrix'
                      ? weekGroupsM.flatMap(({ wk, items, isThisWeek }) => isWeekCollapsedM(wk, isThisWeek) ? [] : items)
                      : allItemsM;

                    return (
                      <div>
                        {/* 주차 탭 */}
                        {activeTab === 'matrix' && weekGroupsM.length > 0 && (
                          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center bg-slate-50/50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">주차</span>
                            {weekGroupsM.map(({ wk, label, isThisWeek, items }) => {
                              const collapsed = isWeekCollapsedM(wk, isThisWeek);
                              const incompleteCnt = collapsed ? items.reduce((cnt, as) =>
                                cnt + visibleStudentsFiltered.filter(s => {
                                  const st = submissions[`${s.id}-${as.id}`]?.status || 'not_started';
                                  return (as.type === 'all' || as.targetStudents?.includes(s.id)) && st === 'incomplete_red';
                                }).length, 0) : 0;
                              return (
                                <button key={wk}
                                  onClick={() => setCollapsedWeeks(prev => ({ ...prev, [wk]: !isWeekCollapsedM(wk, isThisWeek) }))}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all ${!collapsed ? 'text-white border-transparent shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}
                                  style={!collapsed ? {background:'var(--sc)'} : {}}>
                                  {isThisWeek && <span className="text-[8px] opacity-70">이번주</span>}
                                  {label}
                                  <span className={`text-[9px] px-1 py-0.5 rounded-full font-black ${!collapsed ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{items.length}</span>
                                  {incompleteCnt > 0 && <span className="text-[9px] px-1 py-0.5 rounded-full font-black bg-red-100 text-red-500">{incompleteCnt}미완</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <div className="divide-y divide-slate-100">
                          {visibleStudentsFiltered.map(s => {
                            const items = visibleItemsM;

                            // 진척도 계산 (전체 과제 기준)
                            let pctText, labelText;
                            if (activeTab === 'matrix') {
                              const rel = assignments.filter(a => a.type === 'all' || a.targetStudents?.includes(s.id));
                              const done = rel.filter(a => submissions[`${s.id}-${a.id}`]?.status === 'completed').length;
                              const incomplete = rel.filter(a => submissions[`${s.id}-${a.id}`]?.status === 'incomplete_red').length;
                              const effective = done + incomplete;
                              pctText = effective > 0 ? `${Math.round(done / effective * 100)}%` : '-';
                              labelText = effective > 0 ? `${done}/${effective} 완료` : '집계 중';
                            } else {
                              const progressStat = stats.memo[s.id];
                              pctText = `${progressStat?.percent || '0.0'}%`;
                              labelText = progressStat?.label || '-';
                            }
                            return (
                              <div key={s.id} className="p-4">
                                {/* 학생 헤더 */}
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <p className="text-base font-black text-slate-800">{s.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {s.homeroomTeacher && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold border border-indigo-100 leading-none"><UserCircle2 size={9}/> {s.homeroomTeacher}</span>}
                                      {s.highSchool && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold border border-slate-100 leading-none"><School size={9}/> {s.highSchool}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`text-right px-3 py-1.5 rounded-xl ${activeTab === 'matrix' ? 'bg-indigo-50' : 'bg-purple-50'}`}>
                                      <p className={`text-xs font-black ${activeTab === 'matrix' ? 'text-indigo-700' : 'text-purple-700'}`}>{pctText}</p>
                                      <p className={`text-[10px] font-black ${activeTab === 'matrix' ? 'text-indigo-400' : 'text-purple-400'}`}>{labelText}</p>
                                    </div>
                                    <button onClick={() => setSelectedStudent(s)}><Search size={16} className="text-slate-300 hover:text-indigo-600 transition-colors" /></button>
                                  </div>
                                </div>
                                {/* 과제 목록 */}
                                <div className="space-y-2">
                                  {items.map(as => {
                                    const isTarget = as.type === 'all' || (as.targetStudents && as.targetStudents.includes(s.id));
                                    const subKey = `${s.id}-${as.id}`;
                                    const sub = (activeTab === 'matrix' ? submissions : memoSubmissions)[subKey];
                                    const status = sub?.status || 'not_started';
                                    const cfg = activeTab === 'matrix' ? ASSIGN_STATUS_CONFIG[status] : MEMO_STATUS_CONFIG[status];
                                    const isLate = status === 'completed' && as.deadline && sub?.completionDate > as.deadline;
                                    const today = new Date().toISOString().split('T')[0];
                                    const diff = as.deadline ? Math.ceil((new Date(as.deadline) - new Date(today)) / (1000 * 60 * 60 * 24)) : null;
                                    const overDiff = as.deadline && today > as.deadline ? Math.ceil((new Date(today) - new Date(as.deadline)) / (1000 * 60 * 60 * 24)) : 0;
                                    const isOverdue = overDiff > 0 && ['not_started', 'in_progress', 'incomplete_red'].includes(status);

                                    if (!isTarget) return (
                                      <div key={as.id} className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-50/50 border border-slate-100 opacity-40">
                                        <span className="text-[11px] font-black text-slate-400 truncate flex-1 mr-2">{as.title}</span>
                                        <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">대상 아님</span>
                                      </div>
                                    );

                                    const colorClass = activeTab === 'matrix' ? (isLate ? STATUS_COLORS.late_completed : STATUS_COLORS[status]) : `${cfg?.bg} ${cfg?.color}`;
                                    const Icon = activeTab === 'matrix'
                                      ? (status === 'completed' ? (isLate ? History : CheckCircle2) : status === 'in_progress' ? Clock : status === 'incomplete_red' ? AlertCircle : status === 'exempt' ? MinusCircle : Circle)
                                      : cfg?.icon || Circle;

                                    return (
                                      <div key={as.id}
                                        onClick={(e) => { if (userRole === 'master') setStatusMenu({ studentId: s.id, itemId: as.id, category: activeTab === 'matrix' ? 'assignment' : 'memorization', x: e.clientX, y: e.clientY }); }}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-2xl border transition-all ${colorClass} ${userRole === 'master' ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <Icon size={16} className="shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-[11px] font-black truncate leading-tight">{as.title}</p>
                                            <p className="text-[9px] font-bold opacity-70 leading-none mt-0.5">{as.subject} · {as.level}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                          {activeTab === 'matrix' && as.deadline && diff !== null && diff >= 0 && (
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border leading-none whitespace-nowrap ${diff === 0 ? 'bg-orange-100 text-orange-600 border-orange-200' : diff <= 3 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white/60 text-current border-current/20'}`}>
                                              {diff === 0 ? '마감!' : `D-${diff}`}
                                            </span>
                                          )}
                                          {isOverdue && (
                                            <span className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-lg border leading-none whitespace-nowrap bg-red-100 text-red-600 border-red-200">
                                              <AlertTriangle size={8} className="shrink-0"/>{overDiff}일 초과
                                            </span>
                                          )}
                                          {activeTab === 'memorization' && status !== 'not_started' && (
                                            <span className="text-[9px] font-black opacity-80 whitespace-nowrap">{cfg?.label}</span>
                                          )}
                                          {(userRole === 'master' || userRole === 'teacher') && ((status === 'completed' && activeTab === 'matrix') || (status === 'round_4' && activeTab === 'memorization')) && sub?.completionDate && (
                                            userRole === 'master' ? (
                                              inlineDateEditKey === subKey ? (
                                                <input type="date" value={sub?.completionDate || ''} onChange={(e) => updateCompletionDate(s.id, as.id, e.target.value, activeTab === 'matrix' ? 'assignment' : 'memorization')} onBlur={() => setInlineDateEditKey(null)} className="text-[9px] border-none bg-white/60 rounded px-1 outline-none font-bold w-24" autoFocus onClick={e => e.stopPropagation()} />
                                              ) : (
                                                <span onClick={(e) => { e.stopPropagation(); setInlineDateEditKey(subKey); }} className="text-[9px] font-bold opacity-60 hover:opacity-100 cursor-pointer whitespace-nowrap">{sub?.completionDate?.split('-').slice(1).join('/') || '날짜'}</span>
                                              )
                                            ) : (
                                              <span className="text-[9px] font-bold opacity-60 whitespace-nowrap">{sub?.completionDate?.split('-').slice(1).join('/')}</span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                /* ── 데스크탑: 기존 테이블 뷰 ── */
                <div className="overflow-x-auto text-slate-700">
                  {(() => {
                    const allItems = activeTab === 'matrix' ? assignments : memoItems;
                    // 필터 적용
                    const filteredItems = allItems.filter(as => {
                      if (matrixHideDone) {
                        // 모든 대상 학생이 완료했으면 숨김
                        const targets = visibleStudentsFiltered.filter(s => as.type === 'all' || as.targetStudents?.includes(s.id));
                        const allDone = targets.length > 0 && targets.every(s => {
                          const st = (activeTab === 'matrix' ? submissions : memoSubmissions)[`${s.id}-${as.id}`]?.status;
                          return st === 'completed' || st === 'exempt' || st === 'round_4';
                        });
                        if (allDone) return false;
                      }
                      return true;
                    });

                    // 주차 계산 헬퍼 (마감일 기준 월~일)
                    const getWeekKey = (dateStr) => {
                      if (!dateStr) return 'no-deadline';
                      const d = new Date(dateStr);
                      const day = d.getDay();
                      const mon = new Date(d);
                      mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
                      return mon.toISOString().slice(0, 10);
                    };
                    const getWeekLabel = (wk) => {
                      if (wk === 'no-deadline') return '마감일 미정';
                      const mon = new Date(wk);
                      const sun = new Date(wk); sun.setDate(mon.getDate() + 6);
                      const fmt = d => `${d.getMonth()+1}/${d.getDate()}`;
                      return `${fmt(mon)} ~ ${fmt(sun)}`;
                    };
                    const todayKst = new Date(Date.now() + 9*60*60*1000).toISOString().slice(0, 10);
                    const thisWeekKey = getWeekKey(todayKst);

                    // 주차 그룹핑 (matrix 탭만)
                    const weekGroups = activeTab === 'matrix' ? (() => {
                      const wm = {};
                      filteredItems.forEach(as => { const wk = getWeekKey(as.deadline); if (!wm[wk]) wm[wk] = []; wm[wk].push(as); });
                      return Object.entries(wm)
                        .sort(([a],[b]) => a === 'no-deadline' ? 1 : b === 'no-deadline' ? -1 : a.localeCompare(b))
                        .map(([wk, items]) => ({ wk, label: getWeekLabel(wk), items, isThisWeek: wk === thisWeekKey }));
                    })() : [];

                    // 접힘 상태: 기본은 이번 주차만 펼침
                    const isWeekCollapsed = (wk, isThisWeek) => collapsedWeeks[wk] !== undefined ? collapsedWeeks[wk] : !isThisWeek;

                    // 화면에 보일 items (접힌 주차 제외)
                    const visibleItems = activeTab === 'matrix'
                      ? weekGroups.flatMap(({ wk, items, isThisWeek }) => isWeekCollapsed(wk, isThisWeek) ? [] : items)
                      : filteredItems;

                    // 과목별 그룹핑 (visibleItems 기준)
                    const subjectGroups = subjects.map(sub => ({
                      subject: sub,
                      items: visibleItems.filter(a => a.subject === sub)
                    })).filter(g => g.items.length > 0);

                    if (filteredItems.length === 0) return (
                      <div className="p-12 text-center text-slate-400 font-bold">
                        <CheckCircle2 size={32} className="text-blue-200 mx-auto mb-3"/>
                        <p>표시할 과제가 없어요.</p>
                        <p className="text-sm mt-1 text-slate-300">필터를 변경하거나 완료 숨기기를 해제해보세요.</p>
                      </div>
                    );

                    return (
                      <div>
                      {/* 주차 탭 버튼 (matrix만) */}
                      {activeTab === 'matrix' && weekGroups.length > 0 && (
                        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center bg-slate-50/50">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">주차</span>
                          {weekGroups.map(({ wk, label, isThisWeek, items }) => {
                            const collapsed = isWeekCollapsed(wk, isThisWeek);
                            const incompleteCnt = collapsed ? items.reduce((cnt, as) =>
                              cnt + visibleStudentsFiltered.filter(s => {
                                const st = submissions[`${s.id}-${as.id}`]?.status || 'not_started';
                                return (as.type === 'all' || as.targetStudents?.includes(s.id)) && st === 'incomplete_red';
                              }).length, 0) : 0;
                            return (
                              <button key={wk}
                                onClick={() => setCollapsedWeeks(prev => ({ ...prev, [wk]: !isWeekCollapsed(wk, isThisWeek) }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${!collapsed ? 'text-white border-transparent shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                style={!collapsed ? {background:'var(--sc)'} : {}}>
                                {isThisWeek && <span className="text-[8px] opacity-70">이번주</span>}
                                {label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${!collapsed ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{items.length}</span>
                                {incompleteCnt > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-red-100 text-red-500">{incompleteCnt}미완</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-400">
                          <tr>
                            <th className="p-5 font-black text-[10px] uppercase sticky left-0 bg-slate-50 z-30 w-64 border-r text-center">학생 정보</th>
                            <th className="p-5 font-black text-[10px] uppercase border-r w-28 text-center">진척도</th>
                            {subjectGroups.map(({ subject, items }) => (
                              <React.Fragment key={subject}>
                                <th colSpan={items.length}
                                  className="border-b border-l-2 border-l-indigo-200 text-center"
                                  style={{background:'var(--sc-faint)'}}>
                                  <div className="flex items-center justify-center gap-2 py-2 px-3">
                                    <span className="text-[11px] font-black" style={{color:'var(--sc)'}}>{subject}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{items.length}개</span>
                                  </div>
                                </th>
                              </React.Fragment>
                            ))}
                          </tr>
                          {/* 과제 제목 행 */}
                          <tr>
                            <th className="sticky left-0 bg-slate-50 z-30 border-r"/>
                            <th className="border-r"/>
                            {subjectGroups.map(({ subject, items }) =>
                              items.map((as) => (
                                <th key={as.id} className="p-4 min-w-[150px] border-b border-l border-slate-100 relative group text-center">
                                  <div className="flex flex-col relative text-center">
                                    <div className="flex justify-between items-start mb-1 text-left leading-none">
                                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter leading-none">{as.level}</span>
                                      {userRole === 'master' && (
                                        <button onClick={(e) => { e.stopPropagation(); setBulkSelectedDate(new Date().toISOString().split('T')[0]); setBulkSelectedStatus(null); setBulkDatePopup({ item: as, category: activeTab === 'matrix' ? 'assignment' : 'memorization' }); }} className="px-1.5 py-0.5 bg-white border rounded text-[9px] font-black text-slate-600 hover:bg-slate-50 leading-none">일괄</button>
                                      )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 block text-center leading-tight break-words whitespace-normal">{as.title}</span>
                                    {activeTab === 'matrix' && as.deadline && (() => {
                                      const today = new Date().toISOString().split('T')[0];
                                      const diff = Math.ceil((new Date(as.deadline) - new Date(today)) / (1000 * 60 * 60 * 24));
                                      const isOver = diff < 0;
                                      const isToday = diff === 0;
                                      const isClose = diff > 0 && diff <= 3;
                                      if (isOver) {
                                        const overDays = Math.abs(diff);
                                        const incompleteCnt = visibleStudentsFiltered.filter(s => {
                                          const st = submissions[`${s.id}-${as.id}`]?.status || 'not_started';
                                          const isTarget = as.type === 'all' || as.targetStudents?.includes(s.id);
                                          return isTarget && ['not_started','in_progress','incomplete_red'].includes(st);
                                        }).length;
                                        if (incompleteCnt === 0) return null;
                                        return (
                                          <span className="mt-1.5 mx-auto flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black w-fit leading-none bg-red-100 text-red-600 border border-red-200">
                                            <AlertTriangle size={9}/>{overDays}일 초과 · {incompleteCnt}명
                                          </span>
                                        );
                                      }
                                      return (
                                        <span className={`mt-1.5 mx-auto flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black w-fit leading-none ${isToday ? 'bg-orange-100 text-orange-600 border border-orange-200' : isClose ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                          <Calendar size={9}/>{isToday ? '마감!' : `D-${diff}`}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </th>
                              ))
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {visibleStudentsFiltered.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group text-center">
                              <td className="p-5 font-bold text-slate-700 sticky left-0 bg-white z-20 border-r flex flex-col items-start gap-1 justify-center text-left">
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate text-base font-black">{s.name}</span>
                                  {userRole !== 'student' && s.group && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 shrink-0">{s.group}</span>
                                  )}
                                  <button onClick={() => setSelectedStudent(s)}><Search size={14} className="text-slate-300 hover:text-indigo-600 transition-colors" /></button>
                                </div>
                                {(userRole === 'master' || userRole === 'teacher') && (
                                  <div className="flex flex-wrap gap-1 mt-1 leading-none">
                                    {s.homeroomTeacher && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold border border-indigo-100 leading-none"><UserCircle2 size={10} /> {s.homeroomTeacher}</span>}
                                    {s.highSchool && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold border border-slate-100 leading-none"><School size={10} /> {s.highSchool}</span>}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 border-r text-center">
                                {(() => {
                                  const isMatrix = activeTab === 'matrix';
                                  const items = isMatrix ? assignments : memoItems;
                                  const subData = isMatrix ? submissions : memoSubmissions;
                                  const rel = items.filter(a => a.type === 'all' || (a.targetStudents?.includes(s.id)));
                                  if (isMatrix) {
                                    // 과제: 완료+미완료만 분모, 나머지 제외
                                    const done = rel.filter(a => subData[`${s.id}-${a.id}`]?.status === 'completed').length;
                                    const incomplete = rel.filter(a => subData[`${s.id}-${a.id}`]?.status === 'incomplete_red').length;
                                    const effective = done + incomplete; // 완료 + 미완료만
                                    const pct = effective > 0 ? Math.round(done / effective * 100) : 0;
                                    if (effective === 0) return <span className="text-[10px] font-black text-slate-300">집계 중</span>;
                                    return (
                                      <div className="flex flex-col items-center gap-1.5">
                                        <span className={`text-base font-black leading-none ${pct===100?'text-blue-600':pct>=50?'text-indigo-500':'text-slate-500'}`}>{pct}%</span>
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all ${pct===100?'bg-blue-400':pct>=50?'bg-indigo-400':'bg-slate-300'}`} style={{width: pct+'%'}} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 leading-none">{done}/{effective}</span>
                                        {incomplete > 0 && <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg border border-red-100 leading-none">미완료 {incomplete}</span>}
                                      </div>
                                    );
                                  } else {
                                    // 암기: stats.memo 기반 회독 진척도
                                    const memoStat = stats.memo[s.id];
                                    if (!memoStat || memoStat.label === '미부여') return <span className="text-[10px] font-black text-slate-300">미부여</span>;
                                    const pct = parseFloat(memoStat.percent);
                                    return (
                                      <div className="flex flex-col items-center gap-1.5">
                                        <span className={`text-[10px] font-black leading-none ${pct===100?'text-blue-600':'text-purple-500'}`}>{memoStat.label}</span>
                                        <span className={`text-base font-black leading-none ${pct===100?'text-blue-600':pct>=50?'text-indigo-500':'text-slate-500'}`}>{pct}%</span>
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all ${pct===100?'bg-blue-400':pct>=50?'bg-indigo-400':'bg-slate-300'}`} style={{width: pct+'%'}} />
                                        </div>
                                      </div>
                                    );
                                  }
                                })()}
                              </td>
                              {subjectGroups.map(({ subject, items }) =>
                                items.map(as => {
                                      const subKey = `${s.id}-${as.id}`;
                                      const sub = (activeTab === 'matrix' ? submissions : memoSubmissions)[subKey];
                                      const status = sub?.status || 'not_started';
                                      if (!(as.type === 'all' || (as.targetStudents && as.targetStudents.includes(s.id)))) return <td key={as.id} className="p-4 bg-slate-50/30 text-center font-bold text-[9px] text-slate-300 border-l border-slate-50">-</td>;
                                      const cfg = activeTab === 'matrix' ? ASSIGN_STATUS_CONFIG[status] : MEMO_STATUS_CONFIG[status];
                                      const isLate = status === 'completed' && as.deadline && sub.completionDate > as.deadline;
                                      const today = new Date().toISOString().split('T')[0];
                                      const overDiff = as.deadline && today > as.deadline ? Math.ceil((new Date(today) - new Date(as.deadline)) / (1000 * 60 * 60 * 24)) : 0;
                                      const isOverdue = overDiff > 0 && ['not_started', 'in_progress', 'incomplete_red'].includes(status);
                                      return (
                                        <td key={as.id} className="p-3 text-center relative border-l border-slate-50">
                                          <div
                                            onClick={(e) => { if (userRole === 'master') setStatusMenu({ studentId: s.id, itemId: as.id, category: activeTab === 'matrix' ? 'assignment' : 'memorization', x: e.clientX, y: e.clientY }); }}
                                            className={`w-full py-2.5 rounded-xl transition-all flex flex-col items-center justify-center ${activeTab === 'matrix' ? (isLate ? STATUS_COLORS.late_completed : STATUS_COLORS[status]) : `${cfg?.bg} ${cfg?.color}`} ${userRole === 'master' ? 'cursor-pointer hover:brightness-95 shadow-sm' : 'cursor-default'}`}
                                          >
                                            {activeTab === 'matrix' ? (
                                              status === 'completed' ? (isLate ? <History size={16}/> : <CheckCircle2 size={16}/>) : status === 'in_progress' ? <Clock size={16}/> : status === 'incomplete_red' ? <AlertCircle size={16}/> : status === 'exempt' ? <MinusCircle size={16}/> : <Circle size={16}/>
                                            ) : (
                                              <>{cfg?.icon && React.createElement(cfg.icon, { size: 16 })}{status !== 'not_started' && <span className="text-[8px] font-black mt-0.5">{cfg?.label}</span>}</>
                                            )}
                                            {isOverdue && (
                                              <span className="mt-1 text-[8px] font-black text-red-600 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-lg leading-none flex items-center gap-0.5">
                                                <AlertTriangle size={8}/>{overDiff}일 초과
                                              </span>
                                            )}
                                          </div>
                                          {(userRole === 'master' || userRole === 'teacher') && ((status === 'completed' && activeTab === 'matrix') || (status === 'round_4' && activeTab === 'memorization')) && sub.completionDate && (
                                            <div className="mt-1 leading-none">
                                              {userRole === 'master' ? (
                                                inlineDateEditKey === subKey ? (
                                                  <input type="date" value={sub.completionDate || ''} onChange={(e) => updateCompletionDate(s.id, as.id, e.target.value, activeTab === 'matrix' ? 'assignment' : 'memorization')} onBlur={() => setInlineDateEditKey(null)} className="text-[8px] border-none bg-indigo-50 rounded px-1 outline-none font-bold shadow-inner" autoFocus />
                                                ) : (
                                                  <span onClick={(e) => { e.stopPropagation(); setInlineDateEditKey(subKey); }} className="text-[8px] font-bold text-slate-400 hover:text-indigo-600 cursor-pointer">{sub.completionDate?.split('-').slice(1).join('/') || '날짜'}</span>
                                                )
                                              ) : (
                                                <span className="text-[8px] font-bold text-slate-400">{sub.completionDate?.split('-').slice(1).join('/')}</span>
                                              )}
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    );
                  })()}
                </div>
                )}
              </div>
            </div>
          )}

          {/* 종합 성적표 탭 */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {userRole === 'master' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left text-slate-800">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-600 leading-none"><Trophy size={20} /> 신규 시험 등록</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1"><p className="text-[10px] uppercase font-black ml-1">실시 일자</p><input type="date" value={newTest.date} onChange={(e) => setNewTest({ ...newTest, date: e.target.value })} className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:border-orange-500 transition-all text-slate-800 shadow-sm" /></div>
                    <div className="space-y-1"><p className="text-[10px] uppercase font-black ml-1 text-left">시험 명칭</p><BufferedInput value={newTest.title} onSave={(v) => setNewTest({ ...newTest, title: v })} placeholder="제목..." className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none shadow-sm" /></div>
                    <div className="space-y-1 text-left"><p className="text-[10px] uppercase font-black ml-1 text-left">출처</p><BufferedInput value={newTest.source} onSave={(v) => setNewTest({ ...newTest, source: v })} placeholder="출처..." className="w-full px-4 py-3 rounded-2xl font-bold border bg-slate-50 outline-none shadow-sm" /></div>
                    <div className="space-y-1"><p className="text-[10px] uppercase font-black ml-1 text-left">난이도 및 등록</p><div className="flex gap-2"><select value={newTest.difficulty} onChange={(e) => setNewTest({ ...newTest, difficulty: e.target.value })} className="flex-1 px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none shadow-sm">{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select><button onClick={addTest} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all">등록</button></div></div>
                  </div>
                  {/* 테스트 종류 선택 */}
                  <div className="flex gap-2 mb-4">
                    {['중간 테스트', '미니 테스트'].map(type => (
                      <button key={type} onClick={() => setNewTest({ ...newTest, testType: type })}
                        className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${newTest.testType === type ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-orange-300'}`}>
                        {type === '중간 테스트' ? '📝 중간 테스트 (평균 집계)' : '⚡ 미니 테스트 (평균 제외)'}
                      </button>
                    ))}
                  </div>
                  <BufferedTextarea value={newTest.description} onSave={(v) => setNewTest({ ...newTest, description: v })} placeholder="상세 범위 및 설명..." className="w-full h-24 p-4 border rounded-2xl font-medium text-sm outline-none bg-slate-50 focus:bg-white transition-all text-slate-700 shadow-inner" />
                </div>
              )}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b font-bold text-slate-800 flex items-center gap-2 justify-center"><Calculator className="text-orange-500" /> 종합 성적표 분석</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50/50 text-slate-400">
                      <tr>
                        <th className="p-5 font-black text-[10px] sticky left-0 bg-slate-50 z-20 w-40 border-r text-center leading-none">이름</th>
                        {/* 중간 테스트 헤더 */}
                        {tests.filter(t => !t.testType || t.testType === '중간 테스트').map(t => (
                          <th key={t.id} className="p-5 min-w-[200px] border-b text-left">
                            <div className="flex flex-col relative group/th text-left">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-black text-orange-500 uppercase">{t.date}</span>
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none bg-orange-100 text-orange-600">중간</span>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => setSelectedTest(t)} className="p-1 hover:bg-orange-100 rounded text-orange-400 transition-colors"><Search size={14} /></button>
                                  {userRole === 'master' && <button onClick={() => deleteItem('tests', t.id)} className="p-1 hover:bg-red-50 rounded text-red-200 transition-colors"><Trash2 size={14} /></button>}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-700 block w-40 text-left leading-tight break-words whitespace-normal">{t.title}</span>
                              {t.source && <div className="mt-1 flex items-center gap-1 text-indigo-400 bg-white border border-indigo-50 px-1.5 py-0.5 rounded w-fit text-[9px] font-black leading-none shadow-sm"><Bookmark size={10} />{t.source}</div>}
                              <span className="mt-1 text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-1.5 py-0.5 rounded w-fit leading-none">AVG: {stats.testAverages[t.id]}점</span>
                            </div>
                          </th>
                        ))}
                        {/* 중간/미니 구분선 */}
                        {tests.some(t => t.testType === '미니 테스트') && (
                          <th className="w-2 bg-slate-100 border-x border-slate-200 p-0">
                            <div className="h-full flex items-center justify-center">
                              <span className="text-[8px] font-black text-slate-400" style={{writingMode:'vertical-rl'}}>미니 테스트</span>
                            </div>
                          </th>
                        )}
                        {/* 미니 테스트 헤더 */}
                        {tests.filter(t => t.testType === '미니 테스트').map(t => (
                          <th key={t.id} className="p-5 min-w-[180px] border-b text-left bg-slate-50/50">
                            <div className="flex flex-col relative group/th text-left">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">{t.date}</span>
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none bg-slate-200 text-slate-500">미니</span>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => setSelectedTest(t)} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"><Search size={14} /></button>
                                  {userRole === 'master' && <button onClick={() => deleteItem('tests', t.id)} className="p-1 hover:bg-red-50 rounded text-red-200 transition-colors"><Trash2 size={14} /></button>}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-600 block w-40 text-left leading-tight break-words whitespace-normal">{t.title}</span>
                              {t.source && <div className="mt-1 flex items-center gap-1 text-indigo-400 bg-white border border-indigo-50 px-1.5 py-0.5 rounded w-fit text-[9px] font-black leading-none shadow-sm"><Bookmark size={10} />{t.source}</div>}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-center">
                      {visibleStudentsFiltered.map(s => (
                        <tr key={s.id} className="text-center">
                          <td className="p-4 font-bold sticky left-0 bg-white z-10 border-r text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-black text-slate-800">{s.name}</span>
                              <button onClick={() => setSelectedStudent(s)} className="p-1 hover:bg-orange-50 rounded-lg transition-colors">
                                <Search size={13} className="text-slate-300 hover:text-orange-400 transition-colors"/>
                              </button>
                            </div>
                          </td>
                          {/* 중간 테스트 셀들 */}
                          {tests.filter(t => !t.testType || t.testType === '중간 테스트').map(t => {
                            const res = testScores[`${s.id}-${t.id}`] || { score: '', plan: '' };
                            const score = res.score;
                            return (
                              <td key={t.id} className="p-4 text-center">
                                {userRole === 'master' ? (
                                  <div className="flex flex-col gap-2">
                                    <BufferedInput type="number" value={res.score ?? ''} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { score: v === '' ? null : parseFloat(v) }, { merge: true })} className="w-full px-3 py-1.5 rounded-xl bg-slate-50 font-bold text-center text-sm focus:border-orange-500 shadow-sm transition-all" />
                                    <BufferedTextarea value={res.plan} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { plan: v }, { merge: true })} className="w-full px-3 py-2 rounded-xl bg-slate-50 border-none text-[10px] h-12 resize-none font-medium shadow-inner text-center" />
                                  </div>
                                ) : (
                                  <div className="space-y-1 text-center">
                                    <div className="w-full py-1.5 bg-slate-50 rounded-xl font-black text-slate-700 text-sm text-center shadow-sm">{score !== '' && score != null ? `${score}점` : '-'}</div>
                                    {res.plan && <div className="text-[10px] bg-indigo-50/50 p-2 rounded-xl text-indigo-700 font-medium whitespace-pre-wrap text-center leading-tight shadow-inner">{res.plan}</div>}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          {/* 미니 테스트 구분선 + 셀들 */}
                          {tests.some(t => t.testType === '미니 테스트') && (
                            <td className="w-2 bg-slate-100 border-x border-slate-200 p-0"/>
                          )}
                          {tests.filter(t => t.testType === '미니 테스트').map(t => {
                            const res = testScores[`${s.id}-${t.id}`] || { score: '', plan: '' };
                            const score = res.score;
                            return (
                              <td key={t.id} className="p-4 text-center bg-slate-50/30">
                                {userRole === 'master' ? (
                                  <div className="flex flex-col gap-2">
                                    <BufferedInput type="number" value={res.score ?? ''} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { score: v === '' ? null : parseFloat(v) }, { merge: true })} className="w-full px-3 py-1.5 rounded-xl bg-white font-bold text-center text-sm focus:border-slate-400 shadow-sm transition-all" />
                                    <BufferedTextarea value={res.plan} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { plan: v }, { merge: true })} className="w-full px-3 py-2 rounded-xl bg-white border-none text-[10px] h-12 resize-none font-medium shadow-inner text-center" />
                                  </div>
                                ) : (
                                  <div className="space-y-1 text-center">
                                    <div className="w-full py-1.5 bg-white rounded-xl font-black text-slate-700 text-sm text-center shadow-sm">{score !== '' && score != null ? `${score}점` : '-'}</div>
                                    {res.plan && <div className="text-[10px] bg-indigo-50/50 p-2 rounded-xl text-indigo-700 font-medium whitespace-pre-wrap text-center leading-tight shadow-inner">{res.plan}</div>}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 출결 관리 탭 */}
          {activeTab === 'attendance' && userRole !== 'student' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm text-slate-800">
                <div className="flex items-center gap-2 text-emerald-600"><Calendar size={20} /> 출결 및 보충 현황 관리</div>
                <div className="flex items-center gap-3 w-full md:w-auto leading-none">
                  <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="flex-1 md:flex-none px-6 py-3 rounded-2xl border font-bold outline-none shadow-sm focus:border-indigo-500 transition-all text-slate-700" />
                </div>
              </div>
              {/* 진도 달력 미니 뷰 */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><TrendingUp size={11} className="text-teal-500"/> 진도 수업 달력</p>
                <ProgressMiniCalendar
                  progressPlans={progressPlans}
                  progressCalMonth={progressCalMonth}
                  setProgressCalMonth={setProgressCalMonth}
                  kstToday={new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0]}
                  attendance={attendance}
                  students={students}
                  makeupDates={makeupDates}
                  onDateSelect={(date) => setCurrentDate(date)}
                />
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-left shadow-sm">
                {/* 컬럼 헤더 + 일괄 출석 */}
                <div className="px-5 py-3 flex items-center gap-4 bg-slate-50 border-b border-slate-100">
                  <div className="hidden md:flex items-center gap-6 flex-1">
                    <div className="min-w-[120px]">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">학생명</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">메모 입력</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:block">출결 현황</span>
                    {userRole === 'master' && (
                      <button onClick={handleBulkAttendanceToggle} className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-xs shadow-md hover:bg-emerald-600 transition active:scale-95 whitespace-nowrap leading-none">
                        <CheckCircle size={14}/> 일괄 출석
                      </button>
                    )}
                  </div>
                </div>
                {students.map(s => {
                  const att = attendance[`${s.id}-${currentDate}`] || { status: 'none', makeup: false };
                  const note = attendanceNotes[`${s.id}-${currentDate}`] || '';
                  const mDateValue = makeupDates[`${s.id}-${currentDate}`] || '';
                  return (
                    <div key={s.id} className="px-4 py-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
                      {/* 1행: 학생명 + 출결 버튼 */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-black text-base text-slate-700 leading-none flex-1 min-w-0 truncate">{s.name}</div>
                        <div className="flex gap-1.5 shrink-0">
                          {[{ id: 'present', l: '출석', c: 'emerald' }, { id: 'late', l: '지각', c: 'amber' }, { id: 'absent', l: '결석', c: 'red' }].map(opt => (
                            <button key={opt.id} onClick={() => updateAttendance(s.id, opt.id)} disabled={userRole !== 'master'}
                              className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all shadow-sm leading-none ${att.status === opt.id ? `bg-${opt.c}-500 border-${opt.c}-500 text-white shadow-lg` : 'bg-white border-slate-100 text-slate-400'} ${userRole === 'master' ? 'active:scale-95' : 'cursor-default'}`}>
                              {opt.l}
                            </button>
                          ))}
                          <button onClick={() => updateAttendance(s.id, 'makeup')} disabled={userRole !== 'master'}
                            className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all shadow-sm leading-none ${att.makeup ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-100' : 'bg-white border-slate-100 text-slate-400'} ${userRole === 'master' ? 'active:scale-95' : 'cursor-default'}`}>
                            보충
                          </button>
                        </div>
                      </div>
                      {/* 2행: 메모 */}
                      <div className="flex flex-col gap-1.5">
                        {userRole === 'master' ? (
                          <div className="relative w-full text-slate-700">
                            <StickyNote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
                            <BufferedInput value={note} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendanceNotes', `${s.id}-${currentDate}`), { note: v })} placeholder="메모 입력..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-slate-300 transition-all text-left" />
                          </div>
                        ) : (
                          note ? <div className="px-3 py-2 bg-slate-50 rounded-xl text-slate-600 font-medium text-sm italic leading-snug">{note}</div> : null
                        )}
                        {att.makeup && (
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 w-fit">
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">보충일</span>
                            {userRole === 'master' ? (
                              <input type="date" value={mDateValue} onChange={(e) => updateMakeupDateValue(s.id, currentDate, e.target.value)} className="text-xs bg-white border-none rounded px-2 py-0.5 outline-none font-bold text-purple-700 select-text" />
                            ) : (
                              <span className="text-xs font-bold text-purple-700">{mDateValue || '-'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 출결 관리 탭 - student 전용 */}
          {activeTab === 'attendance' && userRole === 'student' && (() => {
            const s = students.find(st => st.id === myStudentId);
            if (!s) return null;

            // 진도 수업이 있는 날짜 목록
            const lessonDates = new Set(progressPlans.map(p => p.date));

            // 진도 수업 날짜에만 출결 표시
            const allDates = Object.keys(attendance)
              .filter(k => k.startsWith(`${s.id}-`))
              .map(k => k.replace(`${s.id}-`, ''))
              .filter(date => lessonDates.has(date))
              .sort((a, b) => b.localeCompare(a));
            const STATUS_LABEL = {
              present: { l: '출석', c: 'emerald' },
              late:    { l: '지각', c: 'amber' },
              absent:  { l: '결석', c: 'red' },
              none:    { l: '-',    c: 'slate' }
            };
            return (
              <div className="space-y-6 text-left max-w-lg mx-auto">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600"><Calendar size={22} /></div>
                  <div>
                    <p className="font-black text-slate-800 text-base leading-none">{s.name}의 출결 기록</p>
                    <p className="text-xs text-slate-400 font-medium mt-1.5 leading-none">총 {allDates.length}건</p>
                  </div>
                </div>
                {allDates.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-bold shadow-sm">출결 기록이 없습니다.</div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                    {allDates.map(date => {
                      const att = attendance[`${s.id}-${date}`] || { status: 'none', makeup: false };
                      const note = attendanceNotes[`${s.id}-${date}`] || '';
                      const mDateValue = makeupDates[`${s.id}-${date}`] || '';
                      const cfg = STATUS_LABEL[att.status] || STATUS_LABEL.none;
                      return (
                        <div key={date} className="p-5 flex items-center gap-4">
                          <span className="font-black text-slate-700 text-sm w-28 shrink-0">{date}</span>
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black bg-${cfg.c}-50 text-${cfg.c}-600 border border-${cfg.c}-100 leading-none`}>{cfg.l}</span>
                          {att.makeup && (
                            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 leading-none">
                              <span className="text-[10px] font-black text-purple-600 leading-none">보충</span>
                              {mDateValue && <span className="text-xs font-bold text-purple-700 leading-none">{mDateValue}</span>}
                            </div>
                          )}
                          {note && <span className="flex-1 text-xs text-slate-400 font-medium italic text-right truncate">{note}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 진도 관리 탭 - student 전용 */}
          {activeTab === 'progress' && userRole === 'student' && (() => {
            const jinDoPlans = progressPlans.filter(p => !p.lessonType || p.lessonType === '진도');
            const totalPlans = jinDoPlans.length;
            const donePlans = jinDoPlans.filter(p => p.done).length;
            const overallPct = totalPlans > 0 ? Math.round((donePlans / totalPlans) * 100) : 0;
            const subjectStats = subjects.reduce((acc, sub) => {
              const all = jinDoPlans.filter(p => p.subject === sub);
              const done = all.filter(p => p.done).length;
              if (all.length > 0) acc[sub] = { total: all.length, done };
              return acc;
            }, {});
            const plansByDate = progressPlans.reduce((acc, p) => {
              if (!acc[p.date]) acc[p.date] = [];
              acc[p.date].push(p);
              return acc;
            }, {});
            const sortedDates = Object.keys(plansByDate).sort((a,b) => b.localeCompare(a));
            return (
              <div className="max-w-2xl mx-auto space-y-6 text-left">
                {/* 진도율 요약 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 leading-none"><TrendingUp size={18} className="text-teal-600" /> 전체 진도율</h3>
                    <span className="text-2xl font-black text-teal-600 leading-none">{overallPct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: overallPct + '%' }} />
                  </div>
                  {Object.keys(subjectStats).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(subjectStats).map(([sub, st]) => {
                        const pct = Math.round((st.done / st.total) * 100);
                        return (
                          <div key={sub} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-black text-slate-600">{sub}</span>
                              <span className="text-[11px] font-black text-teal-600">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: pct + '%' }} />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{st.done}/{st.total} 완료</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* 날짜별 리스트 (읽기 전용) */}
                {sortedDates.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-bold shadow-sm">등록된 진도 계획이 없습니다.</div>
                ) : sortedDates.map(date => (
                  <div key={date} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
                      <Calendar size={14} className="text-teal-500" />
                      <span className="text-sm font-black text-teal-700">{date}</span>
                      <span className="ml-auto text-[10px] font-black text-teal-400">
                        {plansByDate[date].filter(p=>p.done).length}/{plansByDate[date].length} 완료
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {plansByDate[date].map(plan => (
                        <div key={plan.id} className="px-6 py-3 flex items-center gap-3">
                          <div className={`shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center ${plan.done ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'}`}>
                            {plan.done && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black border shrink-0 leading-none ${plan.done ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>{plan.subject}</span>
                          <div className="flex-1 min-w-0">
                            <span className={`font-black text-sm leading-none ${plan.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{plan.unit}</span>
                            {plan.memo && <p className="text-xs text-slate-400 font-medium italic mt-0.5 leading-none">{plan.memo}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 학생 관리 탭 */}
          {activeTab === 'students' && userRole !== 'student' && (
            <div className="max-w-4xl mx-auto space-y-6 text-left">
              {userRole === 'master' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left text-slate-800">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600 tracking-tight leading-none"><UserPlus size={22} /> 학생 일괄 등록</h2>
                  <BufferedTextarea value={bulkStudentInput} onSave={setBulkStudentInput} placeholder="이름을 입력하세요..." className="w-full h-32 px-4 py-4 rounded-2xl border bg-slate-50 font-bold resize-none mb-4 outline-none transition-all focus:bg-white text-slate-800 shadow-inner" />
                  <button onClick={() => {
                    if (!bulkStudentInput.trim()) return;
                    const names = bulkStudentInput.split(/[,\n]/).map(n => n.trim()).filter(Boolean);
                    const batch = writeBatch(db);
                    names.forEach(name => {
                      // [FIX 6] ID 충돌 가능성 개선: crypto.randomUUID() 사용
                      const id = 's' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now() + Math.random().toString(36).substr(2, 9));
                      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'students', id), { name, studentCode: '', homeroomTeacher: '', highSchool: '' });
                    });
                    batch.commit().then(() => setBulkStudentInput(''));
                  }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all leading-none">등록하기</button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group transition-all text-left leading-none">
                    {editStudentId === s.id ? (
                      <div className="space-y-4 animate-in slide-in-from-top-2 text-left leading-none">
                        <div className="grid grid-cols-2 gap-3 text-left leading-none">
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">이름</label><input value={editStudentData.name} onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">코드</label><input value={editStudentData.studentCode} onChange={(e) => setEditStudentData({ ...editStudentData, studentCode: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">담임</label><input value={editStudentData.homeroomTeacher} onChange={(e) => setEditStudentData({ ...editStudentData, homeroomTeacher: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                          <div className="space-y-1 text-left leading-none"><label className="text-[10px] text-slate-400 font-black leading-none">고교</label><input value={editStudentData.highSchool} onChange={(e) => setEditStudentData({ ...editStudentData, highSchool: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 text-slate-800 outline-none shadow-sm focus:border-indigo-500 leading-none" /></div>
                        </div>
                        {/* 그룹 선택 - master/teacher 전용, 절대 student에게 노출 금지 */}
                        <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                          <label className="text-[10px] font-black text-amber-700 flex items-center gap-1"><ShieldCheck size={11}/> 내부 수준 그룹 (학생·학부모 비공개)</label>
                          <div className="flex gap-2">
                            {['A', 'B', 'C', 'D', 'E', '미분류'].map(g => (
                              <button key={g} onClick={() => setEditStudentData({ ...editStudentData, group: g === '미분류' ? '' : g })}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${(editStudentData.group || '') === (g === '미분류' ? '' : g) ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'border-amber-200 text-amber-600 bg-white hover:border-amber-400'}`}>
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* 전점수/등급 - 절대 student 노출 금지 */}
                        {userRole !== 'student' && (() => {
                          const sd = studentScoreData[s.id] || {};
                          return (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                              <p className="text-[9px] font-black text-blue-700 flex items-center gap-1"><ShieldCheck size={10}/> 전점수 · 등급 (학생·학부모 비공개)</p>
                              <div className="grid grid-cols-2 gap-2">
                                {/* 전점수 */}
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-blue-500">전점수</p>
                                  <BufferedInput
                                    type="number"
                                    value={sd.prevScore ?? ''}
                                    onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'studentScores', s.id), { prevScore: v === '' ? null : parseFloat(v) }, { merge: true })}
                                    placeholder="점수 입력..."
                                    className="w-full px-2 py-1.5 rounded-xl border border-blue-200 bg-white font-bold text-sm outline-none focus:border-blue-400 text-slate-800 shadow-sm"
                                  />
                                </div>
                                {/* 교육과정 선택 */}
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-blue-500">교육과정</p>
                                  <div className="flex gap-1">
                                    {['15개정', '22개정'].map(cur => (
                                      <button key={cur} onClick={() => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'studentScores', s.id), { curriculum: (sd.curriculum || '') === cur ? '' : cur, grade: '' }, { merge: true })}
                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black border transition-all ${(sd.curriculum || '') === cur ? 'bg-blue-500 border-blue-500 text-white' : 'border-blue-200 text-blue-400 bg-white hover:border-blue-400'}`}>
                                        {cur}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {/* 등급 */}
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-blue-500">등급</p>
                                {sd.curriculum ? (
                                  <div className="flex flex-wrap gap-1">
                                    {(sd.curriculum === '22개정'
                                      ? ['1등급','2등급','3등급','4등급','5등급']
                                      : ['1등급','2등급','3등급','4등급','5등급','6등급','7등급','8등급','9등급']
                                    ).map(g => (
                                      <button key={g} onClick={() => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'studentScores', s.id), { grade: sd.grade === g ? '' : g }, { merge: true })}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all ${sd.grade === g ? 'bg-blue-500 border-blue-500 text-white shadow-sm' : 'border-blue-200 text-blue-400 bg-white hover:border-blue-400'}`}>
                                        {g}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-blue-300 font-bold italic">교육과정 먼저 선택하세요</p>
                                )}
                              </div>
                              {/* 성적 메모 */}
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-blue-500">성적 메모</p>
                                <BufferedTextarea
                                  value={sd.scoreMemo || ''}
                                  onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'studentScores', s.id), { scoreMemo: v }, { merge: true })}
                                  placeholder="성적 관련 메모..."
                                  className="w-full px-2 py-1.5 rounded-xl border border-blue-200 bg-white font-medium text-xs outline-none focus:border-blue-400 text-slate-700 resize-none h-14 shadow-sm"
                                />
                              </div>
                            </div>
                          );
                        })()}
                        <div className="flex gap-2 pt-2 leading-none"><button onClick={saveStudentDetails} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-black text-xs shadow-md transition-all hover:bg-green-700 leading-none">저장</button><button onClick={() => setEditStudentId(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs transition-all leading-none">취소</button></div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start text-left text-slate-700 font-bold">
                        <div className="space-y-3 flex-1 text-left leading-none">
                          <div className="flex items-center gap-2 text-left leading-none">
                            <span className="font-bold text-xl text-slate-800 leading-none">#{s.studentCode || '000'} {s.name}</span>
                            {/* 그룹 뱃지 - 절대 student 노출 금지 */}
                            {userRole !== 'student' && s.group && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">그룹 {s.group}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-500 text-left font-bold leading-none">
                            <div className="flex items-center gap-1.5 text-left leading-none"><UserCog size={14} /><span className="text-xs leading-none">{s.homeroomTeacher || "-"}</span></div>
                            <div className="flex items-center gap-1.5 text-left leading-none"><GraduationCap size={14} /><span className="text-xs leading-none">{s.highSchool || "-"}</span></div>
                          </div>
                          {/* 전점수/등급 표시 (편집 아닐 때) - 절대 student 노출 금지 */}
                          {userRole !== 'student' && (() => {
                            const sd = studentScoreData[s.id] || {};
                            if (!sd.prevScore && !sd.grade) return null;
                            return (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {sd.prevScore != null && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">{sd.prevScore}점</span>}
                                {sd.grade && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">{sd.grade}</span>}
                                {sd.curriculum && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">{sd.curriculum}</span>}
                              </div>
                            );
                          })()}
                        </div>
                        {userRole === 'master' && (
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 leading-none">
                            <button onClick={() => { setEditStudentId(s.id); setEditStudentData({ name: s.name, studentCode: s.studentCode || '', homeroomTeacher: s.homeroomTeacher || '', highSchool: s.highSchool || '', group: s.group || '' }); }} className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm leading-none"><Edit2 size={18} /></button>
                            <button onClick={() => deleteItem('students', s.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm leading-none"><Trash2 size={18} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 진도 관리 탭 */}
          {/* 진도 관리 탭 */}
          {activeTab === 'progress' && userRole !== 'student' && (() => {  /* master/teacher */
            const kstToday = new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
            const [calYear, calMonthIdx] = progressCalMonth.split('-').map(Number);
            const firstDay = new Date(calYear, calMonthIdx - 1, 1).getDay();
            const daysInMonth = new Date(calYear, calMonthIdx, 0).getDate();

            const plansByDate = progressPlans.reduce((acc, p) => {
              if (!acc[p.date]) acc[p.date] = [];
              acc[p.date].push(p);
              return acc;
            }, {});

            const jinDoPlans = progressPlans.filter(p => !p.lessonType || p.lessonType === '진도');
            const totalPlans = jinDoPlans.length;
            const donePlans = jinDoPlans.filter(p => p.done).length;
            const overallPct = totalPlans > 0 ? Math.round((donePlans / totalPlans) * 100) : 0;

            const subjectStats = subjects.reduce((acc, sub) => {
              const all = jinDoPlans.filter(p => p.subject === sub);
              const done = all.filter(p => p.done).length;
              if (all.length > 0) acc[sub] = { total: all.length, done };
              return acc;
            }, {});

            const prevMonth = () => {
              let y = calYear, m = calMonthIdx - 1;
              if (m < 1) { m = 12; y -= 1; }
              setProgressCalMonth(`${y}-${String(m).padStart(2, '0')}`);
            };
            const nextMonth = () => {
              let y = calYear, m = calMonthIdx + 1;
              if (m > 12) { m = 1; y += 1; }
              setProgressCalMonth(`${y}-${String(m).padStart(2, '0')}`);
            };

            const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

            return (
              <div className="max-w-4xl mx-auto space-y-6 text-left">

                {/* 진도율 요약 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 leading-none"><TrendingUp size={18} className="text-teal-600" /> 전체 진도율</h3>
                    <span className="text-2xl font-black text-teal-600 leading-none">{overallPct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: overallPct + '%' }} />
                  </div>
                  {Object.keys(subjectStats).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(subjectStats).map(([sub, st]) => {
                        const pct = Math.round((st.done / st.total) * 100);
                        return (
                          <div key={sub} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-black text-slate-600">{sub}</span>
                              <span className="text-[11px] font-black text-teal-600">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: pct + '%' }} />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{st.done}/{st.total} 완료</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 달력 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <button onClick={prevMonth} className="flex items-center gap-1 px-3 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 font-black text-sm">&#8249; 이전</button>
                    <span className="font-black text-slate-800 text-base">{calYear}년 {calMonthIdx}월</span>
                    <button onClick={nextMonth} className="flex items-center gap-1 px-3 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 font-black text-sm">다음 &#8250;</button>
                  </div>
                  <div className="grid grid-cols-7 border-b border-slate-100">
                    {dayLabels.map((d, i) => (
                      <div key={d} className={`py-2 text-center text-[11px] font-black ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }).map((_, i) => {
                      const prevMonthDays = new Date(calYear, calMonthIdx - 1, 0).getDate();
                      const day = prevMonthDays - firstDay + i + 1;
                      let prevY = calYear, prevM = calMonthIdx - 1;
                      if (prevM < 1) { prevM = 12; prevY -= 1; }
                      const dateStr = `${prevY}-${String(prevM).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayPlans = plansByDate[dateStr] || [];
                      return (
                        <div key={'prev'+i} onClick={() => { setProgressCalMonth(`${prevY}-${String(prevM).padStart(2,'0')}`); setProgressSelectedDate(dateStr); }}
                          className="border-b border-r border-slate-50 min-h-[64px] p-1.5 cursor-pointer hover:bg-slate-50 transition-all bg-slate-50/30">
                          <div className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full mb-1 ${i === 0 ? 'text-red-200' : 'text-slate-300'}`}>{day}</div>
                          {dayPlans.length > 0 && (
                            <div className="space-y-0.5">
                              {dayPlans.slice(0, 2).map(p => (
                                <div key={p.id} className={`text-[9px] font-black px-1 py-0.5 rounded leading-none truncate opacity-40 ${p.done ? 'bg-teal-100 text-teal-700 line-through' : 'bg-indigo-50 text-indigo-600'}`}>{p.subject} {p.unit}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${calYear}-${String(calMonthIdx).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayPlans = plansByDate[dateStr] || [];
                      const isSelected = progressSelectedDate === dateStr;
                      const isToday = kstToday === dateStr;
                      const colIdx = (firstDay + i) % 7;
                      return (
                        <div
                          key={dateStr}
                          onClick={() => setProgressSelectedDate(dateStr)}
                          className={`border-b border-r border-slate-50 min-h-[64px] p-1.5 cursor-pointer transition-all hover:bg-teal-50/50 ${isSelected ? 'bg-teal-50 border-teal-200' : ''}`}
                        >
                          <div className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-teal-600 text-white' : isSelected ? 'text-teal-600' : colIdx === 0 ? 'text-red-400' : colIdx === 6 ? 'text-blue-400' : 'text-slate-600'}`}>{day}</div>
                          {dayPlans.length > 0 && (
                            <div className="space-y-0.5">
                              {dayPlans.slice(0, 2).map(p => {
                                const lt = LESSON_TYPES.find(l => l.id === p.lessonType) || LESSON_TYPES[0];
                                return (
                                  <div key={p.id} className="relative group/tip">
                                    <div className={`text-[9px] font-black px-1 py-0.5 rounded leading-none truncate ${p.done ? 'opacity-50 line-through ' + lt.calChip : lt.calChip}`}>{p.subject} {p.unit}</div>
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/tip:block z-50 pointer-events-none" style={{left:'50%',transform:'translateX(-50%) translateX(0)',maxWidth:'220px',whiteSpace:'normal'}}>
                                      <div className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-2xl leading-snug break-keep" style={{width:'max-content',maxWidth:'220px'}}>
                                        [{p.lessonType || '진도'}] {p.subject} {p.unit}
                                      </div>
                                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 mx-auto" />
                                    </div>
                                  </div>
                                );
                              })}
                              {dayPlans.length > 2 && (
                                <div className="relative group/tip">
                                  <div className="text-[9px] text-slate-400 font-bold px-1">+{dayPlans.length - 2}</div>
                                  <div className="absolute left-1/2 bottom-full mb-1 hidden group-hover/tip:block z-50 pointer-events-none" style={{transform:'translateX(-50%)',maxWidth:'220px'}}>
                                    <div className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-2xl leading-snug space-y-1 break-keep" style={{width:'max-content',maxWidth:'220px'}}>
                                      {dayPlans.slice(2).map(p => (
                                        <div key={p.id} className={p.done ? 'line-through opacity-60' : ''}>{p.subject} {p.unit}</div>
                                      ))}
                                    </div>
                                    <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 mx-auto" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {Array.from({ length: (7 - (firstDay + daysInMonth) % 7) % 7 }).map((_, i) => {
                      const day = i + 1;
                      let nextY = calYear, nextM = calMonthIdx + 1;
                      if (nextM > 12) { nextM = 1; nextY += 1; }
                      const dateStr = `${nextY}-${String(nextM).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayPlans = plansByDate[dateStr] || [];
                      return (
                        <div key={'next'+i} onClick={() => { setProgressCalMonth(`${nextY}-${String(nextM).padStart(2,'0')}`); setProgressSelectedDate(dateStr); }}
                          className="border-b border-r border-slate-50 min-h-[64px] p-1.5 cursor-pointer hover:bg-slate-50 transition-all bg-slate-50/30">
                          <div className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full mb-1 ${(firstDay + daysInMonth + i) % 7 === 6 ? 'text-blue-200' : 'text-slate-300'}`}>{day}</div>
                          {dayPlans.length > 0 && (
                            <div className="space-y-0.5">
                              {dayPlans.slice(0, 2).map(p => (
                                <div key={p.id} className={`text-[9px] font-black px-1 py-0.5 rounded leading-none truncate opacity-40 ${p.done ? 'bg-teal-100 text-teal-700 line-through' : 'bg-indigo-50 text-indigo-600'}`}>{p.subject} {p.unit}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 선택된 날짜 패널 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-teal-500" />
                      <span className="font-black text-slate-800">{progressSelectedDate}</span>
                      {(plansByDate[progressSelectedDate] || []).length > 0 && (
                        <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 leading-none">
                          {(plansByDate[progressSelectedDate] || []).filter(p=>p.done).length}/{(plansByDate[progressSelectedDate] || []).length} 완료
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 계획 등록 폼 (master only) */}
                  {userRole === 'master' && (
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">새 계획 추가</p>
                      {/* 수업 종류 선택 */}
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">수업 종류</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {LESSON_TYPES.map(lt => (
                          <button key={lt.id} onClick={() => setNewPlan({ ...newPlan, lessonType: lt.id })}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${newPlan.lessonType === lt.id ? lt.light + ' border-current shadow-sm' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}>{lt.id}</button>
                        ))}
                      </div>
                      {/* 과목 선택 */}
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">과목</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {subjects.map(sub => (
                          <button key={sub} onClick={() => setNewPlan({ ...newPlan, subject: sub })}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${newPlan.subject === sub ? 'bg-teal-600 border-teal-600 text-white shadow-sm' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}>{sub}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <BufferedInput value={newPlan.unit} onSave={(v) => setNewPlan({ ...newPlan, unit: v })}
                          placeholder="단원 / 내용 입력..." className="flex-1 px-4 py-2.5 rounded-2xl border bg-white font-bold text-sm outline-none focus:border-teal-400 transition-all text-slate-800 shadow-sm" />
                        <BufferedInput value={newPlan.memo} onSave={(v) => setNewPlan({ ...newPlan, memo: v })}
                          placeholder="메모 (선택)" className="flex-1 px-4 py-2.5 rounded-2xl border bg-white font-medium text-sm outline-none focus:border-teal-400 transition-all text-slate-700 shadow-sm" />
                        <button onClick={addPlan} className="px-5 py-2.5 bg-teal-600 text-white rounded-2xl font-black text-sm shadow-md hover:bg-teal-700 transition-all active:scale-95 whitespace-nowrap leading-none">추가</button>
                      </div>
                    </div>
                  )}

                  {/* 해당 날짜 계획 리스트 */}
                  <div className="divide-y divide-slate-100">
                    {(plansByDate[progressSelectedDate] || []).length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold text-sm">이 날의 수업 계획이 없습니다.</div>
                    ) : (
                      (plansByDate[progressSelectedDate] || []).map(plan => (
                        <div key={plan.id} className="px-6 py-4 group hover:bg-slate-50 transition-all">
                          {editPlanId === plan.id ? (
                            <div className="space-y-3 animate-in slide-in-from-top-2">
                              {/* 수업 종류 */}
                              <div className="flex flex-wrap gap-1.5">
                                {LESSON_TYPES.map(lt => (
                                  <button key={lt.id} onClick={() => setEditPlanData({ ...editPlanData, lessonType: lt.id })}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${(editPlanData.lessonType || '진도') === lt.id ? lt.light + ' border-current shadow-sm' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}>{lt.id}</button>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {subjects.map(sub => (
                                  <button key={sub} onClick={() => setEditPlanData({ ...editPlanData, subject: sub })}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${editPlanData.subject === sub ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'}`}>{sub}</button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <BufferedInput value={editPlanData.unit} onSave={(v) => setEditPlanData({ ...editPlanData, unit: v })}
                                  placeholder="단원 / 내용" className="flex-1 px-3 py-2 border rounded-xl font-bold text-sm bg-slate-50 outline-none focus:border-teal-400 text-slate-800 shadow-sm" />
                                <BufferedInput value={editPlanData.memo} onSave={(v) => setEditPlanData({ ...editPlanData, memo: v })}
                                  placeholder="메모" className="flex-1 px-3 py-2 border rounded-xl font-medium text-sm bg-slate-50 outline-none focus:border-teal-400 text-slate-700 shadow-sm" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={saveEditPlan} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-green-700 transition-all"><Save size={13} /> 저장</button>
                                <button onClick={() => { setEditPlanId(null); setEditPlanData(null); }} className="px-5 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">취소</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {/* 체크박스 */}
                              <button onClick={() => togglePlanDone(plan)}
                                disabled={userRole !== 'master'}
                                className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${plan.done ? 'bg-teal-500 border-teal-500' : 'border-slate-300 hover:border-teal-400 bg-white'} ${userRole !== 'master' ? 'cursor-default' : 'cursor-pointer'}`}>
                                {plan.done && <CheckCircle2 size={14} className="text-white" />}
                              </button>
                              {/* 수업 종류 뱃지 */}
                              {(() => { const lt = LESSON_TYPES.find(l => l.id === (plan.lessonType || '진도')) || LESSON_TYPES[0]; return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border shrink-0 leading-none ${plan.done ? 'bg-slate-50 text-slate-400 border-slate-100' : lt.light}`}>{plan.lessonType || '진도'}</span>; })()}
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black border shrink-0 leading-none ${plan.done ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>{plan.subject}</span>
                              <div className="flex-1 min-w-0">
                                <span className={`font-black text-sm leading-none ${plan.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{plan.unit}</span>
                                {plan.memo && <p className="text-xs text-slate-400 font-medium italic mt-0.5 leading-none">{plan.memo}</p>}
                              </div>
                              {userRole === 'master' && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                  <button onClick={() => { setEditPlanId(plan.id); setEditPlanData({ ...plan, lessonType: plan.lessonType || '진도' }); }} className="p-1.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"><Edit2 size={13} /></button>
                                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"><Trash2 size={13} /></button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            );
          })()}

          
                    {/* 항목 등록 탭 */}
          {/* 리포트 탭 */}
          {activeTab === 'report' && (userRole === 'master' || userRole === 'teacher') && (
            <div className="max-w-4xl mx-auto space-y-6 text-left">

              {/* 날짜 범위 + 생성 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 leading-none" style={{color:'var(--sc)'}}>
                  <Printer size={20} /> 학습 종합 리포트 생성
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {/* 시작 날짜 - 밝은 파란색 */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">시작 날짜</p>
                    <input type="date" value={reportRange.from}
                      onChange={e => setReportRange(r => ({...r, from: e.target.value, to: r.to < e.target.value ? '' : r.to}))}
                      className="w-full px-4 py-3 rounded-2xl border-2 font-bold outline-none transition-all text-blue-700 shadow-sm bg-blue-50 border-blue-200 focus:border-blue-400" />
                  </div>
                  {/* 종료 날짜 - 어두운 파란색 */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">종료 날짜 <span className="text-slate-300 font-bold normal-case">(미선택 시 시작 날짜 하루만)</span></p>
                    <input type="date" value={reportRange.to}
                      min={reportRange.from}
                      onChange={e => setReportRange(r => ({...r, to: e.target.value}))}
                      className="w-full px-4 py-3 rounded-2xl border-2 font-bold outline-none transition-all shadow-sm bg-blue-900/5 border-blue-700/30 text-blue-900 focus:border-blue-700" />
                  </div>
                </div>
                {/* 선택된 기간 표시 */}
                <div className="flex items-center gap-2 mb-5 px-1">
                  {reportRange.from ? (
                    <div className="flex items-center gap-2 text-[11px] font-black">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-lg">{reportRange.from}</span>
                      {reportRange.to && reportRange.to !== reportRange.from ? (
                        <>
                          <span className="text-slate-300">→</span>
                          <span className="px-2.5 py-1 bg-blue-900/10 text-blue-900 rounded-lg">{reportRange.to}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-medium">하루 데이터</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-300 font-medium">날짜 미선택 시 전체 기간</span>
                  )}
                </div>
                <button onClick={generateReport}
                  className="w-full py-4 text-white rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 leading-none flex items-center justify-center gap-2"
                  style={{background:'var(--sc)'}}>
                  <Printer size={18} /> 리포트 생성
                </button>
              </div>

              {/* 진도 달력 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><TrendingUp size={11} className="text-teal-500"/> 진도 수업 달력</p>
                  <span className="text-[9px] font-bold text-slate-300">첫 클릭 → 시작  /  두 번째 클릭 → 종료  /  선택 날짜 재클릭 → 해제</span>
                </div>
                <ProgressMiniCalendar
                  progressPlans={progressPlans}
                  progressCalMonth={progressCalMonth}
                  setProgressCalMonth={setProgressCalMonth}
                  kstToday={new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0]}
                  attendance={attendance}
                  students={students}
                  makeupDates={makeupDates}
                  highlightFrom={reportRange.from}
                  highlightTo={reportRange.to}
                  onDateSelect={(date) => {
                    setReportRange(prev => {
                      // 아무것도 없으면 → 시작 날짜 설정
                      if (!prev.from) return { from: date, to: '' };

                      // 시작만 있을 때
                      if (prev.from && !prev.to) {
                        if (date === prev.from) return { from: '', to: '' }; // 같은 날 → 해제
                        if (date < prev.from) return { from: date, to: prev.from }; // 앞 날짜 → 교체
                        return { from: prev.from, to: date }; // 이후 날짜 → 종료 설정
                      }

                      // 둘 다 있을 때
                      if (date === prev.from) return { from: '', to: '' }; // 시작 클릭 → 전체 해제
                      if (date === prev.to) return { from: prev.from, to: '' }; // 종료 클릭 → 종료만 해제
                      return { from: date, to: '' }; // 다른 날짜 → 시작 새로 설정
                    });
                  }}
                />
              </div>

              {/* 생성된 리포트 */}
              {reportGenerated && (() => {
                const { from, to } = reportRange;
                const fromDate = from || '0000-00-00';
                const toDate = to && to >= from ? to : from ? from : '9999-99-99';
                const inRange = (date) => !date || (date >= fromDate && date <= toDate);
                const rangedAssign = assignments.filter(a => inRange(a.deadline));
                const rangedTests = tests.filter(t => inRange(t.date));
                const rangedPlans = progressPlans.filter(p => inRange(p.date));
                const jinDoPlans = rangedPlans.filter(p => !p.lessonType || p.lessonType === '진도');
                const now = new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];

                // 학생별 요약 데이터
                const studentSummary = students.map(s => {
                  const relAssign = rangedAssign.filter(a => a.type === 'all' || (a.targetStudents?.includes(s.id)));
                  const exemptA = relAssign.filter(a => submissions[`${s.id}-${a.id}`]?.status === 'exempt').length;
                  const effectiveA = relAssign.length - exemptA;
                  const doneA = relAssign.filter(a => submissions[`${s.id}-${a.id}`]?.status === 'completed').length;
                  const assignPct = effectiveA > 0 ? Math.round(doneA / effectiveA * 100) : null;

                  const relMemo = memoItems.filter(m => m.type === 'all' || (m.targetStudents?.includes(s.id)));
                  const topMemo = relMemo.reduce((best, m) => {
                    const st = memoSubmissions[`${s.id}-${m.id}`]?.status || 'not_started';
                    const idx = MEMO_STATUS_ORDER.indexOf(st);
                    return idx > best ? idx : best;
                  }, 0);

                  const attKeys = Object.keys(attendance).filter(k => {
                    const d = k.split('-').slice(1).join('-');
                    return k.startsWith(`${s.id}-`) && inRange(d);
                  });
                  const present = attKeys.filter(k => attendance[k]?.status === 'present').length;
                  const absent = attKeys.filter(k => attendance[k]?.status === 'absent').length;
                  const late = attKeys.filter(k => attendance[k]?.status === 'late').length;

                  const testScoreList = rangedTests.map(t => testScores[`${s.id}-${t.id}`]?.score).filter(v => v !== null && v !== undefined);
                  const avgScore = testScoreList.length ? (testScoreList.reduce((a,b)=>a+b,0)/testScoreList.length).toFixed(1) : null;

                  return { s, assignPct, doneA, effectiveA, topMemo, present, absent, late, avgScore };
                });

                // 과제별 완료율
                const assignStats = rangedAssign.map(a => {
                  const rel = students.filter(s => a.type === 'all' || (a.targetStudents?.includes(s.id)));
                  const exempt = rel.filter(s => submissions[`${s.id}-${a.id}`]?.status === 'exempt').length;
                  const effective = rel.length - exempt;
                  const done = rel.filter(s => submissions[`${s.id}-${a.id}`]?.status === 'completed').length;
                  const incomplete = rel.filter(s => submissions[`${s.id}-${a.id}`]?.status === 'incomplete_red').length;
                  const inprog = rel.filter(s => submissions[`${s.id}-${a.id}`]?.status === 'in_progress').length;
                  const pct = effective > 0 ? Math.round(done / effective * 100) : 0;
                  return { a, done, incomplete, inprog, effective, pct };
                });

                return (
                  <div className="space-y-4">
                    {/* 탭 선택 */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2 flex gap-2">
                      {[['summary', BarChart3, '학생 요약'], ['daily', Calendar, '일자별 리포트'], ['print', Printer, '인쇄용 리포트']].map(([mode, Icon, label]) => (
                        <button key={mode} onClick={() => setReportViewMode(mode)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${reportViewMode === mode ? 'text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                          style={reportViewMode === mode ? {background:'var(--sc)'} : {}}>
                          <Icon size={16}/>{label}
                        </button>
                      ))}
                    </div>

                    {/* ── 일자별 수업 리포트 ── */}
                    {reportViewMode === 'daily' && (() => {
                      // 수업이 있는 날짜만 추출 (progressPlans 기준)
                      const lessonDates = [...new Set(rangedPlans.map(p => p.date))].sort((a,b) => b.localeCompare(a));
                      const DOW = ['일','월','화','수','목','금','토'];

                      if (lessonDates.length === 0) return (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
                          <Calendar size={32} className="text-slate-200 mx-auto mb-3"/>
                          <p className="font-black text-slate-400">해당 기간에 수업 기록이 없습니다.</p>
                        </div>
                      );

                      return (
                        <div className="space-y-4">
                          {/* 인쇄 버튼 */}
                          <div className="flex justify-end">
                            <button onClick={() => window.print()}
                              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95"
                              style={{background:'var(--sc)'}}>
                              <Printer size={15}/> 인쇄
                            </button>
                          </div>

                          <div id="print-report" className="space-y-6">
                            {lessonDates.map(date => {
                              const dayPlans = rangedPlans.filter(p => p.date === date);
                              const dow = DOW[new Date(date).getDay()];
                              const isWeekend = [0,6].includes(new Date(date).getDay());

                              // 그날 시험
                              const dayTests = rangedTests.filter(t => t.date === date);

                              // 그날 마감 과제
                              const dayDeadlineAssigns = rangedAssign.filter(a => a.deadline === date);

                              // 출결 데이터
                              const attList = students.map(s => {
                                const att = attendance[`${s.id}-${date}`] || { status: 'none', makeup: false };
                                const makeupDate = makeupDates[`${s.id}-${date}`] || '';
                                // 출결 이외 날짜 attendanceNotes
                                const note = attendanceNotes[`${s.id}-${date}`] || '';
                                return { s, att, makeupDate, note };
                              });

                              const presentList  = attList.filter(x => x.att.status === 'present');
                              const absentList   = attList.filter(x => x.att.status === 'absent');
                              const lateList     = attList.filter(x => x.att.status === 'late');
                              const noneList     = attList.filter(x => x.att.status === 'none');

                              return (
                                <div key={date} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                  {/* 날짜 헤더 */}
                                  <div className="flex items-center gap-4 px-6 py-4" style={{background:'var(--sc)'}}>
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/20 rounded-2xl shrink-0">
                                      <span className="text-white/70 text-[9px] font-black leading-none">{date.slice(0,7)}</span>
                                      <span className="text-white text-xl font-black leading-tight">{date.slice(8)}</span>
                                    </div>
                                    <div>
                                      <p className={`text-lg font-black leading-none ${isWeekend ? 'text-red-200' : 'text-white'}`}>{dow}요일</p>
                                      <p className="text-white/60 text-xs font-bold mt-1">{date}</p>
                                    </div>
                                    <div className="ml-auto flex gap-2 flex-wrap justify-end">
                                      <span className="text-[10px] font-black bg-white/20 text-white px-2.5 py-1 rounded-full">수업 {dayPlans.length}건</span>
                                      {dayTests.length > 0 && <span className="text-[10px] font-black bg-orange-300/40 text-white px-2.5 py-1 rounded-full">시험 {dayTests.length}</span>}
                                      {absentList.length > 0 && <span className="text-[10px] font-black bg-red-300/40 text-white px-2.5 py-1 rounded-full">결석 {absentList.length}</span>}
                                    </div>
                                  </div>

                                  <div className="p-5 space-y-5">
                                    {/* 수업 내용 */}
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><TrendingUp size={11}/> 수업 내용</p>
                                      <div className="space-y-1.5">
                                        {dayPlans.map(p => {
                                          const lt = LESSON_TYPES.find(l => l.id === (p.lessonType || '진도')) || LESSON_TYPES[0];
                                          return (
                                            <div key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-slate-50 ${p.done ? 'opacity-60' : ''}`}>
                                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border shrink-0 ${lt.light}`}>{p.lessonType || '진도'}</span>
                                              <span className="text-[11px] font-black text-slate-500 shrink-0">{p.subject}</span>
                                              <span className={`text-sm font-black text-slate-800 flex-1 ${p.done ? 'line-through' : ''}`}>{p.unit}</span>
                                              {p.done && <span className="text-[9px] font-black text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded-lg shrink-0">완료</span>}
                                              {p.memo && <span className="text-[10px] text-slate-400 font-medium italic shrink-0 max-w-[120px] truncate">{p.memo}</span>}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* 시험 성적 (그날 시험이 있을 때만) */}
                                    {dayTests.map(t => {
                                      const scoreList = students.map(s => ({ s, sc: testScores[`${s.id}-${t.id}`]?.score }));
                                      const validScores = scoreList.filter(x => x.sc != null);
                                      const avg = validScores.length ? (validScores.reduce((a,b) => a+b.sc, 0) / validScores.length).toFixed(1) : null;
                                      return (
                                        <div key={t.id}>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Trophy size={11} className="text-orange-500"/> 시험 — {t.title} {t.difficulty && <span className="text-orange-400">({t.difficulty})</span>}</p>
                                          <div className="overflow-x-auto rounded-2xl border border-orange-100">
                                            <table className="w-full border-collapse text-sm">
                                              <thead>
                                                <tr className="bg-orange-50">
                                                  <th className="px-4 py-2.5 text-left font-black text-[10px] text-orange-600 uppercase tracking-widest sticky left-0 bg-orange-50">학생</th>
                                                  <th className="px-4 py-2.5 text-center font-black text-[10px] text-orange-600 uppercase tracking-widest">점수</th>
                                                  <th className="px-4 py-2.5 text-center font-black text-[10px] text-orange-600 uppercase tracking-widest">등급</th>
                                                  <th className="px-4 py-2.5 text-left font-black text-[10px] text-orange-600 uppercase tracking-widest">계획/메모</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-orange-50">
                                                {scoreList.map(({ s, sc }) => {
                                                  const plan = testScores[`${s.id}-${t.id}`]?.plan || '';
                                                  const grade = t.scales ? [...t.scales].sort((a,b)=>b.min-a.min).find(g => sc != null && sc >= g.min) : null;
                                                  return (
                                                    <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                                                      <td className="px-4 py-2.5 font-black text-slate-800 sticky left-0 bg-white">{s.name}</td>
                                                      <td className="px-4 py-2.5 text-center">
                                                        {sc != null
                                                          ? <span className={`font-black text-base ${sc>=80?'text-blue-600':sc>=60?'text-amber-500':'text-red-500'}`}>{sc}점</span>
                                                          : <span className="text-slate-200 text-xs font-bold">미응시</span>}
                                                      </td>
                                                      <td className="px-4 py-2.5 text-center">
                                                        {grade ? <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">{grade.icon} {grade.label}</span> : <span className="text-slate-200 text-xs">-</span>}
                                                      </td>
                                                      <td className="px-4 py-2.5 text-xs font-medium text-slate-500 italic">{plan || '-'}</td>
                                                    </tr>
                                                  );
                                                })}
                                                {avg && (
                                                  <tr className="bg-orange-50/60">
                                                    <td className="px-4 py-2 font-black text-orange-600 text-[11px]">반 평균</td>
                                                    <td className="px-4 py-2 text-center font-black text-orange-600">{avg}점</td>
                                                    <td colSpan={2}/>
                                                  </tr>
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* 마감 과제 현황 (그날이 마감일인 과제) */}
                                    {dayDeadlineAssigns.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ClipboardCheck size={11} className="text-indigo-500"/> 마감 과제 현황</p>
                                        <div className="overflow-x-auto rounded-2xl border border-indigo-100">
                                          <table className="w-full border-collapse text-sm">
                                            <thead>
                                              <tr className="bg-indigo-50">
                                                <th className="px-4 py-2.5 text-left font-black text-[10px] text-indigo-600 uppercase tracking-widest sticky left-0 bg-indigo-50">학생</th>
                                                {dayDeadlineAssigns.map(a => (
                                                  <th key={a.id} className="px-3 py-2.5 text-center font-black text-[10px] text-indigo-600 min-w-[100px]">
                                                    <p className="break-words whitespace-normal">{a.title}</p>
                                                    <p className="text-indigo-400 font-bold opacity-70">{a.subject}</p>
                                                  </th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-indigo-50">
                                              {students.map((s, idx) => (
                                                <tr key={s.id} className={idx%2===0?'bg-white':'bg-slate-50/30'}>
                                                  <td className="px-4 py-2.5 font-black text-slate-800 sticky left-0 bg-white">{s.name}</td>
                                                  {dayDeadlineAssigns.map(a => {
                                                    const isTarget = a.type === 'all' || a.targetStudents?.includes(s.id);
                                                    if (!isTarget) return <td key={a.id} className="px-3 py-2.5 text-center"><span className="text-slate-200 text-[10px] font-bold">-</span></td>;
                                                    const sub = submissions[`${s.id}-${a.id}`] || {};
                                                    const status = sub.status || 'not_started';
                                                    const cfg = ASSIGN_STATUS_CONFIG[status];
                                                    const isLate = status === 'completed' && sub.completionDate > date;
                                                    return (
                                                      <td key={a.id} className="px-3 py-2.5 text-center">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isLate ? STATUS_COLORS.late_completed : STATUS_COLORS[status]}`}>
                                                          {React.createElement(cfg.icon, { size: 10 })}
                                                          {isLate ? '지각완료' : cfg.label}
                                                        </span>
                                                        {sub.completionDate && <p className="text-[9px] text-slate-400 font-bold mt-0.5">{sub.completionDate.slice(5)}</p>}
                                                      </td>
                                                    );
                                                  })}
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}

                                    {/* 출결 표 */}
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><UserCheck size={11} className="text-emerald-500"/> 출결 현황</p>
                                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr className="bg-slate-50">
                                              <th className="px-4 py-2.5 text-left font-black text-[10px] text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50">학생</th>
                                              <th className="px-4 py-2.5 text-center font-black text-[10px] text-slate-500 uppercase tracking-widest">출결</th>
                                              <th className="px-4 py-2.5 text-center font-black text-[10px] text-slate-500 uppercase tracking-widest">보충</th>
                                              <th className="px-4 py-2.5 text-left font-black text-[10px] text-slate-500 uppercase tracking-widest">특이사항</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {attList.map(({ s, att, makeupDate, note }, idx) => {
                                              const statusMap = {
                                                present: { label: '출석', cls: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                                absent:  { label: '결석', cls: 'text-red-500 bg-red-50 border-red-100' },
                                                late:    { label: '지각', cls: 'text-amber-600 bg-amber-50 border-amber-100' },
                                                none:    { label: '미기록', cls: 'text-slate-300 bg-slate-50 border-slate-100' },
                                              };
                                              const sm = statusMap[att.status] || statusMap.none;
                                              return (
                                                <tr key={s.id} className={`${att.status === 'absent' ? 'bg-red-50/30' : att.status === 'late' ? 'bg-amber-50/20' : idx%2===0?'bg-white':'bg-slate-50/30'}`}>
                                                  <td className="px-4 py-2.5 font-black text-slate-800 sticky left-0 bg-inherit">{s.name}</td>
                                                  <td className="px-4 py-2.5 text-center">
                                                    <span className={`inline-flex items-center font-black text-[11px] px-2.5 py-1 rounded-xl border ${sm.cls}`}>{sm.label}</span>
                                                  </td>
                                                  <td className="px-4 py-2.5 text-center">
                                                    {att.makeup
                                                      ? <div className="flex flex-col items-center gap-0.5">
                                                          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">보충 완료</span>
                                                          {makeupDate && <span className="text-[9px] text-purple-400 font-bold">{makeupDate.slice(5)}</span>}
                                                        </div>
                                                      : att.status === 'absent'
                                                        ? <span className="text-[10px] font-black text-slate-300">미보충</span>
                                                        : <span className="text-slate-200 text-[10px]">-</span>}
                                                  </td>
                                                  <td className="px-4 py-2.5 text-xs text-slate-500 font-medium italic">
                                                    {note || (att.status === 'absent' && !att.makeup ? '보충 일정 미정' : '-')}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                          {/* 요약 행 */}
                                          <tfoot>
                                            <tr className="bg-slate-50 border-t-2 border-slate-200">
                                              <td className="px-4 py-2 font-black text-slate-500 text-[11px]">합계</td>
                                              <td className="px-4 py-2 text-center">
                                                <div className="flex justify-center gap-2 text-[10px] font-black">
                                                  <span className="text-emerald-600">출석 {presentList.length}</span>
                                                  {lateList.length > 0 && <span className="text-amber-600">지각 {lateList.length}</span>}
                                                  {absentList.length > 0 && <span className="text-red-500">결석 {absentList.length}</span>}
                                                </div>
                                              </td>
                                              <td className="px-4 py-2 text-center text-[10px] font-black text-purple-500">
                                                {attList.filter(x=>x.att.makeup).length > 0 ? `보충 ${attList.filter(x=>x.att.makeup).length}명` : '-'}
                                              </td>
                                              <td/>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── 학생 요약형 ── */}
                    {reportViewMode === 'summary' && (
                      <div className="space-y-4">
                        {/* 헤더 요약 카드 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: '전체 학생', value: students.length + '명', color: 'bg-indigo-50 text-indigo-700' },
                            { label: '과제 항목', value: rangedAssign.length + '개', color: 'bg-blue-50 text-blue-700' },
                            { label: '시험 횟수', value: rangedTests.length + '회', color: 'bg-orange-50 text-orange-700' },
                            { label: '진도 완료율', value: jinDoPlans.length > 0 ? Math.round(jinDoPlans.filter(p=>p.done).length/jinDoPlans.length*100)+'%' : '-', color: 'bg-teal-50 text-teal-700' },
                          ].map(c => (
                            <div key={c.label} className={`${c.color} rounded-2xl p-4 text-center`}>
                              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">{c.label}</p>
                              <p className="text-2xl font-black">{c.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* 학생별 요약 표 */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <Users size={16} className="text-indigo-500"/>
                            <p className="font-black text-slate-800">학생별 종합 현황</p>
                            <span className="text-[10px] text-slate-400 font-bold ml-auto">{from||'전체'} ~ {to||'전체'}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <th className="px-5 py-3 text-left sticky left-0 bg-slate-50 z-10">이름</th>
                                  <th className="px-4 py-3 text-center">과제 완료율</th>
                                  <th className="px-4 py-3 text-center">최고 암기</th>
                                  <th className="px-4 py-3 text-center">시험 평균</th>
                                  <th className="px-4 py-3 text-center">출석</th>
                                  <th className="px-4 py-3 text-center">결석</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {studentSummary.map(({ s, assignPct, doneA, effectiveA, topMemo, present, absent, late, avgScore }) => (
                                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 sticky left-0 bg-white z-10">
                                      <p className="font-black text-slate-800 text-sm">{s.name}</p>
                                      {s.highSchool && <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">{s.highSchool}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {assignPct !== null ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className={`text-sm font-black ${assignPct >= 80 ? 'text-blue-600' : assignPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{assignPct}%</span>
                                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${assignPct >= 80 ? 'bg-blue-400' : assignPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{width: assignPct+'%'}} />
                                          </div>
                                          <span className="text-[9px] text-slate-400 font-bold">{doneA}/{effectiveA}</span>
                                        </div>
                                      ) : <span className="text-slate-300 text-xs font-bold">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {(() => { const cfg = MEMO_STATUS_CONFIG[MEMO_STATUS_ORDER[topMemo]]; return <span className={`px-2 py-1 rounded-lg text-[11px] font-black ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>; })()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {avgScore !== null ? (
                                        <span className={`text-sm font-black ${parseFloat(avgScore)>=80?'text-blue-600':parseFloat(avgScore)>=60?'text-amber-600':'text-red-500'}`}>{avgScore}점</span>
                                      ) : <span className="text-slate-300 text-xs font-bold">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center"><span className="text-sm font-black text-emerald-600">{present}</span></td>
                                    <td className="px-4 py-3 text-center"><span className={`text-sm font-black ${absent > 0 ? 'text-red-500' : 'text-slate-300'}`}>{absent}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 과제별 완료율 */}
                        {assignStats.length > 0 && (
                          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                              <ClipboardList size={16} className="text-indigo-500"/>
                              <p className="font-black text-slate-800">과제별 완료 현황</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                              {assignStats.map(({ a, done, incomplete, inprog, effective, pct }) => (
                                <div key={a.id} className="px-6 py-4 flex items-center gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{a.subject}</span>
                                      <span className="text-[10px] font-bold text-slate-400">{a.level}</span>
                                      {a.deadline && <span className="text-[10px] font-bold text-slate-400 ml-auto">마감 {a.deadline}</span>}
                                    </div>
                                    <p className="font-black text-sm text-slate-700 truncate">{a.title}</p>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex gap-2 text-[10px] font-black">
                                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">완료 {done}</span>
                                      {incomplete > 0 && <span className="text-red-500 bg-red-50 px-2 py-1 rounded-lg">미완료 {incomplete}</span>}
                                      {inprog > 0 && <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">진행 {inprog}</span>}
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className={`text-sm font-black ${pct>=80?'text-blue-600':pct>=50?'text-amber-600':'text-red-500'}`}>{pct}%</span>
                                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                        <div className={`h-full rounded-full ${pct>=80?'bg-blue-400':pct>=50?'bg-amber-400':'bg-red-400'}`} style={{width:pct+'%'}} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 날짜별 타임라인 */}
                        {(() => {
                          const dateMap = {};
                          const addDate = (d) => { if (d && inRange(d) && !dateMap[d]) dateMap[d] = { assigns: [], tests: [], attList: [], plans: [] }; };
                          rangedAssign.forEach(a => { students.forEach(s => { const sub = submissions[`${s.id}-${a.id}`]; if (sub?.completionDate) { addDate(sub.completionDate); dateMap[sub.completionDate]?.assigns.push({ a, s, sub }); } }); });
                          rangedTests.forEach(t => { addDate(t.date); if (dateMap[t.date]) dateMap[t.date].tests.push(t); });
                          Object.keys(attendance).forEach(k => { const parts = k.split('-'); const sid = parts[0]; const d = parts.slice(1).join('-'); if (inRange(d)) { addDate(d); dateMap[d]?.attList.push({ sid, att: attendance[k] }); } });
                          rangedPlans.forEach(p => { addDate(p.date); if (dateMap[p.date]) dateMap[p.date].plans.push(p); });
                          const sortedDates = Object.keys(dateMap).sort((a,b) => b.localeCompare(a));
                          if (sortedDates.length === 0) return null;
                          const DOW = ['일','월','화','수','목','금','토'];
                          return (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                <Calendar size={16} className="text-teal-500"/>
                                <p className="font-black text-slate-800">날짜별 상세 기록</p>
                                <span className="ml-auto text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{sortedDates.length}일</span>
                              </div>
                              <div className="p-4 space-y-3">
                                {sortedDates.map(date => {
                                  const { assigns, tests: dayTests, attList, plans: dayPlans } = dateMap[date];
                                  const presentCnt = attList.filter(a=>a.att?.status==='present').length;
                                  const absentCnt  = attList.filter(a=>a.att?.status==='absent').length;
                                  const lateCnt    = attList.filter(a=>a.att?.status==='late').length;
                                  const dow = DOW[new Date(date).getDay()];
                                  const isWeekend = new Date(date).getDay()===0 || new Date(date).getDay()===6;
                                  return (
                                    <div key={date} className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                      {/* 날짜 헤더 */}
                                      <div className="flex items-center gap-3 px-4 py-3" style={{background:'var(--sc-faint)'}}>
                                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-white shrink-0 shadow-sm" style={{background:'var(--sc)'}}>
                                          <span className="text-[9px] font-black opacity-80 leading-none">{date.slice(0,7)}</span>
                                          <span className="text-lg font-black leading-tight">{date.slice(8)}</span>
                                        </div>
                                        <div>
                                          <span className={`text-base font-black ${isWeekend ? 'text-red-500' : 'text-slate-800'}`}>{dow}요일</span>
                                          <div className="flex gap-1.5 mt-0.5">
                                            {dayTests.length>0   && <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">시험 {dayTests.length}</span>}
                                            {dayPlans.length>0   && <span className="text-[9px] font-black bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full">수업 {dayPlans.length}</span>}
                                            {assigns.length>0    && <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">완료 {assigns.length}</span>}
                                            {attList.length>0    && <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">출결 {attList.length}</span>}
                                          </div>
                                        </div>
                                      </div>

                                      {/* 카테고리 블록들 */}
                                      <div className="divide-y divide-slate-50">

                                        {/* 시험 */}
                                        {dayTests.map(t => {
                                          const scoreList = students.map(s => ({ s, sc: testScores[`${s.id}-${t.id}`]?.score })).filter(x=>x.sc!=null).sort((a,b)=>b.sc-a.sc);
                                          const avg = stats.testAverages[t.id];
                                          return (
                                            <div key={t.id} className="px-4 py-3 bg-orange-50/40">
                                              <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1 bg-orange-100 rounded-lg"><Trophy size={12} className="text-orange-500"/></div>
                                                <span className="text-xs font-black text-orange-700">{t.title}</span>
                                                {t.difficulty && <span className="text-[9px] font-bold text-orange-400 bg-orange-100 px-1.5 py-0.5 rounded-full ml-auto">난이도 {t.difficulty}</span>}
                                              </div>
                                              {/* 점수 그리드 */}
                                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-2">
                                                {scoreList.map(({s, sc}) => (
                                                  <div key={s.id} className="flex items-center justify-between bg-white rounded-xl px-2.5 py-1.5 border border-orange-100">
                                                    <span className="text-[10px] font-black text-slate-600 truncate mr-1">{s.name}</span>
                                                    <span className={`text-[11px] font-black shrink-0 ${sc>=80?'text-blue-600':sc>=60?'text-amber-500':'text-red-500'}`}>{sc}점</span>
                                                  </div>
                                                ))}
                                              </div>
                                              <div className="flex items-center justify-end gap-1">
                                                <span className="text-[9px] font-bold text-orange-400">반 평균</span>
                                                <span className="text-sm font-black text-orange-600">{avg}점</span>
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* 수업 */}
                                        {dayPlans.length > 0 && (
                                          <div className="px-4 py-3 bg-teal-50/40">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="p-1 bg-teal-100 rounded-lg"><TrendingUp size={12} className="text-teal-500"/></div>
                                              <span className="text-xs font-black text-teal-700">수업 기록</span>
                                            </div>
                                            <div className="space-y-1.5">
                                              {dayPlans.map(p => {
                                                const lt = LESSON_TYPES.find(l=>l.id===(p.lessonType||'진도'))||LESSON_TYPES[0];
                                                return (
                                                  <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-white ${p.done?'opacity-60':''}`}>
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border shrink-0 ${lt.light}`}>{p.lessonType||'진도'}</span>
                                                    <span className="text-[10px] font-black text-slate-500 shrink-0">{p.subject}</span>
                                                    <span className={`text-[11px] font-black text-slate-700 flex-1 min-w-0 truncate ${p.done?'line-through':''}`}>{p.unit}</span>
                                                    {p.done && <CheckCircle2 size={12} className="text-teal-400 shrink-0"/>}
                                                    {p.memo && <span className="text-[9px] text-slate-400 font-medium italic shrink-0 truncate max-w-[80px]">{p.memo}</span>}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {/* 과제 완료 */}
                                        {assigns.length > 0 && (
                                          <div className="px-4 py-3 bg-blue-50/40">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="p-1 bg-blue-100 rounded-lg"><CheckCircle2 size={12} className="text-blue-500"/></div>
                                              <span className="text-xs font-black text-blue-700">과제 완료</span>
                                              <span className="text-[9px] font-bold text-blue-400">{assigns.length}건</span>
                                            </div>
                                            {/* 과제명 기준으로 그룹핑 */}
                                            {Object.entries(assigns.reduce((acc, {a, s}) => { if(!acc[a.id]) acc[a.id]={a, names:[]}; acc[a.id].names.push(s.name); return acc; }, {})).map(([aid, {a, names}]) => (
                                              <div key={aid} className="flex items-start gap-2 px-3 py-2 bg-white rounded-xl border border-blue-100 mb-1.5 last:mb-0">
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded">{a.subject}</span>
                                                    <span className="text-[11px] font-black text-slate-700 truncate">{a.title}</span>
                                                  </div>
                                                  <div className="flex flex-wrap gap-1">
                                                    {names.map(n => <span key={n} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg">{n}</span>)}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* 출결 */}
                                        {attList.length > 0 && (
                                          <div className="px-4 py-3">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="p-1 bg-slate-100 rounded-lg"><UserCheck size={12} className="text-slate-500"/></div>
                                              <span className="text-xs font-black text-slate-600">출결 현황</span>
                                              <div className="flex gap-2 ml-auto text-[10px] font-black">
                                                {presentCnt>0 && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">출석 {presentCnt}</span>}
                                                {lateCnt>0   && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">지각 {lateCnt}</span>}
                                                {absentCnt>0 && <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full">결석 {absentCnt}</span>}
                                              </div>
                                            </div>
                                            {(absentCnt>0||lateCnt>0) && (
                                              <div className="flex flex-wrap gap-1.5">
                                                {attList.filter(a=>a.att?.status==='absent').map(({sid}) => { const st=students.find(s=>s.id===sid); return st ? <span key={sid} className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-xl border border-red-100"><AlertCircle size={10}/>{st.name} 결석</span> : null; })}
                                                {attList.filter(a=>a.att?.status==='late').map(({sid}) => { const st=students.find(s=>s.id===sid); return st ? <span key={sid} className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100"><Clock size={10}/>{st.name} 지각</span> : null; })}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* ── 인쇄용 리포트 ── */}
                    {reportViewMode === 'print' && (
                      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                          <p className="font-black text-slate-800 flex items-center gap-2 leading-none"><Printer size={16}/> 인쇄용 리포트</p>
                          <div className="flex gap-2">
                            <button onClick={() => navigator.clipboard?.writeText(reportText)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all">
                              <Copy size={13}/> 복사
                            </button>
                            <button onClick={() => window.print()}
                              className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
                              style={{background:'var(--sc)'}}>
                              <Printer size={13}/> 인쇄
                            </button>
                          </div>
                        </div>
                        {/* 인쇄 영역 */}
                        <div id="print-report" className="p-8 space-y-8 text-slate-800">
                          {/* 헤더 */}
                          <div className="border-b-2 pb-6" style={{borderColor:'var(--sc)'}}>
                            <h1 className="text-2xl font-black mb-1" style={{color:'var(--sc)'}}>{siteTitle}</h1>
                            <p className="text-sm font-bold text-slate-500">학습 종합 리포트 &nbsp;|&nbsp; 생성일: {now} &nbsp;|&nbsp; 기간: {from||'전체'} ~ {to||'전체'}</p>
                          </div>

                          {/* 요약 통계 */}
                          <div>
                            <h2 className="text-base font-black text-slate-700 mb-3 flex items-center gap-2"><BarChart3 size={16} style={{color:'var(--sc)'}}/> 종합 요약</h2>
                            <div className="grid grid-cols-4 gap-3">
                              {[
                                ['전체 학생', students.length+'명'],
                                ['과제 항목', rangedAssign.length+'개'],
                                ['시험 횟수', rangedTests.length+'회'],
                                ['진도 완료율', jinDoPlans.length > 0 ? Math.round(jinDoPlans.filter(p=>p.done).length/jinDoPlans.length*100)+'%' : '-'],
                              ].map(([l,v]) => (
                                <div key={l} className="rounded-xl p-3 text-center border border-slate-100 bg-slate-50">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{l}</p>
                                  <p className="text-xl font-black" style={{color:'var(--sc)'}}>{v}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 학생별 종합표 */}
                          <div>
                            <h2 className="text-base font-black text-slate-700 mb-3 flex items-center gap-2"><Users size={16} style={{color:'var(--sc)'}}/> 학생별 종합 현황</h2>
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr style={{background:'var(--sc)'}}>
                                  {['이름','학교','과제 완료율','최고 암기','시험 평균','출석','결석','지각'].map(h => (
                                    <th key={h} className="px-3 py-2.5 text-white font-black text-[11px] text-center first:text-left">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {studentSummary.map(({ s, assignPct, doneA, effectiveA, topMemo, present, absent, late, avgScore }, idx) => (
                                  <tr key={s.id} className={idx%2===0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className="px-3 py-2.5 font-black text-slate-800 border-b border-slate-100">{s.name}</td>
                                    <td className="px-3 py-2.5 text-[11px] text-slate-500 font-bold border-b border-slate-100">{s.highSchool||'-'}</td>
                                    <td className="px-3 py-2.5 text-center border-b border-slate-100">
                                      <span className={`font-black text-sm ${assignPct==null?'text-slate-300':assignPct>=80?'text-blue-600':assignPct>=50?'text-amber-600':'text-red-500'}`}>{assignPct!=null?assignPct+'%':'-'}</span>
                                      {assignPct!=null&&<p className="text-[9px] text-slate-400 font-bold">{doneA}/{effectiveA}</p>}
                                    </td>
                                    <td className="px-3 py-2.5 text-center border-b border-slate-100">
                                      <span className="text-[11px] font-black text-slate-600">{MEMO_STATUS_CONFIG[MEMO_STATUS_ORDER[topMemo]]?.label}</span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center border-b border-slate-100">
                                      <span className={`font-black text-sm ${avgScore==null?'text-slate-300':parseFloat(avgScore)>=80?'text-blue-600':parseFloat(avgScore)>=60?'text-amber-600':'text-red-500'}`}>{avgScore!=null?avgScore+'점':'-'}</span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-black text-emerald-600 border-b border-slate-100">{present}</td>
                                    <td className="px-3 py-2.5 text-center font-black border-b border-slate-100" style={{color:absent>0?'#ef4444':'#cbd5e1'}}>{absent}</td>
                                    <td className="px-3 py-2.5 text-center font-black border-b border-slate-100" style={{color:late>0?'#f59e0b':'#cbd5e1'}}>{late}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* 과제별 완료 현황 */}
                          {assignStats.length > 0 && (
                            <div>
                              <h2 className="text-base font-black text-slate-700 mb-3 flex items-center gap-2"><ClipboardList size={16} style={{color:'var(--sc)'}}/> 과제별 완료 현황</h2>
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr style={{background:'var(--sc)'}}>
                                    {['과목','수준','과제명','마감','완료','미완료','진행중','완료율'].map(h=>(
                                      <th key={h} className="px-3 py-2.5 text-white font-black text-[11px] text-center">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {assignStats.map(({ a, done, incomplete, inprog, effective, pct }, idx) => (
                                    <tr key={a.id} className={idx%2===0?'bg-white':'bg-slate-50'}>
                                      <td className="px-3 py-2 text-center font-black text-indigo-600 text-[11px] border-b border-slate-100">{a.subject}</td>
                                      <td className="px-3 py-2 text-center text-[11px] font-bold text-slate-500 border-b border-slate-100">{a.level}</td>
                                      <td className="px-3 py-2 font-bold text-slate-700 border-b border-slate-100 max-w-[200px] truncate">{a.title}</td>
                                      <td className="px-3 py-2 text-center text-[11px] text-slate-400 font-bold border-b border-slate-100">{a.deadline||'-'}</td>
                                      <td className="px-3 py-2 text-center font-black text-blue-600 border-b border-slate-100">{done}</td>
                                      <td className="px-3 py-2 text-center font-black border-b border-slate-100" style={{color:incomplete>0?'#ef4444':'#cbd5e1'}}>{incomplete}</td>
                                      <td className="px-3 py-2 text-center font-black text-slate-500 border-b border-slate-100">{inprog}</td>
                                      <td className="px-3 py-2 text-center border-b border-slate-100">
                                        <span className={`font-black text-sm ${pct>=80?'text-blue-600':pct>=50?'text-amber-600':'text-red-500'}`}>{pct}%</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* 시험 성적 */}
                          {rangedTests.length > 0 && (
                            <div>
                              <h2 className="text-base font-black text-slate-700 mb-3 flex items-center gap-2"><Trophy size={16} style={{color:'var(--sc)'}}/> 시험 성적 현황</h2>
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr style={{background:'var(--sc)'}}>
                                    <th className="px-3 py-2.5 text-white font-black text-[11px] text-left">이름</th>
                                    {rangedTests.map(t=><th key={t.id} className="px-3 py-2.5 text-white font-black text-[11px] text-center max-w-[100px]"><p className="truncate">{t.title}</p><p className="opacity-70 font-bold">{t.date}</p></th>)}
                                    <th className="px-3 py-2.5 text-white font-black text-[11px] text-center">평균</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {students.map((s, idx) => {
                                    const scores = rangedTests.map(t=>testScores[`${s.id}-${t.id}`]?.score);
                                    const valid = scores.filter(v=>v!=null);
                                    const avg = valid.length ? (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1) : null;
                                    return (
                                      <tr key={s.id} className={idx%2===0?'bg-white':'bg-slate-50'}>
                                        <td className="px-3 py-2.5 font-black text-slate-800 border-b border-slate-100">{s.name}</td>
                                        {scores.map((sc,i)=>(
                                          <td key={i} className="px-3 py-2.5 text-center border-b border-slate-100">
                                            {sc!=null ? <span className={`font-black text-sm ${sc>=80?'text-blue-600':sc>=60?'text-amber-600':'text-red-500'}`}>{sc}점</span> : <span className="text-slate-200 text-xs">-</span>}
                                          </td>
                                        ))}
                                        <td className="px-3 py-2.5 text-center border-b border-slate-100">
                                          {avg ? <span className="font-black text-sm" style={{color:'var(--sc)'}}>{avg}점</span> : <span className="text-slate-200 text-xs">-</span>}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  <tr className="font-black" style={{background:'var(--sc-faint)'}}>
                                    <td className="px-3 py-2.5 font-black text-slate-700 border-t border-slate-200">반 평균</td>
                                    {rangedTests.map(t=>(
                                      <td key={t.id} className="px-3 py-2.5 text-center border-t border-slate-200">
                                        <span className="font-black" style={{color:'var(--sc)'}}>{stats.testAverages[t.id]||'-'}점</span>
                                      </td>
                                    ))}
                                    <td className="border-t border-slate-200"/>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* 날짜별 상세 기록 */}
                          {(() => {
                            const dateMap = {};
                            const addDate = (d) => { if (d && inRange(d) && !dateMap[d]) dateMap[d] = { assigns: [], tests: [], attList: [], plans: [] }; };
                            rangedAssign.forEach(a => { students.forEach(s => { const sub = submissions[`${s.id}-${a.id}`]; if (sub?.completionDate) { addDate(sub.completionDate); dateMap[sub.completionDate]?.assigns.push({ a, s, sub }); } }); });
                            rangedTests.forEach(t => { addDate(t.date); if (dateMap[t.date]) dateMap[t.date].tests.push(t); });
                            Object.keys(attendance).forEach(k => { const parts = k.split('-'); const sid = parts[0]; const d = parts.slice(1).join('-'); if (inRange(d)) { addDate(d); dateMap[d]?.attList.push({ sid, att: attendance[k] }); } });
                            rangedPlans.forEach(p => { addDate(p.date); if (dateMap[p.date]) dateMap[p.date].plans.push(p); });
                            const sortedDates = Object.keys(dateMap).sort((a,b) => b.localeCompare(a));
                            if (sortedDates.length === 0) return null;
                            const DOW = ['일','월','화','수','목','금','토'];
                            return (
                              <div>
                                <h2 className="text-base font-black text-slate-700 mb-4 flex items-center gap-2"><Calendar size={16} style={{color:'var(--sc)'}}/> 날짜별 상세 기록</h2>
                                <div className="space-y-4">
                                  {sortedDates.map(date => {
                                    const { assigns, tests: dayTests, attList, plans: dayPlans } = dateMap[date];
                                    const presentCnt = attList.filter(a=>a.att?.status==='present').length;
                                    const absentCnt  = attList.filter(a=>a.att?.status==='absent').length;
                                    const lateCnt    = attList.filter(a=>a.att?.status==='late').length;
                                    const dow = DOW[new Date(date).getDay()];
                                    return (
                                      <div key={date} className="border border-slate-200 rounded-xl overflow-hidden">
                                        {/* 날짜 헤더 */}
                                        <div className="flex items-center gap-3 px-4 py-2.5" style={{background:'var(--sc)'}}>
                                          <span className="font-black text-white text-sm">{date}</span>
                                          <span className="text-white/70 font-bold text-xs">{dow}요일</span>
                                          <div className="flex gap-1.5 ml-auto">
                                            {dayTests.length>0  && <span className="text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-full">시험 {dayTests.length}</span>}
                                            {dayPlans.length>0  && <span className="text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-full">수업 {dayPlans.length}</span>}
                                            {assigns.length>0   && <span className="text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-full">완료 {assigns.length}</span>}
                                          </div>
                                        </div>
                                        <div className="divide-y divide-slate-100 bg-white">
                                          {/* 시험 */}
                                          {dayTests.map(t => {
                                            const scoreList = students.map(s=>({s, sc:testScores[`${s.id}-${t.id}`]?.score})).filter(x=>x.sc!=null).sort((a,b)=>b.sc-a.sc);
                                            return (
                                              <div key={t.id} className="px-4 py-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <Trophy size={12} className="text-orange-500 shrink-0"/>
                                                  <span className="text-xs font-black text-orange-700">{t.title}</span>
                                                  <span className="ml-auto text-[10px] font-black text-orange-500">반 평균 {stats.testAverages[t.id]}점</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-1">
                                                  {scoreList.map(({s,sc}) => (
                                                    <div key={s.id} className="flex justify-between items-center bg-orange-50 rounded-lg px-2 py-1 border border-orange-100">
                                                      <span className="text-[10px] font-bold text-slate-600 truncate mr-1">{s.name}</span>
                                                      <span className={`text-[11px] font-black shrink-0 ${sc>=80?'text-blue-600':sc>=60?'text-amber-500':'text-red-500'}`}>{sc}점</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                          {/* 수업 */}
                                          {dayPlans.length > 0 && (
                                            <div className="px-4 py-3">
                                              <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp size={12} className="text-teal-500 shrink-0"/>
                                                <span className="text-xs font-black text-teal-700">수업 기록</span>
                                              </div>
                                              <div className="space-y-1">
                                                {dayPlans.map(p => {
                                                  const lt = LESSON_TYPES.find(l=>l.id===(p.lessonType||'진도'))||LESSON_TYPES[0];
                                                  return (
                                                    <div key={p.id} className={`flex items-center gap-2 text-[11px] ${p.done?'opacity-50':''}`}>
                                                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black border ${lt.light}`}>{p.lessonType||'진도'}</span>
                                                      <span className="font-bold text-slate-500 shrink-0">{p.subject}</span>
                                                      <span className={`font-black text-slate-700 ${p.done?'line-through':''}`}>{p.unit}</span>
                                                      {p.done && <span className="text-teal-500 text-[9px] font-black shrink-0">✓ 완료</span>}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                          {/* 과제 완료 */}
                                          {assigns.length > 0 && (
                                            <div className="px-4 py-3">
                                              <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 size={12} className="text-blue-500 shrink-0"/>
                                                <span className="text-xs font-black text-blue-700">과제 완료 {assigns.length}건</span>
                                              </div>
                                              {Object.entries(assigns.reduce((acc,{a,s})=>{ if(!acc[a.id]) acc[a.id]={a,names:[]}; acc[a.id].names.push(s.name); return acc; },{})).map(([aid,{a,names}]) => (
                                                <div key={aid} className="flex items-center gap-2 text-[11px] mb-1">
                                                  <span className="font-bold text-indigo-500 shrink-0">{a.subject}</span>
                                                  <span className="font-black text-slate-700 flex-1 truncate">{a.title}</span>
                                                  <span className="text-slate-500 font-bold shrink-0">{names.join(', ')}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {/* 출결 */}
                                          {attList.length > 0 && (
                                            <div className="px-4 py-3 flex items-center gap-4">
                                              <UserCheck size={12} className="text-slate-400 shrink-0"/>
                                              <div className="flex gap-3 text-[11px] font-black">
                                                {presentCnt>0 && <span className="text-emerald-600">출석 {presentCnt}</span>}
                                                {lateCnt>0   && <span className="text-amber-600">지각 {lateCnt} ({attList.filter(a=>a.att?.status==='late').map(a=>students.find(s=>s.id===a.sid)?.name||'').filter(Boolean).join(', ')})</span>}
                                                {absentCnt>0 && <span className="text-red-500">결석 {absentCnt} ({attList.filter(a=>a.att?.status==='absent').map(a=>students.find(s=>s.id===a.sid)?.name||'').filter(Boolean).join(', ')})</span>}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 푸터 */}
                          <div className="border-t pt-4 text-[11px] text-slate-400 font-bold flex justify-between">
                            <span>{siteTitle} 학습 리포트</span>
                            <span>생성일: {now}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* AI 분석 */}
              {reportGenerated && userRole === 'master' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-black text-slate-800 flex items-center gap-2 leading-none"><Bot size={16} className="text-violet-500" /> AI 학습 분석</p>
                    {aiAnalysis && (
                      <button onClick={requestAiAnalysis} disabled={aiLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs transition-all">
                        <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} /> 재분석
                      </button>
                    )}
                  </div>
                  {!aiAnalysis && !aiLoading && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{background:'var(--sc-faint)'}}>
                        <Sparkles size={28} style={{color:'var(--sc)'}} />
                      </div>
                      <p className="text-slate-600 font-bold mb-2">AI가 리포트를 분석하고 개선점을 제안합니다</p>
                      <p className="text-slate-400 text-sm font-medium mb-6">과제·암기·성적·출결·진도 데이터를 종합적으로 분석합니다</p>
                      <button onClick={requestAiAnalysis}
                        className="px-8 py-4 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
                        style={{background:'var(--sc)'}}>
                        <Sparkles size={18} /> AI 분석 요청
                      </button>
                    </div>
                  )}
                  {aiLoading && (
                    <div className="p-12 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-500 font-bold">
                        <Loader2 size={22} className="animate-spin" style={{color:'var(--sc)'}} />
                        <span>AI가 데이터를 분석하고 있습니다...</span>
                      </div>
                    </div>
                  )}
                  {aiAnalysis && !aiLoading && (
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm select-text">{aiAnalysis}</div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

                    {activeTab === 'assignments' && userRole !== 'student' && (
            <div className="max-w-4xl mx-auto space-y-6 text-left">
              {/* 과목 설정 - master 전용 */}
              {userRole === 'master' && (() => {
                const saveSubjects = async (newList) => {
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { subjects: newList }, { merge: true });
                };
                return (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-black text-slate-800 flex items-center gap-2"><Tag size={16} className="text-indigo-500"/> 과목 설정</h2>
                      <button onClick={() => setEditingSubjects(v => !v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${editingSubjects ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                        {editingSubjects ? '완료' : '편집'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((sub, i) => (
                        <div key={sub} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-black border ${editingSubjects ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          {sub}
                          {editingSubjects && (
                            <button onClick={() => { const nl = subjects.filter((_,j) => j !== i); saveSubjects(nl); }}
                              className="ml-1 text-indigo-300 hover:text-red-500 transition-colors font-black leading-none">×</button>
                          )}
                        </div>
                      ))}
                      {editingSubjects && (
                        <div className="flex items-center gap-1">
                          <input
                            value={subjectInput}
                            onChange={e => setSubjectInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && subjectInput.trim() && !subjects.includes(subjectInput.trim())) { saveSubjects([...subjects, subjectInput.trim()]); setSubjectInput(''); }}}
                            placeholder="과목 추가..."
                            className="px-3 py-1.5 rounded-xl text-sm font-bold border border-indigo-200 bg-white outline-none focus:border-indigo-400 w-28 text-slate-700"
                          />
                          <button onClick={() => { if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) { saveSubjects([...subjects, subjectInput.trim()]); setSubjectInput(''); }}}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-black">+</button>
                        </div>
                      )}
                    </div>
                    {editingSubjects && <p className="text-[10px] text-slate-400 font-medium mt-3">Enter 또는 + 버튼으로 추가 · × 로 삭제</p>}
                  </div>
                );
              })()}
              {userRole === 'master' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-left leading-none">
                  <div className="flex justify-between items-center mb-8 text-left leading-none">
                    <h2 className="text-xl font-bold text-slate-800 leading-none">신규 항목 발행</h2>
                    <div className="flex bg-slate-100 p-1 rounded-xl leading-none">
                      <button onClick={() => setRegCategory('assignment')} className={`px-4 py-2 rounded-lg text-xs font-bold transition leading-none ${regCategory === 'assignment' ? 'bg-white text-indigo-800 shadow-sm font-black' : 'text-slate-400'}`}>과제(숙제)</button>
                      <button onClick={() => setRegCategory('memorization')} className={`px-4 py-2 rounded-lg text-xs font-bold transition leading-none ${regCategory === 'memorization' ? 'bg-white text-purple-800 shadow-sm font-black' : 'text-slate-400'}`}>암기(테스트)</button>
                    </div>
                  </div>
                  <div className="space-y-8 text-left text-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><Tag size={12} /> 1. 과목</p><div className="flex flex-wrap gap-2">{subjects.map(sub => (<button key={sub} onClick={() => setNewAssignment({ ...newAssignment, subject: sub })} className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition leading-none ${newAssignment.subject === sub ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{sub}</button>))}</div></div>
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><TrendingUp size={12} /> 2. 수준</p><div className="flex flex-wrap gap-2">{ASSIGNMENT_LEVELS.map(lvl => (<button key={lvl} onClick={() => setNewAssignment({ ...newAssignment, level: lvl })} className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition leading-none ${newAssignment.level === lvl ? 'bg-indigo-700 border-indigo-700 text-white shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{lvl}</button>))}</div></div>
                      <div className="text-left leading-none">
                        <p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><UserCheck size={12} /> 3. 대상</p>
                        <div className="flex gap-2 mb-3 leading-none">
                          <button onClick={() => setNewAssignment({ ...newAssignment, type: 'all', targetStudents: [] })} className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 leading-none ${newAssignment.type === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>전체</button>
                          <button onClick={() => setNewAssignment({ ...newAssignment, type: 'individual' })} className={`flex-1 py-2 rounded-xl text-xs font-black border-2 leading-none ${newAssignment.type === 'individual' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>개별</button>
                        </div>
                        {newAssignment.type === 'individual' && (() => {
                          const groups = ['A','B','C','D','E'].filter(g => students.some(s => s.group === g));
                          const toggleGroup = (g) => {
                            const inGroup = students.filter(s => s.group === g).map(s => s.id);
                            const allSelected = inGroup.every(id => newAssignment.targetStudents.includes(id));
                            let next = [...newAssignment.targetStudents];
                            if (allSelected) next = next.filter(id => !inGroup.includes(id));
                            else inGroup.forEach(id => { if (!next.includes(id)) next.push(id); });
                            setNewAssignment({ ...newAssignment, targetStudents: next });
                          };
                          const toggleAll = () => {
                            const allIds = students.map(s => s.id);
                            const allSelected = allIds.every(id => newAssignment.targetStudents.includes(id));
                            setNewAssignment({ ...newAssignment, targetStudents: allSelected ? [] : allIds });
                          };
                          return (
                            <div className="space-y-2">
                              {/* 그룹 빠른선택 버튼 */}
                              {groups.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  <button onClick={toggleAll}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-black border-2 border-slate-200 text-slate-500 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all leading-none">
                                    전체선택
                                  </button>
                                  {groups.map(g => {
                                    const inGroup = students.filter(s => s.group === g).map(s => s.id);
                                    const allSel = inGroup.every(id => newAssignment.targetStudents.includes(id));
                                    return (
                                      <button key={g} onClick={() => toggleGroup(g)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all leading-none ${allSel ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-200 text-amber-600 bg-white hover:border-amber-400'}`}>
                                        그룹 {g} ({inGroup.length}명)
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              {/* 학생 개별 선택 그리드 */}
                              <div className="p-3 bg-slate-50 rounded-2xl border shadow-inner">
                                <div className="grid grid-cols-2 gap-1.5">
                                  {students.map(s => {
                                    const checked = newAssignment.targetStudents.includes(s.id);
                                    return (
                                      <button key={s.id}
                                        onClick={() => {
                                          const cur = [...newAssignment.targetStudents];
                                          if (checked) cur.splice(cur.indexOf(s.id), 1);
                                          else cur.push(s.id);
                                          setNewAssignment({ ...newAssignment, targetStudents: cur });
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-white border-white' : 'border-slate-300'}`}>
                                          {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-black truncate leading-none">{s.name}</p>
                                          {s.group && <p className={`text-[9px] font-bold leading-none mt-0.5 ${checked ? 'text-indigo-200' : 'text-amber-500'}`}>그룹 {s.group}</p>}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                                {newAssignment.targetStudents.length > 0 && (
                                  <p className="text-center text-[10px] font-black text-indigo-600 mt-2">{newAssignment.targetStudents.length}명 선택됨</p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><FileText size={12} /> 4. 명칭</p><BufferedInput value={newAssignment.title} onSave={(v) => setNewAssignment({ ...newAssignment, title: v })} placeholder="제목..." className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800 shadow-sm transition-all leading-none" /></div>
                      <div className="text-left leading-none"><p className="text-[10px] font-black text-slate-400 mb-3 uppercase flex items-center gap-1 text-left leading-none"><Calendar size={12} /> 5. 마감기한</p><input type="date" value={newAssignment.deadline} onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })} className="w-full px-4 py-3 rounded-2xl border bg-slate-50 font-bold outline-none focus:border-indigo-500 text-slate-800 shadow-sm transition-all leading-none" /></div>
                    </div>
                    <button onClick={addAssignment} className={`w-full ${regCategory === 'assignment' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-purple-600 shadow-purple-100'} text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] transition-all shadow-md leading-none`}>발행하기</button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {(regCategory === 'assignment' ? assignments : memoItems).map(a => (
                  <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group transition-all text-left hover:shadow-md">
                    {editItemId === a.id ? (
                      <div className="space-y-5 animate-in slide-in-from-top-2 text-left">
                        {/* 1행: 과목 / 수준 / 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-slate-700">
                          <div className="space-y-2 text-left">
                            <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">과목 수정</p>
                            <div className="flex flex-wrap gap-1">
                              {subjects.map(s => (
                                <button key={s} onClick={() => setEditItemData({ ...editItemData, subject: s })} className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${editItemData.subject === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-400 hover:border-slate-300'}`}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-left">
                            <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">수준 수정</p>
                            <div className="flex flex-wrap gap-1">
                              {ASSIGNMENT_LEVELS.map(lvl => (
                                <button key={lvl} onClick={() => setEditItemData({ ...editItemData, level: lvl })} className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${editItemData.level === lvl ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-slate-50 text-slate-400 hover:border-slate-300'}`}>{lvl}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-left">
                            <p className="text-[10px] uppercase tracking-tighter font-black text-slate-400">정보 수정</p>
                            <BufferedInput value={editItemData.title} onSave={(v) => setEditItemData({ ...editItemData, title: v })} className="w-full px-2 py-1.5 border rounded-lg text-xs font-bold mb-2 focus:border-indigo-500 text-slate-800 shadow-sm" />
                            <input type="date" value={editItemData.deadline || ''} onChange={(e) => setEditItemData({ ...editItemData, deadline: e.target.value })} className="w-full px-2 py-1.5 border rounded-lg text-xs font-bold text-slate-800 shadow-sm" />
                          </div>
                        </div>
                        {/* 2행: 대상 수정 (전체/개별 + 개별일 때 학생 목록) */}
                        <div className="space-y-2 text-left">
                          <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400 flex items-center gap-1"><UserCheck size={11} /> 대상 수정</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditItemData({ ...editItemData, type: 'all', targetStudents: [] })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${editItemData.type === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                            >
                              전체 학생
                            </button>
                            <button
                              onClick={() => setEditItemData({ ...editItemData, type: 'individual', targetStudents: editItemData.targetStudents || [] })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${editItemData.type === 'individual' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                            >
                              개별 지정
                            </button>
                            {editItemData.type === 'individual' && (
                              <span className="ml-auto text-[11px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1">
                                <Users size={12} /> {(editItemData.targetStudents || []).length}명 선택됨
                              </span>
                            )}
                          </div>
                          {editItemData.type === 'individual' && (
                            <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">학생 선택</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditItemData({ ...editItemData, targetStudents: students.map(s => s.id) })}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black hover:bg-indigo-200 transition-all"
                                  >
                                    전체 선택
                                  </button>
                                  <button
                                    onClick={() => setEditItemData({ ...editItemData, targetStudents: [] })}
                                    className="px-2 py-1 bg-slate-200 text-slate-500 rounded-lg text-[9px] font-black hover:bg-slate-300 transition-all"
                                  >
                                    전체 해제
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {students.map(s => {
                                  const isChecked = (editItemData.targetStudents || []).includes(s.id);
                                  return (
                                    <label
                                      key={s.id}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border-2 transition-all text-xs font-bold select-none ${isChecked ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const cur = [...(editItemData.targetStudents || [])];
                                          if (e.target.checked) cur.push(s.id);
                                          else cur.splice(cur.indexOf(s.id), 1);
                                          setEditItemData({ ...editItemData, targetStudents: cur });
                                        }}
                                      />
                                      <UserCheck size={11} className={isChecked ? 'text-white' : 'text-slate-300'} />
                                      {s.name}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={saveEditItem} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-green-700 transition-all"><Save size={16} /> 저장</button>
                          <button onClick={() => { setEditItemId(null); setEditItemData(null); }} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm transition-all">취소</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-left text-slate-700 shadow-sm p-1 rounded-xl">
                        <div className="flex flex-col gap-1 text-left">
                          <div className="flex items-center gap-2 text-left leading-none">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${regCategory === 'assignment' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{a.subject}</span>
                            <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 leading-none">{a.level}</span>
                            {a.type === 'individual' && (
                              <div className="relative group/individual">
                                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-black cursor-help flex items-center gap-1 shadow-sm leading-none"><UserCheck size={10} /> 개별 ({a.targetStudents?.length || 0}명)</span>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/individual:block z-50 animate-in fade-in zoom-in-95 pointer-events-none shadow-2xl">
                                  <div className="bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl shadow-2xl min-w-[120px]">
                                    <p className="text-amber-400 border-b border-white/10 pb-1 mb-1 text-[8px] uppercase font-black tracking-widest leading-none">대상 명단</p>
                                    {/* [FIX 1] getTargetStudentNamesLocal에 students 인수 전달 */}
                                    {getTargetStudentNamesLocal(students, a.targetStudents)}
                                  </div>
                                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 ml-3" />
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="font-black text-slate-800 text-lg leading-tight text-left mt-0.5 leading-none">{a.title}</span>
                          {a.deadline && <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 tracking-tighter italic text-left leading-none">{a.deadline} 마감</span>}
                        </div>
                        {userRole === 'master' && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <div className="flex flex-col gap-1">
                              <button onClick={() => moveItem('up', a)} className="p-1.5 text-slate-400 bg-slate-50 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-all shadow-sm leading-none" title="위로"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                              <button onClick={() => moveItem('down', a)} className="p-1.5 text-slate-400 bg-slate-50 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-all shadow-sm leading-none" title="아래로"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3 7l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                            </div>
                            <button onClick={() => { setEditItemId(a.id); setEditItemData({ ...a }); }} className="p-2.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm"><Edit2 size={18} /></button>
                            <button onClick={() => deleteItem(regCategory === 'assignment' ? 'assignments' : 'memoItems', a.id)} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* --- Detail Modals --- */}
        {selectedTest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in shadow-2xl">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-orange-600 p-8 text-white flex justify-between items-start shadow-inner leading-none">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center shadow-inner">{isTestEditMode ? <Edit2 size={32} /> : <FileSearch size={32} />}</div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-white leading-none">{isTestEditMode ? "시험 정보 수정" : `${selectedTest.title} 상세`}</h2>
                    <p className="text-orange-100 text-xs font-medium uppercase tracking-widest leading-none mt-2">{selectedTest.date} | {selectedTest.source}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedTest(null); setIsTestEditMode(false); }} className="p-1 hover:bg-white/10 rounded-full transition-all text-white"><LucideX size={24} /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-left shadow-inner">
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner text-left font-bold">
                  {isTestEditMode ? (
                    <div className="space-y-4">
                      <input type="date" value={selectedTest.date} onChange={(e) => setSelectedTest({ ...selectedTest, date: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl font-bold bg-white focus:border-indigo-500 outline-none" />
                      <BufferedInput value={selectedTest.title} onSave={(v) => setSelectedTest({ ...selectedTest, title: v })} className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl font-bold bg-white" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">출처</p>
                        <BufferedInput value={selectedTest.source} onSave={(v) => setSelectedTest({ ...selectedTest, source: v })} placeholder="출처 입력..." className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl font-bold bg-white focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">난이도</p>
                        <div className="flex flex-wrap gap-2">
                          {DIFFICULTIES.map(d => (
                            <button key={d} onClick={() => setSelectedTest({ ...selectedTest, difficulty: d })} className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${selectedTest.difficulty === d ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{d}</button>
                          ))}
                        </div>
                      </div>
                      <BufferedTextarea value={selectedTest.description} onSave={(v) => setSelectedTest({ ...selectedTest, description: v })} className="w-full h-40 p-5 border-2 border-slate-100 rounded-3xl font-medium text-sm bg-white" />
                      <button onClick={updateTestDetails} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg">저장하기</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 날짜 / 난이도 / 출처 정보 카드 */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm">
                          <Calendar size={16} className="text-orange-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">시험 날짜</p>
                          <p className="text-sm font-black text-slate-800 leading-none">{selectedTest.date || '-'}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm">
                          <Tag size={16} className="text-orange-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">난이도</p>
                          <p className="text-sm font-black text-slate-800 leading-none">{selectedTest.difficulty || '-'}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 bg-white border border-slate-100 rounded-2xl py-4 px-2 shadow-sm">
                          <Bookmark size={16} className="text-orange-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">출처</p>
                          <p className="text-sm font-black text-slate-800 leading-none text-center break-all">{selectedTest.source || '-'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 leading-none"><ClipboardList size={14} /> 시험 상세 범위 및 참고사항</p>
                        {userRole === 'master' && <button onClick={() => setIsTestEditMode(true)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 hover:bg-indigo-50 shadow-sm"><Edit2 size={12} /> 수정</button>}
                      </div>
                      <p className="text-slate-700 font-black whitespace-pre-wrap leading-relaxed">{selectedTest.description || "등록된 상세 정보가 없습니다."}</p>
                      <button onClick={() => { setSelectedTest(null); setIsTestEditMode(false); }} className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black shadow-lg shadow-orange-100 transition-all active:scale-95 leading-none">확인 완료</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in shadow-2xl">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 text-white flex justify-between items-start shadow-inner leading-none" style={{background:'var(--sc-darker)'}}>
                <div>
                  <h2 className="text-xl font-bold text-white text-left leading-none">{selectedStudent.name} 학습 현황</h2>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-widest leading-none mt-2">{selectedStudent.highSchool} | {selectedStudent.homeroomTeacher}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-white/10 rounded-full transition-all text-white"><LucideX size={24} /></button>
              </div>
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">과제 진척도</p>
                    {(() => {
                      const sid = selectedStudent.id;
                      const rel = assignments.filter(a => a.type === 'all' || a.targetStudents?.includes(sid));
                      const done = rel.filter(a => submissions[`${sid}-${a.id}`]?.status === 'completed').length;
                      const incomplete = rel.filter(a => submissions[`${sid}-${a.id}`]?.status === 'incomplete_red').length;
                      const effective = done + incomplete;
                      const pct = effective > 0 ? Math.round(done / effective * 100) : null;
                      return pct !== null ? (
                        <>
                          <p className="text-2xl font-black text-indigo-700">{pct}%</p>
                          <p className="text-xs text-indigo-500 font-bold">{done}/{effective} 완료</p>
                        </>
                      ) : <p className="text-sm font-black text-indigo-300 mt-2">집계 중</p>;
                    })()}
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">암기 진척도</p>
                    <p className="text-2xl font-black text-purple-700">{stats.memo[selectedStudent.id]?.percent || '0.0'}%</p>
                    <p className="text-xs text-purple-500 font-bold">{stats.memo[selectedStudent.id]?.label || '-'}</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-4 text-center col-span-2">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">시험 평균</p>
                    <p className="text-2xl font-black text-orange-700">{stats.studentTestAverages[selectedStudent.id] || '0.0'}점</p>
                  </div>
                </div>
                {/* 시험별 점수 상세 */}
                {tests.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Trophy size={12} className="text-orange-400"/> 시험별 점수</p>
                    <div className="space-y-2">
                      {tests.map(t => {
                        const sc = testScores[`${selectedStudent.id}-${t.id}`];
                        const score = sc?.score;
                        const grade = score != null && t.scales
                          ? [...t.scales].sort((a,b) => b.min - a.min).find(g => score >= g.min)
                          : null;
                        const avg = parseFloat(stats.testAverages[t.id] || 0);
                        const diff = score != null ? (score - avg).toFixed(1) : null;
                        return (
                          <div key={t.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-700 truncate">{t.title}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">{t.date}{t.difficulty && ` · ${t.difficulty}`}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {score != null ? (
                                <>
                                  {userRole !== 'student' && grade && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600">{grade.icon} {grade.label}</span>}
                                  <div className="text-right">
                                    <p className="text-base font-black leading-none text-slate-800">{score}점</p>
                                    {userRole !== 'student' && diff !== null && (
                                      <p className={`text-[9px] font-bold mt-0.5 leading-none ${parseFloat(diff)>0?'text-emerald-500':parseFloat(diff)<0?'text-red-400':'text-slate-400'}`}>
                                        평균 대비 {parseFloat(diff)>0?'+':''}{diff}
                                      </p>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-300">미응시</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {userRole === 'master' && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><StickyNote size={12} /> 학생 메모</p>
                    <BufferedTextarea
                      value={studentNotes[selectedStudent.id] || ''}
                      onSave={(v) => saveStudentNote(selectedStudent.id, v)}
                      placeholder="이 학생에 대한 메모를 입력하세요..."
                      className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-slate-400 transition-all resize-none select-text shadow-inner"
                    />
                  </div>
                )}
                {userRole !== 'master' && studentNotes[selectedStudent.id] && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><StickyNote size={12} /> 메모</p>
                    <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{studentNotes[selectedStudent.id]}</p>
                  </div>
                )}
                <button onClick={() => setSelectedStudent(null)} className="w-full py-4 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 leading-none" style={{background:'var(--sc-darker)'}}>닫기</button>
              </div>
            </div>
          </div>
        )}

        {/* Status Menu Portal */}
        {statusMenu && (
          <div className="fixed inset-0 z-[150]" onClick={() => setStatusMenu(null)}>
            <div
              className="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[140px] animate-in zoom-in-95"
              style={{ left: Math.min(statusMenu.x, window.innerWidth - 160), top: Math.min(statusMenu.y, window.innerHeight - 200) }}
              onClick={e => e.stopPropagation()}
            >
              <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">상태 변경</p>
              {(statusMenu.category === 'assignment' ? ASSIGN_STATUS_ORDER : MEMO_STATUS_ORDER).map(st => {
                const cfg = statusMenu.category === 'assignment' ? ASSIGN_STATUS_CONFIG[st] : MEMO_STATUS_CONFIG[st];
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusSelect(statusMenu.studentId, statusMenu.itemId, statusMenu.category, st)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-black hover:bg-slate-50 transition-colors ${cfg?.color}`}
                  >
                    {cfg?.icon && React.createElement(cfg.icon, { size: 14 })}
                    {cfg?.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* 일괄 처리 날짜 선택 팝업 */}
        {bulkDatePopup && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setBulkDatePopup(null); setBulkSelectedStatus(null); }}>
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-xs animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600"><Calendar size={22} /></div>
                <div>
                  <p className="font-black text-slate-800 text-base leading-none">일괄 처리 날짜 선택</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 leading-none truncate max-w-[180px]">{bulkDatePopup.item.title}</p>
                </div>
              </div>
              <input
                type="date"
                value={bulkSelectedDate}
                onChange={e => setBulkSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all mb-6 text-center"
                autoFocus
              />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">적용할 상태 선택</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto mb-4">
                {(bulkDatePopup.category === 'assignment' ? ASSIGN_STATUS_ORDER : MEMO_STATUS_ORDER).map(st => {
                  const cfg = bulkDatePopup.category === 'assignment' ? ASSIGN_STATUS_CONFIG[st] : MEMO_STATUS_CONFIG[st];
                  const isSelected = bulkSelectedStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setBulkSelectedStatus(st)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm border-2 ${
                        isSelected
                          ? `${cfg?.bg} ${cfg?.color} border-current ring-2 ring-offset-1 ring-current scale-[1.02]`
                          : `${cfg?.bg} ${cfg?.color} border-transparent opacity-60 hover:opacity-100 hover:brightness-95`
                      }`}
                    >
                      {cfg?.icon && React.createElement(cfg.icon, { size: 14 })}
                      {cfg?.label}
                      {isSelected && <CheckCircle2 size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setBulkDatePopup(null); setBulkSelectedStatus(null); }} className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm transition hover:bg-slate-200">취소</button>
                <button
                  onClick={() => { if (bulkSelectedStatus) { bulkUpdateStatus(bulkDatePopup.item, bulkSelectedStatus, bulkDatePopup.category); setBulkSelectedStatus(null); } }}
                  disabled={!bulkSelectedStatus}
                  className={`flex-1 py-3 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 ${
                    bulkSelectedStatus
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle size={16} />
                  완료
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
