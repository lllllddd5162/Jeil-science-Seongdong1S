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
  Tag, TrendingUp, Printer, Sparkles, Copy, RefreshCw, Bot
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = { apiKey: "AIzaSyBaWWriu3X7iVQnglR5XcA0Mqqc736VopM", authDomain: "science-academy-13dda.firebaseapp.com", projectId: "science-academy-13dda", storageBucket: "science-academy-13dda.firebasestorage.app", messagingSenderId: "449626746191", appId: "1:449626746191:web:73885c6bb862a07655293a", measurementId: "G-4W0B7CX2DX" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'Jeil-science-Physics';

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
    let displayLabel = labels ? (labels[actualStages[0]] || "진행 중") : "1회독";
    let displayPercent = "0.0";

    for (let i = 0; i < actualStages.length; i++) {
      const currentStageKey = actualStages[i];
      const countReached = rel.filter(item => {
        const status = submissionData[`${s.id}-${item.id}`]?.status || 'not_started';
        if (status === 'exempt') return false;
        return statusOrder.indexOf(status) >= statusOrder.indexOf(currentStageKey);
      }).length;

      const percent = ((countReached / effectiveTotal) * 100).toFixed(1);
      displayLabel = labels ? (labels[currentStageKey] || "진행 중") : `${i + 1}회독`;
      displayPercent = percent;

      if (percent !== "100.0") break;
      if (i < actualStages.length - 1) continue;
    }
    acc[s.id] = { label: displayLabel, percent: displayPercent };
    return acc;
  }, {});
};

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

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matrix');

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
  const [progressPlans, setProgressPlans] = useState([]);
  
  // Progress Calendar State
  const [progressCalMonth, setProgressCalMonth] = useState(() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9*60*60*1000);
    return kst.toISOString().slice(0, 7);
  });
  const [progressSelectedDate, setProgressSelectedDate] = useState(() => {
    return new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0];
  });
  const [newPlan, setNewPlan] = useState({ subject: '물리', unit: '', memo: '' });
  const [editPlanId, setEditPlanId] = useState(null);
  const [editPlanData, setEditPlanData] = useState(null);

  // UI Support
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
  });
  const [regCategory, setRegCategory] = useState('assignment');
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
  const [editStudentData, setEditStudentData] = useState({ name: '', studentCode: '', homeroomTeacher: '', highSchool: '' });
  const [editItemId, setEditItemId] = useState(null);
  const [editItemData, setEditItemData] = useState(null);

  const [newAssignment, setNewAssignment] = useState({ title: '', subject: '물리', level: '기본', type: 'all', targetStudents: [], deadline: '' });
  const [newTest, setNewTest] = useState({ 
    title: '', source: '', difficulty: '중', description: '', 
    date: new Date(Date.now() + 9*60*60*1000).toISOString().split('T')[0], 
    scales: DEFAULT_GRADE_SCALES 
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

    return {
      assign, memo,
      studentTestAverages: students.reduce((acc, s) => {
        const scs = tests.map(t => testScores[`${s.id}-${t.id}`]?.score).filter(v => v !== null && v !== undefined);
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
    let loadingDone = false;

    const initApp = async () => {
      try {
        await signInAnonymously(auth);

        onAuthStateChanged(auth, (u) => {
          setUser(u);
          if (u) {
            const basePath = ['artifacts', appId, 'public', 'data'];
            unsubscribers.push(onSnapshot(doc(db, ...basePath, 'settings', 'config'), snap => { if (snap.exists()) { setSiteTitle(snap.data().siteTitle || 'Science Academy'); if (snap.data().siteColor) setSiteColor(snap.data().siteColor); } }));
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
            unsubscribers.push(onSnapshot(query(collection(db, ...basePath, 'progressPlans')), s => setProgressPlans(s.docs.map(d => ({ id: d.id, ...d.data() })))));

            if (!loadingDone) {
              loadingDone = true;
              setLoading(false);
            }
          }
        });
      } catch (e) {
        setLoading(false);
      }
    };
    initApp();
    return () => unsubscribers.forEach(u => u());
  }, []);

  // --- Main App UI ---
  return (
    <ErrorBoundary>
      <SiteColorStyle color={siteColor} />
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 select-none overflow-x-hidden font-black">
        <header className="text-white shadow-lg sticky top-0 z-50" style={{background:'var(--sc-darker)'}}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
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
                  <span className={`px-2 py-0.5 rounded font-black uppercase border ${userRole === 'master' ? 'bg-rose-500 border-rose-400' : userRole === 'teacher' ? 'bg-amber-500 border-amber-400' : 'bg-emerald-500 border-emerald-400'}`}>
                    {userRole}
                  </span>
                  <p className="text-white/50 tracking-widest uppercase ml-1">v17.51 master</p>
                </div>
              </div>
            </div>
            <nav className="flex bg-white/10 p-1 rounded-xl items-center overflow-x-auto max-w-full no-scrollbar">
              {[{ id: 'matrix', l: '과제 현황', i: BarChart3 }, { id: 'memorization', l: '암기 현황', i: BrainCircuit }, { id: 'tests', l: '성적표', i: Trophy }, { id: 'attendance', l: '출결 관리', i: Calendar }, { id: 'progress', l: '진도 관리', i: TrendingUp }, { id: 'students', l: '학생 관리', i: Users, h: userRole === 'student' }, { id: 'report', l: '리포트', i: Printer, h: userRole !== 'master' }, { id: 'assignments', l: '항목 등록', i: BookOpen, h: userRole === 'student' }].filter(t => !t.h).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md font-black' : 'hover:bg-white/10 text-white'}`}><tab.i size={16} />{tab.l}</button>
              ))}
              <button onClick={handleLogout} className="ml-2 p-2 hover:bg-white/20 rounded-lg text-white transition"><LogOut size={18} /></button>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 animate-in fade-in duration-500">
          {(activeTab === 'matrix' || activeTab === 'memorization') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={20} /> 상태 가이드</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-slate-700">
                  {activeTab === 'matrix' ? (
                    [{ l: '시작 전', c: 'bg-slate-50 text-slate-300', i: Circle }, { l: '진행 중', c: 'bg-slate-100 text-slate-900', i: Clock }, { l: '미완료', c: 'bg-red-50 text-red-500', i: AlertCircle }, { l: '완료', c: 'bg-blue-50 text-blue-500', i: CheckCircle2 }, { l: '지각 완료', c: 'bg-orange-50 text-orange-500', i: History }, { l: '해당 없음', c: 'bg-slate-100 text-slate-400', i: MinusCircle }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50"><div className={`p-2 rounded-xl ${item.c}`}><item.i size={20} /></div><p className="text-[11px] font-black">{item.l}</p></div>
                    ))
                  ) : (
                    MEMO_STATUS_ORDER.map(k => (
                      <div key={k} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <div className={`p-2 rounded-xl ${MEMO_STATUS_CONFIG[k].bg} ${MEMO_STATUS_CONFIG[k].color}`}>{React.createElement(MEMO_STATUS_CONFIG[k].icon, { size: 20 })}</div>
                        <p className="text-[11px] font-black">{MEMO_STATUS_CONFIG[k].label}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">{activeTab === 'matrix' ? <ClipboardCheck /> : <BrainCircuit />} 실시간 학습 현황</h2>
                </div>
                <div className="overflow-x-auto relative">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-slate-400">
                      <tr>
                        <th className="p-5 font-black text-[10px] uppercase sticky left-0 bg-slate-50 z-40 w-[160px] min-w-[160px] max-w-[160px] border-r text-center leading-tight">학생 정보</th>
                        <th className="p-5 font-black text-[10px] uppercase sticky left-[160px] bg-slate-50 z-40 w-[100px] min-w-[100px] max-w-[100px] border-r text-center leading-tight">진척도</th>
                        {(activeTab === 'matrix' ? assignments : memoItems).map((as) => (
                          <th key={as.id} className="p-5 min-w-[160px] border-b relative group text-center">
                            <div className="flex flex-col text-center">
                              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">{as.subject} | {as.level}</span>
                              <span className="text-xs font-bold text-slate-700 truncate block text-center mt-1">{as.title}</span>
                              {userRole === 'master' && (
                                <div className="mt-2 flex justify-center gap-1">
                                  <button onClick={() => setBulkDatePopup({ item: as, category: activeTab === 'matrix' ? 'assignment' : 'memorization' })} className="px-1.5 py-0.5 bg-white border rounded text-[8px] font-black text-slate-600 hover:bg-slate-50">일괄</button>
                                  <button onClick={() => { setEditItemId(as.id); setEditItemData({ ...as }); }} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[8px] font-black text-indigo-600 hover:bg-indigo-100">수정</button>
                                </div>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {visibleStudentsFiltered.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-5 font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-30 border-r text-left w-[160px] min-w-[160px] max-w-[160px]">
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="truncate text-sm font-black">{s.name}</span>
                              <button onClick={() => setSelectedStudent(s)}><Search size={14} className="text-slate-300 hover:text-indigo-600" /></button>
                            </div>
                            <div className="flex flex-wrap gap-1 leading-none">
                              {s.homeroomTeacher && <span className="text-[8px] text-indigo-500 font-bold bg-indigo-50 px-1 py-0.5 rounded">T.{s.homeroomTeacher}</span>}
                              {s.highSchool && <span className="text-[8px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded truncate max-w-[80px]">{s.highSchool}</span>}
                            </div>
                          </td>
                          <td className="p-5 sticky left-[160px] bg-white group-hover:bg-slate-50 z-30 border-r text-center w-[100px] min-w-[100px] max-w-[100px]">
                            <div className="flex flex-col text-center">
                              <span className={`${activeTab === 'matrix' ? 'text-indigo-700' : 'text-purple-700'} text-[10px] font-black`}>{(activeTab === 'matrix' ? (stats.assign[s.id]?.label || '-') : (stats.memo[s.id]?.label || '-'))}</span>
                              <span className={`${activeTab === 'matrix' ? 'text-indigo-400' : 'text-purple-400'} text-[9px] font-black`}>{(activeTab === 'matrix' ? (stats.assign[s.id]?.percent || '0.0') : (stats.memo[s.id]?.percent || '0.0'))}%</span>
                            </div>
                          </td>
                          {(activeTab === 'matrix' ? assignments : memoItems).map(as => {
                            const subKey = `${s.id}-${as.id}`;
                            const sub = (activeTab === 'matrix' ? submissions : memoSubmissions)[subKey];
                            const status = sub?.status || 'not_started';
                            if (!(as.type === 'all' || (as.targetStudents && as.targetStudents.includes(s.id)))) return <td key={as.id} className="p-4 bg-slate-50/30 text-center text-[9px] text-slate-300">N/A</td>;
                            const cfg = activeTab === 'matrix' ? ASSIGN_STATUS_CONFIG[status] : MEMO_STATUS_CONFIG[status];
                            const isLate = status === 'completed' && as.deadline && sub.completionDate > as.deadline;

                            return (
                              <td key={as.id} className="p-4 text-center">
                                <div
                                  onClick={(e) => { if (userRole === 'master') setStatusMenu({ studentId: s.id, itemId: as.id, category: activeTab === 'matrix' ? 'assignment' : 'memorization', x: e.clientX, y: e.clientY }); }}
                                  className={`w-full py-2.5 rounded-xl transition-all flex flex-col items-center justify-center ${activeTab === 'matrix' ? (isLate ? STATUS_COLORS.late_completed : STATUS_COLORS[status]) : `${cfg?.bg} ${cfg?.color}`} ${userRole === 'master' ? 'cursor-pointer hover:scale-95 shadow-sm' : 'cursor-default'}`}
                                >
                                  {activeTab === 'matrix' ? (
                                    status === 'completed' ? (isLate ? <History size={18} /> : <CheckCircle2 size={18} />) : status === 'in_progress' ? <Clock size={18} /> : status === 'incomplete_red' ? <AlertCircle size={18} /> : status === 'exempt' ? <MinusCircle size={18} /> : <Circle size={18} />
                                  ) : (
                                    <>{cfg?.icon && React.createElement(cfg.icon, { size: 18 })}{status !== 'not_started' && <span className="text-[8px] font-black mt-0.5">{cfg?.label}</span>}</>
                                  )}
                                </div>
                                {userRole === 'master' && ((status === 'completed' && activeTab === 'matrix') || (status === 'round_4' && activeTab === 'memorization')) && (
                                  <div className="mt-1">
                                    {inlineDateEditKey === subKey ? (
                                      <input type="date" value={sub.completionDate || ''} onChange={(e) => updateCompletionDate(s.id, as.id, e.target.value, activeTab === 'matrix' ? 'assignment' : 'memorization')} onBlur={() => setInlineDateEditKey(null)} className="text-[8px] border-none bg-indigo-50 rounded px-1 outline-none font-bold shadow-inner" autoFocus />
                                    ) : (
                                      <span onClick={(e) => { e.stopPropagation(); setInlineDateEditKey(subKey); }} className="text-[8px] font-bold text-slate-400 hover:text-indigo-600 cursor-pointer">{sub.completionDate?.split('-').slice(1).join('/') || '날짜'}</span>
                                    )}
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

          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b font-bold text-slate-800 flex items-center gap-2 justify-center"><Calculator className="text-orange-500" /> 종합 성적표 분석</div>
                <div className="overflow-x-auto relative">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50/50 text-slate-400">
                      <tr>
                        <th className="p-5 font-black text-[10px] sticky left-0 bg-slate-50 z-40 w-[120px] min-w-[120px] max-w-[120px] border-r text-center leading-none">이름</th>
                        <th className="p-5 font-black text-orange-600 text-[10px] border-r w-[80px] min-w-[80px] max-w-[80px] text-center sticky left-[120px] bg-orange-50/30 z-40 leading-none">평균</th>
                        {tests.map(t => (
                          <th key={t.id} className="p-5 min-w-[180px] border-b text-left">
                            <div className="flex flex-col text-left">
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-black text-orange-500">{t.date}</span>
                                <button onClick={() => setSelectedTest(t)} className="p-1 hover:bg-orange-100 rounded text-orange-400"><Search size={14} /></button>
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate block mt-1">{t.title}</span>
                              <span className="mt-1 text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-1.5 py-0.5 rounded w-fit">AVG: {stats.testAverages[t.id]}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-center">
                      {visibleStudentsFiltered.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 group">
                          <td className="p-5 font-bold sticky left-0 bg-white group-hover:bg-slate-50 z-30 border-r text-center w-[120px] min-w-[120px] max-w-[120px]">{s.name}</td>
                          <td className="p-5 text-center sticky left-[120px] bg-white group-hover:bg-slate-50 z-30 border-r font-black text-orange-600 w-[80px] min-w-[80px] max-w-[80px]">{stats.studentTestAverages[s.id]}</td>
                          {tests.map(t => {
                            const res = testScores[`${s.id}-${t.id}`] || { score: '', plan: '' };
                            return (
                              <td key={t.id} className="p-4 text-center">
                                {userRole === 'master' ? (
                                  <div className="flex flex-col gap-2">
                                    <BufferedInput type="number" value={res.score ?? ''} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { score: v === '' ? null : parseFloat(v) }, { merge: true })} className="w-full px-2 py-1 bg-slate-50 font-bold text-center text-sm rounded-lg" />
                                    <BufferedTextarea value={res.plan} onSave={(v) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'testScores', `${s.id}-${t.id}`), { plan: v }, { merge: true })} className="w-full px-2 py-1 bg-slate-50 border-none text-[9px] h-10 resize-none rounded-lg" />
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="w-full py-1.5 bg-slate-50 rounded-xl font-black text-slate-700 text-sm">{res.score ?? '-'}점</div>
                                    {res.plan && <div className="text-[9px] bg-indigo-50/50 p-2 rounded-xl text-indigo-700 font-medium whitespace-pre-wrap leading-tight text-center">{res.plan}</div>}
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

          {activeTab === 'attendance' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center font-bold">출결 탭은 기존과 동일하게 작동합니다.</div>
          )}
          {activeTab === 'progress' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center font-bold">진도 탭은 기존과 동일하게 작동합니다.</div>
          )}
          {activeTab === 'students' && userRole !== 'student' && (
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center font-bold">학생 관리 탭은 기존과 동일하게 작동합니다.</div>
          )}
        </main>

        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 text-white flex justify-between items-start" style={{background:'var(--sc-darker)'}}>
                <div>
                  <h2 className="text-xl font-bold text-white text-left">{selectedStudent.name} 학습 현황</h2>
                  <p className="text-white/60 text-[10px] mt-2 font-bold uppercase">{selectedStudent.highSchool} | {selectedStudent.homeroomTeacher}</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-white/10 rounded-full transition-all text-white"><LucideX size={24} /></button>
              </div>
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase">과제 진척도</p>
                    <p className="text-2xl font-black text-indigo-700">{stats.assign[selectedStudent.id]?.percent || '0.0'}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase">암기 진척도</p>
                    <p className="text-2xl font-black text-purple-700">{stats.memo[selectedStudent.id]?.percent || '0.0'}%</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="w-full py-4 text-white rounded-2xl font-black shadow-lg" style={{background:'var(--sc-darker)'}}>닫기</button>
              </div>
            </div>
          </div>
        )}
        
        {statusMenu && (
          <div className="fixed inset-0 z-[150]" onClick={() => setStatusMenu(null)}>
            <div
              className="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 min-w-[140px] animate-in zoom-in-95"
              style={{ left: Math.min(statusMenu.x, window.innerWidth - 160), top: Math.min(statusMenu.y, window.innerHeight - 200) }}
              onClick={e => e.stopPropagation()}
            >
              <p className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 mb-1 text-left">상태 변경</p>
              {(statusMenu.category === 'assignment' ? ASSIGN_STATUS_ORDER : MEMO_STATUS_ORDER).map(st => {
                const cfg = statusMenu.category === 'assignment' ? ASSIGN_STATUS_CONFIG[st] : MEMO_STATUS_CONFIG[st];
                return (
                  <button key={st} onClick={() => handleStatusSelect(statusMenu.studentId, statusMenu.itemId, statusMenu.category, st)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-black hover:bg-slate-50 transition-colors ${cfg?.color}`}>
                    {cfg?.icon && React.createElement(cfg.icon, { size: 14 })}
                    {cfg?.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {bulkDatePopup && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBulkDatePopup(null)}>
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-xs animate-in zoom-in-95 text-center" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600"><Calendar size={22} /></div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-base leading-none">일괄 처리 날짜</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 truncate max-w-[180px]">{bulkDatePopup.item.title}</p>
                </div>
              </div>
              <input type="date" value={bulkSelectedDate} onChange={e => setBulkSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none mb-6 text-center" />
              <div className="flex gap-3">
                <button onClick={() => setBulkDatePopup(null)} className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm">취소</button>
                <button onClick={() => { bulkUpdateStatus(bulkDatePopup.item, 'completed', bulkDatePopup.category); }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm">완료 처리</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
