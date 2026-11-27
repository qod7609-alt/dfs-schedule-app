import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

const DEFAULT_ADMINS = [
  { id: 'adm_1', name: '영업총괄', pin: '1234' },
  { id: 'adm_2', name: '운영지원', pin: '5678' }
];

const ROLE_OPTIONS = ['매니저', '부매니저', '슈퍼바이저', 'TF팀장', '시니어', '사원', '아르바이트'];

const SHIFT_TYPES = [
  { code: 'A', label: 'A조 근무', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  { code: 'A+', label: 'A조 연장', color: 'bg-sky-100 text-sky-950 border-sky-300' },
  { code: 'B', label: 'B조 근무', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { code: 'B+', label: 'B조 연장', color: 'bg-indigo-100 text-indigo-950 border-indigo-300' },
  { code: 'C', label: 'C조 근무', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { code: 'C+', label: 'C조 연장', color: 'bg-purple-100 text-purple-950 border-purple-300' },
  { code: 'F', label: 'F조 근무', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { code: 'F+', label: 'F조 연장', color: 'bg-cyan-100 text-cyan-950 border-cyan-300' },
  { code: '휴무', label: '휴무', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { code: '연차', label: '연차 (1일)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { code: '오전반차', label: '오전 반차 (0.5일)', color: 'bg-amber-50/70 text-amber-700 border-amber-200' },
  { code: '오후반차', label: '오후 반차 (0.5일)', color: 'bg-amber-50/70 text-amber-700 border-amber-200' }
];

const VALID_SHIFT_CODES = new Set(SHIFT_TYPES.map((s) => s.code));
const BASE_WORK_GROUPS = ['A조', 'B조', 'C조', 'F조'];
const AUTO_WORK_GROUPS = ['A', 'C'];

const KR_HOLIDAYS = new Set([
  '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30', '2025-03-01', '2025-03-03',
  '2025-05-05', '2025-05-06', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-05',
  '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09', '2025-12-25',
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-01', '2026-03-02',
  '2026-05-05', '2026-05-24', '2026-05-25', '2026-06-06', '2026-08-15', '2026-08-17',
  '2026-09-24', '2026-09-25', '2026-09-26', '2026-10-03', '2026-10-05', '2026-10-09',
  '2026-12-25'
]);

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const normalizeBaseGroup = (code) => {
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  if (clean === 'A' || clean === 'A+' || clean === 'A조' || clean === 'A조+') return 'A조';
  if (clean === 'B' || clean === 'B+' || clean === 'B조' || clean === 'B조+') return 'B조';
  if (clean === 'C' || clean === 'C+' || clean === 'C조' || clean === 'C조+') return 'C조';
  if (clean === 'F' || clean === 'F+' || clean === 'F조' || clean === 'F조+') return 'F조';
  return null;
};

const isWorkCode = (code) => Boolean(normalizeBaseGroup(code));
const isOvertimeCode = (code) => Boolean(code && String(code).includes('+'));

const getLeaveUnitsFromCode = (code) => {
  if (code === '연차') return 1;
  if (code === '오전반차' || code === '오후반차' || code === '반차') return 0.5;
  return 0;
};

const formatUsd = (num) => {
  const n = Number(num) || 0;
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatQty = (num) => {
  const n = Number(num) || 0;
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
};

const formatDays = (num) => {
  const n = Number(num) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

const formatHireYearMonth = (hireDateStr) => {
  if (!hireDateStr) return '-';
  const parts = String(hireDateStr).split('-');
  if (parts.length >= 2) {
    return `${parts[0]}년 ${Number(parts[1])}월`;
  }
  return hireDateStr;
};

const calcAnnualLeaveByHireYearMonth = (hireDateStr, refDate = new Date(2026, 10, 27)) => {
  if (!hireDateStr) return 0;
  const [yStr, mStr] = String(hireDateStr).split('-');
  const hireYear = Number(yStr);
  const hireMonth = Number(mStr);
  if (!hireYear || !hireMonth) return 0;

  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth() + 1;
  const monthsWorked = Math.max(0, (refYear - hireYear) * 12 + (refMonth - hireMonth));

  if (monthsWorked < 12) {
    return Math.min(11, monthsWorked);
  }
  const yearsWorked = Math.floor(monthsWorked / 12);
  const extraDays = Math.max(0, Math.floor((yearsWorked - 1) / 2));
  return Math.min(25, 15 + extraDays);
};

const parseCsvLine = (line) => {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
};

const escapeCsvCell = (val) => {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const triggerCsvDownload = (filename, lines) => {
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [fbReady, setFbReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Firebase 연결 중...');
  const skipNextSnapshotRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [loginMode, setLoginMode] = useState('staff');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedAdminId, setSelectedAdminId] = useState('MASTER');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1));
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedStoreId, setSelectedStoreId] = useState('ALL');

  const [stores, setStores] = useState(DEFAULT_STORES);
  const [monthlyStoreTargets, setMonthlyStoreTargets] = useState({});
  const [staffList, setStaffList] = useState(DEFAULT_STAFF);
  const [adminAccounts, setAdminAccounts] = useState(DEFAULT_ADMINS);
  const [masterPin, setMasterPin] = useState('9999');
  const [schedules, setSchedules] = useState({});
  const [scheduleApprovals, setScheduleApprovals] = useState({});
  const [salesRecords, setSalesRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [autoTargetStoreId, setAutoTargetStoreId] = useState('store_1');
  const [autoDraftSchedule, setAutoDraftSchedule] = useState({});
  const [autoAnalysisMeta, setAutoAnalysisMeta] = useState(null);
  const [autoNotice, setAutoNotice] = useState('');

  const [salesDate, setSalesDate] = useState('2026-11-27');
  const [salesStoreInput, setSalesStoreInput] = useState('store_1');
  const [salesAmountInput, setSalesAmountInput] = useState('');
  const [salesQuantityInput, setSalesQuantityInput] = useState('');
  const [salesNoteInput, setSalesNoteInput] = useState('');

  const [leaveDate, setLeaveDate] = useState('2026-11-28');
  const [leaveType, setLeaveType] = useState('연차');
  const [leaveReason, setLeaveReason] = useState('');

  const [newSelfPin, setNewSelfPin] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffStore, setNewStaffStore] = useState('store_1');
  const [newStaffRole, setNewStaffRole] = useState('사원');
  const [newStaffHireDate, setNewStaffHireDate] = useState('2026-01-01');
  const [newStaffAnnualLeave, setNewStaffAnnualLeave] = useState('0');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newAdminPinInput, setNewAdminPinInput] = useState('');
  const [resignModalStaff, setResignModalStaff] = useState(null);
  const [resignDateInput, setResignDateInput] = useState('2026-11-27');

  const [sortConfig, setSortConfig] = useState({ key: 'overallAvg', direction: 'desc' });
  const [scheduleImportFeedback, setScheduleImportFeedback] = useState(null);
  const scheduleFileInputRef = useRef(null);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
          return;
        }
        setFbReady(true);
        setSyncStatus('Firebase 실시간 동기화 연결됨');

        unsubscribeSnapshot = onSnapshot(
          APP_DOC_REF,
          (snap) => {
            if (skipNextSnapshotRef.current) {
              skipNextSnapshotRef.current = false;
              return;
            }
            if (snap.exists()) {
              const data = snap.data();
              if (Array.isArray(data.stores) && data.stores.length > 0) setStores(data.stores);
              if (data.monthlyStoreTargets && typeof data.monthlyStoreTargets === 'object') {
                setMonthlyStoreTargets(data.monthlyStoreTargets);
              }
              if (Array.isArray(data.staffList) && data.staffList.length > 0) setStaffList(data.staffList);
              if (Array.isArray(data.adminAccounts)) setAdminAccounts(data.adminAccounts);
              if (typeof data.masterPin === 'string' && data.masterPin) setMasterPin(data.masterPin);
              if (data.schedules && typeof data.schedules === 'object') setSchedules(data.schedules);
              if (data.scheduleApprovals && typeof data.scheduleApprovals === 'object') {
                setScheduleApprovals(data.scheduleApprovals);
              }
              if (Array.isArray(data.salesRecords)) setSalesRecords(data.salesRecords);
              if (Array.isArray(data.leaveRequests)) setLeaveRequests(data.leaveRequests);
            }
          },
          (err) => {
            console.error('Snapshot error:', err);
            setSyncStatus('동기화 경고 (로컬 유지)');
          }
        );
      } catch (err) {
        console.error('Auth error:', err);
        setSyncStatus('인증 오류 (로컬 모드)');
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const saveToCloud = useCallback(async (partialPatch) => {
    try {
      skipNextSnapshotRef.current = true;
      await setDoc(APP_DOC_REF, { ...partialPatch, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('Cloud save error:', err);
    }
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const daysInMonth = useMemo(() => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = KR_HOLIDAYS.has(dateStr);
      arr.push({
        day,
        dateStr,
        dayOfWeek,
        dayName: DAY_NAMES[dayOfWeek],
        isHoliday,
        isRedDay: isWeekend || isHoliday
      });
    }
    return arr;
  }, [year, month]);

  const monthRedDayCount = useMemo(
    () => daysInMonth.filter((d) => d.isRedDay).length,
    [daysInMonth]
  );

  // 매장별 월별 목표 금액 조회 (YYYY-MM_storeId 단위 분리)
  const getStoreMonthlyTarget = useCallback(
    (storeId, monthPrefix = currentMonthPrefix) => {
      const key = `${monthPrefix}_${storeId}`;
      if (
        monthlyStoreTargets &&
        Object.prototype.hasOwnProperty.call(monthlyStoreTargets, key) &&
        monthlyStoreTargets[key] !== '' &&
        monthlyStoreTargets[key] !== null &&
        monthlyStoreTargets[key] !== undefined
      ) {
        return Number(monthlyStoreTargets[key]) || 0;
      }
      const stObj = stores.find((s) => s.id === storeId);
      return Number(stObj?.targetSales ?? 0);
    },
    [monthlyStoreTargets, stores, currentMonthPrefix]
  );

  // 매장별 월별 목표 금액 수정 (선택된 월에만 따로 반영)
  const handleUpdateMonthlyStoreTarget = useCallback(
    (storeId, rawValue, monthPrefix = currentMonthPrefix) => {
      const numericVal = rawValue === '' ? 0 : Math.max(0, Number(rawValue) || 0);
      const key = `${monthPrefix}_${storeId}`;
      setMonthlyStoreTargets((prev) => {
        const next = {
          ...(prev || {}),
          [key]: numericVal
        };
        saveToCloud({ monthlyStoreTargets: next });
        return next;
      });
    },
    [currentMonthPrefix, saveToCloud]
  );

  const isAdmin = currentUser?.roleType === 'ADMIN';
  const activeStaffProfile = useMemo(() => {
    if (!currentUser || currentUser.roleType !== 'STAFF') return null;
    return staffList.find((s) => s.id === currentUser.staffId) || null;
  }, [currentUser, staffList]);

  const isManager = activeStaffProfile?.role === '매니저';
  const myStoreObj = useMemo(
    () => stores.find((s) => s.id === activeStaffProfile?.storeId) || null,
    [stores, activeStaffProfile]
  );

  const adminDisplayName = useMemo(() => {
    if (!isAdmin) return '';
    if (currentUser.adminId === 'MASTER') return '본사 마스터 관리자';
    const found = adminAccounts.find((a) => a.id === currentUser.adminId);
    return found ? `${found.name} (관리자)` : '본사 관리자';
  }, [isAdmin, currentUser, adminAccounts]);

  const activeStaffList = useMemo(
    () => staffList.filter((s) => s.status !== 'RESIGNED'),
    [staffList]
  );

  const isStaffHiddenOnDate = useCallback((stf, dateStr) => {
    if (!stf) return false;
    if (stf.status === 'RESIGNED' && stf.resignedAt && dateStr > stf.resignedAt) {
      return true;
    }
    return false;
  }, []);

  const visibleStaff = useMemo(() => {
    return staffList.filter((stf) => {
      const matchesStore = isAdmin
        ? selectedStoreId === 'ALL' || stf.storeId === selectedStoreId
        : stf.storeId === activeStaffProfile?.storeId;
      if (!matchesStore) return false;
      return daysInMonth.some((d) => !isStaffHiddenOnDate(stf, d.dateStr));
    });
  }, [staffList, isAdmin, selectedStoreId, activeStaffProfile, daysInMonth, isStaffHiddenOnDate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginMode === 'staff') {
      if (!selectedStaffId) {
        setLoginError('본인의 성명을 선택해 주세요.');
        return;
      }
      const targetStaff = staffList.find((s) => s.id === selectedStaffId);
      if (!targetStaff || targetStaff.status === 'RESIGNED') {
        setLoginError('유효하지 않은 직원 계정입니다.');
        return;
      }
      if (String(targetStaff.pin) !== String(pinInput)) {
        setLoginError('PIN 번호가 일치하지 않습니다.');
        return;
      }
      setCurrentUser({ roleType: 'STAFF', staffId: targetStaff.id });
      setSalesStoreInput(targetStaff.storeId);
      setAutoTargetStoreId(targetStaff.storeId);
      setPinInput('');
    } else {
      if (selectedAdminId === 'MASTER') {
        if (String(pinInput) !== String(masterPin)) {
          setLoginError('마스터 PIN 번호가 일치하지 않습니다.');
          return;
        }
        setCurrentUser({ roleType: 'ADMIN', adminId: 'MASTER' });
      } else {
        const adm = adminAccounts.find((a) => a.id === selectedAdminId);
        if (!adm || String(adm.pin) !== String(pinInput)) {
          setLoginError('관리자 PIN 번호가 일치하지 않습니다.');
          return;
        }
        setCurrentUser({ roleType: 'ADMIN', adminId: adm.id });
      }
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPinInput('');
    setLoginError('');
  };

  const getStoreApprovalInfo = useCallback(
    (storeId) => {
      const key = `${currentMonthPrefix}_${storeId}`;
      return scheduleApprovals[key] || { status: 'DRAFT', rejectReason: '' };
    },
    [scheduleApprovals, currentMonthPrefix]
  );

  const isStoreMonthPending = useCallback(
    (storeId) => getStoreApprovalInfo(storeId).status === 'PENDING',
    [getStoreApprovalInfo]
  );

  const canEditScheduleForStaff = useCallback(
    (stf, dateStr) => {
      if (!currentUser || !stf) return false;
      if (isStaffHiddenOnDate(stf, dateStr)) return false;
      if (isAdmin) return true;
      const approval = getStoreApprovalInfo(stf.storeId);
      if (approval.status === 'APPROVED' || approval.status === 'PENDING') return false;
      if (isManager && stf.storeId === activeStaffProfile?.storeId) return true;
      return stf.id === activeStaffProfile?.id;
    },
    [currentUser, isAdmin, isManager, activeStaffProfile, isStaffHiddenOnDate, getStoreApprovalInfo]
  );

  const handleScheduleChange = (dateStr, stf, newCode) => {
    if (!canEditScheduleForStaff(stf, dateStr)) return;
    const key = `${dateStr}_${stf.id}`;
    setSchedules((prev) => {
      const next = { ...prev };
      if (!newCode) delete next[key];
      else next[key] = newCode;
      saveToCloud({ schedules: next });
      return next;
    });
  };

  const handleRequestScheduleApproval = (storeId) => {
    const key = `${currentMonthPrefix}_${storeId}`;
    const nextApprovals = {
      ...scheduleApprovals,
      [key]: { status: 'PENDING', rejectReason: '', requestedAt: new Date().toISOString() }
    };
    setScheduleApprovals(nextApprovals);
    saveToCloud({ scheduleApprovals: nextApprovals });
    alert('관리자에게 스케줄 승인을 요청했습니다.');
  };

  const handleDecideScheduleApproval = (storeId, nextStatus) => {
    const key = `${currentMonthPrefix}_${storeId}`;
    let rejectReason = '';
    if (nextStatus === 'REJECTED') {
      rejectReason = window.prompt('반려(수정요청) 사유를 입력하세요:', '근무 인원 조정 필요') || '수정 요청';
    }
    const nextApprovals = {
      ...scheduleApprovals,
      [key]: {
        status: nextStatus,
        rejectReason,
        decidedAt: new Date().toISOString()
      }
    };
    setScheduleApprovals(nextApprovals);
    saveToCloud({ scheduleApprovals: nextApprovals });
  };

  // 개인별 근무일수 · 조별 근무일수 · 연장 · 휴무 · 연차 · 최대연속근무 집계
  const scheduleSummaryByStaff = useMemo(() => {
    const map = {};
    visibleStaff.forEach((stf) => {
      let workDays = 0;
      let overtimeDays = 0;
      let offDays = 0;
      let leaveUsed = 0;
      let streak = 0;
      let maxStreak = 0;
      const groupDays = { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0 };

      daysInMonth.forEach((d) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) {
          streak = 0;
          return;
        }
        const code = schedules[`${d.dateStr}_${stf.id}`] || '';
        const baseGrp = normalizeBaseGroup(code);

        if (baseGrp) {
          workDays += 1;
          groupDays[baseGrp] += 1;
          if (isOvertimeCode(code)) overtimeDays += 1;
          streak += 1;
          if (streak > maxStreak) maxStreak = streak;
        } else {
          streak = 0;
          if (code === '휴무') offDays += 1;
          const lv = getLeaveUnitsFromCode(code);
          if (lv > 0) leaveUsed += lv;
        }
      });

      map[stf.id] = {
        workDays,
        overtimeDays,
        offDays,
        leaveUsed,
        maxStreak,
        groupDays
      };
    });
    return map;
  }, [visibleStaff, daysInMonth, schedules, isStaffHiddenOnDate]);

  // 날짜별 조별 출근 인원 집계 (하단 <tfoot>)
  const dailyGroupCounts = useMemo(() => {
    const result = {};
    daysInMonth.forEach((d) => {
      const counts = { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0, total: 0, overtime: 0 };
      visibleStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const shift = schedules[`${d.dateStr}_${stf.id}`] || '';
        const base = normalizeBaseGroup(shift);
        if (base) {
          counts[base] += 1;
          counts.total += 1;
          if (isOvertimeCode(shift)) counts.overtime += 1;
        }
      });
      result[d.dateStr] = counts;
    });
    return result;
  }, [daysInMonth, visibleStaff, schedules, isStaffHiddenOnDate]);

  const overStreakStaffNames = useMemo(() => {
    return visibleStaff
      .filter((stf) => (scheduleSummaryByStaff[stf.id]?.maxStreak || 0) >= 4)
      .map((stf) => `${stf.name}(${scheduleSummaryByStaff[stf.id].maxStreak}일)`);
  }, [visibleStaff, scheduleSummaryByStaff]);

  const canUploadScheduleExcel = useMemo(() => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (isManager && activeStaffProfile?.storeId) {
      const status = getStoreApprovalInfo(activeStaffProfile.storeId).status;
      return status !== 'APPROVED' && status !== 'PENDING';
    }
    return false;
  }, [currentUser, isAdmin, isManager, activeStaffProfile, getStoreApprovalInfo]);

  const handleDownloadScheduleTemplate = () => {
    const targetRows = visibleStaff.length > 0 ? visibleStaff : activeStaffList;
    const headers = ['매장명', '성명', '직책', ...daysInMonth.map((d) => `${d.day}일(${d.dayName})`)];
    const lines = [headers.map(escapeCsvCell).join(',')];

    targetRows.forEach((stf) => {
      const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
      const rowCells = [
        stName,
        stf.name,
        stf.role,
        ...daysInMonth.map((d) =>
          isStaffHiddenOnDate(stf, d.dateStr) ? '-' : schedules[`${d.dateStr}_${stf.id}`] || ''
        )
      ];
      lines.push(rowCells.map(escapeCsvCell).join(','));
    });

    triggerCsvDownload(`근무스케줄_양식_${currentMonthPrefix}.csv`, lines);
  };

  const handleUploadScheduleExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '').replace(/^\uFEFF/, '');
      const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (rawLines.length < 2) {
        alert('데이터 행이 없는 CSV 파일입니다.');
        return;
      }

      const nextSchedules = { ...schedules };
      let matchedStaffCount = 0;
      let appliedCellsCount = 0;
      const skippedRows = [];
      const invalidCells = [];

      for (let rIdx = 1; rIdx < rawLines.length; rIdx++) {
        const cols = parseCsvLine(rawLines[rIdx]);
        const storeNameCol = cols[0] || '';
        const staffNameCol = cols[1] || '';
        if (!staffNameCol) continue;

        const stf = staffList.find(
          (s) =>
            s.name === staffNameCol &&
            (!storeNameCol || stores.find((st) => st.id === s.storeId)?.name === storeNameCol)
        );

        if (!stf) {
          skippedRows.push(`${storeNameCol ? storeNameCol + ' ' : ''}${staffNameCol}`);
          continue;
        }

        let rowApplied = false;
        daysInMonth.forEach((d, dIdx) => {
          const cellVal = (cols[3 + dIdx] ?? '').trim();
          if (!cellVal || cellVal === '-') return;
          if (!canEditScheduleForStaff(stf, d.dateStr)) return;

          if (VALID_SHIFT_CODES.has(cellVal)) {
            nextSchedules[`${d.dateStr}_${stf.id}`] = cellVal;
            appliedCellsCount += 1;
            rowApplied = true;
          } else {
            invalidCells.push(`${stf.name} ${d.day}일(${cellVal})`);
          }
        });

        if (rowApplied) matchedStaffCount += 1;
      }

      setSchedules(nextSchedules);
      saveToCloud({ schedules: nextSchedules });
      setScheduleImportFeedback({
        fileName: file.name,
        matchedStaffCount,
        appliedCellsCount,
        skippedRows,
        invalidCells
      });
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleDownloadScheduleExcel = () => {
    const headers = [
      '매장명',
      '성명',
      '직책',
      ...daysInMonth.map((d) => d.dateStr),
      '근무날수',
      'A조일수',
      'B조일수',
      'C조일수',
      'F조일수',
      '연장(+)',
      '휴무날수',
      '연차사용수'
    ];
    const lines = [headers.map(escapeCsvCell).join(',')];

    visibleStaff.forEach((stf) => {
      const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
      const sum = scheduleSummaryByStaff[stf.id] || {
        workDays: 0,
        overtimeDays: 0,
        offDays: 0,
        leaveUsed: 0,
        groupDays: { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0 }
      };
      const row = [
        stName,
        stf.name,
        stf.role,
        ...daysInMonth.map((d) =>
          isStaffHiddenOnDate(stf, d.dateStr) ? '-' : schedules[`${d.dateStr}_${stf.id}`] || ''
        ),
        sum.workDays,
        sum.groupDays['A조'] || 0,
        sum.groupDays['B조'] || 0,
        sum.groupDays['C조'] || 0,
        sum.groupDays['F조'] || 0,
        sum.overtimeDays,
        sum.offDays,
        formatDays(sum.leaveUsed)
      ];
      lines.push(row.map(escapeCsvCell).join(','));
    });

    triggerCsvDownload(`근무스케줄_${currentMonthPrefix}.csv`, lines);
  };

  const effectiveAutoStoreId = isAdmin
    ? autoTargetStoreId
    : activeStaffProfile?.storeId || 'store_1';

  const autoStoreObj = useMemo(
    () => stores.find((s) => s.id === effectiveAutoStoreId) || null,
    [stores, effectiveAutoStoreId]
  );

  const autoStoreStaff = useMemo(
    () =>
      staffList.filter(
        (s) =>
          s.storeId === effectiveAutoStoreId &&
          daysInMonth.some((d) => !isStaffHiddenOnDate(s, d.dateStr))
      ),
    [staffList, effectiveAutoStoreId, daysInMonth, isStaffHiddenOnDate]
  );

  const handleGenerateAutoSchedule = () => {
    if (autoStoreStaff.length === 0) {
      setAutoDraftSchedule({});
      setAutoAnalysisMeta(null);
      setAutoNotice('선택된 매장에 스케줄을 생성할 수 있는 직원이 없습니다.');
      return;
    }

    const prevDateObj = new Date(year, month - 1, 1);
    const prevYear = prevDateObj.getFullYear();
    const prevMonth = prevDateObj.getMonth();
    const prevPrefix = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;

    const prevMonthSales = salesRecords.filter(
      (r) => r.storeId === effectiveAutoStoreId && String(r.date || '').startsWith(prevPrefix)
    );
    const hasPrevData = prevMonthSales.length > 0;

    const weekdaySalesSum = [0, 0, 0, 0, 0, 0, 0];
    const weekdaySalesCnt = [0, 0, 0, 0, 0, 0, 0];
    const pairSalesSum = {};
    const pairSalesCnt = {};
    const staffGroupSalesSum = {};
    const staffGroupSalesCnt = {};

    prevMonthSales.forEach((rec) => {
      const dt = new Date(`${rec.date}T00:00:00`);
      if (Number.isNaN(dt.getTime())) return;
      const dow = dt.getDay();
      const amt = Number(rec.amount) || 0;
      weekdaySalesSum[dow] += amt;
      weekdaySalesCnt[dow] += 1;

      const workingOnDay = autoStoreStaff.filter((stf) => {
        if (isStaffHiddenOnDate(stf, rec.date)) return false;
        const code = schedules[`${rec.date}_${stf.id}`];
        return isWorkCode(code);
      });

      workingOnDay.forEach((stf) => {
        const code = schedules[`${rec.date}_${stf.id}`];
        const grp = normalizeBaseGroup(code)?.replace('조', '') || 'A';
        const k = `${stf.id}_${grp}`;
        staffGroupSalesSum[k] = (staffGroupSalesSum[k] || 0) + amt;
        staffGroupSalesCnt[k] = (staffGroupSalesCnt[k] || 0) + 1;
      });

      for (let i = 0; i < workingOnDay.length; i++) {
        for (let j = i + 1; j < workingOnDay.length; j++) {
          const [aId, bId] = [workingOnDay[i].id, workingOnDay[j].id].sort();
          const pKey = `${aId}__${bId}`;
          pairSalesSum[pKey] = (pairSalesSum[pKey] || 0) + amt;
          pairSalesCnt[pKey] = (pairSalesCnt[pKey] || 0) + 1;
        }
      }
    });

    const maxStaff = autoStoreStaff.length;
    const baseHeadcount = Math.max(1, Math.min(maxStaff, Math.ceil(maxStaff * 0.65)));
    const weekendHeadcount = Math.max(1, Math.min(maxStaff, Math.ceil(maxStaff * 0.75)));
    const weekdayAvgs = weekdaySalesSum.map((s, idx) =>
      weekdaySalesCnt[idx] > 0 ? s / weekdaySalesCnt[idx] : 0
    );
    const overallAvgDow =
      weekdayAvgs.reduce((acc, v) => acc + v, 0) /
      Math.max(1, weekdayAvgs.filter((v) => v > 0).length);

    const weekdayTargetHeadcount = [0, 1, 2, 3, 4, 5, 6].map((dow) => {
      const isWknd = dow === 0 || dow === 6;
      let target = isWknd ? weekendHeadcount : baseHeadcount;
      if (hasPrevData && overallAvgDow > 0 && weekdayAvgs[dow] > 0) {
        const ratio = weekdayAvgs[dow] / overallAvgDow;
        if (ratio >= 1.18) target += 1;
        else if (ratio <= 0.82) target -= 1;
      }
      return Math.max(1, Math.min(maxStaff, target));
    });

    const getPairAvg = (id1, id2) => {
      const [aId, bId] = [id1, id2].sort();
      const pKey = `${aId}__${bId}`;
      return pairSalesCnt[pKey] ? pairSalesSum[pKey] / pairSalesCnt[pKey] : 0;
    };

    const getStaffGroupAvg = (stfId, grpLetter) => {
      const k = `${stfId}_${grpLetter}`;
      return staffGroupSalesCnt[k] ? staffGroupSalesSum[k] / staffGroupSalesCnt[k] : 0;
    };

    const topPairsSummary = Object.keys(pairSalesCnt)
      .map((pKey) => {
        const [aId, bId] = pKey.split('__');
        const n1 = autoStoreStaff.find((s) => s.id === aId)?.name || aId;
        const n2 = autoStoreStaff.find((s) => s.id === bId)?.name || bId;
        return {
          names: `${n1} + ${n2}`,
          avgSales: pairSalesSum[pKey] / pairSalesCnt[pKey],
          daysCount: pairSalesCnt[pKey]
        };
      })
      .sort((a, b) => b.avgSales - a.avgSales);

    const draft = {};
    const workCountByStaff = {};
    const overtimeCountByStaff = {};
    const offCountByStaff = {};
    const leaveCountByStaff = {};
    const targetOffByStaff = {};
    const lastGroupByStaff = {};
    const groupRotationIdx = {};

    autoStoreStaff.forEach((stf) => {
      workCountByStaff[stf.id] = 0;
      overtimeCountByStaff[stf.id] = 0;
      offCountByStaff[stf.id] = 0;
      leaveCountByStaff[stf.id] = 0;
      lastGroupByStaff[stf.id] = null;
      groupRotationIdx[stf.id] = 0;

      let availableDays = 0;
      let existingOff = 0;
      let existingLeave = 0;

      daysInMonth.forEach((d) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        availableDays += 1;
        const existing = schedules[`${d.dateStr}_${stf.id}`];
        const lv = getLeaveUnitsFromCode(existing);
        if (lv > 0) {
          draft[`${d.dateStr}_${stf.id}`] = existing;
          leaveCountByStaff[stf.id] += lv;
          existingLeave += lv;
        } else if (existing === '휴무') {
          draft[`${d.dateStr}_${stf.id}`] = '휴무';
          offCountByStaff[stf.id] += 1;
          existingOff += 1;
        }
      });

      const desiredOffTotal = Math.min(monthRedDayCount, Math.max(0, availableDays - 1));
      targetOffByStaff[stf.id] = Math.max(existingOff, desiredOffTotal - Math.floor(existingLeave));
    });

    const getPriorConsecutiveWorkDays = (stfId, dayIdx) => {
      let streak = 0;
      for (let i = dayIdx - 1; i >= 0; i--) {
        const dStr = daysInMonth[i].dateStr;
        const stf = autoStoreStaff.find((s) => s.id === stfId);
        if (!stf || isStaffHiddenOnDate(stf, dStr)) break;
        if (isWorkCode(draft[`${dStr}_${stfId}`])) streak += 1;
        else break;
      }
      return streak;
    };

    const wouldExceedThreeConsecutiveWork = (stfId, dayIdx) => {
      const prior = getPriorConsecutiveWorkDays(stfId, dayIdx);
      if (prior >= 3) return true;
      let after = 0;
      for (let i = dayIdx + 1; i < daysInMonth.length; i++) {
        const dStr = daysInMonth[i].dateStr;
        const stf = autoStoreStaff.find((s) => s.id === stfId);
        if (!stf || isStaffHiddenOnDate(stf, dStr)) break;
        if (isWorkCode(draft[`${dStr}_${stfId}`])) after += 1;
        else break;
      }
      return prior + 1 + after > 3;
    };

    daysInMonth.forEach((d, dayIdx) => {
      const targetCount = weekdayTargetHeadcount[d.dayOfWeek] || 1;
      const remainingDaysAfterToday = daysInMonth.length - 1 - dayIdx;
      const mustTakeOffToday = [];
      const eligibleForWorkToday = [];

      autoStoreStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const key = `${d.dateStr}_${stf.id}`;
        if (draft[key]) return;

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
        draft[`${d.dateStr}_${stf.id}`] = '휴무';
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
        const candidateGroups = prevGrp === 'A' ? ['C', 'A'] : ['A', 'C'];

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

        draft[`${d.dateStr}_${worker.id}`] = selectedGroup;
        lastGroupByStaff[worker.id] = selectedGroup;
        groupRotationIdx[worker.id] = (groupRotationIdx[worker.id] + 1) % AUTO_WORK_GROUPS.length;
        workCountByStaff[worker.id] += 1;
      });

      autoStoreStaff.forEach((stf) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const key = `${d.dateStr}_${stf.id}`;
        if (draft[key]) return;
        const goalOff = targetOffByStaff[stf.id] ?? monthRedDayCount;
        if (goalOff - offCountByStaff[stf.id] > 0) {
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
        const key = `${d.dateStr}_${stf.id}`;
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
        const key = `${d.dateStr}_${stf.id}`;
        if (!draft[key]) {
          if (wouldExceedThreeConsecutiveWork(stf.id, dayIdx)) {
            draft[key] = '휴무';
            offCountByStaff[stf.id] += 1;
          } else {
            const prevGrp = lastGroupByStaff[stf.id];
            const nextGrp = prevGrp === 'A' ? 'C' : 'A';
            draft[key] = nextGrp;
            lastGroupByStaff[stf.id] = nextGrp;
            workCountByStaff[stf.id] += 1;
          }
        }
      });

      daysInMonth.forEach((d, dayIdx) => {
        if (isStaffHiddenOnDate(stf, d.dateStr)) return;
        const key = `${d.dateStr}_${stf.id}`;
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
      prevMonthLabel: `${prevYear}년 ${prevMonth + 1}월`,
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
      `${autoStoreObj?.name || ''} ${year}년 ${month + 1}월 추천 스케줄(최대 3일 연속 근무 제한 · 휴무 ${monthRedDayCount}일 기준)이 생성되었습니다.`
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
        const code = autoDraftSchedule[`${d.dateStr}_${stf.id}`];
        if (code === 'A' || code === 'A+') aCount += 1;
        else if (code === 'C' || code === 'C+') cCount += 1;
        if (isOvertimeCode(code)) otCount += 1;
      });
      result[d.dateStr] = { aCount, cCount, otCount, total: aCount + cCount };
    });
    return result;
  }, [daysInMonth, autoStoreStaff, autoDraftSchedule, isStaffHiddenOnDate]);

  const handleApplyAutoScheduleToMain = () => {
    if (!autoAnalysisMeta || Object.keys(autoDraftSchedule).length === 0) return;
    const targetStId = autoAnalysisMeta.storeId;
    const approval = getStoreApprovalInfo(targetStId);

    if (!isAdmin) {
      if (!isManager || targetStId !== activeStaffProfile?.storeId) {
        alert('스케줄 반영은 본사 관리자와 해당 매장 매니저만 가능합니다.');
        return;
      }
      if (approval.status === 'APPROVED' || approval.status === 'PENDING') {
        alert('승인 완료 또는 승인 대기 중인 스케줄은 반영할 수 없습니다.');
        return;
      }
    }

    if (
      !window.confirm(
        `${autoAnalysisMeta.storeName}의 ${year}년 ${month + 1}월 자동 추천 스케줄을 실제 스케줄표에 반영하시겠습니까?`
      )
    ) {
      return;
    }

    const updated = { ...schedules };
    daysInMonth.forEach((d) => {
      autoStoreStaff.forEach((stf) => {
        const key = `${d.dateStr}_${stf.id}`;
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

  const handleSaveSales = (e) => {
    e.preventDefault();
    const targetStore = isAdmin ? salesStoreInput : activeStaffProfile?.storeId;
    if (!targetStore || !salesDate) return;

    const amount = Math.max(0, Number(salesAmountInput) || 0);
    const quantity = Math.max(0, Number(salesQuantityInput) || 0);
    const note = salesNoteInput.trim();

    const filtered = salesRecords.filter(
      (r) => !(r.date === salesDate && r.storeId === targetStore)
    );
    const nextRecords = [
      ...filtered,
      {
        id: `${salesDate}_${targetStore}`,
        date: salesDate,
        storeId: targetStore,
        amount,
        quantity,
        note,
        updatedAt: new Date().toISOString()
      }
    ];

    setSalesRecords(nextRecords);
    saveToCloud({ salesRecords: nextRecords });
    setSalesAmountInput('');
    setSalesQuantityInput('');
    setSalesNoteInput('');
    alert(`${salesDate} 매출(${formatUsd(amount)} · ${formatQty(quantity)} PCS)이 저장되었습니다.`);
  };

  const monthlySalesSummary = useMemo(() => {
    const map = {};
    stores.forEach((st) => {
      map[st.id] = { amount: 0, quantity: 0 };
    });
    salesRecords.forEach((rec) => {
      if (String(rec.date || '').startsWith(currentMonthPrefix) && map[rec.storeId]) {
        map[rec.storeId].amount += Number(rec.amount) || 0;
        map[rec.storeId].quantity += Number(rec.quantity) || 0;
      }
    });
    return map;
  }, [stores, salesRecords, currentMonthPrefix]);

  const targetStoresForDailyMatrix = useMemo(() => {
    if (!isAdmin) {
      return stores.filter((s) => s.id === activeStaffProfile?.storeId);
    }
    if (selectedStoreId !== 'ALL') {
      return stores.filter((s) => s.id === selectedStoreId);
    }
    return stores;
  }, [stores, isAdmin, activeStaffProfile, selectedStoreId]);

  const dailyStoreMatrix = useMemo(() => {
    const allowedStoreIds = new Set(targetStoresForDailyMatrix.map((s) => s.id));
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
        const rec = salesRecords.find((r) => r.date === d.dateStr && r.storeId === st.id);
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
        dateStr: d.dateStr,
        day: d.day,
        dayName: d.dayName,
        cells,
        dayAmount,
        dayQuantity
      };
    });

    salesRecords.forEach((rec) => {
      if (
        String(rec.date || '').startsWith(currentMonthPrefix) &&
        !daysInMonth.some((d) => d.dateStr === rec.date) &&
        allowedStoreIds.has(rec.storeId)
      ) {
        const amt = Number(rec.amount) || 0;
        const qty = Number(rec.quantity) || 0;
        storeTotals[rec.storeId].amount += amt;
        storeTotals[rec.storeId].quantity += qty;
        grandTotalAmount += amt;
        grandTotalQuantity += qty;
      }
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
  }, [daysInMonth, targetStoresForDailyMatrix, salesRecords, currentMonthPrefix]);

  const handleDownloadDailySalesExcel = () => {
    const headers = [
      '일자',
      ...targetStoresForDailyMatrix.flatMap((st) => [`${st.name} 매출($)`, `${st.name} 수량(PCS)`]),
      '일별 매출합계($)',
      '일별 수량합계(PCS)'
    ];
    const lines = [headers.map(escapeCsvCell).join(',')];

    dailyStoreMatrix.rows.forEach((r) => {
      const row = [
        r.dateStr,
        ...targetStoresForDailyMatrix.flatMap((st) => [
          r.cells[st.id]?.amount || 0,
          r.cells[st.id]?.quantity || 0
        ]),
        r.dayAmount,
        r.dayQuantity
      ];
      lines.push(row.map(escapeCsvCell).join(','));
    });

    const totalRow = [
      '월 누적 합계',
      ...targetStoresForDailyMatrix.flatMap((st) => [
        dailyStoreMatrix.storeTotals[st.id]?.amount || 0,
        dailyStoreMatrix.storeTotals[st.id]?.quantity || 0
      ]),
      dailyStoreMatrix.grandTotalAmount,
      dailyStoreMatrix.grandTotalQuantity
    ];
    lines.push(totalRow.map(escapeCsvCell).join(','));

    triggerCsvDownload(`일별매출합계_${currentMonthPrefix}.csv`, lines);
  };

  // 사원별 출근일 매출 전액 배분 집계
  const staffSalesAnalytics = useMemo(() => {
    const baseMap = {};
    visibleStaff.forEach((stf) => {
      const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
      baseMap[stf.id] = {
        staff: stf,
        staffName: stf.name,
        storeName: stName,
        workDaysCount: 0,
        overtimeDaysCount: 0,
        totalAllocatedExact: 0,
        totalAllocatedQtyExact: 0,
        groupTotals: { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0 },
        groupDays: { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0 }
      };
    });

    daysInMonth.forEach((d) => {
      const daySalesByStore = {};
      salesRecords.forEach((rec) => {
        if (rec.date === d.dateStr) {
          daySalesByStore[rec.storeId] = {
            amount: Number(rec.amount) || 0,
            quantity: Number(rec.quantity) || 0
          };
        }
      });

      const storeIdsInScope = new Set(visibleStaff.map((s) => s.storeId));
      storeIdsInScope.forEach((stId) => {
        const workersToday = visibleStaff.filter((stf) => {
          if (stf.storeId !== stId) return false;
          if (isStaffHiddenOnDate(stf, d.dateStr)) return false;
          return isWorkCode(schedules[`${d.dateStr}_${stf.id}`]);
        });

        const saleInfo = daySalesByStore[stId] || { amount: 0, quantity: 0 };

        workersToday.forEach((w) => {
          const code = schedules[`${d.dateStr}_${w.id}`];
          const grp = normalizeBaseGroup(code);
          const entry = baseMap[w.id];
          if (!entry) return;

          entry.workDaysCount += 1;
          if (isOvertimeCode(code)) entry.overtimeDaysCount += 1;
          entry.totalAllocatedExact += saleInfo.amount;
          entry.totalAllocatedQtyExact += saleInfo.quantity;

          if (grp) {
            entry.groupDays[grp] += 1;
            entry.groupTotals[grp] += saleInfo.amount;
          }
        });
      });
    });

    return Object.values(baseMap).map((item) => {
      const totalAllocatedRounded = Math.round(item.totalAllocatedExact);
      const totalAllocatedQtyRounded = Math.round(item.totalAllocatedQtyExact);
      const overallAvg =
        item.workDaysCount > 0 ? Math.round(item.totalAllocatedExact / item.workDaysCount) : 0;
      const overallAvgQty =
        item.workDaysCount > 0
          ? Math.round(item.totalAllocatedQtyExact / item.workDaysCount)
          : 0;

      const groupAverages = {};
      BASE_WORK_GROUPS.forEach((g) => {
        groupAverages[g] =
          item.groupDays[g] > 0 ? Math.round(item.groupTotals[g] / item.groupDays[g]) : null;
      });

      return {
        ...item,
        totalAllocatedRounded,
        totalAllocatedQtyRounded,
        overallAvg,
        overallAvgQty,
        groupAverages
      };
    });
  }, [visibleStaff, stores, daysInMonth, salesRecords, schedules, isStaffHiddenOnDate]);

  const sortedStaffSalesAnalytics = useMemo(() => {
    const copy = [...staffSalesAnalytics];
    const { key, direction } = sortConfig;
    const mult = direction === 'asc' ? 1 : -1;

    copy.sort((a, b) => {
      let va;
      let vb;
      if (key.startsWith('group_')) {
        const g = key.replace('group_', '');
        va = a.groupAverages[g] ?? -1;
        vb = b.groupAverages[g] ?? -1;
      } else {
        va = a[key];
        vb = b[key];
      }
      if (typeof va === 'string' || typeof vb === 'string') {
        return String(va || '').localeCompare(String(vb || ''), 'ko') * mult;
      }
      return ((Number(va) || 0) - (Number(vb) || 0)) * mult;
    });

    return copy;
  }, [staffSalesAnalytics, sortConfig]);

  const handleHeaderSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' }
    );
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400 inline" />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 text-indigo-600 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-indigo-600 inline" />
    );
  };

  const handleDownloadStaffSalesExcel = () => {
    const headers = [
      '사원명',
      '소속매장',
      '출근일수',
      '연장(+)',
      '총배분매출($)',
      '총배분수량(PCS)',
      '일평균매출($)',
      '일평균수량(PCS)',
      ...BASE_WORK_GROUPS.map((g) => `${g}평균($)`)
    ];
    const lines = [headers.map(escapeCsvCell).join(',')];

    sortedStaffSalesAnalytics.forEach((row) => {
      lines.push(
        [
          row.staffName,
          row.storeName,
          row.workDaysCount,
          row.overtimeDaysCount,
          row.totalAllocatedRounded,
          row.totalAllocatedQtyRounded,
          row.overallAvg,
          row.overallAvgQty,
          ...BASE_WORK_GROUPS.map((g) => (row.groupAverages[g] !== null ? row.groupAverages[g] : ''))
        ]
          .map(escapeCsvCell)
          .join(',')
      );
    });

    triggerCsvDownload(`사원별배분집계_${currentMonthPrefix}.csv`, lines);
  };

  // 입사년월 기준 연차 계산 및 휴가 신청/승인
  const leaveSummaryByStaff = useMemo(() => {
    const map = {};
    staffList.forEach((stf) => {
      const granted = Number(stf.grantedLeave ?? stf.annualLeave ?? 0);
      let usedFromSchedule = 0;
      Object.entries(schedules).forEach(([k, code]) => {
        if (k.endsWith(`_${stf.id}`)) {
          usedFromSchedule += getLeaveUnitsFromCode(code);
        }
      });

      const approvedExtraLeave = leaveRequests
        .filter((r) => r.staffId === stf.id && r.status === '승인')
        .reduce((acc, r) => acc + (r.type === '연차' ? 1 : 0.5), 0);

      const used = Math.max(usedFromSchedule, approvedExtraLeave);
      const remaining = Math.max(0, granted - used);
      map[stf.id] = {
        granted,
        used,
        remaining,
        calcInfo: formatHireYearMonth(stf.hireDate)
      };
    });
    return map;
  }, [staffList, schedules, leaveRequests]);

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
          granted: Number(stf.grantedLeave ?? stf.annualLeave ?? 0),
          used: 0,
          remaining: Number(stf.grantedLeave ?? stf.annualLeave ?? 0),
          calcInfo: null
        };
        return {
          staff: stf,
          storeName: stName,
          ...summary
        };
      });
  }, [staffList, stores, isAdmin, selectedStoreId, activeStaffProfile, leaveSummaryByStaff]);

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!activeStaffProfile || !leaveDate) return;

    const stName = stores.find((s) => s.id === activeStaffProfile.storeId)?.name || '';
    const newReq = {
      id: `lv_${Date.now()}`,
      staffId: activeStaffProfile.id,
      staffName: activeStaffProfile.name,
      storeId: activeStaffProfile.storeId,
      storeName: stName,
      date: leaveDate,
      type: leaveType,
      reason: leaveReason.trim() || '개인 사유',
      status: '대기',
      createdAt: new Date().toISOString()
    };

    const nextReqs = [newReq, ...leaveRequests];
    setLeaveRequests(nextReqs);
    saveToCloud({ leaveRequests: nextReqs });
    setLeaveReason('');
    alert('휴가 신청이 제출되었습니다.');
  };

  const handleLeaveAction = (reqItem, nextStatus) => {
    const nextReqs = leaveRequests.map((r) =>
      r.id === reqItem.id ? { ...r, status: nextStatus, decidedAt: new Date().toISOString() } : r
    );
    setLeaveRequests(nextReqs);

    let nextSchedules = schedules;
    if (nextStatus === '승인') {
      const code = reqItem.type === '연차' ? '연차' : '오전반차';
      nextSchedules = {
        ...schedules,
        [`${reqItem.date}_${reqItem.staffId}`]: code
      };
      setSchedules(nextSchedules);
    }

    saveToCloud({
      leaveRequests: nextReqs,
      ...(nextStatus === '승인' ? { schedules: nextSchedules } : {})
    });
  };

  // 설정 / 직원 / 연차 / PIN / 퇴사 처리
  const handleSelfPinChange = (e) => {
    e.preventDefault();
    if (!activeStaffProfile) return;
    if (!/^\d{4}$/.test(newSelfPin)) {
      alert('PIN 번호는 숫자 4자리로 입력해 주세요.');
      return;
    }
    const nextStaff = staffList.map((s) =>
      s.id === activeStaffProfile.id ? { ...s, pin: newSelfPin } : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
    setNewSelfPin('');
    alert('내 PIN 번호가 변경되었습니다.');
  };

  const handleSyncDefaultRosterToCloud = () => {
    if (
      !window.confirm(
        '7개 면세점 매장과 34명 직원 명단으로 동기화하시겠습니까?'
      )
    ) {
      return;
    }
    setStores(DEFAULT_STORES);
    setStaffList(DEFAULT_STAFF);
    saveToCloud({ stores: DEFAULT_STORES, staffList: DEFAULT_STAFF });
    alert('7개 매장 · 34명 직원 명단이 동기화되었습니다.');
  };

  const handleHireDateInputChange = (dateVal) => {
    setNewStaffHireDate(dateVal);
    const autoDays = calcAnnualLeaveByHireYearMonth(dateVal, new Date(2026, 10, 27));
    setNewStaffAnnualLeave(String(autoDays));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    const trimmedName = newStaffName.trim();
    if (!trimmedName) {
      alert('성명을 입력해 주세요.');
      return;
    }
    if (!/^\d{4}$/.test(newStaffPin)) {
      alert('PIN 번호는 숫자 4자리로 입력해 주세요.');
      return;
    }
    const leaveNum = Math.max(0, Number(newStaffAnnualLeave) || 0);
    const newStf = {
      id: `staff_${Date.now()}`,
      name: trimmedName,
      storeId: newStaffStore,
      role: newStaffRole,
      hireDate: newStaffHireDate,
      annualLeave: leaveNum,
      grantedLeave: leaveNum,
      pin: newStaffPin,
      status: 'ACTIVE',
      resignedAt: ''
    };
    const nextStaff = [...staffList, newStf];
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
    setNewStaffName('');
    setNewStaffPin('');
    alert(`${trimmedName} 님이 추가되었습니다.`);
  };

  const handleUpdateStaffRole = (staffId, nextRole) => {
    const nextStaff = staffList.map((s) => (s.id === staffId ? { ...s, role: nextRole } : s));
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
  };

  const handleUpdateStaffHireDate = (staffId, nextHireDate) => {
    const nextStaff = staffList.map((s) =>
      s.id === staffId ? { ...s, hireDate: nextHireDate } : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
  };

  const handleUpdateStaffLeaveDays = (staffId, rawDays) => {
    const val = Math.max(0, Number(rawDays) || 0);
    const nextStaff = staffList.map((s) =>
      s.id === staffId ? { ...s, annualLeave: val, grantedLeave: val } : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
  };

  const handleApplyAutoLeaveByHireDate = (staffId) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target) return;
    const calcDays = calcAnnualLeaveByHireYearMonth(target.hireDate, new Date(2026, 10, 27));
    const nextStaff = staffList.map((s) =>
      s.id === staffId ? { ...s, annualLeave: calcDays, grantedLeave: calcDays } : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
    alert(`${target.name} 님의 입사년월(${formatHireYearMonth(target.hireDate)}) 기준 연차 ${calcDays}일이 반영되었습니다.`);
  };

  const handleResetStaffPin = (staffId, staffName) => {
    const nextPin = window.prompt(`${staffName} 님의 새 4자리 PIN 번호를 입력하세요:`, '1234');
    if (!nextPin) return;
    if (!/^\d{4}$/.test(nextPin.trim())) {
      alert('PIN 번호는 숫자 4자리로 입력해 주세요.');
      return;
    }
    const nextStaff = staffList.map((s) =>
      s.id === staffId ? { ...s, pin: nextPin.trim() } : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
    alert(`${staffName} 님의 PIN이 변경되었습니다.`);
  };

  const openResignModal = (stf) => {
    setResignModalStaff(stf);
    setResignDateInput(stf.resignedAt || '2026-11-27');
  };

  const handleConfirmResignStaff = (e) => {
    e.preventDefault();
    if (!resignModalStaff || !resignDateInput) return;
    const nextStaff = staffList.map((s) =>
      s.id === resignModalStaff.id
        ? { ...s, status: 'RESIGNED', resignedAt: resignDateInput }
        : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
    setResignModalStaff(null);
  };

  const handleReinstateStaff = (staffId, staffName) => {
    if (!window.confirm(`${staffName} 님을 복직 처리하시겠습니까?`)) return;
    const nextStaff = staffList.map((s) =>
      s.id === staffId ? { ...s, status: 'ACTIVE', resignedAt: '' } : s
    );
    setStaffList(nextStaff);
    saveToCloud({ staffList: nextStaff });
  };

  const handleUpdateStoreName = (storeId, nextName) => {
    const nextStores = stores.map((st) => (st.id === storeId ? { ...st, name: nextName } : st));
    setStores(nextStores);
    saveToCloud({ stores: nextStores });
  };

  const handleUpdateAdminPin = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newAdminPinInput)) {
      alert('마스터 PIN은 숫자 4자리로 입력해 주세요.');
      return;
    }
    setMasterPin(newAdminPinInput);
    saveToCloud({ masterPin: newAdminPinInput });
    setNewAdminPinInput('');
    alert('마스터 PIN이 변경되었습니다.');
  };

  const handleClearMonthData = (mode) => {
    const label = mode === 'schedule' ? '스케줄' : '매출';
    if (!window.confirm(`${year}년 ${month + 1}월 ${label} 데이터를 삭제하시겠습니까?`)) return;

    if (mode === 'schedule') {
      const nextSchedules = { ...schedules };
      Object.keys(nextSchedules).forEach((k) => {
        if (k.startsWith(currentMonthPrefix)) delete nextSchedules[k];
      });
      setSchedules(nextSchedules);
      saveToCloud({ schedules: nextSchedules });
    } else {
      const nextSales = salesRecords.filter(
        (r) => !String(r.date || '').startsWith(currentMonthPrefix)
      );
      setSalesRecords(nextSales);
      saveToCloud({ salesRecords: nextSales });
    }
    alert(`${year}년 ${month + 1}월 ${label} 데이터가 삭제되었습니다.`);
  };

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
              <span
                className={
                  fbReady
                    ? 'w-2 h-2 rounded-full bg-emerald-400'
                    : 'w-2 h-2 rounded-full bg-amber-400 animate-pulse'
                }
              />
              {syncStatus}
            </p>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                setLoginMode('staff');
                setPinInput('');
                setLoginError('');
              }}
              className={
                loginMode === 'staff'
                  ? 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 text-slate-500'
              }
            >
              <UserCheck className="w-4 h-4" />판매사원 로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setPinInput('');
                setLoginError('');
              }}
              className={
                loginMode === 'admin'
                  ? 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 text-slate-500'
              }
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
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
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
                      <option key={adm.id} value={adm.id}>
                        {adm.name} (관리자)
                      </option>
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
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-md"
            >
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
  const activeRemainLeave =
    leaveSummaryByStaff[activeStaffProfile?.id]?.remaining ??
    activeStaffProfile?.annualLeave ??
    0;

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
                  {isAdmin ? adminDisplayName : myStoreObj?.name || '매장'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {isAdmin
                    ? 'ADMIN'
                    : `${activeStaffProfile?.name} (${activeStaffProfile?.role} · 잔여연차 ${formatDays(activeRemainLeave)}일)`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {syncStatus}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>

        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={
              activeTab === 'schedule'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <CalendarIcon className="w-4 h-4" />근무 스케줄
            {isAdmin && pendingSchedulesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">
                {pendingSchedulesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auto_schedule')}
            className={
              activeTab === 'auto_schedule'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <Sparkles className="w-4 h-4" />매장별 자동 스케줄표
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={
              activeTab === 'sales'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <TrendingUp className="w-4 h-4" />일매출(USD) · 수량입력
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily_sales_summary')}
            className={
              activeTab === 'daily_sales_summary'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <TableProperties className="w-4 h-4" />일별 매출 합계
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff_sales')}
            className={
              activeTab === 'staff_sales'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <BarChart3 className="w-4 h-4" />사원별 배분집계
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leave')}
            className={
              activeTab === 'leave'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <Clock className="w-4 h-4" />휴가 · 연차관리
            {isAdmin && pendingLeavesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white">
                {pendingLeavesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={
              activeTab === 'settings'
                ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
                : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'
            }
          >
            <KeyRound className="w-4 h-4" />
            {isAdmin ? '관리자 · 직원 · 연차 · PIN' : '내 PIN 변경'}
          </button>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-base min-w-[110px] text-center">
              {year}년 {month + 1}월
            </span>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
            >
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
                {stores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
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
                    <span
                      className={
                        currentStoreApproved
                          ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1'
                          : currentStorePending
                          ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1'
                          : currentStoreRejected
                          ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 inline-flex items-center gap-1'
                          : 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 inline-flex items-center gap-1'
                      }
                    >
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
                  우측에서 <strong>조별 근무일수</strong>를, 맨 하단에서 <strong>날짜별 조별 출근 인원</strong>을 확인할 수 있으며 엑셀(CSV) 양식 업로드도 지원합니다.
                </p>
                {overStreakStaffNames.length > 0 && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1 mt-1.5 font-medium">
                    4일 이상 연속 근무 주의: {overStreakStaffNames.join(', ')}
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
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                      <span>양식 다운로드</span>
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
                      <Upload className="w-3.5 h-3.5" />
                      <span>엑셀(CSV) 업로드</span>
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
                        <Send className="w-3.5 h-3.5" />
                        <span>스케줄 승인 요청</span>
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
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>스케줄 승인</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDecideScheduleApproval(selectedStoreId, 'DRAFT')}
                        className="flex items-center gap-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-2 rounded-lg border border-amber-300"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>승인 해제</span>
                      </button>
                    )}
                    {currentStoreStatus !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleDecideScheduleApproval(selectedStoreId, 'REJECTED')}
                        className="flex items-center gap-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-2 rounded-lg border border-rose-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>수정요청(반려)</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownloadScheduleExcel}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>엑셀(CSV) 다운로드</span>
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
                      제외된 행: {scheduleImportFeedback.skippedRows.join(', ')}
                    </div>
                  )}
                  {scheduleImportFeedback.invalidCells.length > 0 && (
                    <div className="text-rose-700">
                      미인식 코드(건너뜀): {scheduleImportFeedback.invalidCells.slice(0, 8).join(', ')}
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
                <span key={t.code} className={`px-2.5 py-1 rounded-md border font-medium ${t.color}`}>
                  {t.code}: {t.label}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="sticky left-0 z-20 bg-slate-100 border-b border-r border-slate-200 px-3 py-2.5 text-left min-w-[165px]">
                      직원 (매장·잔여연차)
                    </th>
                    {daysInMonth.map((d) => {
                      const isSun = d.dayOfWeek === 0;
                      const isSat = d.dayOfWeek === 6;
                      return (
                        <th
                          key={d.dateStr}
                          className={`border-b border-r border-slate-200 px-1.5 py-2 text-center min-w-[54px] ${
                            d.isRedDay
                              ? 'text-rose-600 bg-rose-50/70'
                              : isSun
                              ? 'text-rose-600 bg-rose-50/60'
                              : isSat
                              ? 'text-blue-600 bg-blue-50/40'
                              : ''
                          }`}
                        >
                          <div className="font-bold">{d.day}</div>
                          <div className="text-[10px]">{d.dayName}</div>
                        </th>
                      );
                    })}
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[62px] bg-indigo-50/80 text-indigo-900">
                      근무날수
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[148px] bg-violet-50/80 text-violet-950">
                      조별 근무일수
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[58px] bg-sky-100/80 text-sky-900">
                      연장(+)
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2 text-center min-w-[60px] bg-slate-100 text-slate-800">
                      휴무날수
                    </th>
                    <th className="border-b border-slate-200 px-2 py-2 text-center min-w-[64px] bg-amber-50/80 text-amber-900">
                      연차 사용수
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleStaff.map((stf) => {
                    const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
                    const remLeave =
                      leaveSummaryByStaff[stf.id]?.remaining ??
                      stf.grantedLeave ??
                      stf.annualLeave ??
                      0;
                    const sum = scheduleSummaryByStaff[stf.id] || {
                      workDays: 0,
                      overtimeDays: 0,
                      offDays: 0,
                      leaveUsed: 0,
                      maxStreak: 0,
                      groupDays: { 'A조': 0, 'B조': 0, 'C조': 0, 'F조': 0 }
                    };
                    const activeGroupEntries = BASE_WORK_GROUPS
                      .map((g) => ({ grp: g.replace('조', ''), days: sum.groupDays?.[g] || 0 }))
                      .filter((item) => item.days > 0);

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
                            <span className="font-semibold text-indigo-600 shrink-0">
                              연차 {formatDays(remLeave)}일
                            </span>
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
                          const val = schedules[`${d.dateStr}_${stf.id}`] || '';
                          const shiftObj = SHIFT_TYPES.find((s) => s.code === val);
                          return (
                            <td
                              key={d.dateStr}
                              className="border-b border-r border-slate-200 p-1 text-center"
                            >
                              <select
                                disabled={!editable}
                                value={val}
                                onChange={(e) => handleScheduleChange(d.dateStr, stf, e.target.value)}
                                className={`w-full rounded px-1 py-1.5 text-[11px] font-semibold border cursor-pointer disabled:cursor-default disabled:opacity-80 ${
                                  shiftObj
                                    ? shiftObj.color
                                    : 'bg-white text-slate-400 border-slate-200'
                                }`}
                              >
                                <option value="">-</option>
                                {SHIFT_TYPES.map((t) => (
                                  <option key={t.code} value={t.code}>
                                    {t.code}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}

                        <td className="border-b border-r border-slate-200 px-2 py-2 text-center font-bold text-indigo-700 bg-indigo-50/30">
                          {sum.workDays}일
                        </td>

                        <td className="border-b border-r border-slate-200 px-2 py-2 text-center bg-violet-50/30">
                          {activeGroupEntries.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {activeGroupEntries.map((gItem) => (
                                <span
                                  key={gItem.grp}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-800 border border-violet-200"
                                >
                                  {gItem.grp} {gItem.days}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
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
                  <tr className="bg-indigo-50/90 font-semibold text-slate-800">
                    <td className="sticky left-0 z-10 bg-indigo-100/90 border-t-2 border-r border-slate-300 px-3 py-2 text-xs">
                      <div className="font-bold text-slate-900">조별 출근 인원</div>
                      <div className="text-[10px] font-normal text-slate-600 mt-0.5 space-y-0.5">
                        <div className="text-sky-800 font-semibold">A조 (A/A+)</div>
                        <div className="text-indigo-800 font-semibold">B조 (B/B+)</div>
                        <div className="text-purple-800 font-semibold">C조 (C/C+)</div>
                        <div className="text-cyan-800 font-semibold">F조 (F/F+)</div>
                        <div className="text-slate-900 font-bold border-t border-indigo-200 pt-0.5">
                          총 근무(연장)
                        </div>
                      </div>
                    </td>

                    {daysInMonth.map((d) => {
                      const c = dailyGroupCounts[d.dateStr] || {
                        'A조': 0,
                        'B조': 0,
                        'C조': 0,
                        'F조': 0,
                        total: 0,
                        overtime: 0
                      };
                      return (
                        <td
                          key={d.dateStr}
                          className="border-t-2 border-r border-slate-300 px-1 py-1.5 text-center align-bottom"
                        >
                          <div className="text-[10px] leading-tight space-y-0.5">
                            <div className="text-sky-700 font-semibold">A {c['A조']}</div>
                            <div className="text-indigo-700 font-semibold">B {c['B조']}</div>
                            <div className="text-purple-700 font-semibold">C {c['C조']}</div>
                            <div className="text-cyan-700 font-semibold">F {c['F조']}</div>
                            <div className="text-[11px] font-extrabold text-indigo-900 border-t border-indigo-200 pt-0.5">
                              {c.total}명{c.overtime > 0 ? ` (+${c.overtime})` : ''}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td
                      colSpan={5}
                      className="border-t-2 border-slate-300 px-2 py-2 text-center text-[11px] text-slate-600 align-middle"
                    >
                      우측 열: 개인별 조별 근무일수 · 하단 행: 날짜별 조별 출근인원
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
                    <span>
                      {year}년 {month + 1}월 매장별 자동 스케줄표 추천
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>최대 3일 연속 근무 제한</strong>을 지키며, 당월 토·일·공휴일({monthRedDayCount}일) 기준 휴무를 제안합니다.
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
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
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
                    <span className="font-bold text-indigo-700">{autoAnalysisMeta.storeName}</span> · 최대 연속근무:{' '}
                    <span className="font-bold text-emerald-700">3일 제한 적용</span> · 휴무 기준:{' '}
                    <span className="font-bold">{autoAnalysisMeta.redDayCountInMonth}일</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    요일별 목표 출근: 일 {autoAnalysisMeta.weekdayTargetHeadcount[0]} · 월{' '}
                    {autoAnalysisMeta.weekdayTargetHeadcount[1]} · 화{' '}
                    {autoAnalysisMeta.weekdayTargetHeadcount[2]} · 수{' '}
                    {autoAnalysisMeta.weekdayTargetHeadcount[3]} · 목{' '}
                    {autoAnalysisMeta.weekdayTargetHeadcount[4]} · 금{' '}
                    {autoAnalysisMeta.weekdayTargetHeadcount[5]} · 토{' '}
                    {autoAnalysisMeta.weekdayTargetHeadcount[6]}
                  </div>
                </div>

                {autoAnalysisMeta.topPairs.length > 0 && (
                  <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-600">동반 출근 매출 시너지 상위:</span>
                    {autoAnalysisMeta.topPairs.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium"
                      >
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
                              className={`border-b border-r border-slate-200 px-1.5 py-2 text-center min-w-[50px] ${
                                d.isRedDay
                                  ? 'text-rose-600 bg-rose-50/70'
                                  : isSun
                                  ? 'text-rose-600 bg-rose-50/60'
                                  : isSat
                                  ? 'text-blue-600 bg-blue-50/40'
                                  : ''
                              }`}
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
                              const code = autoDraftSchedule[`${d.dateStr}_${stf.id}`] || '';
                              const shiftObj = SHIFT_TYPES.find((s) => s.code === code);
                              return (
                                <td
                                  key={d.dateStr}
                                  className="border-b border-r border-slate-200 p-1 text-center"
                                >
                                  <span
                                    className={`inline-block w-full py-1 rounded text-[11px] font-bold border ${
                                      shiftObj
                                        ? shiftObj.color
                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}
                                  >
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
                          const gc = autoDailyGroupCounts[d.dateStr] || {
                            aCount: 0,
                            cCount: 0,
                            total: 0
                          };
                          return (
                            <td
                              key={d.dateStr}
                              className="border-t-2 border-r border-slate-300 px-1 py-1.5 text-center"
                            >
                              <div className="text-[10px] text-sky-700 font-semibold">A {gc.aCount}</div>
                              <div className="text-[10px] text-purple-700 font-semibold">C {gc.cCount}</div>
                              <div className="text-[11px] font-extrabold text-indigo-800 border-t border-indigo-200/70 mt-0.5 pt-0.5">
                                {gc.total}명
                              </div>
                            </td>
                          );
                        })}
                        <td
                          colSpan={4}
                          className="border-t-2 border-slate-300 px-2 py-2 text-center text-[11px] text-slate-600"
                        >
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
            <form
              onSubmit={handleSaveSales}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              <h2 className="font-bold text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>일매출(USD) · 수량 등록</span>
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">매출 일자</label>
                <input
                  type="date"
                  value={salesDate}
                  onChange={(e) => setSalesDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">대상 매장</label>
                {isAdmin ? (
                  <select
                    value={salesStoreInput}
                    onChange={(e) => setSalesStoreInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    {stores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={myStoreObj?.name || ''}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">일매출 금액 (USD $)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={salesAmountInput}
                  onChange={(e) => setSalesAmountInput(e.target.value)}
                  placeholder="예: 4500"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">판매 수량 (PCS / 개)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={salesQuantityInput}
                  onChange={(e) => setSalesQuantityInput(e.target.value)}
                  placeholder="예: 35"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  value={salesNoteInput}
                  onChange={(e) => setSalesNoteInput(e.target.value)}
                  placeholder="프로모션, 단체 관광객 등"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm"
              >
                매출·수량 저장하기
              </button>
            </form>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-base mb-3">
                {year}년 {month + 1}월 매장별 누적 매출(USD) · 수량 현황
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stores.map((st) => {
                  const sumObj = monthlySalesSummary[st.id] || { amount: 0, quantity: 0 };
                  const monthTarget = getStoreMonthlyTarget(st.id, currentMonthPrefix);
                  const achRate = monthTarget > 0 ? Math.round((sumObj.amount / monthTarget) * 100) : 0;
                  return (
                    <div key={st.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{st.name}</span>
                        <span className="text-xs font-bold text-indigo-600">{achRate}%</span>
                      </div>
                      <div className="text-lg font-extrabold mt-1">{formatUsd(sumObj.amount)}</div>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                        누적 판매수량: {formatQty(sumObj.quantity)} PCS
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {year}년 {month + 1}월 목표: {formatUsd(monthTarget)}
                      </div>
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
                <h2 className="font-bold text-base">
                  {year}년 {month + 1}월 일별 · 매장별 매출(USD) 및 수량 합계
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  매출 발생일({dailyStoreMatrix.activeSalesDaysCount}일) 일평균 매출:{' '}
                  <span className="font-bold text-indigo-700">
                    {formatUsd(dailyStoreMatrix.avgDailyAmount)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadDailySalesExcel}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>일별 매출합계 엑셀(CSV) 다운로드</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="sticky left-0 z-20 bg-slate-100 border-b border-r border-slate-200 px-3 py-2.5 text-left min-w-[105px]">
                      일자
                    </th>
                    {targetStoresForDailyMatrix.map((st) => (
                      <th
                        key={st.id}
                        className="border-b border-r border-slate-200 px-3 py-2.5 text-right min-w-[130px]"
                      >
                        {st.name}
                      </th>
                    ))}
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right min-w-[125px] bg-indigo-50/70 text-indigo-900">
                      일별 합계
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStoreMatrix.rows.map((r) => (
                    <tr key={r.dateStr} className="hover:bg-slate-50/80">
                      <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-3 py-2 font-semibold">
                        {r.day}일 ({r.dayName})
                      </td>
                      {targetStoresForDailyMatrix.map((st) => {
                        const cell = r.cells[st.id] || { amount: 0, quantity: 0 };
                        return (
                          <td
                            key={st.id}
                            className="border-b border-r border-slate-200 px-3 py-2 text-right"
                          >
                            <div className="font-semibold text-slate-800">{formatUsd(cell.amount)}</div>
                            <div className="text-[11px] text-emerald-700 font-medium">
                              {formatQty(cell.quantity)} PCS
                            </div>
                          </td>
                        );
                      })}
                      <td className="border-b border-r border-slate-200 px-3 py-2 text-right bg-indigo-50/40">
                        <div className="font-bold text-indigo-700">{formatUsd(r.dayAmount)}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          {formatQty(r.dayQuantity)} PCS
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50 font-bold text-slate-900">
                    <td className="sticky left-0 z-10 bg-indigo-100 border-t-2 border-r border-slate-300 px-3 py-2.5">
                      월 누적 합계
                    </td>
                    {targetStoresForDailyMatrix.map((st) => {
                      const tot = dailyStoreMatrix.storeTotals[st.id] || { amount: 0, quantity: 0 };
                      return (
                        <td
                          key={st.id}
                          className="border-t-2 border-r border-slate-300 px-3 py-2.5 text-right"
                        >
                          <div className="font-extrabold text-slate-900">{formatUsd(tot.amount)}</div>
                          <div className="text-[11px] text-emerald-800 font-semibold">
                            {formatQty(tot.quantity)} PCS
                          </div>
                        </td>
                      );
                    })}
                    <td className="border-t-2 border-r border-slate-300 px-3 py-2.5 text-right bg-indigo-100">
                      <div className="font-extrabold text-indigo-800">
                        {formatUsd(dailyStoreMatrix.grandTotalAmount)}
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold">
                        {formatQty(dailyStoreMatrix.grandTotalQuantity)} PCS
                      </div>
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
                <h2 className="font-bold text-base">
                  {year}년 {month + 1}월 사원별 출근일 매출 배분 · 조별 평균 집계
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  당일 출근한 모든 직원(연장 포함)에게 일매출·수량을 전액 배분하여 출근일 평균과 조별 평균을 산출합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadStaffSalesExcel}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>사원별 배분집계 엑셀(CSV) 다운로드</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('staffName')}
                        className="font-bold flex items-center"
                      >
                        사원명 {renderSortIcon('staffName')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('storeName')}
                        className="font-bold flex items-center"
                      >
                        소속 매장 {renderSortIcon('storeName')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('workDaysCount')}
                        className="font-bold inline-flex items-center"
                      >
                        출근일수 {renderSortIcon('workDaysCount')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center bg-sky-50/70">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('overtimeDaysCount')}
                        className="font-bold inline-flex items-center text-sky-900"
                      >
                        연장(+) {renderSortIcon('overtimeDaysCount')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('totalAllocatedRounded')}
                        className="font-bold inline-flex items-center"
                      >
                        총 배분매출 {renderSortIcon('totalAllocatedRounded')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('totalAllocatedQtyRounded')}
                        className="font-bold inline-flex items-center"
                      >
                        총 배분수량 {renderSortIcon('totalAllocatedQtyRounded')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right bg-indigo-50/70">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('overallAvg')}
                        className="font-bold inline-flex items-center text-indigo-900"
                      >
                        일 평균매출 {renderSortIcon('overallAvg')}
                      </button>
                    </th>
                    <th className="border-b border-r border-slate-200 px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleHeaderSort('overallAvgQty')}
                        className="font-bold inline-flex items-center"
                      >
                        일 평균수량 {renderSortIcon('overallAvgQty')}
                      </button>
                    </th>
                    {BASE_WORK_GROUPS.map((g) => (
                      <th
                        key={g}
                        className="border-b border-r border-slate-200 px-3 py-2.5 text-right"
                      >
                        <button
                          type="button"
                          onClick={() => handleHeaderSort(`group_${g}`)}
                          className="font-bold inline-flex items-center"
                        >
                          {g} 평균 {renderSortIcon(`group_${g}`)}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStaffSalesAnalytics.map((row) => (
                    <tr key={row.staff.id} className="hover:bg-slate-50">
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 font-semibold">
                        {row.staff.name}
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-slate-600">
                        {row.storeName}
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-semibold">
                        {row.workDaysCount}일
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold text-sky-800 bg-sky-50/40">
                        {row.overtimeDaysCount}일
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-semibold">
                        {formatUsd(row.totalAllocatedRounded)}
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-semibold text-emerald-700">
                        {formatQty(row.totalAllocatedQtyRounded)} PCS
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-bold text-indigo-700 bg-indigo-50/40">
                        {formatUsd(row.overallAvg)}
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-right font-semibold text-emerald-700">
                        {formatQty(row.overallAvgQty)} PCS
                      </td>
                      {BASE_WORK_GROUPS.map((g) => (
                        <td
                          key={g}
                          className="border-b border-r border-slate-200 px-3 py-2.5 text-right"
                        >
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
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-left">
                        소속 매장
                      </th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">
                        입사년월
                      </th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">
                        발생연차
                      </th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center">
                        사용연차
                      </th>
                      <th className="border-b border-r border-slate-200 px-3 py-2.5 text-center bg-indigo-50/70 text-indigo-900">
                        잔여연차
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveOverviewRows.map((item) => (
                      <tr key={item.staff.id} className="hover:bg-slate-50">
                        <td className="border-b border-r border-slate-200 px-3 py-2 font-semibold">
                          {item.staff.name}
                        </td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-slate-600">
                          {item.storeName}
                        </td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center">
                          {formatHireYearMonth(item.staff.hireDate)}
                        </td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold">
                          {formatDays(item.granted)}일
                        </td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center text-amber-700 font-semibold">
                          {formatDays(item.used)}일
                        </td>
                        <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-extrabold text-indigo-700 bg-indigo-50/40">
                          {formatDays(item.remaining)}일
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {!isAdmin && (
                <form
                  onSubmit={handleSubmitLeave}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <h2 className="font-bold text-base">연차 · 반차 신청</h2>
                  <div className="text-xs bg-indigo-50 text-indigo-800 px-3 py-2 rounded-lg font-semibold">
                    현재 잔여 연차: {formatDays(activeRemainLeave)}일
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">휴가 일자</label>
                    <input
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">휴가 구분</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="연차">연차 (1일 차감)</option>
                      <option value="반차">반차 (0.5일 차감)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">사유</label>
                    <input
                      type="text"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="개인 사유"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm"
                  >
                    휴가 신청 제출
                  </button>
                </form>
              )}

              <div
                className={`${
                  isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'
                } bg-white rounded-xl border border-slate-200 p-5 shadow-sm`}
              >
                <h2 className="font-bold text-base mb-3">휴가 신청 내역</h2>
                {leaveRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    등록된 휴가 신청 내역이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {leaveRequests
                      .filter((r) => isAdmin || r.staffId === activeStaffProfile?.id)
                      .map((req) => (
                        <div
                          key={req.id}
                          className="border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{req.staffName}</span>
                              <span className="text-xs text-slate-500">{req.storeName}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                {req.type}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              일자: <strong>{req.date}</strong> · 사유: {req.reason}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                req.status === '승인'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === '반려'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status}
                            </span>
                            {isAdmin && req.status === '대기' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleLeaveAction(req, '승인')}
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLeaveAction(req, '반려')}
                                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
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

        {activeTab === 'settings' &&
          (!isAdmin ? (
            <div className="max-w-md bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-base mb-3">내 PIN 번호 변경</h2>
              <form onSubmit={handleSelfPinChange} className="space-y-3">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newSelfPin}
                  onChange={(e) => setNewSelfPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="새 PIN 4자리"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  PIN 변경 저장
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-base">7개 매장 · 34명 직원 명단 클라우드 동기화</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    현재 등록된 7개 면세점 매장 및 34명 직원 명단으로 클라우드 데이터를 최신화합니다.
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
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="성명"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <select
                    value={newStaffStore}
                    onChange={(e) => setNewStaffStore(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm bg-white"
                  >
                    {stores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm bg-white"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newStaffHireDate}
                    onChange={(e) => handleHireDateInputChange(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newStaffAnnualLeave}
                    onChange={(e) => setNewStaffAnnualLeave(e.target.value)}
                    placeholder="연차일수"
                    className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
                  />
                  <input
                    type="text"
                    maxLength={4}
                    value={newStaffPin}
                    onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN 4자리"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>추가</span>
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
                <h2 className="font-bold text-base mb-3">
                  전체 직원 명단 및 연차/PIN 관리 ({staffList.length}명)
                </h2>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-left">성명</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-left">매장</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-left">직책</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">입사일</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">
                        발생연차
                      </th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">
                        잔여연차
                      </th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">퇴사일</th>
                      <th className="border-b border-r border-slate-200 px-3 py-2 text-center">PIN</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((stf) => {
                      const stName = stores.find((s) => s.id === stf.storeId)?.name || '';
                      const summary = leaveSummaryByStaff[stf.id] || {
                        granted: stf.grantedLeave ?? stf.annualLeave ?? 0,
                        remaining: stf.grantedLeave ?? stf.annualLeave ?? 0
                      };
                      return (
                        <tr
                          key={stf.id}
                          className={
                            stf.status === 'RESIGNED' ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50'
                          }
                        >
                          <td className="border-b border-r border-slate-200 px-3 py-2 font-semibold">
                            {stf.name}
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2">{stName}</td>
                          <td className="border-b border-r border-slate-200 px-3 py-2">
                            <select
                              value={stf.role}
                              onChange={(e) => handleUpdateStaffRole(stf.id, e.target.value)}
                              className="border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-800"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center">
                            <input
                              type="date"
                              value={stf.hireDate || ''}
                              onChange={(e) => handleUpdateStaffHireDate(stf.id, e.target.value)}
                              className="border border-slate-200 rounded px-1.5 py-1 text-slate-800"
                            />
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
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-bold text-indigo-700">
                            {formatDays(summary.remaining)}일
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-mono text-rose-700">
                            {stf.status === 'RESIGNED' ? stf.resignedAt || '-' : '-'}
                          </td>
                          <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-mono">
                            {stf.pin}
                          </td>
                          <td className="border-b border-slate-200 px-3 py-2 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleApplyAutoLeaveByHireDate(stf.id)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                              >
                                자동연차
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResetStaffPin(stf.id, stf.name)}
                                className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                              >
                                PIN
                              </button>
                              {stf.status !== 'RESIGNED' ? (
                                <button
                                  type="button"
                                  onClick={() => openResignModal(stf)}
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700"
                                >
                                  퇴사
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleReinstateStaff(stf.id, stf.name)}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                >
                                  복직
                                </button>
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
                  <h2 className="font-bold text-base mb-1">
                    매장명 및 {year}년 {month + 1}월 목표 매출(USD) 설정
                  </h2>
                  <p className="text-[11px] text-slate-500 mb-3">
                    현재 선택된 <strong>{year}년 {month + 1}월</strong>에만 적용됩니다. 다른 월로 이동해 수정하면 해당 월 목표가 따로 저장됩니다.
                  </p>
                  <div className="space-y-2.5">
                    {stores.map((st) => {
                      const monthTargetVal = getStoreMonthlyTarget(st.id, currentMonthPrefix);
                      return (
                        <div key={st.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={st.name}
                            onChange={(e) => handleUpdateStoreName(st.id, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold"
                          />
                          <span className="text-[11px] text-slate-500 shrink-0">
                            {month + 1}월목표($)
                          </span>
                          <input
                            type="number"
                            value={monthTargetVal}
                            onChange={(e) =>
                              handleUpdateMonthlyStoreTarget(st.id, e.target.value, currentMonthPrefix)
                            }
                            className="w-28 rounded-lg border border-indigo-300 bg-indigo-50/30 px-2.5 py-1.5 text-xs text-right font-bold text-indigo-900"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h2 className="font-bold text-base">마스터 PIN 및 당월 데이터 초기화</h2>
                  <form onSubmit={handleUpdateAdminPin} className="flex gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={newAdminPinInput}
                      onChange={(e) => setNewAdminPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="새 마스터 PIN 4자리"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
                    />
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg text-xs"
                    >
                      PIN 변경
                    </button>
                  </form>
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleClearMonthData('schedule')}
                      className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
                    >
                      {year}년 {month + 1}월 스케줄 삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearMonthData('sales')}
                      className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
                    >
                      {year}년 {month + 1}월 매출 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
