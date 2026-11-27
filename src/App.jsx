import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon, Users, Store, TrendingUp, Clock, Lock, Unlock,
  LogOut, Plus, Trash2, CheckCircle2, XCircle, Edit3, KeyRound, ChevronLeft,
  ChevronRight, AlertCircle, ShieldCheck, UserCheck, FileSpreadsheet,
  Download, Upload, ShieldAlert, Send, RotateCcw, BarChart3, UserX, ArrowUpDown,
  ArrowUp, ArrowDown, TableProperties, Sparkles, Check, RefreshCw
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC6lKdyHGnSdT--gPtM-QwyQGhSIXuPmlw",
  authDomain: "dfs-schedule.firebaseapp.com",
  projectId: "dfs-schedule",
  storageBucket: "dfs-schedule.firebasestorage.app",
  messagingSenderId: "756200854904",
  appId: "1:756200854904:web:7e71618eb5226053c4a48d",
  measurementId: "G-B9PT8T3GQH"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const APP_DOC_REF = doc(db, 'retail_management', 'dfs_schedule_v1');

const DEFAULT_STORES = [
  { id: 'store_1', name: '신라면세점 T2', targetSales: 120000 },
  { id: 'store_2', name: '롯데면세점 월드타워', targetSales: 80000 },
  { id: 'store_3', name: '롯데면세점 부산본점', targetSales: 90000 },
  { id: 'store_4', name: '신라면세점 서울점', targetSales: 95000 },
  { id: 'store_5', name: '신라면세점 T1', targetSales: 85000 },
  { id: 'store_6', name: '신세계면세점 명동점', targetSales: 75000 },
  { id: 'store_7', name: '신세계면세점 T2', targetSales: 105000 }
];

const DEFAULT_STAFF = [
  { id: 'staff_1', name: '김정수', storeId: 'store_1', role: '매니저', pin: '1111', annualLeave: 10, grantedLeave: 10, hireDate: '2023-03-01', status: 'ACTIVE' },
  { id: 'staff_2', name: '전세이', storeId: 'store_1', role: '시니어', pin: '1112', annualLeave: 15, grantedLeave: 15, hireDate: '2023-05-01', status: 'ACTIVE' },
  { id: 'staff_3', name: '유은혜', storeId: 'store_1', role: '시니어', pin: '1113', annualLeave: 14, grantedLeave: 14, hireDate: '2023-07-01', status: 'ACTIVE' },
  { id: 'staff_4', name: '김민진', storeId: 'store_1', role: '시니어', pin: '1114', annualLeave: 15, grantedLeave: 15, hireDate: '2023-08-01', status: 'ACTIVE' },
  { id: 'staff_5', name: '현재용', storeId: 'store_1', role: '시니어', pin: '1115', annualLeave: 8, grantedLeave: 8, hireDate: '2024-02-01', status: 'ACTIVE' },
  { id: 'staff_6', name: '방시현', storeId: 'store_1', role: '시니어', pin: '1116', annualLeave: 15, grantedLeave: 15, hireDate: '2023-04-01', status: 'ACTIVE' },
  { id: 'staff_7', name: '정욱연', storeId: 'store_1', role: '시니어', pin: '1117', annualLeave: 15, grantedLeave: 15, hireDate: '2023-06-01', status: 'ACTIVE' },
  { id: 'staff_8', name: '김지호', storeId: 'store_1', role: '시니어', pin: '1118', annualLeave: 14, grantedLeave: 14, hireDate: '2023-09-01', status: 'ACTIVE' },
  { id: 'staff_9', name: '장정은', storeId: 'store_1', role: 'TF팀장', pin: '1119', annualLeave: 18, grantedLeave: 18, hireDate: '2022-03-01', status: 'ACTIVE' },
  { id: 'staff_10', name: '이희원', storeId: 'store_1', role: '아르바이트', pin: '1120', annualLeave: 0, grantedLeave: 0, hireDate: '2026-01-01', status: 'ACTIVE' },
  { id: 'staff_11', name: '김보영', storeId: 'store_1', role: '아르바이트', pin: '1121', annualLeave: 0, grantedLeave: 0, hireDate: '2026-02-01', status: 'ACTIVE' },
  { id: 'staff_12', name: '정지윤', storeId: 'store_1', role: '사원', pin: '1122', annualLeave: 0, grantedLeave: 0, hireDate: '2026-03-01', status: 'ACTIVE' },

  { id: 'staff_13', name: '이용필', storeId: 'store_2', role: '매니저', pin: '2221', annualLeave: 16, grantedLeave: 16, hireDate: '2022-05-01', status: 'ACTIVE' },
  { id: 'staff_14', name: '정은경', storeId: 'store_2', role: '아르바이트', pin: '2222', annualLeave: 0, grantedLeave: 0, hireDate: '2026-01-01', status: 'ACTIVE' },

  { id: 'staff_15', name: '전상일', storeId: 'store_3', role: '매니저', pin: '3331', annualLeave: 16, grantedLeave: 16, hireDate: '2022-04-01', status: 'ACTIVE' },
  { id: 'staff_16', name: '이선인', storeId: 'store_3', role: '아르바이트', pin: '3332', annualLeave: 15, grantedLeave: 15, hireDate: '2024-01-01', status: 'ACTIVE' },
  { id: 'staff_17', name: '김소연', storeId: 'store_3', role: '아르바이트', pin: '3333', annualLeave: 5, grantedLeave: 5, hireDate: '2025-06-01', status: 'ACTIVE' },

  { id: 'staff_18', name: '조금화', storeId: 'store_4', role: '매니저', pin: '4441', annualLeave: 18, grantedLeave: 18, hireDate: '2022-01-01', status: 'ACTIVE' },
  { id: 'staff_19', name: '우애청', storeId: 'store_4', role: '사원', pin: '4442', annualLeave: 0, grantedLeave: 0, hireDate: '2026-04-01', status: 'ACTIVE' },
  { id: 'staff_20', name: '김단', storeId: 'store_4', role: '아르바이트', pin: '4443', annualLeave: 6, grantedLeave: 6, hireDate: '2025-05-01', status: 'ACTIVE' },
  { id: 'staff_21', name: '한홍매', storeId: 'store_4', role: '아르바이트', pin: '4444', annualLeave: 2, grantedLeave: 2, hireDate: '2025-09-01', status: 'ACTIVE' },
  { id: 'staff_22', name: '오지원', storeId: 'store_4', role: '아르바이트', pin: '4445', annualLeave: 8, grantedLeave: 8, hireDate: '2025-03-01', status: 'ACTIVE' },

  { id: 'staff_23', name: '진윤희', storeId: 'store_5', role: '매니저', pin: '5551', annualLeave: 15, grantedLeave: 15, hireDate: '2023-02-01', status: 'ACTIVE' },
  { id: 'staff_24', name: '이효숙', storeId: 'store_5', role: '사원', pin: '5552', annualLeave: 15, grantedLeave: 15, hireDate: '2023-03-01', status: 'ACTIVE' },
  { id: 'staff_25', name: '전춘희', storeId: 'store_5', role: '사원', pin: '5553', annualLeave: 15, grantedLeave: 15, hireDate: '2023-04-01', status: 'ACTIVE' },
  { id: 'staff_26', name: '이시우', storeId: 'store_5', role: '사원', pin: '5554', annualLeave: 7, grantedLeave: 7, hireDate: '2025-04-01', status: 'ACTIVE' },
  { id: 'staff_27', name: '장혜원', storeId: 'store_5', role: '슈퍼바이저', pin: '5555', annualLeave: 16, grantedLeave: 16, hireDate: '2022-08-01', status: 'ACTIVE' },

  { id: 'staff_28', name: '문제리', storeId: 'store_6', role: '매니저', pin: '6661', annualLeave: 14, grantedLeave: 14, hireDate: '2023-07-01', status: 'ACTIVE' },
  { id: 'staff_29', name: '오지원', storeId: 'store_6', role: '사원', pin: '6662', annualLeave: 13, grantedLeave: 13, hireDate: '2023-10-01', status: 'ACTIVE' },

  { id: 'staff_30', name: '홍인호', storeId: 'store_7', role: '매니저', pin: '7771', annualLeave: 8, grantedLeave: 8, hireDate: '2024-08-01', status: 'ACTIVE' },
  { id: 'staff_31', name: '박은빈', storeId: 'store_7', role: '사원', pin: '7772', annualLeave: 11, grantedLeave: 11, hireDate: '2024-05-01', status: 'ACTIVE' },
  { id: 'staff_32', name: '유하나', storeId: 'store_7', role: '사원', pin: '7773', annualLeave: 6, grantedLeave: 6, hireDate: '2025-05-01', status: 'ACTIVE' },
  { id: 'staff_33', name: '구영주', storeId: 'store_7', role: '사원', pin: '7774', annualLeave: 2, grantedLeave: 2, hireDate: '2025-10-01', status: 'ACTIVE' },
  { id: 'staff_34', name: '장은선', storeId: 'store_7', role: '아르바이트', pin: '7775', annualLeave: 4, grantedLeave: 4, hireDate: '2025-07-01', status: 'ACTIVE' }
];

const FIXED_HOLIDAYS = new Set([
  '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30', '2025-03-01', '2025-03-03',
  '2025-05-05', '2025-05-06', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-05',
  '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09', '2025-12-25',
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-01', '2026-03-02',
  '2026-05-05', '2026-05-24', '2026-05-25', '2026-06-06', '2026-08-15', '2026-08-17',
  '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-05', '2026-10-09',
  '2026-12-25',
  '2027-01-01', '2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09', '2027-03-01',
  '2027-05-05', '2027-05-13', '2027-06-06', '2027-08-15', '2027-08-16', '2027-09-14',
  '2027-09-15', '2027-09-16', '2027-10-03', '2027-10-04', '2027-10-09', '2027-10-11',
  '2027-12-25'
]);

const isRedDayDateStr = (dateStr, dayOfWeek) => {
  return dayOfWeek === 0 || dayOfWeek === 6 || FIXED_HOLIDAYS.has(dateStr);
};

const isStaffHiddenOnDate = (staff, dateStr) => {
  if (!staff || !dateStr) return false;
  if (staff.status === 'RESIGNED' && staff.resignedAt) {
    return dateStr > staff.resignedAt;
  }
  return false;
};

const WORK_GROUPS = ['A조', 'A+', 'B조', 'B+', 'C조', 'C+', 'F조'];
const BASE_WORK_GROUPS = ['A조', 'B조', 'C조', 'F조'];
const OVERTIME_CODES = ['A+', 'B+', 'C+'];
const AUTO_WORK_GROUPS = ['A조', 'C조'];
const ROLE_OPTIONS = ['TF팀장', '슈퍼바이저', '매니저', '시니어', '사원', '아르바이트'];

const isWorkCode = (code) => WORK_GROUPS.includes(code);
const isOvertimeCode = (code) => OVERTIME_CODES.includes(code);

const normalizeBaseGroup = (code) => {
  if (code === 'A조' || code === 'A+') return 'A조';
  if (code === 'B조' || code === 'B+') return 'B조';
  if (code === 'C조' || code === 'C+') return 'C조';
  if (code === 'F조') return 'F조';
  return null;
};

const SHIFT_TYPES = [
  { code: 'A조', label: 'A조 근무', color: 'bg-sky-100 text-sky-800 border-sky-200', isWork: true },
  { code: 'A+', label: 'A조 연장', color: 'bg-sky-200 text-sky-950 border-sky-400', isWork: true },
  { code: 'B조', label: 'B조 근무', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', isWork: true },
  { code: 'B+', label: 'B조 연장', color: 'bg-indigo-200 text-indigo-950 border-indigo-400', isWork: true },
  { code: 'C조', label: 'C조 근무', color: 'bg-purple-100 text-purple-800 border-purple-200', isWork: true },
  { code: 'C+', label: 'C조 연장', color: 'bg-purple-200 text-purple-950 border-purple-400', isWork: true },
  { code: 'F조', label: 'F조 근무', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', isWork: true },
  { code: '휴무', label: '정기휴무', color: 'bg-slate-100 text-slate-600 border-slate-200', isWork: false },
  { code: '연차', label: '연차휴가', color: 'bg-amber-100 text-amber-800 border-amber-200', isWork: false },
  { code: '반차', label: '반차', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', isWork: false }
];

const normalizeImportedShiftCode = (rawVal) => {
  const cleaned = String(rawVal ?? '').trim().replace(/\s+/g, '');
  if (!cleaned || cleaned === '-') return '';
  const upper = cleaned.toUpperCase();
  const aliasMap = {
    'A': 'A조', 'A조': 'A조', 'A+': 'A+', 'A조+': 'A+',
    'B': 'B조', 'B조': 'B조', 'B+': 'B+', 'B조+': 'B+',
    'C': 'C조', 'C조': 'C조', 'C+': 'C+', 'C조+': 'C+',
    'F': 'F조', 'F조': 'F조',
    '휴': '휴무', '휴무': '휴무', 'OFF': '휴무',
    '연': '연차', '연차': '연차',
    '반': '반차', '반차': '반차', '오전반차': '반차', '오후반차': '반차'
  };
  return aliasMap[upper] || null;
};

const parseCsvRows = (text) => {
  const content = String(text || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
};

const getLeaveCost = (type) => {
  if (type === '연차') return 1;
  if (type === '반차') return 0.5;
  return 0;
};

const parseScheduleKey = (key) => {
  if (!key || key.length < 12 || key[10] !== '_') return null;
  return {
    dateStr: key.slice(0, 10),
    staffId: key.slice(11)
  };
};

const formatUsd = (val) => {
  const num = Math.round(Number(val) || 0);
  return '$' + num.toLocaleString();
};

const formatQty = (val) => {
  const num = Number(val) || 0;
  return Number.isInteger(num) ? num.toLocaleString() : num.toFixed(1);
};

const formatDays = (val) => {
  const num = Number(val) || 0;
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
};

const formatHireYearMonth = (hireDateStr) => {
  if (!hireDateStr) return '-';
  const parts = String(hireDateStr).split('-').filter(Boolean);
  if (parts.length >= 2) {
    return parts[0] + '-' + String(parts[1]).padStart(2, '0');
  }
  return String(hireDateStr);
};

const calculateEarnedLeaveByHireYearMonth = (hireDateStr, referenceDate = new Date()) => {
  if (!hireDateStr) return null;
  const parts = String(hireDateStr).split('-').map(Number);
  const hireYear = parts[0];
  const hireMonth = parts[1];
  if (!hireYear || !hireMonth || hireMonth < 1 || hireMonth > 12) return null;

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;

  const totalMonthsDiff = (refYear - hireYear) * 12 + (refMonth - hireMonth);
  if (totalMonthsDiff < 0) {
    return {
      earned: 0,
      monthsWorked: 0,
      yearsWorked: 0,
      hireYear,
      hireMonth,
      yearMonthLabel: hireYear + '-' + String(hireMonth).padStart(2, '0'),
      mode: 'UNDER_1Y'
    };
  }

  const fullMonths = totalMonthsDiff;

  if (fullMonths < 12) {
    const monthlyLeave = Math.min(11, fullMonths);
    return {
      earned: monthlyLeave,
      monthsWorked: fullMonths,
      yearsWorked: 0,
      hireYear,
      hireMonth,
      yearMonthLabel: hireYear + '-' + String(hireMonth).padStart(2, '0'),
      mode: 'UNDER_1Y'
    };
  }

  const yearsWorked = Math.floor(fullMonths / 12);
  const extraDays = Math.min(10, Math.max(0, Math.floor((yearsWorked - 1) / 2)));
  const annualDays = Math.min(25, 15 + extraDays);

  return {
    earned: annualDays,
    monthsWorked: fullMonths,
    yearsWorked,
    hireYear,
    hireMonth,
    yearMonthLabel: hireYear + '-' + String(hireMonth).padStart(2, '0'),
    mode: 'OVER_1Y'
  };
};

export default function App() {
  const [fbReady, setFbReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('연결 중...');
  const [adminPin, setAdminPin] = useState('0000');
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [stores, setStores] = useState(DEFAULT_STORES);
  const [staffList, setStaffList] = useState(DEFAULT_STAFF);
  const [schedules, setSchedules] = useState({});
  const [scheduleApprovals, setScheduleApprovals] = useState({});
  const [salesRecords, setSalesRecords] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [loginMode, setLoginMode] = useState('staff');
  const [selectedAdminId, setSelectedAdminId] = useState('MASTER');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedStoreId, setSelectedStoreId] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 11, 1));

  const [sortField, setSortField] = useState('totalAllocatedRounded');
  const [sortDirection, setSortDirection] = useState('desc');

  const [autoTargetStoreId, setAutoTargetStoreId] = useState('store_1');
  const [autoDraftSchedule, setAutoDraftSchedule] = useState({});
  const [autoAnalysisMeta, setAutoAnalysisMeta] = useState(null);
  const [autoNotice, setAutoNotice] = useState('');

  const [resignModalStaff, setResignModalStaff] = useState(null);
  const [resignDateInput, setResignDateInput] = useState('2026-11-27');

  const scheduleFileInputRef = useRef(null);
  const [scheduleImportFeedback, setScheduleImportFeedback] = useState(null);

  useEffect(() => {
    let unsubscribeSnapshot = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          setSyncStatus('인증 오류');
        }
        return;
      }
      setFbReady(true);
      unsubscribeSnapshot = onSnapshot(APP_DOC_REF, async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.adminPin) setAdminPin(data.adminPin);
          if (data.adminAccounts) setAdminAccounts(data.adminAccounts);
          if (data.stores && data.stores.length > 0) setStores(data.stores);
          if (data.staffList && data.staffList.length > 0) setStaffList(data.staffList);
          if (data.schedules) setSchedules(data.schedules);
          if (data.scheduleApprovals) setScheduleApprovals(data.scheduleApprovals);
          if (data.salesRecords) setSalesRecords(data.salesRecords);
          if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
          setSyncStatus('클라우드 실시간 동기화됨');
        } else {
          await setDoc(APP_DOC_REF, {
            adminPin: '0000',
            adminAccounts: [],
            stores: DEFAULT_STORES,
            staffList: DEFAULT_STAFF,
            schedules: {},
            scheduleApprovals: {},
            salesRecords: {},
            leaveRequests: []
          });
          setSyncStatus('초기 데이터 생성 완료');
        }
      });
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const saveToCloud = async (partialData) => {
    try {
      setSyncStatus('저장 중...');
      await setDoc(APP_DOC_REF, partialData, { merge: true });
      setSyncStatus('클라우드 실시간 동기화됨');
    } catch (err) {
      setSyncStatus('저장 실패');
    }
  };

  const handleSyncDefaultRosterToCloud = async () => {
    if (
      !window.confirm(
        '실제 7개 매장 및 34명 직원 명단으로 클라우드를 동기화하시겠습니까?\n기존 스케줄/매출/휴가 기록은 유지됩니다.'
      )
    ) {
      return;
    }
    setStores(DEFAULT_STORES);
    setStaffList(DEFAULT_STAFF);
    setAutoTargetStoreId('store_1');
    setAutoDraftSchedule({});
    setAutoAnalysisMeta(null);
    setAutoNotice('');
    await saveToCloud({ stores: DEFAULT_STORES, staffList: DEFAULT_STAFF });
    alert('7개 매장 및 34명 직원 데이터가 동기화되었습니다.');
  };

  const isAdmin = currentUser?.role === 'admin';
  const adminDisplayName = isAdmin ? currentUser.adminName || '본사 관리자' : '';

  const activeStaffProfile = useMemo(() => {
    if (currentUser?.role !== 'staff') return null;
    return staffList.find((s) => s.id === currentUser.staff.id) || currentUser.staff;
  }, [currentUser, staffList]);

  const isManager = !isAdmin && activeStaffProfile?.role === '매니저';
  const myStoreObj = !isAdmin ? stores.find((s) => s.id === activeStaffProfile?.storeId) : null;

  useEffect(() => {
    if (!currentUser) return;
    if (isAdmin) {
      if (selectedStoreId && selectedStoreId !== 'ALL') {
        setAutoTargetStoreId(selectedStoreId);
      } else if (!autoTargetStoreId && stores[0]) {
        setAutoTargetStoreId(stores[0].id);
      }
    } else if (activeStaffProfile?.storeId) {
      setAutoTargetStoreId(activeStaffProfile.storeId);
    }
  }, [currentUser, isAdmin, selectedStoreId, stores, activeStaffProfile, autoTargetStoreId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthPrefix = year + '-' + String(month + 1).padStart(2, '0');

  const daysInMonth = useMemo(() => {
    const total = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(year, month, i + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = yyyy + '-' + mm + '-' + dd;
      const dayOfWeek = d.getDay();
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return {
        dateStr,
        day: i + 1,
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        isRedDay: isRedDayDateStr(dateStr, dayOfWeek)
      };
    });
  }, [year, month]);

  const monthRedDayCount = useMemo(
    () => daysInMonth.filter((d) => d.isRedDay).length,
    [daysInMonth]
  );

  const activeStaffList = useMemo(
    () => staffList.filter((s) => s.status !== 'RESIGNED'),
    [staffList]
  );

  const scheduleVisibleStaffList = useMemo(() => {
    return staffList.filter((stf) => {
      if (stf.status !== 'RESIGNED') return true;
      if (!stf.resignedAt) return false;
      const resignMonthPrefix = String(stf.resignedAt).slice(0, 7);
      return resignMonthPrefix >= currentMonthPrefix;
    });
  }, [staffList, currentMonthPrefix]);

  const leaveSummaryByStaff = useMemo(() => {
    const map = {};
    staffList.forEach((stf) => {
      const calc = calculateEarnedLeaveByHireYearMonth(stf.hireDate);

      const scheduleLeaveByDate = {};
      Object.entries(schedules).forEach(([key, shiftCode]) => {
        if (shiftCode !== '연차' && shiftCode !== '반차') return;
        const parsed = parseScheduleKey(key);
        if (!parsed) return;
        if (parsed.staffId === stf.id) {
          scheduleLeaveByDate[parsed.dateStr] = getLeaveCost(shiftCode);
        }
      });

      const approvedLeaveByDate = {};
      leaveRequests
        .filter((r) => r.staffId === stf.id && r.status === '승인')
        .forEach((r) => {
          const cost = r.cost !== undefined ? Number(r.cost) : getLeaveCost(r.type);
          if (cost > 0 && r.date) {
            approvedLeaveByDate[r.date] = Math.max(approvedLeaveByDate[r.date] || 0, cost);
          }
        });

      const allUsedDates = new Set([
        ...Object.keys(scheduleLeaveByDate),
        ...Object.keys(approvedLeaveByDate)
      ]);

      let used = 0;
      allUsedDates.forEach((dt) => {
        used += Math.max(scheduleLeaveByDate[dt] || 0, approvedLeaveByDate[dt] || 0);
      });
      used = Number(used.toFixed(1));

      let granted;
      if (stf.manualGrantedLeave !== undefined && stf.manualGrantedLeave !== null && stf.manualGrantedLeave !== '') {
        granted = Number(stf.manualGrantedLeave) || 0;
      } else if (stf.grantedLeave !== undefined && stf.grantedLeave !== null && stf.grantedLeave !== '') {
        granted = Number(stf.grantedLeave) || 0;
      } else if (stf.annualLeave !== undefined && stf.annualLeave !== null && stf.annualLeave !== '') {
        granted = Number((Number(stf.annualLeave) + used).toFixed(1));
      } else if (calc) {
        granted = calc.earned;
      } else {
        granted = used;
      }

      const remaining = Math.max(0, Number((granted - used).toFixed(1)));

      map[stf.id] = {
        granted,
        used,
        remaining,
        calcInfo: calc
      };
    });
    return map;
  }, [staffList, leaveRequests, schedules]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (loginMode === 'admin') {
      if (selectedAdminId === 'MASTER') {
        if (pinInput === adminPin) {
          setCurrentUser({ role: 'admin', adminId: 'MASTER', adminName: '본사 마스터 관리자' });
          setPinInput('');
          setSelectedStoreId('ALL');
          setActiveTab('schedule');
        } else {
          setLoginError('마스터 관리자 PIN 번호가 일치하지 않습니다.');
        }
      } else {
        const targetAdmin = adminAccounts.find((a) => a.id === selectedAdminId);
        if (!targetAdmin) {
          setLoginError('관리자 계정을 찾을 수 없습니다.');
          return;
        }
        if (pinInput === targetAdmin.pin) {
          setCurrentUser({ role: 'admin', adminId: targetAdmin.id, adminName: targetAdmin.name + ' (관리자)' });
          setPinInput('');
          setSelectedStoreId('ALL');
          setActiveTab('schedule');
        } else {
          setLoginError('해당 관리자 계정의 PIN 번호가 일치하지 않습니다.');
        }
      }
    } else {
      if (!selectedStaffId) {
        setLoginError('본인 이름을 먼저 선택해 주세요.');
        return;
      }
      const target = staffList.find((s) => s.id === selectedStaffId);
      if (!target) {
        setLoginError('직원 정보를 찾을 수 없습니다.');
        return;
      }
      if (target.status === 'RESIGNED') {
        setLoginError('퇴사 처리된 계정으로 접속이 정지되었습니다.');
        return;
      }
      if (pinInput === target.pin) {
        setCurrentUser({ role: 'staff', staff: target });
        setPinInput('');
        setSelectedStoreId(target.storeId);
        setAutoTargetStoreId(target.storeId);
        setActiveTab('schedule');
      } else {
        setLoginError('개인 PIN 번호 4자리가 일치하지 않습니다.');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPinInput('');
    setLoginError('');
    setAutoDraftSchedule({});
    setAutoAnalysisMeta(null);
    setAutoNotice('');
    setScheduleImportFeedback(null);
  };

  const getStoreApprovalInfo = (storeId) => {
    if (!storeId) return { status: 'DRAFT', approved: false };
    const raw = scheduleApprovals[currentMonthPrefix + '_' + storeId];
    if (!raw) return { status: 'DRAFT', approved: false };
    if (raw.status) {
      return { ...raw, approved: raw.status === 'APPROVED' };
    }
    return {
      ...raw,
      status: raw.approved ? 'APPROVED' : 'DRAFT',
      approved: Boolean(raw.approved)
    };
  };

  const isStoreMonthPending = (storeId) => {
    return getStoreApprovalInfo(storeId).status === 'PENDING';
  };

  const canEditScheduleForStaff = (staff, dateStr) => {
    if (isStaffHiddenOnDate(staff, dateStr)) return false;
    if (isAdmin) return true;
    if (!isManager || staff.storeId !== activeStaffProfile?.storeId) return false;
    const st = getStoreApprovalInfo(staff.storeId).status;
    return st === 'DRAFT' || st === 'REJECTED';
  };

  const recomputeStaffLeaveBalances = (targetSchedules, targetStaffList, affectedStaffIds) => {
    const idSet = new Set(affectedStaffIds);
    return targetStaffList.map((s) => {
      if (!idSet.has(s.id)) return s;

      const scheduleLeaveByDate = {};
      Object.entries(targetSchedules).forEach(([k, code]) => {
        if (code !== '연차' && code !== '반차') return;
        const parsed = parseScheduleKey(k);
        if (!parsed) return;
        if (parsed.staffId === s.id) {
          scheduleLeaveByDate[parsed.dateStr] = getLeaveCost(code);
        }
      });

      const approvedLeaveByDate = {};
      leaveRequests
        .filter((r) => r.staffId === s.id && r.status === '승인')
        .forEach((r) => {
          const cost = r.cost !== undefined ? Number(r.cost) : getLeaveCost(r.type);
          if (cost > 0 && r.date) {
            approvedLeaveByDate[r.date] = Math.max(approvedLeaveByDate[r.date] || 0, cost);
          }
        });

      const allUsedDates = new Set([
        ...Object.keys(scheduleLeaveByDate),
        ...Object.keys(approvedLeaveByDate)
      ]);

      let nextUsed = 0;
      allUsedDates.forEach((dt) => {
        nextUsed += Math.max(scheduleLeaveByDate[dt] || 0, approvedLeaveByDate[dt] || 0);
      });
      nextUsed = Number(nextUsed.toFixed(1));

      const summary = leaveSummaryByStaff[s.id];
      const granted = summary ? summary.granted : Number(s.annualLeave ?? 0);
      const nextRemaining = Math.max(0, Number((granted - nextUsed).toFixed(1)));

      return {
        ...s,
        grantedLeave: granted,
        annualLeave: nextRemaining
      };
    });
  };

  const handleScheduleChange = (dateStr, staff, shiftCode) => {
    if (isStaffHiddenOnDate(staff, dateStr)) {
      alert('퇴사일 이후 날짜의 스케줄은 수정할 수 없습니다.');
      return;
    }
    if (!isAdmin) {
      if (!isManager || staff.storeId !== activeStaffProfile?.storeId) {
        alert('스케줄 입력 및 수정은 본사 관리자와 해당 매장 매니저만 가능합니다.');
        return;
      }
      const st = getStoreApprovalInfo(staff.storeId).status;
      if (st === 'APPROVED') {
        alert('관리자 승인이 완료된 스케줄입니다. 변경하려면 관리자에게 승인 해제를 요청하세요.');
        return;
      }
      if (st === 'PENDING') {
        alert('현재 관리자 승인 심사 중입니다.');
        return;
      }
    }

    const key = dateStr + '_' + staff.id;
    const updatedSchedules = { ...schedules };
    if (!shiftCode) delete updatedSchedules[key];
    else updatedSchedules[key] = shiftCode;

    const updatedStaffList = recomputeStaffLeaveBalances(updatedSchedules, staffList, [staff.id]);

    setSchedules(updatedSchedules);
    setStaffList(updatedStaffList);
    saveToCloud({ schedules: updatedSchedules, staffList: updatedStaffList });
  };

  const handleRequestScheduleApproval = (storeId) => {
    if (!isManager || !storeId) return;
    if (!window.confirm(year + '년 ' + (month + 1) + '월 스케줄을 관리자에게 승인 요청하시겠습니까?')) return;
    const key = currentMonthPrefix + '_' + storeId;
    const updated = {
      ...scheduleApprovals,
      [key]: {
        status: 'PENDING',
        approved: false,
        requestedAt: new Date().toISOString(),
        requestedBy: activeStaffProfile?.name || '매니저'
      }
    };
    setScheduleApprovals(updated);
    saveToCloud({ scheduleApprovals: updated });
    alert('관리자에게 스케줄 승인이 요청되었습니다.');
  };

  const handleDecideScheduleApproval = (storeId, nextStatus) => {
    if (!isAdmin || !storeId) return;
    let rejectReason = '';
    if (nextStatus === 'REJECTED') {
      const inputReason = window.prompt('매니저에게 전달할 수정요청(반려) 사유를 입력하세요:', '근무 인원 또는 휴무 배치를 재조정해 주세요.');
      if (inputReason === null) return;
      rejectReason = inputReason.trim();
    }

    const key = currentMonthPrefix + '_' + storeId;
    const prev = scheduleApprovals[key] || {};
    const updated = {
      ...scheduleApprovals,
      [key]: {
        ...prev,
        status: nextStatus,
        approved: nextStatus === 'APPROVED',
        rejectReason: nextStatus === 'REJECTED' ? rejectReason : '',
        decidedAt: new Date().toISOString(),
        decidedBy: adminDisplayName || '관리자'
      }
    };
    setScheduleApprovals(updated);
    saveToCloud({ scheduleApprovals: updated });
  };

  const escapeCsv = (val) => '"' + String(val ?? '').replace(/"/g, '""') + '"';

  const triggerCsvDownload = (filename, headers, rows) => {
    const csvContent = '\uFEFF' + [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [salesDate, setSalesDate] = useState('2026-12-01');
  const [salesStoreInput, setSalesStoreInput] = useState('store_1');
  const [salesAmountInput, setSalesAmountInput] = useState('');
  const [salesQuantityInput, setSalesQuantityInput] = useState('');
  const [salesNoteInput, setSalesNoteInput] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'staff' && activeStaffProfile) {
      setSalesStoreInput(activeStaffProfile.storeId);
    } else if (stores.length > 0 && !salesStoreInput) {
      setSalesStoreInput(stores[0].id);
    }
  }, [currentUser, activeStaffProfile, stores, salesStoreInput]);

  const handleSaveSales = (e) => {
    e.preventDefault();
    const targetStoreId = isAdmin ? salesStoreInput : activeStaffProfile?.storeId;
    if (!targetStoreId || !salesDate) return;

    const numericAmount = Math.max(0, Math.round(Number(String(salesAmountInput).replace(/,/g, '')) || 0));
    const numericQuantity = Math.max(0, Math.round(Number(String(salesQuantityInput).replace(/,/g, '')) || 0));
    const key = salesDate + '_' + targetStoreId;
    const updatedRecords = {
      ...salesRecords,
      [key]: {
        amount: numericAmount,
        quantity: numericQuantity,
        note: salesNoteInput.trim(),
        author: isAdmin ? adminDisplayName : activeStaffProfile?.name || '직원',
        updatedAt: new Date().toISOString()
      }
    };

    const [ry, rm] = salesDate.split('-').map(Number);
    if (ry && rm && (ry !== year || rm - 1 !== month)) {
      setCurrentDate(new Date(ry, rm - 1, 1));
    }

    setSalesRecords(updatedRecords);
    saveToCloud({ salesRecords: updatedRecords });
    setSalesAmountInput('');
    setSalesQuantityInput('');
    setSalesNoteInput('');
    alert('일매출(USD) 및 판매 수량이 등록되었습니다.');
  };

  const [leaveDate, setLeaveDate] = useState('2026-12-01');
  const [leaveType, setLeaveType] = useState('연차');
  const [leaveReason, setLeaveReason] = useState('');

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!activeStaffProfile || !leaveDate) return;
    const cost = getLeaveCost(leaveType);
    const currentRemain = Number(leaveSummaryByStaff[activeStaffProfile.id]?.remaining ?? activeStaffProfile.annualLeave ?? 0);
    if (cost > 0 && currentRemain < cost) {
      alert('잔여 연차가 부족합니다. (현재 잔여 연차: ' + currentRemain + '일)');
      return;
    }

    const storeObj = stores.find((st) => st.id === activeStaffProfile.storeId);
    const newReq = {
      id: 'leave_' + Date.now(),
      staffId: activeStaffProfile.id,
      staffName: activeStaffProfile.name,
      storeId: activeStaffProfile.storeId,
      storeName: storeObj?.name || '미지정 매장',
      date: leaveDate,
      type: leaveType,
      cost,
      reason: leaveReason.trim() || '개인 사유',
      status: '대기',
      createdAt: new Date().toISOString()
    };
    const updated = [newReq, ...leaveRequests];
    setLeaveRequests(updated);
    saveToCloud({ leaveRequests: updated });
    setLeaveReason('');
    alert('휴가 신청이 접수되었습니다.');
  };

  const handleLeaveAction = (req, newStatus) => {
    if (!isAdmin) return;
    const updatedReqs = leaveRequests.map((item) =>
      item.id === req.id ? { ...item, status: newStatus, decidedAt: new Date().toISOString() } : item
    );

    let updatedSchedules = { ...schedules };
    let updatedStaff = [...staffList];

    if (newStatus === '승인') {
      updatedSchedules[req.date + '_' + req.staffId] = req.type;
      const cost = req.cost !== undefined ? Number(req.cost) : getLeaveCost(req.type);
      if (cost > 0) {
        updatedStaff = updatedStaff.map((s) => {
          if (s.id !== req.staffId) return s;
          const summary = leaveSummaryByStaff[s.id];
          const baseRemain = summary ? summary.remaining : Number(s.annualLeave ?? 0);
          const nextLeave = Math.max(0, Number((baseRemain - cost).toFixed(1)));
          return { ...s, annualLeave: nextLeave };
        });
      }
    }

    setLeaveRequests(updatedReqs);
    setSchedules(updatedSchedules);
    setStaffList(updatedStaff);
    saveToCloud({
      leaveRequests: updatedReqs,
      schedules: updatedSchedules,
      staffList: updatedStaff
    });
  };

  const [newSelfPin, setNewSelfPin] = useState('');
  const handleSelfPinChange = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newSelfPin)) {
      alert('PIN 번호는 숫자 4자리로 입력해 주세요.');
      return;
    }
    const updatedStaff = staffList.map((s) =>
      s.id === activeStaffProfile.id ? { ...s, pin: newSelfPin } : s
    );
    setStaffList(updatedStaff);
    saveToCloud({ staffList: updatedStaff });
    setNewSelfPin('');
    alert('개인 PIN 번호가 변경되었습니다.');
  };

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffStore, setNewStaffStore] = useState('store_1');
  const [newStaffRole, setNewStaffRole] = useState('사원');
  const [newStaffHireDate, setNewStaffHireDate] = useState('2025-01-01');
  const [newStaffPin, setNewStaffPin] = useState('1234');
  const [newStaffAnnualLeave, setNewStaffAnnualLeave] = useState('');

  const handleHireDateInputChange = (val) => {
    setNewStaffHireDate(val);
    const calc = calculateEarnedLeaveByHireYearMonth(val);
    if (calc) {
      setNewStaffAnnualLeave(String(calc.earned));
    }
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !/^\d{4}$/.test(newStaffPin)) {
      alert('성명과 4자리 PIN을 확인해 주세요.');
      return;
    }
    const calc = calculateEarnedLeaveByHireYearMonth(newStaffHireDate);
    const leaveDays =
      newStaffAnnualLeave !== ''
        ? Math.max(0, Number(newStaffAnnualLeave) || 0)
        : calc
        ? calc.earned
        : 15;

    const added = {
      id: 'staff_' + Date.now(),
      name: newStaffName.trim(),
      storeId: newStaffStore,
      role: newStaffRole,
      hireDate: newStaffHireDate || '',
      pin: newStaffPin,
      grantedLeave: leaveDays,
      annualLeave: leaveDays,
      status: 'ACTIVE'
    };
    const updated = [...staffList, added];
    setStaffList(updated);
    saveToCloud({ staffList: updated });
    setNewStaffName('');
    setNewStaffPin('1234');
    setNewStaffAnnualLeave('');
  };

  const handleUpdateStaffRole = (staffId, nextRole) => {
    const updated = staffList.map((s) => (s.id === staffId ? { ...s, role: nextRole } : s));
    setStaffList(updated);
    saveToCloud({ staffList: updated });
  };

  const handleUpdateStaffHireDate = (staffId, nextHireDate) => {
    const calc = calculateEarnedLeaveByHireYearMonth(nextHireDate);
    const updated = staffList.map((s) => {
      if (s.id !== staffId) return s;
      const nextGranted = calc ? calc.earned : s.grantedLeave ?? s.annualLeave ?? 0;
      const used = leaveSummaryByStaff[staffId]?.used ?? 0;
      const nextRemain = Math.max(0, Number((nextGranted - used).toFixed(1)));
      const copy = {
        ...s,
        hireDate: nextHireDate,
        grantedLeave: nextGranted,
        annualLeave: nextRemain
      };
      delete copy.manualGrantedLeave;
      return copy;
    });
    setStaffList(updated);
    saveToCloud({ staffList: updated });
  };

  const handleApplyAutoLeaveByHireDate = (staffId) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target || !target.hireDate) return;
    const calc = calculateEarnedLeaveByHireYearMonth(target.hireDate);
    if (!calc) return;
    const used = leaveSummaryByStaff[staffId]?.used ?? 0;
    const nextRemain = Math.max(0, Number((calc.earned - used).toFixed(1)));
    const updated = staffList.map((s) => {
      if (s.id !== staffId) return s;
      const copy = { ...s, grantedLeave: calc.earned, annualLeave: nextRemain };
      delete copy.manualGrantedLeave;
      return copy;
    });
    setStaffList(updated);
    saveToCloud({ staffList: updated });
    alert(target.name + ' 님의 입사년월(' + calc.yearMonthLabel + ') 기준 연차(' + calc.earned + '일, 잔여 ' + nextRemain + '일)가 적용되었습니다.');
  };

  const handleUpdateStaffLeaveDays = (staffId, nextVal) => {
    const parsed = Math.max(0, Number(nextVal) || 0);
    const updated = staffList.map((s) => {
      if (s.id !== staffId) return s;
      const used = leaveSummaryByStaff[staffId]?.used ?? 0;
      return {
        ...s,
        manualGrantedLeave: parsed,
        grantedLeave: parsed,
        annualLeave: Math.max(0, Number((parsed - used).toFixed(1)))
      };
    });
    setStaffList(updated);
    saveToCloud({ staffList: updated });
  };

  const openResignModal = (stf) => {
    setResignModalStaff(stf);
    setResignDateInput(stf.resignedAt || '2026-11-27');
  };

  const handleConfirmResignStaff = (e) => {
    e.preventDefault();
    if (!resignModalStaff || !resignDateInput) return;

    const targetId = resignModalStaff.id;
    const cleanSchedules = Object.fromEntries(
      Object.entries(schedules).filter(([key]) => {
        const parsed = parseScheduleKey(key);
        if (!parsed || parsed.staffId !== targetId) return true;
        return parsed.dateStr <= resignDateInput;
      })
    );

    const updatedStaff = staffList.map((s) =>
      s.id === targetId
        ? {
            ...s,
            status: 'RESIGNED',
            resignedAt: resignDateInput
          }
        : s
    );

    setSchedules(cleanSchedules);
    setStaffList(updatedStaff);
    saveToCloud({ schedules: cleanSchedules, staffList: updatedStaff });
    setResignModalStaff(null);
  };

  const handleReinstateStaff = (id, name) => {
    if (!window.confirm(name + ' 직원의 퇴사 처리를 해제하시겠습니까?')) return;
    const updated = staffList.map((s) => {
      if (s.id !== id) return s;
      const copy = { ...s, status: 'ACTIVE' };
      delete copy.resignedAt;
      return copy;
    });
    setStaffList(updated);
    saveToCloud({ staffList: updated });
  };

  const handleResetStaffPin = (id, name) => {
    const nextPin = window.prompt(name + ' 직원의 새 PIN 번호 4자리를 입력하세요:', '0000');
    if (!nextPin || !/^\d{4}$/.test(nextPin)) return;
    const updated = staffList.map((s) => (s.id === id ? { ...s, pin: nextPin } : s));
    setStaffList(updated);
    saveToCloud({ staffList: updated });
    alert('PIN이 변경되었습니다.');
  };

  const [newAdminPinInput, setNewAdminPinInput] = useState('');
  const handleUpdateAdminPin = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newAdminPinInput)) {
      alert('마스터 관리자 PIN은 4자리 숫자여야 합니다.');
      return;
    }
    setAdminPin(newAdminPinInput);
    saveToCloud({ adminPin: newAdminPinInput });
    setNewAdminPinInput('');
    alert('마스터 관리자 PIN이 변경되었습니다.');
  };

  const handleUpdateStore = (storeId, field, value) => {
    const updated = stores.map((st) =>
      st.id === storeId
        ? { ...st, [field]: field === 'targetSales' ? Number(value) || 0 : value }
        : st
    );
    setStores(updated);
    saveToCloud({ stores: updated });
  };

  const handleClearMonthData = (targetType) => {
    if (!window.confirm(year + '년 ' + (month + 1) + '월 데이터를 삭제하시겠습니까?')) return;
    if (targetType === 'schedule') {
      const filtered = Object.fromEntries(
        Object.entries(schedules).filter(([k]) => !k.startsWith(currentMonthPrefix))
      );
      setSchedules(filtered);
      saveToCloud({ schedules: filtered });
    } else {
      const filtered = Object.fromEntries(
        Object.entries(salesRecords).filter(([k]) => !k.startsWith(currentMonthPrefix))
      );
      setSalesRecords(filtered);
      saveToCloud({ salesRecords: filtered });
    }
  };

  const visibleStaff = useMemo(() => {
    if (currentUser?.role === 'staff' && activeStaffProfile) {
      return scheduleVisibleStaffList.filter((s) => s.storeId === activeStaffProfile.storeId);
    }
    if (selectedStoreId === 'ALL') return scheduleVisibleStaffList;
    return scheduleVisibleStaffList.filter((s) => s.storeId === selectedStoreId);
  }, [currentUser, activeStaffProfile, selectedStoreId, scheduleVisibleStaffList]);

  const scheduleSummaryByStaff = useMemo(() => {
    const map = {};
    visibleStaff.forEach((stf) => {
      let workDays = 0;
      let overtimeDays = 0;
      let offDays = 0;
      let leaveUsed = 0;
      let streak = 0;
      let maxStreak = 0;

      daysInMonth.forEach((d) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) {
          streak = 0;
          return;
        }
        const code = schedules[d.dateStr + '_' + stf.id] || '';
        if (isWorkCode(code)) {
          workDays += 1;
          streak += 1;
          if (streak > maxStreak) maxStreak = streak;
          if (isOvertimeCode(code)) {
            overtimeDays += 1;
          }
        } else {
          streak = 0;
          if (code === '휴무') {
            offDays += 1;
          } else if (code === '연차') {
            leaveUsed += 1;
          } else if (code === '반차') {
            leaveUsed += 0.5;
          }
        }
      });
      map[stf.id] = {
        workDays,
        overtimeDays,
        offDays,
        leaveUsed: Number(leaveUsed.toFixed(1)),
        maxStreak
      };
    });
    return map;
  }, [visibleStaff, daysInMonth, schedules]);

  const overStreakStaffNames = useMemo(() => {
    return visibleStaff
      .filter((stf) => (scheduleSummaryByStaff[stf.id]?.maxStreak || 0) >= 4)
      .map((stf) => stf.name + '(' + scheduleSummaryByStaff[stf.id].maxStreak + '일)');
  }, [visibleStaff, scheduleSummaryByStaff]);

  const handleDownloadScheduleTemplate = () => {
    const templateStaff = visibleStaff.filter((s) => s.status !== 'RESIGNED');
    if (templateStaff.length === 0) {
      alert('다운로드할 대상 매장의 재직 직원이 없습니다.');
      return;
    }

    const headers = [
      '직원ID(수정금지)',
      '매장명',
      '성명',
      '직책',
      ...daysInMonth.map((d) => d.day + '일(' + d.dayName + ')')
    ];

    const rows = templateStaff.map((stf) => {
      const stName = stores.find((s) => s.id === stf.storeId)?.name || '미지정';
      const dayCells = daysInMonth.map((d) => schedules[d.dateStr + '_' + stf.id] || '');
      return [stf.id, stName, stf.name, stf.role, ...dayCells];
    });

    const guideRow = [
      '입력안내',
      '코드: A조, A+, B조, B+, C조, C+, F조, 휴무, 연차, 반차 (빈칸=미정)',
      '직원ID·성명 열 유지',
      '',
      ...daysInMonth.map(() => '')
    ];

    const filterLabel = isAdmin
      ? selectedStoreId === 'ALL'
        ? '전체매장'
        : stores.find((s) => s.id === selectedStoreId)?.name || '매장'
      : myStoreObj?.name || '매장';

    triggerCsvDownload(
      '스케줄업로드양식_' + currentMonthPrefix + '_' + filterLabel + '.csv',
      headers,
      [...rows, guideRow]
    );
  };

  const canUploadScheduleExcel = useMemo(() => {
    if (isAdmin) return true;
    if (!isManager || !activeStaffProfile?.storeId) return false;
    const st = getStoreApprovalInfo(activeStaffProfile.storeId).status;
    return st === 'DRAFT' || st === 'REJECTED';
  }, [isAdmin, isManager, activeStaffProfile, scheduleApprovals, currentMonthPrefix]);

  const handleUploadScheduleExcel = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!canUploadScheduleExcel) {
      alert('현재 매장 스케줄이 승인 대기 중이거나 승인 완료 상태여서 업로드할 수 없습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = String(evt.target?.result || '');
        const rows = parseCsvRows(text);
        if (rows.length < 2) {
          alert('유효한 데이터가 없는 파일입니다. 먼저 [양식 다운로드]로 받은 파일을 작성해 업로드해 주세요.');
          return;
        }

        const headerRow = rows[0].map((h) => String(h ?? '').trim());
        const idColIdx = headerRow.findIndex((h) => h.includes('직원ID'));
        const nameColIdx = headerRow.findIndex((h) => h === '성명' || h.includes('성명'));
        const storeColIdx = headerRow.findIndex((h) => h === '매장명' || h.includes('매장'));

        const dayColMap = [];
        headerRow.forEach((h, idx) => {
          const matchDay = h.match(/^(\d{1,2})일/);
          if (matchDay) {
            const dNum = Number(matchDay[1]);
            const dayObj = daysInMonth.find((d) => d.day === dNum);
            if (dayObj) {
              dayColMap.push({ colIdx: idx, dateStr: dayObj.dateStr });
            }
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(h) && h.startsWith(currentMonthPrefix)) {
            dayColMap.push({ colIdx: idx, dateStr: h });
          }
        });

        if (dayColMap.length === 0) {
          alert(
            year +
              '년 ' +
              (month + 1) +
              '월 날짜 열(1일~' +
              daysInMonth.length +
              '일)을 찾을 수 없습니다. 상단 월을 맞춘 뒤 [양식 다운로드]로 받은 파일을 사용해 주세요.'
          );
          return;
        }

        if (idColIdx === -1 && nameColIdx === -1) {
          alert('파일 첫 번째 줄에 [직원ID] 또는 [성명] 열이 필요합니다.');
          return;
        }

        const allowedStaffPool = isAdmin
          ? selectedStoreId === 'ALL'
            ? staffList
            : staffList.filter((s) => s.storeId === selectedStoreId)
          : staffList.filter((s) => s.storeId === activeStaffProfile?.storeId);

        const updatedSchedules = { ...schedules };
        const affectedStaffIds = new Set();
        let matchedStaffCount = 0;
        let appliedCellsCount = 0;
        const skippedRows = [];
        const invalidCells = [];

        for (let rIdx = 1; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const rawId = idColIdx !== -1 ? String(row[idColIdx] ?? '').trim() : '';
          const rawName = nameColIdx !== -1 ? String(row[nameColIdx] ?? '').trim() : '';
          const rawStore = storeColIdx !== -1 ? String(row[storeColIdx] ?? '').trim() : '';

          if (rawId === '입력안내' || (!rawId && !rawName)) continue;

          let targetStaff = null;
          if (rawId) {
            targetStaff = allowedStaffPool.find((s) => s.id === rawId);
          }
          if (!targetStaff && rawName) {
            const nameMatches = allowedStaffPool.filter((s) => s.name === rawName);
            if (nameMatches.length === 1) {
              targetStaff = nameMatches[0];
            } else if (nameMatches.length > 1 && rawStore) {
              targetStaff = nameMatches.find(
                (s) => (stores.find((st) => st.id === s.storeId)?.name || '') === rawStore
              );
            }
          }

          if (!targetStaff) {
            skippedRows.push(rawName || rawId || rIdx + 1 + '행');
            continue;
          }

          if (!canEditScheduleForStaff(targetStaff, currentMonthPrefix + '-01')) {
            skippedRows.push(targetStaff.name + '(잠금됨)');
            continue;
          }

          matchedStaffCount += 1;
          affectedStaffIds.add(targetStaff.id);

          dayColMap.forEach(({ colIdx, dateStr }) => {
            if (isStaffHiddenOnDate(targetStaff, dateStr)) return;
            const rawCell = row[colIdx];
            const normalized = normalizeImportedShiftCode(rawCell);
            const cellKey = dateStr + '_' + targetStaff.id;

            if (normalized === null) {
              invalidCells.push(targetStaff.name + ' ' + dateStr.slice(8) + '일("' + String(rawCell).trim() + '")');
              return;
            }

            if (normalized === '') {
              delete updatedSchedules[cellKey];
            } else {
              updatedSchedules[cellKey] = normalized;
            }
            appliedCellsCount += 1;
          });
        }

        if (matchedStaffCount === 0) {
          alert(
            '반영 가능한 매장 직원을 찾지 못했습니다.\n' +
              (skippedRows.length > 0 ? '제외된 항목: ' + skippedRows.slice(0, 5).join(', ') : '')
          );
          return;
        }

        const updatedStaffList = recomputeStaffLeaveBalances(
          updatedSchedules,
          staffList,
          Array.from(affectedStaffIds)
        );

        setSchedules(updatedSchedules);
        setStaffList(updatedStaffList);
        saveToCloud({ schedules: updatedSchedules, staffList: updatedStaffList });

        setScheduleImportFeedback({
          fileName: file.name,
          matchedStaffCount,
          appliedCellsCount,
          skippedRows,
          invalidCells
        });
      } catch (err) {
        alert('엑셀(CSV) 파일을 읽는 중 오류가 발생했습니다. CSV(UTF-8) 형식인지 확인해 주세요.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDownloadScheduleExcel = () => {
    const headers = [
      '매장명',
      '성명',
      '직책',
      '잔여연차',
      ...daysInMonth.map((d) => d.day + '일(' + d.dayName + ')'),
      '근무날수',
      '연장(+)',
      '휴무날수',
      '연차 사용수'
    ];
    const rows = visibleStaff.map((stf) => {
      const stName = stores.find((s) => s.id === stf.storeId)?.name || '미지정';
      const rem = leaveSummaryByStaff[stf.id]?.remaining ?? stf.annualLeave ?? 0;
      const dayCells = daysInMonth.map((d) =>
        isStaffHiddenOnDate(stf, d.dateStr) ? '' : schedules[d.dateStr + '_' + stf.id] || ''
      );
      const sum = scheduleSummaryByStaff[stf.id] || { workDays: 0, overtimeDays: 0, offDays: 0, leaveUsed: 0 };
      return [stName, stf.name, stf.role, rem, ...dayCells, sum.workDays, sum.overtimeDays, sum.offDays, sum.leaveUsed];
    });
    const filterLabel = isAdmin
      ? selectedStoreId === 'ALL'
        ? '전체매장'
        : stores.find((s) => s.id === selectedStoreId)?.name || '매장'
      : myStoreObj?.name || '매장';
    triggerCsvDownload('근무스케줄_' + currentMonthPrefix + '_' + filterLabel + '.csv', headers, rows);
  };

  const monthlySalesSummary = useMemo(() => {
    const byStore = {};
    stores.forEach((st) => {
      byStore[st.id] = { amount: 0, quantity: 0 };
    });
    Object.entries(salesRecords).forEach(([key, val]) => {
      if (key.startsWith(currentMonthPrefix)) {
        const parts = key.split('_');
        const stId = parts.slice(1).join('_');
        if (byStore[stId] !== undefined) {
          byStore[stId].amount += Number(val.amount) || 0;
          byStore[stId].quantity += Number(val.quantity) || 0;
        }
      }
    });
    return byStore;
  }, [salesRecords, stores, currentMonthPrefix]);

  const targetStoresForDailyMatrix = useMemo(() => {
    if (isAdmin) {
      return selectedStoreId === 'ALL'
        ? stores
        : stores.filter((st) => st.id === selectedStoreId);
    }
    return stores.filter((st) => st.id === activeStaffProfile?.storeId);
  }, [isAdmin, selectedStoreId, stores, activeStaffProfile]);

  const dailyStoreMatrix = useMemo(() => {
    const storeTotals = {};
    targetStoresForDailyMatrix.forEach((st) => {
      storeTotals[st.id] = { amount: 0, quantity: 0 };
    });

    let grandTotalAmount = 0;
    let grandTotalQuantity = 0;
    let activeSalesDaysCount = 0;

    const rows = daysInMonth.map((d) => {
      const cells = {};
      let dayAmount = 0;
      let dayQuantity = 0;

      targetStoresForDailyMatrix.forEach((st) => {
        const rec = salesRecords[d.dateStr + '_' + st.id];
        const amt = Number(rec?.amount) || 0;
        const qty = Number(rec?.quantity) || 0;
        cells[st.id] = { amount: amt, quantity: qty };
        dayAmount += amt;
        dayQuantity += qty;
        storeTotals[st.id].amount += amt;
        storeTotals[st.id].quantity += qty;
      });

      if (dayAmount > 0 || dayQuantity > 0) {
        activeSalesDaysCount += 1;
      }

      grandTotalAmount += dayAmount;
      grandTotalQuantity += dayQuantity;

      return {
        ...d,
        cells,
        dayAmount,
        dayQuantity
      };
    });

    const avgDailyAmount =
      activeSalesDaysCount > 0 ? Math.round(grandTotalAmount / activeSalesDaysCount) : 0;

    return {
      rows,
      storeTotals,
      grandTotalAmount,
      grandTotalQuantity,
      activeSalesDaysCount,
      avgDailyAmount
    };
  }, [daysInMonth, targetStoresForDailyMatrix, salesRecords]);

  const handleDownloadDailySalesExcel = () => {
    const headers = [
      '일자',
      '요일',
      ...targetStoresForDailyMatrix.flatMap((st) => [st.name + ' 매출(USD)', st.name + ' 수량(PCS)']),
      '일별 합계 매출(USD)',
      '일별 합계 수량(PCS)'
    ];
    const rows = dailyStoreMatrix.rows.map((r) => [
      r.dateStr,
      r.dayName,
      ...targetStoresForDailyMatrix.flatMap((st) => [
        r.cells[st.id]?.amount || 0,
        r.cells[st.id]?.quantity || 0
      ]),
      r.dayAmount,
      r.dayQuantity
    ]);
    rows.push([
      '매장별 합계',
      '',
      ...targetStoresForDailyMatrix.flatMap((st) => [
        dailyStoreMatrix.storeTotals[st.id]?.amount || 0,
        dailyStoreMatrix.storeTotals[st.id]?.quantity || 0
      ]),
      dailyStoreMatrix.grandTotalAmount,
      dailyStoreMatrix.grandTotalQuantity
    ]);
    const filterLabel = isAdmin
      ? selectedStoreId === 'ALL'
        ? '전체매장'
        : stores.find((s) => s.id === selectedStoreId)?.name || '매장'
      : myStoreObj?.name || '매장';
    triggerCsvDownload('일별_매장별_매출합계_' + currentMonthPrefix + '_' + filterLabel + '.csv', headers, rows);
  };

  const staffSalesAnalytics = useMemo(() => {
    const statsByStaff = {};
    staffList.forEach((stf) => {
      statsByStaff[stf.id] = {
        staff: stf,
        totalAllocated: 0,
        totalAllocatedQty: 0,
        workDaysCount: 0,
        overtimeDaysCount: 0,
        groupStats: {
          'A조': { sum: 0, qtySum: 0, count: 0 },
          'B조': { sum: 0, qtySum: 0, count: 0 },
          'C조': { sum: 0, qtySum: 0, count: 0 },
          'F조': { sum: 0, qtySum: 0, count: 0 }
        }
      };
    });

    Object.entries(salesRecords).forEach(([key, rec]) => {
      if (!key.startsWith(currentMonthPrefix)) return;
      const parts = key.split('_');
      const dateStr = parts[0];
      const storeId = parts.slice(1).join('_');
      const daySales = Number(rec.amount) || 0;
      const dayQty = Number(rec.quantity) || 0;
      if (daySales <= 0 && dayQty <= 0) return;

      const workingOnDay = staffList.filter((stf) => {
        if (stf.storeId !== storeId) return false;
        if (isStaffHiddenOnDate(stf, dateStr)) return false;
        const shift = schedules[dateStr + '_' + stf.id];
        return isWorkCode(shift);
      });

      if (workingOnDay.length === 0) return;

      workingOnDay.forEach((stf) => {
        const shift = schedules[dateStr + '_' + stf.id];
        const baseGroup = normalizeBaseGroup(shift);
        const entry = statsByStaff[stf.id];
        if (!entry) return;
        entry.totalAllocated += daySales;
        entry.totalAllocatedQty += dayQty;
        entry.workDaysCount += 1;
        if (isOvertimeCode(shift)) {
          entry.overtimeDaysCount += 1;
        }
        if (baseGroup && entry.groupStats[baseGroup]) {
          entry.groupStats[baseGroup].sum += daySales;
          entry.groupStats[baseGroup].qtySum += dayQty;
          entry.groupStats[baseGroup].count += 1;
        }
      });
    });

    return Object.values(statsByStaff)
      .filter((item) => {
        const hasAnyActivity = item.workDaysCount > 0 || item.totalAllocated > 0;
        if (item.staff.status === 'RESIGNED' && !hasAnyActivity) return false;
        if (isAdmin) {
          return selectedStoreId === 'ALL' || item.staff.storeId === selectedStoreId;
        }
        return item.staff.storeId === activeStaffProfile?.storeId;
      })
      .map((item) => {
        const storeName = stores.find((s) => s.id === item.staff.storeId)?.name || '미지정';
        const overallAvg = item.workDaysCount > 0 ? Math.round(item.totalAllocated / item.workDaysCount) : 0;
        const overallAvgQty = item.workDaysCount > 0 ? Number((item.totalAllocatedQty / item.workDaysCount).toFixed(1)) : 0;
        const groupAverages = {};
        BASE_WORK_GROUPS.forEach((g) => {
          const gs = item.groupStats[g];
          groupAverages[g] = gs.count > 0 ? Math.round(gs.sum / gs.count) : null;
        });
        return {
          ...item,
          storeName,
          staffName: item.staff.name,
          totalAllocatedRounded: Math.round(item.totalAllocated),
          totalAllocatedQtyRounded: Number(item.totalAllocatedQty.toFixed(1)),
          overallAvg,
          overallAvgQty,
          groupAverages
        };
      });
  }, [salesRecords, schedules, staffList, stores, currentMonthPrefix, isAdmin, selectedStoreId, activeStaffProfile]);

  const getSortValue = (row, field) => {
    if (field === 'staffName') return row.staffName || '';
    if (field === 'storeName') return row.storeName || '';
    if (field.startsWith('group_')) {
      const grp = field.replace('group_', '');
      const val = row.groupAverages?.[grp];
      return val === null || val === undefined ? -1 : Number(val);
    }
    return Number(row[field] ?? 0);
  };

  const sortedStaffSalesAnalytics = useMemo(() => {
    const arr = [...staffSalesAnalytics];
    arr.sort((a, b) => {
      const va = getSortValue(a, sortField);
      const vb = getSortValue(b, sortField);
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb, 'ko');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      return sortDirection === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });
    return arr;
  }, [staffSalesAnalytics, sortField, sortDirection]);

  const handleHeaderSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'staffName' || field === 'storeName' ? 'asc' : 'desc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 inline ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600 inline ml-1" />
    );
  };

  const handleDownloadStaffSalesExcel = () => {
    const headers = [
      '사원명',
      '직책',
      '상태',
      '소속 매장',
      '출근일수',
      '연장일수(+)',
      '총 배분매출(USD)',
      '총 배분수량(PCS)',
      '출근일 평균매출(USD)',
      '일 평균수량(PCS)',
      'A조 평균(USD)',
      'B조 평균(USD)',
      'C조 평균(USD)',
      'F조 평균(USD)'
    ];
    const rows = sortedStaffSalesAnalytics.map((row) => [
      row.staff.name,
      row.staff.role,
      row.staff.status === 'RESIGNED' ? '퇴사' : '재직',
      row.storeName,
      row.workDaysCount,
      row.overtimeDaysCount,
      row.totalAllocatedRounded,
      row.totalAllocatedQtyRounded,
      row.overallAvg,
      row.overallAvgQty,
      row.groupAverages['A조'] !== null ? row.groupAverages['A조'] : '',
      row.groupAverages['B조'] !== null ? row.groupAverages['B조'] : '',
      row.groupAverages['C조'] !== null ? row.groupAverages['C조'] : '',
      row.groupAverages['F조'] !== null ? row.groupAverages['F조'] : ''
    ]);
    const filterLabel = isAdmin
      ? selectedStoreId === 'ALL'
        ? '전체매장'
        : stores.find((s) => s.id === selectedStoreId)?.name || '매장'
      : myStoreObj?.name || '매장';
    triggerCsvDownload('사원별_배분집계_' + currentMonthPrefix + '_' + filterLabel + '.csv', headers, rows);
  };

  const effectiveAutoStoreId = isAdmin
    ? autoTargetStoreId || stores[0]?.id || 'store_1'
    : activeStaffProfile?.storeId || stores[0]?.id || 'store_1';

  const autoStoreObj = useMemo(
    () => stores.find((s) => s.id === effectiveAutoStoreId) || stores[0],
    [stores, effectiveAutoStoreId]
  );

  const autoStoreStaff = useMemo(
    () =>
      scheduleVisibleStaffList.filter(
        (s) => s.storeId === effectiveAutoStoreId && (!s.resignedAt || s.resignedAt >= currentMonthPrefix + '-01')
      ),
    [scheduleVisibleStaffList, effectiveAutoStoreId, currentMonthPrefix]
  );

  const handleGenerateAutoSchedule = () => {
    setAutoNotice('');
    if (!effectiveAutoStoreId) {
      setAutoNotice('대상 매장을 먼저 선택해 주세요.');
      return;
    }
    if (autoStoreStaff.length === 0) {
      setAutoDraftSchedule({});
      setAutoAnalysisMeta(null);
      setAutoNotice(
        (autoStoreObj?.name || '선택한 매장') +
          '에 배정된 대상 사원이 없습니다. [관리자 · 직원 · 연차 · PIN] 탭에서 직원을 확인해 주세요.'
      );
      return;
    }

    const prevMonthDate = new Date(year, month - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    const prevTotalDays = new Date(prevYear, prevMonth + 1, 0).getDate();

    const prevWeekdayWorkCounts = Array.from({ length: 7 }, () => []);
    for (let dayNum = 1; dayNum <= prevTotalDays; dayNum++) {
      const dObj = new Date(prevYear, prevMonth, dayNum);
      const dow = dObj.getDay();
      const dtStr =
        prevYear +
        '-' +
        String(prevMonth + 1).padStart(2, '0') +
        '-' +
        String(dayNum).padStart(2, '0');

      let countOnDay = 0;
      autoStoreStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, dtStr)) return;
        const shift = schedules[dtStr + '_' + stf.id];
        if (isWorkCode(shift)) {
          countOnDay += 1;
        }
      });
      prevWeekdayWorkCounts[dow].push(countOnDay);
    }

    const hasPrevData = prevWeekdayWorkCounts.some((arr) => arr.some((c) => c > 0));
    const fallbackDailyTarget = Math.max(
      1,
      Math.min(autoStoreStaff.length, Math.ceil(autoStoreStaff.length * 0.7))
    );

    const weekdayTargetHeadcount = prevWeekdayWorkCounts.map((arr) => {
      if (!hasPrevData || arr.length === 0) return fallbackDailyTarget;
      const avg = arr.reduce((acc, v) => acc + v, 0) / arr.length;
      return Math.max(1, Math.min(autoStoreStaff.length, Math.round(avg)));
    });

    const staffGroupSales = {};
    const staffTotalSales = {};
    autoStoreStaff.forEach((stf) => {
      staffGroupSales[stf.id] = {
        'A조': { sum: 0, count: 0 },
        'C조': { sum: 0, count: 0 }
      };
      staffTotalSales[stf.id] = { sum: 0, count: 0 };
    });

    const pairSales = {};
    const getPairKey = (idA, idB) => [idA, idB].sort().join('__');

    Object.entries(salesRecords).forEach(([key, rec]) => {
      const parts = key.split('_');
      const dtStr = parts[0];
      const stId = parts.slice(1).join('_');
      if (stId !== effectiveAutoStoreId) return;
      const daySales = Number(rec.amount) || 0;
      if (daySales <= 0) return;

      const workingToday = autoStoreStaff.filter((stf) => {
        if (isStaffHiddenOnDate(stf, dtStr)) return false;
        return isWorkCode(schedules[dtStr + '_' + stf.id]);
      });
      if (workingToday.length === 0) return;

      workingToday.forEach((stf) => {
        const shift = schedules[dtStr + '_' + stf.id];
        const baseGrp = normalizeBaseGroup(shift);
        staffTotalSales[stf.id].sum += daySales;
        staffTotalSales[stf.id].count += 1;
        if (baseGrp === 'A조' || baseGrp === 'C조') {
          staffGroupSales[stf.id][baseGrp].sum += daySales;
          staffGroupSales[stf.id][baseGrp].count += 1;
        }
      });

      for (let i = 0; i < workingToday.length; i++) {
        for (let j = i + 1; j < workingToday.length; j++) {
          const pKey = getPairKey(workingToday[i].id, workingToday[j].id);
          if (!pairSales[pKey]) pairSales[pKey] = { sum: 0, count: 0 };
          pairSales[pKey].sum += daySales;
          pairSales[pKey].count += 1;
        }
      }
    });

    const getPairAvg = (idA, idB) => {
      const entry = pairSales[getPairKey(idA, idB)];
      if (!entry || entry.count === 0) return 0;
      return entry.sum / entry.count;
    };

    const getStaffGroupAvg = (stfId, groupCode) => {
      const gEntry = staffGroupSales[stfId]?.[groupCode];
      if (gEntry && gEntry.count > 0) return gEntry.sum / gEntry.count;
      const tEntry = staffTotalSales[stfId];
      if (tEntry && tEntry.count > 0) return tEntry.sum / tEntry.count;
      return 0;
    };

    const topPairsSummary = [];
    for (let i = 0; i < autoStoreStaff.length; i++) {
      for (let j = i + 1; j < autoStoreStaff.length; j++) {
        const avg = getPairAvg(autoStoreStaff[i].id, autoStoreStaff[j].id);
        const cnt = pairSales[getPairKey(autoStoreStaff[i].id, autoStoreStaff[j].id)]?.count || 0;
        if (avg > 0) {
          topPairsSummary.push({
            names: autoStoreStaff[i].name + ' + ' + autoStoreStaff[j].name,
            avgSales: Math.round(avg),
            daysCount: cnt
          });
        }
      }
    }
    topPairsSummary.sort((a, b) => b.avgSales - a.avgSales);

    const draft = {};
    const offCountByStaff = {};
    const workCountByStaff = {};
    const overtimeCountByStaff = {};
    const leaveCountByStaff = {};
    const lastGroupByStaff = {};
    const groupRotationIdx = {};
    const targetOffByStaff = {};

    autoStoreStaff.forEach((stf, idx) => {
      const validDays = daysInMonth.filter((d) => !isStaffHiddenOnDate(stf, d.dateStr));
      const validRedDays = validDays.filter((d) => d.isRedDay).length;
      targetOffByStaff[stf.id] = Math.min(validRedDays, validDays.length);

      offCountByStaff[stf.id] = 0;
      workCountByStaff[stf.id] = 0;
      overtimeCountByStaff[stf.id] = 0;
      leaveCountByStaff[stf.id] = 0;
      lastGroupByStaff[stf.id] = idx % 2 === 0 ? 'C조' : 'A조';
      groupRotationIdx[stf.id] = idx % 2;
    });

    const getPriorConsecutiveWorkDays = (stfId, dayIdx) => {
      let streak = 0;
      for (let back = 1; back <= 3; back++) {
        if (dayIdx - back < 0) break;
        const prevDateStr = daysInMonth[dayIdx - back].dateStr;
        if (isWorkCode(draft[prevDateStr + '_' + stfId])) {
          streak += 1;
        } else {
          break;
        }
      }
      return streak;
    };

    const wouldExceedThreeConsecutiveWork = (stfId, dayIdx) => {
      let before = 0;
      for (let back = 1; back <= 3; back++) {
        if (dayIdx - back < 0) break;
        if (isWorkCode(draft[daysInMonth[dayIdx - back].dateStr + '_' + stfId])) {
          before += 1;
        } else {
          break;
        }
      }
      let after = 0;
      for (let fwd = 1; fwd <= 3; fwd++) {
        if (dayIdx + fwd >= daysInMonth.length) break;
        if (isWorkCode(draft[daysInMonth[dayIdx + fwd].dateStr + '_' + stfId])) {
          after += 1;
        } else {
          break;
        }
      }
      return before + 1 + after >= 4;
    };

    const totalDays = daysInMonth.length;

    daysInMonth.forEach((d, dayIdx) => {
      const targetCount = weekdayTargetHeadcount[d.dayOfWeek] ?? fallbackDailyTarget;
      const remainingDaysAfterToday = totalDays - 1 - dayIdx;

      const mustTakeOffToday = [];
      const eligibleForWorkToday = [];

      autoStoreStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;

        const existingShift = schedules[d.dateStr + '_' + stf.id];
        if (existingShift === '연차' || existingShift === '반차') {
          draft[d.dateStr + '_' + stf.id] = existingShift;
          leaveCountByStaff[stf.id] += getLeaveCost(existingShift);
          return;
        }

        const goalOff = targetOffByStaff[stf.id] ?? monthRedDayCount;
        const needOff = goalOff - offCountByStaff[stf.id];

        if (getPriorConsecutiveWorkDays(stf.id, dayIdx) >= 3) {
          mustTakeOffToday.push(stf);
          return;
        }

        if (needOff > 0 && needOff >= remainingDaysAfterToday + 1) {
          mustTakeOffToday.push(stf);
          return;
        }

        eligibleForWorkToday.push(stf);
      });

      mustTakeOffToday.forEach((stf) => {
        draft[d.dateStr + '_' + stf.id] = '휴무';
        offCountByStaff[stf.id] += 1;
      });

      const desiredWorkCount = Math.min(targetCount, eligibleForWorkToday.length);
      const chosenWorkers = [];
      const remainingPool = [...eligibleForWorkToday];

      while (chosenWorkers.length < desiredWorkCount && remainingPool.length > 0) {
        let bestIdx = 0;
        let bestScore = -Infinity;

        remainingPool.forEach((cand, idx) => {
          let synergyScore = 0;
          chosenWorkers.forEach((cw) => {
            synergyScore += getPairAvg(cand.id, cw.id) * 1.5;
          });
          const fairnessPenalty = workCountByStaff[cand.id] * 500;
          const totalScore = synergyScore - fairnessPenalty;
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestIdx = idx;
          }
        });

        const [picked] = remainingPool.splice(bestIdx, 1);
        chosenWorkers.push(picked);
      }

      chosenWorkers.forEach((worker) => {
        const prevGrp = lastGroupByStaff[worker.id];
        const rotGrp = AUTO_WORK_GROUPS[groupRotationIdx[worker.id] % AUTO_WORK_GROUPS.length];
        const candidateGroups = prevGrp === 'A조' ? ['C조', 'A조'] : ['A조', 'C조'];

        let selectedGroup = candidateGroups[0];
        if (candidateGroups.includes(rotGrp) && candidateGroups[0] !== rotGrp) {
          const scoreFirst = getStaffGroupAvg(worker.id, candidateGroups[0]);
          const scoreRot = getStaffGroupAvg(worker.id, rotGrp);
          selectedGroup = scoreRot > scoreFirst * 1.15 ? rotGrp : candidateGroups[0];
        } else {
          const scoreFirst = getStaffGroupAvg(worker.id, candidateGroups[0]);
          const scoreSecond = getStaffGroupAvg(worker.id, candidateGroups[1]);
          if (scoreSecond > scoreFirst * 1.2) {
            selectedGroup = candidateGroups[1];
          }
        }

        draft[d.dateStr + '_' + worker.id] = selectedGroup;
        lastGroupByStaff[worker.id] = selectedGroup;
        groupRotationIdx[worker.id] = (groupRotationIdx[worker.id] + 1) % AUTO_WORK_GROUPS.length;
        workCountByStaff[worker.id] += 1;
      });

      autoStoreStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const key = d.dateStr + '_' + stf.id;
        if (draft[key]) return;
        const goalOff = targetOffByStaff[stf.id] ?? monthRedDayCount;
        const needOff = goalOff - offCountByStaff[stf.id];
        if (needOff > 0) {
          draft[key] = '휴무';
          offCountByStaff[stf.id] += 1;
        }
      });
    });

    autoStoreStaff.forEach((stf) => {
      const goalOff = targetOffByStaff[stf.id] ?? monthRedDayCount;
      for (let dayIdx = daysInMonth.length - 1; dayIdx >= 0; dayIdx--) {
        if (offCountByStaff[stf.id] >= goalOff) break;
        const d = daysInMonth[dayIdx];
        if (isStaffHiddenOnDate(stf, d.dateStr)) continue;
        const key = d.dateStr + '_' + stf.id;
        const cur = draft[key];
        if (!cur || isWorkCode(cur)) {
          if (isWorkCode(cur)) {
            workCountByStaff[stf.id] = Math.max(0, workCountByStaff[stf.id] - 1);
          }
          draft[key] = '휴무';
          offCountByStaff[stf.id] += 1;
        }
      }

      daysInMonth.forEach((d, dayIdx) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const key = d.dateStr + '_' + stf.id;
        if (!draft[key]) {
          if (wouldExceedThreeConsecutiveWork(stf.id, dayIdx)) {
            draft[key] = '휴무';
            offCountByStaff[stf.id] += 1;
          } else {
            const prevGrp = lastGroupByStaff[stf.id];
            const nextGrp = prevGrp === 'A조' ? 'C조' : 'A조';
            draft[key] = nextGrp;
            lastGroupByStaff[stf.id] = nextGrp;
            workCountByStaff[stf.id] += 1;
          }
        }
      });

      daysInMonth.forEach((d, dayIdx) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const key = d.dateStr + '_' + stf.id;
        if (isWorkCode(draft[key]) && getPriorConsecutiveWorkDays(stf.id, dayIdx) >= 3) {
          draft[key] = '휴무';
          workCountByStaff[stf.id] = Math.max(0, workCountByStaff[stf.id] - 1);
          offCountByStaff[stf.id] += 1;
        }
      });
    });

    setAutoDraftSchedule(draft);
    setAutoAnalysisMeta({
      storeId: effectiveAutoStoreId,
      storeName: autoStoreObj?.name || '',
      prevMonthLabel: prevYear + '년 ' + (prevMonth + 1) + '월',
      hasPrevData,
      weekdayTargetHeadcount,
      redDayCountInMonth: monthRedDayCount,
      topPairs: topPairsSummary.slice(0, 5),
      workCountByStaff,
      overtimeCountByStaff,
      offCountByStaff,
      leaveCountByStaff,
      targetOffByStaff
    });
    setAutoNotice(
      (autoStoreObj?.name || '') +
        ' ' +
        year +
        '년 ' +
        (month + 1) +
        '월 추천 스케줄(최대 3일 연속 근무 제한 준수 · 토·일·공휴일 ' +
        monthRedDayCount +
        '일 기준 휴무 제안 완료)이 생성되었습니다.'
    );
  };

  const autoDailyGroupCounts = useMemo(() => {
    const result = {};
    daysInMonth.forEach((d) => {
      let aCount = 0;
      let cCount = 0;
      let otCount = 0;
      autoStoreStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const code = autoDraftSchedule[d.dateStr + '_' + stf.id];
        if (code === 'A조' || code === 'A+') aCount += 1;
        else if (code === 'C조' || code === 'C+') cCount += 1;
        if (isOvertimeCode(code)) otCount += 1;
      });
      result[d.dateStr] = {
        aCount,
        cCount,
        otCount,
        total: aCount + cCount
      };
    });
    return result;
  }, [daysInMonth, autoStoreStaff, autoDraftSchedule]);

  const handleApplyAutoScheduleToMain = () => {
    if (!autoAnalysisMeta || Object.keys(autoDraftSchedule).length === 0) return;
    const targetStId = autoAnalysisMeta.storeId;
    const approval = getStoreApprovalInfo(targetStId);

    if (!isAdmin) {
      if (!isManager || targetStId !== activeStaffProfile?.storeId) {
        alert('스케줄 반영은 본사 관리자와 해당 매장 매니저만 가능합니다.');
        return;
      }
      if (approval.status === 'APPROVED') {
        alert('이미 관리자 승인이 완료된 스케줄입니다.');
        return;
      }
      if (approval.status === 'PENDING') {
        alert('현재 관리자 승인 심사 중입니다.');
        return;
      }
    }

    if (
      !window.confirm(
        autoAnalysisMeta.storeName +
          '의 ' +
          year +
          '년 ' +
          (month + 1) +
          '월 자동 추천 스케줄을 실제 스케줄표에 반영하시겠습니까?'
      )
    ) {
      return;
    }

    const updated = { ...schedules };
    daysInMonth.forEach((d) => {
      autoStoreStaff.forEach((stf) => {
        const key = d.dateStr + '_' + stf.id;
        if (isStaffHiddenOnDate(stf, d.dateStr)) {
          delete updated[key];
          return;
        }
        if (Object.prototype.hasOwnProperty.call(autoDraftSchedule, key)) {
          const val = autoDraftSchedule[key];
          if (val) updated[key] = val;
          else delete updated[key];
        }
      });
    });

    setSchedules(updated);
    saveToCloud({ schedules: updated });
    alert('자동 추천 스케줄이 당월 스케줄표에 반영되었습니다.');
    setActiveTab('schedule');
  };

  const dailyGroupCounts = useMemo(() => {
    const result = {};
    daysInMonth.forEach((d) => {
      const counts = { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0, total: 0, overtime: 0 };
      visibleStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const shift = schedules[d.dateStr + '_' + stf.id];
        if (isWorkCode(shift)) {
          const base = normalizeBaseGroup(shift);
          if (base) counts[base] += 1;
          counts.total += 1;
          if (isOvertimeCode(shift)) {
            counts.overtime += 1;
          }
        }
      });
      result[d.dateStr] = counts;
    });
    return result;
  }, [daysInMonth, visibleStaff, schedules]);

  const leaveOverviewRows = useMemo(() => {
    return staffList
      .filter((stf) => {
        if (isAdmin) {
          return selectedStoreId === 'ALL' || stf.storeId === selectedStoreId;
        }
        return stf.storeId === activeStaffProfile?.storeId;
      })
      .map((stf) => {
        const stName = stores.find((s) => s.id === stf.storeId)?.name || '미지정';
        const summary = leaveSummaryByStaff[stf.id] || {
          granted: Number(stf.annualLeave ?? 0),
          used: 0,
          remaining: Number(stf.annualLeave ?? 0),
          calcInfo: null
        };
        return {
          staff: stf,
          storeName: stName,
          ...summary
        };
      });
  }, [staffList, stores, isAdmin, selectedStoreId, activeStaffProfile, leaveSummaryByStaff]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-slate-800 px-6 py-7 text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">면세점 영업 · 스케줄 통합관리</h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center justify-center gap-1.5">
              <span className={fbReady ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-2 h-2 rounded-full bg-amber-400 animate-pulse'} />
              {syncStatus}
            </p>
          </div>
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => { setLoginMode('staff'); setPinInput(''); setLoginError(''); }}
              className={loginMode === 'staff'
                ? 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 text-slate-500'}
            >
              <UserCheck className="w-4 h-4" />판매사원 로그인
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('admin'); setPinInput(''); setLoginError(''); }}
              className={loginMode === 'admin'
                ? 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 text-slate-500'}
            >
              <ShieldCheck className="w-4 h-4" />본사 관리자 로그인
            </button>
          </div>
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginMode === 'staff' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">매장 및 성명 선택</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm bg-white"
                >
                  <option value="">-- 본인의 이름을 선택하세요 --</option>
                  {stores.map((st) => {
                    const members = activeStaffList.filter((m) => m.storeId === st.id);
                    if (members.length === 0) return null;
                    return (
                      <optgroup key={st.id} label={st.name}>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">관리자 계정 선택</label>
                  <select
                    value={selectedAdminId}
                    onChange={(e) => setSelectedAdminId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm bg-white font-medium"
                  >
                    <option value="MASTER">본사 마스터 관리자</option>
                    {adminAccounts.map((adm) => (
                      <option key={adm.id} value={adm.id}>{adm.name} (관리자)</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-800">
                  본사 관리자 전용 모드입니다. 전 매장 스케줄 승인/반려, USD 매출·수량 마감, 연차 승인 및 계정 관리를 수행합니다.
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {loginMode === 'admin' ? '관리자 PIN (4자리)' : '개인 PIN 번호 (4자리)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-center tracking-[0.5em] text-lg font-bold"
                />
              </div>
            </div>
            {loginError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{loginError}</span>
              </div>
            )}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-md">
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === '대기').length;
  const pendingSchedulesCount = stores.filter((st) => isStoreMonthPending(st.id)).length;
  const currentFilterStoreId = isAdmin ? selectedStoreId : activeStaffProfile?.storeId;
  const currentApprovalInfo =
    currentFilterStoreId && currentFilterStoreId !== 'ALL'
      ? getStoreApprovalInfo(currentFilterStoreId)
      : null;
  const currentStoreStatus = currentApprovalInfo?.status || 'DRAFT';
  const currentStoreApproved = currentStoreStatus === 'APPROVED';
  const currentStorePending = currentStoreStatus === 'PENDING';
  const currentStoreRejected = currentStoreStatus === 'REJECTED';
  const activeRemainLeave = leaveSummaryByStaff[activeStaffProfile?.id]?.remaining ?? activeStaffProfile?.annualLeave ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base">
                  {isAdmin ? adminDisplayName : (myStoreObj?.name || '매장')}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {isAdmin
                    ? 'ADMIN'
                    : activeStaffProfile?.name + ' (' + activeStaffProfile?.role + ' · 잔여연차 ' + formatDays(activeRemainLeave) + '일)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{syncStatus}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" /><span>로그아웃</span>
          </button>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-800">
          <button
            onClick={() => setActiveTab('schedule')}
            className={activeTab === 'schedule'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <CalendarIcon className="w-4 h-4" />근무 스케줄
            {isAdmin && pendingSchedulesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">{pendingSchedulesCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('auto_schedule')}
            className={activeTab === 'auto_schedule'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <Sparkles className="w-4 h-4" />매장별 자동 스케줄표
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={activeTab === 'sales'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <TrendingUp className="w-4 h-4" />일매출(USD) · 수량입력
          </button>
          <button
            onClick={() => setActiveTab('daily_sales_summary')}
            className={activeTab === 'daily_sales_summary'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <TableProperties className="w-4 h-4" />일별 매출 합계
          </button>
          <button
            onClick={() => setActiveTab('staff_sales')}
            className={activeTab === 'staff_sales'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <BarChart3 className="w-4 h-4" />사원별 배분집계
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={activeTab === 'leave'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <Clock className="w-4 h-4" />휴가 · 연차관리
            {isAdmin && pendingLeavesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white">{pendingLeavesCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={activeTab === 'settings'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <KeyRound className="w-4 h-4" />{isAdmin ? '관리자 · 직원 · 연차 · PIN' : '내 PIN 변경'}
          </button>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-base min-w-[110px] text-center">{year}년 {month + 1}월</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">지점 필터:</span>
              <select
                value={selectedStoreId}
                onChange={(e) => {
                  setSelectedStoreId(e.target.value);
                  if (e.target.value !== 'ALL') {
                    setAutoTargetStoreId(e.target.value);
                  }
                }}
                className="text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium"
              >
                <option value="ALL">전체 7개 매장 보기</option>
                {stores.map((st) => (<option key={st.id} value={st.id}>{st.name}</option>))}
              </select>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-4 space-y-6">
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-base">월간 근무 스케줄표 (A조 · B조 · C조 · F조 · 연장+)</h2>
                  {currentFilterStoreId && currentFilterStoreId !== 'ALL' && (
                    <span className={currentStoreApproved
                      ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1'
                      : currentStorePending
                      ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1'
                      : currentStoreRejected
                      ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 inline-flex items-center gap-1'
                      : 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 inline-flex items-center gap-1'}>
                      {currentStoreApproved ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {currentStoreApproved
                        ? '관리자 승인 완료'
                        : currentStorePending
                        ? '관리자 승인 대기 중'
                        : currentStoreRejected
                        ? '수정요청(반려)됨'
                        : '작성 중'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  매장 전용 <strong>[양식 다운로드]</strong> 후 엑셀에서 근무표를 작성해 <strong>[엑셀(CSV) 업로드]</strong>로 일괄 반영할 수 있습니다.
                </p>
                {overStreakStaffNames.length > 0 && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1 mt-1.5 font-medium">
                    4일 이상 연속 근무 주의: {overStreakStaffNames.join(', ')} (3일 연속 근무 후 휴무 배치를 권장합니다)
                  </p>
                )}
                {currentStoreRejected && currentApprovalInfo?.rejectReason && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1 mt-1.5">
                    반려 사유: {currentApprovalInfo.rejectReason}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(isManager || isAdmin) && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadScheduleTemplate}
                      className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-lg border border-slate-300"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" /><span>양식 다운로드</span>
                    </button>
                    <input
                      ref={scheduleFileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleUploadScheduleExcel}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={!canUploadScheduleExcel}
                      onClick={() => scheduleFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-lg border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-3.5 h-3.5" /><span>엑셀(CSV) 업로드</span>
                    </button>
                  </>
                )}
                {isManager && activeStaffProfile?.storeId && (
                  <>
                    {(currentStoreStatus === 'DRAFT' || currentStoreStatus === 'REJECTED') && (
                      <button
                        type="button"
                        onClick={() => handleRequestScheduleApproval(activeStaffProfile.storeId)}
                        className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-lg shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /><span>스케줄 승인 요청</span>
                      </button>
                    )}
                    {currentStorePending && (
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-3 py-2 rounded-lg">
                        승인 심사 중
                      </span>
                    )}
                    {currentStoreApproved && (
                      <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-3 py-2 rounded-lg">
                        승인 완료
                      </span>
                    )}
                  </>
                )}
                {isAdmin && selectedStoreId !== 'ALL' && (
                  <div className="flex items-center gap-1.5">
                    {currentStoreStatus !== 'APPROVED' ? (
                      <button
                        type="button"
                        onClick={() => handleDecideScheduleApproval(selectedStoreId, 'APPROVED')}
                        className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /><span>스케줄 승인</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDecideScheduleApproval(selectedStoreId, 'DRAFT')}
                        className="flex items-center gap-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-2 rounded-lg border border-amber-300"
                      >
                        <Unlock className="w-3.5 h-3.5" /><span>승인 해제</span>
                      </button>
                    )}
                    {currentStoreStatus !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleDecideScheduleApproval(selectedStoreId, 'REJECTED')}
                        className="flex items-center gap-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-2 rounded-lg border border-rose-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /><span>수정요청(반려)</span>
                      </button>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDownloadScheduleExcel}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /><span>엑셀(CSV) 다운로드</span>
                </button>
              </div>
            </div>

            {scheduleImportFeedback && (
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-950 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      [{scheduleImportFeedback.fileName}] 업로드 완료: 직원 {scheduleImportFeedback.matchedStaffCount}명 · 총 {scheduleImportFeedback.appliedCellsCount}칸 반영됨
                    </span>
                  </div>
                  {scheduleImportFeedback.skippedRows.length > 0 && (
                    <div className="text-amber-800">
                      매장 불일치/잠금으로 제외된 행: {scheduleImportFeedback.skippedRows.join(', ')}
                    </div>
                  )}
                  {scheduleImportFeedback.invalidCells.length > 0 && (
                    <div className="text-rose-700">
                      인식되지 않은 코드(건너뜀): {scheduleImportFeedback.invalidCells.slice(0, 8).join(', ')}
                      {scheduleImportFeedback.invalidCells.length > 8 ? ' 외 ' + (scheduleImportFeedback.invalidCells.length - 8) + '건' : ''}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleImportFeedback(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-semibold shrink-0"
                >
                  닫기
                </button>
              </div>
            )}

            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 text-xs">
              {SHIFT_TYPES.map((t) => (
                <span key={t.code} className={'px-2.5 py-1 rounded-md border font-medium ' + t.color}>
                  {t.code}: {t.label}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="sticky left-0 z-20 bg-slate-100 border-b border-r border-slate-200 px-3 py-2.5 text-left min-w-[160px]">
                      직원 (매장·잔여연차)
                    </th>
                    {daysInMonth.map((d) => {
                      const isSun = d.dayOfWeek === 0;
                      const isSat = d.dayOfWeek === 6;
                      return (
                        <th
                          key={d.dateStr}
                          className={'border-b border-r border-slate-200 px-1.5 py-2 text-center min-w-[54px] ' +
                            (d.isRedDay ? 'text-rose-600 bg-rose-50/70' : isSun ? 'text-rose-600 bg-rose-50/60' : isSat ? 'text-blue-600 bg-blue-50/40' : '')}
                        >
                          <div className="font-bold">{d.day}</div>
                          <div className="text-[10px]">{d.dayName}</div>
                        </th>
                      );
                    })}
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[62px] bg-indigo-50/80 text-indigo-900">
                      근무날수
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[60px] bg-sky-100/80 text-sky-900">
                      연장(+)
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[62px] bg-slate-100 text-slate-800">
                      휴무날수
                    </th>
                    <th className="border-b border-slate-200 px-2 py-2 text-center min-w-[68px] bg-amber-50/80 text-amber-900">
                      연차 사용수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStaff.map((stf) => {
                    const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
                    const remLeave = leaveSummaryByStaff[stf.id]?.remaining ?? stf.annualLeave ?? 0;
                    const sum = scheduleSummaryByStaff[stf.id] || { workDays: 0, overtimeDays: 0, offDays: 0, leaveUsed: 0, maxStreak: 0 };
                    return (
                      <tr key={stf.id} className="hover:bg-slate-50/70">
                        <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-3 py-2">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>{stf.name}</span>
                            <span className="text-[10px] font-normal text-slate-500">{stf.role}</span>
                            {sum.maxStreak >= 4 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                                {sum.maxStreak}연근
                              </span>
                            )}
                            {stf.status === 'RESIGNED' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                                퇴사({stf.resignedAt})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between gap-1 mt-0.5">
                            <span className="truncate">{stName}</span>
                            <span className="font-semibold text-indigo-600 shrink-0">연차 {formatDays(remLeave)}일</span>
                          </div>
                        </td>
                        {daysInMonth.map((d) => {
                          if (isStaffHiddenOnDate(stf, d.dateStr)) {
                            return (
                              <td
                                key={d.dateStr}
                                className="border-b border-r border-slate-200 p-1 text-center bg-slate-100/80 text-slate-300"
                              >
                                <span className="text-[10px]">-</span>
                              </td>
                            );
                          }
                          const editable = canEditScheduleForStaff(stf, d.dateStr);
                          const val = schedules[d.dateStr + '_' + stf.id] || '';
                          const shiftObj = SHIFT_TYPES.find((s) => s.code === val);
                          return (
                            <td key={d.dateStr} className="border-b border-r border-slate-200 p-1 text-center">
                              <select
                                disabled={!editable}
                                value={val}
                                onChange={(e) => handleScheduleChange(d.dateStr, stf, e.target.value)}
                                className={'w-full rounded px-1 py-1.5 text-[11px] font-semibold border cursor-pointer disabled:cursor-default disabled:opacity-80 ' +
                                  (shiftObj ? shiftObj.color : 'bg-white text-slate-400 border-slate-200')}
                              >
                                <option value="">-</option>
                                {SHIFT_TYPES.map((t) => (
                                  <option key={t.code} value={t.code}>{t.code}</option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                        <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-bold text-indigo-700 bg-indigo-50/30">
                          {sum.workDays}일
                        </td>
                        <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-extrabold text-sky-800 bg-sky-50/50">
                          {sum.overtimeDays}일
                        </td>
                        <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-700 bg-slate-50/60">
                          {sum.offDays}일
                        </td>
                        <td className="border-b border-slate-200 px-2 py-2 text-center font-bold text-amber-800 bg-amber-50/40">
                          {formatDays(sum.leaveUsed)}일
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50/70 font-semibold text-slate-800">
                    <td className="sticky left-0 z-10 bg-indigo-50 border-t-2 border-r border-slate-300 px-3 py-2 text-xs">
                      일별 근무인원 (연장 포함)
                    </td>
                    {daysInMonth.map((d) => {
                      const c = dailyGroupCounts[d.dateStr] || { total: 0, overtime: 0 };
                      return (
                        <td key={d.dateStr} className="border-t-2 border-r border-slate-300 px-1 py-2 text-center">
                          <div className="text-xs font-bold text-indigo-700">{c.total}명</div>
                          {c.overtime > 0 && (
                            <div className="text-[10px] font-bold text-sky-700">+{c.overtime}</div>
                          )}
                        </td>
                      );
                    })}
                    <td colSpan={4} className="border-t-2 border-slate-300 px-2 py-2 text-center text-[11px] text-slate-500">
                      인원별 합계 열 참조
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'auto_schedule' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>{year}년 {month + 1}월 매장별 자동 스케줄표 추천</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>최대 3일 연속 근무 제한(3일 근무 후 반드시 휴무 제안)</strong>을 지키며, 당월 토·일·공휴일({monthRedDayCount}일) 수만큼 <strong>휴무</strong>가 배정됩니다.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin ? (
                    <select
                      value={effectiveAutoStoreId}
                      onChange={(e) => setAutoTargetStoreId(e.target.value)}
                      className="text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white font-semibold"
                    >
                      {stores.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {autoStoreObj?.name || '내 매장'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateAutoSchedule}
                    className="flex items-center gap-1.5 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>자동 스케줄 생성</span>
                  </button>

                  {Object.keys(autoDraftSchedule).length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyAutoScheduleToMain}
                      className="flex items-center gap-1.5 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>당월 스케줄표에 반영</span>
                    </button>
                  )}
                </div>
              </div>

              {autoNotice && (
                <div
                  className={
                    autoStoreStaff.length === 0
                      ? 'mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800 font-semibold'
                      : 'mt-3 rounded-lg bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 text-xs text-indigo-900 font-medium'
                  }
                >
                  {autoNotice}
                </div>
              )}
            </div>

            {autoAnalysisMeta ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-700 font-medium">
                    <span className="font-bold text-indigo-700">{autoAnalysisMeta.storeName}</span> · 최대 연속근무: <span className="font-bold text-emerald-700">3일 제한 적용</span> · 토·일·공휴일 기준 휴무: <span className="font-bold">{autoAnalysisMeta.redDayCountInMonth}일</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    요일별 목표 출근: 일 {autoAnalysisMeta.weekdayTargetHeadcount[0]} · 월 {autoAnalysisMeta.weekdayTargetHeadcount[1]} · 화 {autoAnalysisMeta.weekdayTargetHeadcount[2]} · 수 {autoAnalysisMeta.weekdayTargetHeadcount[3]} · 목 {autoAnalysisMeta.weekdayTargetHeadcount[4]} · 금 {autoAnalysisMeta.weekdayTargetHeadcount[5]} · 토 {autoAnalysisMeta.weekdayTargetHeadcount[6]}
                  </div>
                </div>

                {autoAnalysisMeta.topPairs.length > 0 && (
                  <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-600">동반 출근 매출 시너지 상위:</span>
                    {autoAnalysisMeta.topPairs.map((p, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                        {p.names} ({formatUsd(p.avgSales)} / {p.daysCount}일)
                      </span>
                    ))}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="sticky left-0 z-20 bg-slate-100 border-b border-r border-slate-200 px-3 py-2.5 text-left min-w-[155px]">
                          직원 (직책)
                        </th>
                        {daysInMonth.map((d) => {
                          const isSun = d.dayOfWeek === 0;
                          const isSat = d.dayOfWeek === 6;
                          return (
                            <th
                              key={d.dateStr}
                              className={'border-b border-r border-slate-200 px-1.5 py-2 text-center min-w-[50px] ' +
                                (d.isRedDay ? 'text-rose-600 bg-rose-50/70' : isSun ? 'text-rose-600 bg-rose-50/60' : isSat ? 'text-blue-600 bg-blue-50/40' : '')}
                            >
                              <div className="font-bold">{d.day}</div>
                              <div className="text-[10px]">{d.dayName}</div>
                            </th>
                          );
                        })}
                        <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[62px] bg-indigo-50/80 text-indigo-900">
                          근무날수
                        </th>
                        <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[60px] bg-sky-100/80 text-sky-900">
                          연장(+)
                        </th>
                        <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[62px] bg-slate-100 text-slate-800">
                          휴무날수
                        </th>
                        <th className="border-b border-slate-200 px-2 py-2 text-center min-w-[62px] bg-amber-50/80 text-amber-900">
                          연차날수
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {autoStoreStaff.map((stf) => {
                        const wCnt = autoAnalysisMeta.workCountByStaff[stf.id] ?? 0;
                        const otCnt = autoAnalysisMeta.overtimeCountByStaff?.[stf.id] ?? 0;
                        const oCnt = autoAnalysisMeta.offCountByStaff[stf.id] ?? 0;
                        const lCnt = autoAnalysisMeta.leaveCountByStaff?.[stf.id] ?? 0;
                        return (
                          <tr key={stf.id} className="hover:bg-slate-50/70">
                            <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-3 py-2">
                              <div className="font-semibold text-slate-800 flex items-center gap-1 flex-wrap">
                                <span>{stf.name}</span>
                                <span className="text-[10px] font-normal text-slate-500">{stf.role}</span>
                                {stf.resignedAt && (
                                  <span className="text-[10px] px-1 rounded bg-rose-100 text-rose-700 font-bold">
                                    퇴사 {stf.resignedAt}
                                  </span>
                                )}
                              </div>
                            </td>
                            {daysInMonth.map((d) => {
                              if (isStaffHiddenOnDate(stf, d.dateStr)) {
                                return (
                                  <td
                                    key={d.dateStr}
                                    className="border-b border-r border-slate-200 p-1 text-center bg-slate-100/80 text-slate-300"
                                  >
                                    <span className="text-[10px]">-</span>
                                  </td>
                                );
                              }
                              const code = autoDraftSchedule[d.dateStr + '_' + stf.id] || '';
                              const shiftObj = SHIFT_TYPES.find((s) => s.code === code);
                              return (
                                <td key={d.dateStr} className="border-b border-r border-slate-200 p-1 text-center">
                                  <span className={'inline-block w-full py-1 rounded text-[11px] font-bold border ' +
                                    (shiftObj ? shiftObj.color : 'bg-slate-50 text-slate-400 border-slate-200')}>
                                    {code || '-'}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-bold text-indigo-700 bg-indigo-50/30">
                              {wCnt}일
                            </td>
                            <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-extrabold text-sky-800 bg-sky-50/50">
                              {otCnt}일
                            </td>
                            <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold text-slate-700 bg-slate-50/60">
                              {oCnt}일
                            </td>
                            <td className="border-b border-slate-200 px-2 py-2 text-center font-bold text-amber-800 bg-amber-50/40">
                              {formatDays(lCnt)}일
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50/80 font-semibold text-slate-900">
                        <td className="sticky left-0 z-10 bg-indigo-100/80 border-t-2 border-r border-slate-300 px-3 py-2 text-xs">
                          <div>조별 출근 인원</div>
                          <div className="text-[10px] font-normal text-slate-600">A조 · C조 · 합계</div>
                        </td>
                        {daysInMonth.map((d) => {
                          const gc = autoDailyGroupCounts[d.dateStr] || { aCount: 0, cCount: 0, total: 0 };
                          return (
                            <td key={d.dateStr} className="border-t-2 border-r border-slate-300 px-1 py-1.5 text-center">
                              <div className="text-[10px] text-sky-700 font-semibold">A {gc.aCount}</div>
                              <div className="text-[10px] text-purple-700 font-semibold">C {gc.cCount}</div>
                              <div className="text-[11px] font-extrabold text-indigo-800 border-t border-indigo-200/70 mt-0.5 pt-0.5">
                                {gc.total}명
                              </div>
                            </td>
                          );
                        })}
                        <td colSpan={4} className="border-t-2 border-slate-300 px-2 py-2 text-center text-[11px] text-slate-600">
                          우측 일수 집계 참조
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                매장을 선택한 뒤 <strong>[자동 스케줄 생성]</strong> 버튼을 누르면 추천 스케줄표가 표시됩니다.
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveSales} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-indigo-600" /><span>일매출(USD) · 수량 등록</span></h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">매출 일자</label>
                <input type="date" value={salesDate} onChange={(e) => setSalesDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">대상 매장</label>
                {isAdmin ? (
                  <select value={salesStoreInput} onChange={(e) => setSalesStoreInput(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                    {stores.map((st) => (<option key={st.id} value={st.id}>{st.name}</option>))}
                  </select>
                ) : (
                  <input type="text" readOnly value={myStoreObj?.name || ''} className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700" />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">일매출 금액 (USD $)</label>
                <input type="number" min="0" step="1" value={salesAmountInput} onChange={(e) => setSalesAmountInput(e.target.value)} placeholder="예: 4500" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">판매 수량 (PCS / 개)</label>
                <input type="number" min="0" step="1" value={salesQuantityInput} onChange={(e) => setSalesQuantityInput(e.target.value)} placeholder="예: 35" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">메모 (선택)</label>
                <input type="text" value={salesNoteInput} onChange={(e) => setSalesNoteInput(e.target.value)} placeholder="프로모션, 단체 관광객 등" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">매출·수량 저장하기</button>
            </form>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-base mb-3">{year}년 {month + 1}월 매장별 누적 매출(USD) · 수량 현황</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stores.map((st) => {
                  const sumObj = monthlySalesSummary[st.id] || { amount: 0, quantity: 0 };
                  const achRate = st.targetSales > 0 ? Math.round((sumObj.amount / st.targetSales) * 100) : 0;
                  return (
                    <div key={st.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{st.name}</span>
                        <span className="text-xs font-bold text-indigo-600">{achRate}%</span>
                      </div>
                      <div className="text-lg font-extrabold mt-1">{formatUsd(sumObj.amount)}</div>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">누적 판매수량: {formatQty(sumObj.quantity)} PCS</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">월 목표: {formatUsd(st.targetSales)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daily_sales_summary' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base">{year}년 {month + 1}월 일별 · 매장별 매출(USD) 및 수량 합계</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  매출 발생일({dailyStoreMatrix.activeSalesDaysCount}일) 일평균 매출: <span className="font-bold text-indigo-700">{formatUsd(dailyStoreMatrix.avgDailyAmount)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadDailySalesExcel}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /><span>일별 매출합계 엑셀(CSV) 다운로드</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="sticky left-0 z-20 bg-slate-100 border-b border-r border-slate-200 px-3 py-2.5 text-left min-w-[105px]">일자</th>
                    {targetStoresForDailyMatrix.map((st) => (
                      <th key={st.id} className="border-b border-r border-slate-200 px-3 py-2.5 text-right min-w-[130px]">{st.name}</th>
                    ))}
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right min-w-[125px] bg-indigo-50/70 text-indigo-900">일별 합계</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStoreMatrix.rows.map((r) => (
                    <tr key={r.dateStr} className="hover:bg-slate-50/80">
                      <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-3 py-2 font-semibold">{r.day}일 ({r.dayName})</td>
                      {targetStoresForDailyMatrix.map((st) => {
                        const cell = r.cells[st.id] || { amount: 0, quantity: 0 };
                        return (
                          <td key={st.id} className="border-b border-r border-slate-200 px-3 py-2 text-right">
                            <div className="font-semibold text-slate-800">{formatUsd(cell.amount)}</div>
                            <div className="text-[11px] text-emerald-700 font-medium">{formatQty(cell.quantity)} PCS</div>
                          </td>
                        );
                      })}
                      <td className="border-b border-r border-slate-200 px-3 py-2 text-right bg-indigo-50/40">
                        <div className="font-bold text-indigo-700">{formatUsd(r.dayAmount)}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">{formatQty(r.dayQuantity)} PCS</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50 font-bold text-slate-900">
                    <td className="sticky left-0 z-10 bg-indigo-100 border-t-2 border-r border-slate-300 px-3 py-2.5">월 누적 합계</td>
                    {targetStoresForDailyMatrix.map((st) => {
                      const tot = dailyStoreMatrix.storeTotals[st.id] || { amount: 0, quantity: 0 };
                      return (
                        <td key={st.id} className="border-t-2 border-r border-slate-300 px-3 py-2.5 text-right">
                          <div className="font-extrabold text-slate-900">{formatUsd(tot.amount)}</div>
                          <div className="text-[11px] text-emerald-800 font-semibold">{formatQty(tot.quantity)} PCS</div>
                        </td>
                      );
                    })}
                    <td className="border-t-2 border-r border-slate-300 px-3 py-2.5 text-right bg-indigo-100">
                      <div className="font-extrabold text-indigo-800">{formatUsd(dailyStoreMatrix.grandTotalAmount)}</div>
                      <div className="text-[11px] text-emerald-800 font-bold">{formatQty(dailyStoreMatrix.grandTotalQuantity)} PCS</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff_sales' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base">{year}년 {month + 1}월 사원별 출근일 매출 배분 · 조별 평균 집계</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  당일 출근한 모든 직원(A+·B+·C+ 연장 포함)에게 일매출·수량을 동일 배분하여 출근일 평균과 조별 평균을 산출합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadStaffSalesExcel}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /><span>사원별 배분집계 엑셀(CSV) 다운로드</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">
                      <button type="button" onClick={() => handleHeaderSort('staffName')} className="font-bold flex items-center">
                        사원명 {renderSortIcon('staffName')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">
                      <button type="button" onClick={() => handleHeaderSort('storeName')} className="font-bold flex items-center">
                        소속 매장 {renderSortIcon('storeName')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">
                      <button type="button" onClick={() => handleHeaderSort('workDaysCount')} className="font-bold inline-flex items-center">
                        출근일수 {renderSortIcon('workDaysCount')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center bg-sky-50/70">
                      <button type="button" onClick={() => handleHeaderSort('overtimeDaysCount')} className="font-bold inline-flex items-center text-sky-900">
                        연장(+) {renderSortIcon('overtimeDaysCount')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                      <button type="button" onClick={() => handleHeaderSort('totalAllocatedRounded')} className="font-bold inline-flex items-center">
                        총 배분매출 {renderSortIcon('totalAllocatedRounded')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                      <button type="button" onClick={() => handleHeaderSort('totalAllocatedQtyRounded')} className="font-bold inline-flex items-center">
                        총 배분수량 {renderSortIcon('totalAllocatedQtyRounded')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right bg-indigo-50/70">
                      <button type="button" onClick={() => handleHeaderSort('overallAvg')} className="font-bold inline-flex items-center text-indigo-900">
                        일 평균매출 {renderSortIcon('overallAvg')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                      <button type="button" onClick={() => handleHeaderSort('overallAvgQty')} className="font-bold inline-flex items-center">
                        일 평균수량 {renderSortIcon('overallAvgQty')}
                      </button>
                    </th>
                    {BASE_WORK_GROUPS.map((g) => (
                      <th key={g} className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                        <button type="button" onClick={() => handleHeaderSort('group_' + g)} className="font-bold inline-flex items-center">
                          {g} 평균 {renderSortIcon('group_' + g)}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStaffSalesAnalytics.map((row) => (
                    <tr key={row.staff.id} className="hover:bg-slate-50">
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 font-semibold">{row.staff.name}</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-slate-600">{row.storeName}</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-semibold">{row.workDaysCount}일</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold text-sky-800 bg-sky-50/40">{row.overtimeDaysCount}일</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-semibold">{formatUsd(row.totalAllocatedRounded)}</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-semibold text-emerald-700">{formatQty(row.totalAllocatedQtyRounded)} PCS</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-bold text-indigo-700 bg-indigo-50/40">{formatUsd(row.overallAvg)}</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-semibold text-emerald-700">{formatQty(row.overallAvgQty)} PCS</td>
                      {BASE_WORK_GROUPS.map((g) => (
                        <td key={g} className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                          {row.groupAverages[g] !== null ? formatUsd(row.groupAverages[g]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-bold text-base">입사년월 기준 연차 현황 (발생 · 사용 · 잔여)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">성명</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">소속 매장</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">입사년월</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">발생연차</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">사용연차</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center bg-indigo-50/70 text-indigo-900">잔여연차</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveOverviewRows.map((item) => (
                      <tr key={item.staff.id} className="hover:bg-slate-50">
                        <td className="border-b border-r border-slate-200 px-3 py-2 font-semibold">{item.staff.name}</td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-slate-600">{item.storeName}</td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center">{formatHireYearMonth(item.staff.hireDate)}</td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold">{formatDays(item.granted)}일</td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center text-amber-700 font-semibold">{formatDays(item.used)}일</td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-extrabold text-indigo-700 bg-indigo-50/40">{formatDays(item.remaining)}일</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {!isAdmin && (
                <form onSubmit={handleSubmitLeave} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h2 className="font-bold text-base">연차 · 반차 신청</h2>
                  <div className="text-xs bg-indigo-50 text-indigo-800 px-3 py-2 rounded-lg font-semibold">
                    현재 잔여 연차: {formatDays(activeRemainLeave)}일
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">휴가 일자</label>
                    <input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">휴가 구분</label>
                    <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                      <option value="연차">연차 (1일 차감)</option>
                      <option value="반차">반차 (0.5일 차감)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">사유</label>
                    <input type="text" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="개인 사유" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">휴가 신청 제출</button>
                </form>
              )}

              <div className={(isAdmin ? 'lg:col-span-3' : 'lg:col-span-2') + ' bg-white rounded-xl border border-slate-200 p-5 shadow-sm'}>
                <h2 className="font-bold text-base mb-3">휴가 신청 내역</h2>
                {leaveRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">등록된 휴가 신청 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-2.5">
                    {leaveRequests
                      .filter((r) => isAdmin || r.staffId === activeStaffProfile?.id)
                      .map((req) => (
                        <div key={req.id} className="border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{req.staffName}</span>
                              <span className="text-xs text-slate-500">{req.storeName}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{req.type}</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">일자: <strong>{req.date}</strong> · 사유: {req.reason}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' +
                              (req.status === '승인' ? 'bg-emerald-100 text-emerald-800' : req.status === '반려' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}>
                              {req.status}
                            </span>
                            {isAdmin && req.status === '대기' && (
                              <>
                                <button type="button" onClick={() => handleLeaveAction(req, '승인')} className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={() => handleLeaveAction(req, '반려')} className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"><XCircle className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          !isAdmin ? (
            <div className="max-w-md bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-base mb-3">내 PIN 번호 변경</h2>
              <form onSubmit={handleSelfPinChange} className="space-y-3">
                <input type="password" inputMode="numeric" maxLength={4} value={newSelfPin} onChange={(e) => setNewSelfPin(e.target.value.replace(/\D/g, ''))} placeholder="새 PIN 4자리" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">PIN 변경 저장</button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-base">7개 매장 · 34명 직원 명단 클라우드 동기화</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    현재 등록된 실제 7개 매장 및 34명 직원 명단으로 클라우드 데이터를 최신화합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncDefaultRosterToCloud}
                  className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>7개 매장 · 34명 직원 동기화</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h2 className="font-bold text-base mb-3">직원 추가 (입사년월 기준 연차 자동 계산)</h2>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-7 gap-2.5">
                  <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="성명" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  <select value={newStaffStore} onChange={(e) => setNewStaffStore(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm bg-white">
                    {stores.map((st) => (<option key={st.id} value={st.id}>{st.name}</option>))}
                  </select>
                  <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm bg-white">
                    {ROLE_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                  </select>
                  <input type="date" value={newStaffHireDate} onChange={(e) => handleHireDateInputChange(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm" />
                  <input type="number" step="0.5" min="0" value={newStaffAnnualLeave} onChange={(e) => setNewStaffAnnualLeave(e.target.value)} placeholder="연차일수" className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm" />
                  <input type="text" maxLength={4} value={newStaffPin} onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))} placeholder="PIN 4자리" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" /><span>추가</span>
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
                <h2 className="font-bold text-base mb-3">전체 직원 명단 및 연차/PIN 관리 ({staffList.length}명)</h2>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-left">성명</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-left">매장</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-left">직책</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">입사일</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">발생연차</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">잔여연차</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">퇴사일</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">PIN</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((stf) => {
                      const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
                      const summary = leaveSummaryByStaff[stf.id] || { granted: 0, remaining: 0 };
                      return (
                        <tr key={stf.id} className={stf.status === 'RESIGNED' ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50'}>
                          <td className="border-b border-r border-slate-200 px-3 py-2 font-semibold">{stf.name}</td>
                          <td className="border-b border-r border-slate-200 px-3 py-2">{stName}</td>
                          <td className="border-b border-r border-slate-200 px-3 py-2">
                            <select value={stf.role} onChange={(e) => handleUpdateStaffRole(stf.id, e.target.value)} className="border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-800">
                              {ROLE_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                            </select>
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center">
                            <input type="date" value={stf.hireDate || ''} onChange={(e) => handleUpdateStaffHireDate(stf.id, e.target.value)} className="border border-slate-200 rounded px-1.5 py-1 text-slate-800" />
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={summary.granted}
                              onChange={(e) => handleUpdateStaffLeaveDays(stf.id, e.target.value)}
                              className="w-16 border border-slate-200 rounded px-1.5 py-1 text-center font-semibold text-slate-800"
                            />
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-bold text-indigo-700">{formatDays(summary.remaining)}일</td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-mono text-rose-700">
                            {stf.status === 'RESIGNED' ? stf.resignedAt || '-' : '-'}
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-mono">{stf.pin}</td>
                          <td className="border-b border-slate-200 px-3 py-2 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button type="button" onClick={() => handleApplyAutoLeaveByHireDate(stf.id)} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">자동연차</button>
                              <button type="button" onClick={() => handleResetStaffPin(stf.id, stf.name)} className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700">PIN</button>
                              {stf.status !== 'RESIGNED' ? (
                                <button type="button" onClick={() => openResignModal(stf)} className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700">퇴사</button>
                              ) : (
                                <button type="button" onClick={() => handleReinstateStaff(stf.id, stf.name)} className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700">복직</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h2 className="font-bold text-base mb-3">매장명 및 월 목표 매출(USD) 설정</h2>
                  <div className="space-y-2.5">
                    {stores.map((st) => (
                      <div key={st.id} className="flex items-center gap-2">
                        <input type="text" value={st.name} onChange={(e) => handleUpdateStore(st.id, 'name', e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold" />
                        <input type="number" value={st.targetSales} onChange={(e) => handleUpdateStore(st.id, 'targetSales', e.target.value)} className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-right font-semibold" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h2 className="font-bold text-base">마스터 PIN 및 당월 데이터 초기화</h2>
                  <form onSubmit={handleUpdateAdminPin} className="flex gap-2">
                    <input type="password" inputMode="numeric" maxLength={4} value={newAdminPinInput} onChange={(e) => setNewAdminPinInput(e.target.value.replace(/\D/g, ''))} placeholder="새 마스터 PIN 4자리" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" />
                    <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg text-xs">PIN 변경</button>
                  </form>
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleClearMonthData('schedule')} className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200">
                      {year}년 {month + 1}월 스케줄 삭제
                    </button>
                    <button type="button" onClick={() => handleClearMonthData('sales')} className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200">
                      {year}년 {month + 1}월 매출 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {resignModalStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmResignStaff}
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900">
              {resignModalStaff.name} 님 퇴사 처리
            </h3>
            <p className="text-xs text-slate-500">
              입력한 <strong>퇴사일 다음 날</strong>부터 스케줄표 및 자동 스케줄에서 표시되지 않습니다.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">퇴사 날짜 선택</label>
              <input
                type="date"
                value={resignDateInput}
                onChange={(e) => setResignDateInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResignModalStaff(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white"
              >
                퇴사 확정
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
