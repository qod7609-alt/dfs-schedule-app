import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Users, Store, TrendingUp, Clock, Lock, Unlock,
  LogOut, Plus, Trash2, CheckCircle2, XCircle, Edit3, KeyRound, ChevronLeft,
  ChevronRight, AlertCircle, ShieldCheck, UserCheck, FileSpreadsheet,
  Download, ShieldAlert
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
  { id: 'store_1', name: '롯데면세점 명동본점', targetSales: 150000000 },
  { id: 'store_2', name: '롯데면세점 월드타워점', targetSales: 95000000 },
  { id: 'store_3', name: '신라면세점 서울점', targetSales: 110000000 },
  { id: 'store_4', name: '신세계면세점 명동점', targetSales: 120000000 },
  { id: 'store_5', name: '현대백화점면세점 무역센터점', targetSales: 80000000 },
  { id: 'store_6', name: '인천공항 T1 면세점', targetSales: 130000000 },
  { id: 'store_7', name: '인천공항 T2 면세점', targetSales: 125000000 }
];

const DEFAULT_STAFF = [
  { id: 'staff_1', name: '김민지', storeId: 'store_1', role: '매니저', pin: '1111', annualLeave: 15 },
  { id: 'staff_2', name: '이서연', storeId: 'store_1', role: '시니어', pin: '2222', annualLeave: 15 },
  { id: 'staff_3', name: '박지훈', storeId: 'store_2', role: '매니저', pin: '3333', annualLeave: 15 },
  { id: 'staff_4', name: '최수빈', storeId: 'store_3', role: '매니저', pin: '4444', annualLeave: 15 },
  { id: 'staff_5', name: '정현우', storeId: 'store_4', role: '사원', pin: '5555', annualLeave: 12 }
];

const WORK_GROUPS = ['A조', 'B조', 'C조', 'F조'];

const SHIFT_TYPES = [
  { code: 'A조', label: 'A조 근무', color: 'bg-sky-100 text-sky-800 border-sky-200', isWork: true },
  { code: 'B조', label: 'B조 근무', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', isWork: true },
  { code: 'C조', label: 'C조 근무', color: 'bg-purple-100 text-purple-800 border-purple-200', isWork: true },
  { code: 'F조', label: 'F조 근무', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', isWork: true },
  { code: '휴무', label: '정기휴무', color: 'bg-slate-100 text-slate-600 border-slate-200', isWork: false },
  { code: '연차', label: '연차휴가', color: 'bg-amber-100 text-amber-800 border-amber-200', isWork: false },
  { code: '반차', label: '반차', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', isWork: false }
];

const getLeaveCost = (type) => {
  if (type === '연차') return 1;
  if (type === '반차') return 0.5;
  return 0;
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
  const [currentDate, setCurrentDate] = useState(() => new Date());

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
          if (data.stores) setStores(data.stores);
          if (data.staffList) setStaffList(data.staffList);
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

  const isAdmin = currentUser?.role === 'admin';
  const adminDisplayName = isAdmin ? currentUser.adminName || '본사 관리자' : '';

  const activeStaffProfile = useMemo(() => {
    if (currentUser?.role !== 'staff') return null;
    return staffList.find((s) => s.id === currentUser.staff.id) || currentUser.staff;
  }, [currentUser, staffList]);

  const isManager = !isAdmin && activeStaffProfile?.role === '매니저';
  const myStoreObj = !isAdmin ? stores.find((s) => s.id === activeStaffProfile?.storeId) : null;

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
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return {
        dateStr: yyyy + '-' + mm + '-' + dd,
        day: i + 1,
        dayOfWeek: d.getDay(),
        dayName: dayNames[d.getDay()]
      };
    });
  }, [year, month]);

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
      if (pinInput === target.pin) {
        setCurrentUser({ role: 'staff', staff: target });
        setPinInput('');
        setSelectedStoreId(target.storeId);
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
  };

  const isStoreMonthApproved = (storeId) => {
    if (!storeId) return false;
    return Boolean(scheduleApprovals[currentMonthPrefix + '_' + storeId]?.approved);
  };

  const canEditScheduleForStaff = (staff) => {
    if (isAdmin) return true;
    if (!isManager || staff.storeId !== activeStaffProfile?.storeId) return false;
    return !isStoreMonthApproved(staff.storeId);
  };

  const handleScheduleChange = (dateStr, staff, shiftCode) => {
    if (isAdmin) {
      // 관리자는 항상 수정 가능
    } else if (!isManager || staff.storeId !== activeStaffProfile?.storeId) {
      alert('스케줄 입력 및 수정은 본사 관리자와 해당 매장 매니저만 가능합니다.');
      return;
    } else if (isStoreMonthApproved(staff.storeId)) {
      alert('이미 관리자 승인이 완료된 스케줄입니다. 변경하려면 관리자 승인이 필요합니다.');
      return;
    }

    const key = dateStr + '_' + staff.id;
    const updated = { ...schedules };
    if (!shiftCode) delete updated[key];
    else updated[key] = shiftCode;
    setSchedules(updated);
    saveToCloud({ schedules: updated });
  };

  const handleToggleScheduleApproval = (storeId, nextApproved) => {
    if (!isAdmin) return;
    const key = currentMonthPrefix + '_' + storeId;
    const updated = {
      ...scheduleApprovals,
      [key]: nextApproved
        ? { approved: true, approvedAt: new Date().toISOString(), approvedBy: adminDisplayName || '관리자' }
        : { approved: false, updatedAt: new Date().toISOString() }
    };
    setScheduleApprovals(updated);
    saveToCloud({ scheduleApprovals: updated });
  };

  const handleDownloadScheduleExcel = () => {
    const targetStaff = visibleStaff;
    const headers = ['매장명', '성명', '직책', '잔여연차', ...daysInMonth.map((d) => d.day + '일(' + d.dayName + ')')];
    const rows = targetStaff.map((stf) => {
      const stName = stores.find((s) => s.id === stf.storeId)?.name || '미지정';
      const dayCells = daysInMonth.map((d) => schedules[d.dateStr + '_' + stf.id] || '');
      return [stName, stf.name, stf.role, stf.annualLeave ?? 0, ...dayCells];
    });

    const escapeCsv = (val) => '"' + String(val ?? '').replace(/"/g, '""') + '"';
    const csvContent = '\uFEFF' + [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filterLabel = isAdmin
      ? selectedStoreId === 'ALL'
        ? '전체매장'
        : stores.find((s) => s.id === selectedStoreId)?.name || '매장'
      : myStoreObj?.name || '매장';
    link.href = url;
    link.download = '근무스케줄_' + currentMonthPrefix + '_' + filterLabel + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [salesDate, setSalesDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salesStoreInput, setSalesStoreInput] = useState('');
  const [salesAmountInput, setSalesAmountInput] = useState('');
  const [salesNoteInput, setSalesNoteInput] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'staff' && activeStaffProfile) {
      setSalesStoreInput(activeStaffProfile.storeId);
    } else if (stores.length > 0 && !salesStoreInput) {
      setSalesStoreInput(stores[0].id);
    }
  }, [currentUser, activeStaffProfile, stores]);

  const handleSaveSales = (e) => {
    e.preventDefault();
    const targetStoreId = isAdmin ? salesStoreInput : activeStaffProfile?.storeId;
    if (!targetStoreId || !salesDate) return;

    const numericAmount = Number(String(salesAmountInput).replace(/,/g, '')) || 0;
    const key = salesDate + '_' + targetStoreId;
    const updatedRecords = {
      ...salesRecords,
      [key]: {
        amount: numericAmount,
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
    setSalesNoteInput('');
    alert('일매출이 등록되었고 대시보드에 실시간 합산되었습니다.');
  };

  const [leaveDate, setLeaveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [leaveType, setLeaveType] = useState('연차');
  const [leaveReason, setLeaveReason] = useState('');

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!activeStaffProfile || !leaveDate) return;
    const cost = getLeaveCost(leaveType);
    const currentRemain = Number(activeStaffProfile.annualLeave ?? 0);
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
    alert('휴가 신청이 접수되었습니다. 관리자 승인 시 연차 차감 및 스케줄에 반영됩니다.');
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
          const nextLeave = Math.max(0, Number((Number(s.annualLeave ?? 0) - cost).toFixed(1)));
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

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminAccountPin, setNewAdminAccountPin] = useState('');

  const handleAddAdminAccount = (e) => {
    e.preventDefault();
    if (!newAdminName.trim() || !/^\d{4}$/.test(newAdminAccountPin)) {
      alert('관리자 이름과 4자리 PIN 번호를 확인해 주세요.');
      return;
    }
    const addedAdmin = {
      id: 'admin_' + Date.now(),
      name: newAdminName.trim(),
      pin: newAdminAccountPin
    };
    const updatedAdmins = [...adminAccounts, addedAdmin];
    setAdminAccounts(updatedAdmins);
    saveToCloud({ adminAccounts: updatedAdmins });
    setNewAdminName('');
    setNewAdminAccountPin('');
    alert('새 관리자 계정이 추가되었습니다.');
  };

  const handleResetAdminAccountPin = (adminId, name) => {
    const nextPin = window.prompt(name + ' 관리자의 새 PIN 번호 4자리를 입력하세요:', '0000');
    if (!nextPin || !/^\d{4}$/.test(nextPin)) return;
    const updatedAdmins = adminAccounts.map((a) => (a.id === adminId ? { ...a, pin: nextPin } : a));
    setAdminAccounts(updatedAdmins);
    saveToCloud({ adminAccounts: updatedAdmins });
    alert('관리자 PIN이 변경되었습니다.');
  };

  const handleDeleteAdminAccount = (adminId, name) => {
    if (!window.confirm(name + ' 관리자 계정을 삭제하시겠습니까?')) return;
    const updatedAdmins = adminAccounts.filter((a) => a.id !== adminId);
    setAdminAccounts(updatedAdmins);
    saveToCloud({ adminAccounts: updatedAdmins });
  };

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffStore, setNewStaffStore] = useState(stores[0]?.id || 'store_1');
  const [newStaffRole, setNewStaffRole] = useState('사원');
  const [newStaffPin, setNewStaffPin] = useState('1234');
  const [newStaffAnnualLeave, setNewStaffAnnualLeave] = useState('15');

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !/^\d{4}$/.test(newStaffPin)) {
      alert('성명과 4자리 PIN을 확인해 주세요.');
      return;
    }
    const leaveDays = Math.max(0, Number(newStaffAnnualLeave) || 0);
    const added = {
      id: 'staff_' + Date.now(),
      name: newStaffName.trim(),
      storeId: newStaffStore,
      role: newStaffRole,
      pin: newStaffPin,
      annualLeave: leaveDays
    };
    const updated = [...staffList, added];
    setStaffList(updated);
    saveToCloud({ staffList: updated });
    setNewStaffName('');
    setNewStaffPin('1234');
    setNewStaffAnnualLeave('15');
  };

  const handleUpdateStaffLeaveDays = (staffId, nextVal) => {
    const parsed = Math.max(0, Number(nextVal) || 0);
    const updated = staffList.map((s) => (s.id === staffId ? { ...s, annualLeave: parsed } : s));
    setStaffList(updated);
    saveToCloud({ staffList: updated });
  };

  const handleDeleteStaff = (id, name) => {
    if (!window.confirm(name + ' 직원을 삭제하시겠습니까?')) return;
    const updated = staffList.filter((s) => s.id !== id);
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

  const monthlySalesSummary = useMemo(() => {
    const byStore = {};
    stores.forEach((st) => {
      byStore[st.id] = 0;
    });
    Object.entries(salesRecords).forEach(([key, val]) => {
      if (key.startsWith(currentMonthPrefix)) {
        const parts = key.split('_');
        const stId = parts.slice(1).join('_');
        if (byStore[stId] !== undefined) {
          byStore[stId] += Number(val.amount) || 0;
        }
      }
    });
    return byStore;
  }, [salesRecords, stores, currentMonthPrefix]);

  const staffSalesAnalytics = useMemo(() => {
    const statsByStaff = {};
    staffList.forEach((stf) => {
      statsByStaff[stf.id] = {
        staff: stf,
        totalAllocated: 0,
        workDaysCount: 0,
        groupStats: {
          'A조': { sum: 0, count: 0 },
          'B조': { sum: 0, count: 0 },
          'C조': { sum: 0, count: 0 },
          'F조': { sum: 0, count: 0 }
        }
      };
    });

    Object.entries(salesRecords).forEach(([key, rec]) => {
      if (!key.startsWith(currentMonthPrefix)) return;
      const parts = key.split('_');
      const dateStr = parts[0];
      const storeId = parts.slice(1).join('_');
      const daySales = Number(rec.amount) || 0;
      if (daySales <= 0) return;

      const workingOnDay = staffList.filter((stf) => {
        if (stf.storeId !== storeId) return false;
        const shift = schedules[dateStr + '_' + stf.id];
        return WORK_GROUPS.includes(shift);
      });

      if (workingOnDay.length === 0) return;
      const perPersonShare = daySales / workingOnDay.length;

      workingOnDay.forEach((stf) => {
        const shift = schedules[dateStr + '_' + stf.id];
        const entry = statsByStaff[stf.id];
        if (!entry) return;
        entry.totalAllocated += perPersonShare;
        entry.workDaysCount += 1;
        if (entry.groupStats[shift]) {
          entry.groupStats[shift].sum += perPersonShare;
          entry.groupStats[shift].count += 1;
        }
      });
    });

    return Object.values(statsByStaff)
      .filter((item) => {
        if (isAdmin) {
          return selectedStoreId === 'ALL' || item.staff.storeId === selectedStoreId;
        }
        return item.staff.storeId === activeStaffProfile?.storeId;
      })
      .map((item) => {
        const overallAvg = item.workDaysCount > 0 ? Math.round(item.totalAllocated / item.workDaysCount) : 0;
        const groupAverages = {};
        WORK_GROUPS.forEach((g) => {
          const gs = item.groupStats[g];
          groupAverages[g] = gs.count > 0 ? Math.round(gs.sum / gs.count) : null;
        });
        return {
          ...item,
          totalAllocatedRounded: Math.round(item.totalAllocated),
          overallAvg,
          groupAverages
        };
      });
  }, [salesRecords, schedules, staffList, currentMonthPrefix, isAdmin, selectedStoreId, activeStaffProfile]);

  const visibleStaff = useMemo(() => {
    if (currentUser?.role === 'staff' && activeStaffProfile) {
      return staffList.filter((s) => s.storeId === activeStaffProfile.storeId);
    }
    if (selectedStoreId === 'ALL') return staffList;
    return staffList.filter((s) => s.storeId === selectedStoreId);
  }, [currentUser, activeStaffProfile, selectedStoreId, staffList]);

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
                    const members = staffList.filter((m) => m.storeId === st.id);
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
                  본사 관리자 전용 모드입니다. 전 매장 스케줄 승인/편성, 매출 마감, 연차 승인 및 계정 관리를 수행합니다.
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
  const currentFilterStoreId = isAdmin ? selectedStoreId : activeStaffProfile?.storeId;
  const currentStoreApproved =
    currentFilterStoreId && currentFilterStoreId !== 'ALL'
      ? isStoreMonthApproved(currentFilterStoreId)
      : false;

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
                    : activeStaffProfile?.name + ' (' + activeStaffProfile?.role + ' · 잔여연차 ' + (activeStaffProfile?.annualLeave ?? 0) + '일)'}
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
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={activeTab === 'sales'
              ? 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-indigo-400 text-white whitespace-nowrap flex items-center gap-1.5'
              : 'px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-400 whitespace-nowrap flex items-center gap-1.5'}
          >
            <TrendingUp className="w-4 h-4" />일매출 · 사원집계
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
                onChange={(e) => setSelectedStoreId(e.target.value)}
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
                  <h2 className="font-bold text-base">월간 근무 스케줄표 (A조 · B조 · C조 · F조)</h2>
                  {currentFilterStoreId && currentFilterStoreId !== 'ALL' && (
                    <span className={currentStoreApproved
                      ? 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1'
                      : 'text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1'}>
                      {currentStoreApproved ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {currentStoreApproved ? '관리자 승인 확정 (수정 잠금)' : '작성/수정 가능'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAdmin
                    ? '관리자는 전 매장 스케줄을 입력·수정할 수 있으며, 승인 확정 시 매니저 임의 변경이 잠깁니다.'
                    : isManager
                    ? '매니저는 소속 매장 스케줄을 입력할 수 있으며, 관리자 승인 확정 후 변경 시 관리자 승인이 필요합니다.'
                    : '스케줄 입력/수정은 관리자와 매니저만 가능하며, 일반 직원은 조회만 가능합니다.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && currentFilterStoreId && currentFilterStoreId !== 'ALL' && (
                  <button
                    onClick={() => handleToggleScheduleApproval(currentFilterStoreId, !currentStoreApproved)}
                    className={currentStoreApproved
                      ? 'px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 inline-flex items-center gap-1'
                      : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1'}
                  >
                    {currentStoreApproved ? <Unlock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {currentStoreApproved ? '승인 해제 (변경 허용)' : '스케줄 관리자 승인'}
                  </button>
                )}

                <button
                  onClick={handleDownloadScheduleExcel}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  엑셀 다운로드
                </button>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
              {SHIFT_TYPES.map((t) => (
                <span key={t.code} className={'text-[11px] px-2 py-0.5 rounded border font-medium ' + t.color}>
                  {t.code}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="sticky left-0 z-20 bg-slate-100 px-3 py-2.5 text-left font-bold text-slate-700 min-w-[140px] border-r border-slate-200">
                      매장 / 성명
                    </th>
                    {daysInMonth.map((d) => (
                      <th
                        key={d.dateStr}
                        className={d.dayOfWeek === 0
                          ? 'px-1.5 py-2 text-center min-w-[54px] border-r border-slate-200 text-rose-600 bg-rose-50/60'
                          : d.dayOfWeek === 6
                          ? 'px-1.5 py-2 text-center min-w-[54px] border-r border-slate-200 text-blue-600 bg-blue-50/60'
                          : 'px-1.5 py-2 text-center min-w-[54px] border-r border-slate-200 text-slate-700'}
                      >
                        <div className="font-bold">{d.day}</div>
                        <div className="text-[10px] font-normal">{d.dayName}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleStaff.map((staff) => {
                    const stObj = stores.find((s) => s.id === staff.storeId);
                    const rowEditable = canEditScheduleForStaff(staff);
                    const rowApproved = isStoreMonthApproved(staff.storeId);
                    return (
                      <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 border-r border-slate-200">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <span>{staff.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({staff.role})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[125px]">
                            {stObj?.name} · 연차 {staff.annualLeave ?? 0}일
                          </div>
                        </td>
                        {daysInMonth.map((d) => {
                          const val = schedules[d.dateStr + '_' + staff.id] || '';
                          const shiftMeta = SHIFT_TYPES.find((s) => s.code === val);
                          return (
                            <td key={d.dateStr} className="p-1 text-center border-r border-slate-100">
                              {rowEditable ? (
                                <select
                                  value={val}
                                  onChange={(e) => handleScheduleChange(d.dateStr, staff, e.target.value)}
                                  className={shiftMeta
                                    ? 'w-full text-[11px] font-semibold rounded py-1 px-0.5 text-center border cursor-pointer ' + shiftMeta.color
                                    : 'w-full text-[11px] font-semibold rounded py-1 px-0.5 text-center border cursor-pointer bg-white text-slate-400 border-slate-200'}
                                >
                                  <option value="">-</option>
                                  {SHIFT_TYPES.map((opt) => (
                                    <option key={opt.code} value={opt.code}>{opt.code}</option>
                                  ))}
                                </select>
                              ) : (
                                <span
                                  title={rowApproved && isManager ? '관리자 승인 완료 상태입니다.' : ''}
                                  className={shiftMeta
                                    ? 'inline-block w-full py-1 rounded text-[11px] font-semibold border ' + shiftMeta.color
                                    : 'inline-block w-full py-1 rounded text-[11px] font-semibold text-slate-300'}
                                >
                                  {val || '-'}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit">
                <h2 className="font-bold text-base mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />일매출 마감 등록
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  등록 즉시 매장 목표 대시보드와 출근 사원별 배분·조별 평균 매출에 합산됩니다.
                </p>
                <form onSubmit={handleSaveSales} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">매출 일자</label>
                    <input
                      type="date"
                      value={salesDate}
                      onChange={(e) => setSalesDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">대상 매장</label>
                    {isAdmin ? (
                      <select
                        value={salesStoreInput}
                        onChange={(e) => setSalesStoreInput(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        {stores.map((st) => (<option key={st.id} value={st.id}>{st.name}</option>))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={myStoreObj?.name || ''}
                        className="w-full border border-slate-200 bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-600"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">일매출 금액 (원)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={salesAmountInput}
                      onChange={(e) => setSalesAmountInput(e.target.value)}
                      placeholder="예: 4500000"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">특이사항 / 비고</label>
                    <input
                      type="text"
                      value={salesNoteInput}
                      onChange={(e) => setSalesNoteInput(e.target.value)}
                      placeholder="단체 관광객 입점, 프로모션 등"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                    일매출 저장 및 실시간 합산
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-base mb-4">{year}년 {month + 1}월 매장별 목표 대비 달성 현황</h3>
                  <div className="space-y-4">
                    {stores
                      .filter((st) => isAdmin || st.id === activeStaffProfile?.storeId)
                      .map((st) => {
                        const actual = monthlySalesSummary[st.id] || 0;
                        const rate = st.targetSales > 0 ? Math.round((actual / st.targetSales) * 100) : 0;
                        return (
                          <div key={st.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/60">
                            <div className="flex justify-between items-center text-sm mb-1.5">
                              <span className="font-bold text-slate-800">{st.name}</span>
                              <span className="font-bold text-indigo-600">{rate}% 달성</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: Math.min(rate, 100) + '%' }} />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>누적 매출: {actual.toLocaleString()}원</span>
                              <span>월 목표: {st.targetSales.toLocaleString()}원</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-base mb-3">당월 일매출 입력 내역</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2">일자</th>
                          <th className="py-2">매장명</th>
                          <th className="py-2 text-right">매출액</th>
                          <th className="py-2 pl-3">비고 / 작성자</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(salesRecords)
                          .filter(([key]) => {
                            if (!key.startsWith(currentMonthPrefix)) return false;
                            const [, stId] = key.split('_');
                            return isAdmin || stId === activeStaffProfile?.storeId;
                          })
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .map(([key, rec]) => {
                           const parts = key.split('_');
                            const dt = parts[0];
                            const stId = parts.slice(1).join('_');
                            const stName = stores.find((s) => s.id === stId)?.name || stId;
                            return (
                              <tr key={key} className="border-b border-slate-100">
                                <td className="py-2.5 font-medium">{dt}</td>
                                <td className="py-2.5">{stName}</td>
                                <td className="py-2.5 text-right font-bold text-slate-800">{Number(rec.amount).toLocaleString()}원</td>
                                <td className="py-2.5 pl-3 text-slate-500">{rec.note || '-'} ({rec.author})</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="mb-3">
                <h3 className="font-bold text-base">
                  {year}년 {month + 1}월 판매사원별 출근 배분 매출 및 조별(A/B/C/F) 평균 매출
                </h3>
                <p className="text-xs text-slate-500">
                  해당 일자 매장에 A·B·C·F조로 출근한 인원에게 당일 매출을 균등 배분한 뒤, 사원별 총 배분액과 각 조 출근 시 평균 매출을 집계합니다.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-3">사원명 (직책)</th>
                      <th className="py-2.5 px-3">소속 매장</th>
                      <th className="py-2.5 px-3 text-center">출근일수</th>
                      <th className="py-2.5 px-3 text-right">총 배분매출</th>
                      <th className="py-2.5 px-3 text-right">출근일 평균</th>
                      <th className="py-2.5 px-3 text-right">A조 평균</th>
                      <th className="py-2.5 px-3 text-right">B조 평균</th>
                      <th className="py-2.5 px-3 text-right">C조 평균</th>
                      <th className="py-2.5 px-3 text-right">F조 평균</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffSalesAnalytics.map((row) => {
                      const stName = stores.find((s) => s.id === row.staff.storeId)?.name || '미지정';
                      return (
                        <tr key={row.staff.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {row.staff.name} <span className="font-normal text-slate-500">({row.staff.role})</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{stName}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{row.workDaysCount}일</td>
                          <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                            {row.totalAllocatedRounded.toLocaleString()}원
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                            {row.overallAvg.toLocaleString()}원
                          </td>
                          {WORK_GROUPS.map((g) => (
                            <td key={g} className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {row.groupAverages[g] !== null ? row.groupAverages[g].toLocaleString() + '원' : '-'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {!isAdmin && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit">
                <h2 className="font-bold text-base mb-1">휴가 / 연차 신청</h2>
                <p className="text-xs text-slate-500 mb-3">
                  현재 잔여 연차: <span className="font-bold text-indigo-600">{activeStaffProfile?.annualLeave ?? 0}일</span>
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  관리자 승인 시 잔여 연차가 차감되고 월간 스케줄표에 자동 반영됩니다.
                </p>
                <form onSubmit={handleSubmitLeave} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">희망 일자</label>
                    <input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">휴가 구분</label>
                    <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="연차">연차휴가 (1일 차감)</option>
                      <option value="반차">반차 (0.5일 차감)</option>
                      <option value="휴무">정기휴무 요청 (차감 없음)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">사유</label>
                    <input type="text" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="개인 사유" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                    신청서 제출
                  </button>
                </form>
              </div>
            )}

            <div className={isAdmin ? 'lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm' : 'lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm'}>
              <h3 className="font-bold text-base mb-3">{isAdmin ? '전 매장 휴가 신청 및 연차 승인 관리' : '내 휴가 신청 내역'}</h3>
              <div className="space-y-2.5">
                {leaveRequests
                  .filter((r) => isAdmin || r.staffId === activeStaffProfile?.id)
                  .map((req) => (
                    <div key={req.id} className="border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{req.staffName}</span>
                          <span className="text-xs text-slate-500">{req.storeName}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            {req.date} · {req.type} ({req.cost !== undefined ? req.cost : getLeaveCost(req.type)}일)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">사유: {req.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.status === '대기' && isAdmin ? (
                          <>
                            <button onClick={() => handleLeaveAction(req, '승인')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />승인
                            </button>
                            <button onClick={() => handleLeaveAction(req, '반려')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" />반려
                            </button>
                          </>
                        ) : (
                          <span className={req.status === '승인'
                            ? 'text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800'
                            : req.status === '반려'
                            ? 'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800'
                            : 'text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800'}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {!isAdmin ? (
              <div className="max-w-md bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h2 className="font-bold text-base mb-1">내 로그인 PIN 번호 변경</h2>
                <p className="text-xs text-slate-500 mb-4">본인만 알 수 있는 숫자 4자리로 변경해 주세요.</p>
                <form onSubmit={handleSelfPinChange} className="space-y-3">
                  <input type="password" inputMode="numeric" maxLength={4} value={newSelfPin} onChange={(e) => setNewSelfPin(e.target.value.replace(/\D/g, ''))} placeholder="새 PIN 4자리 입력" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-center tracking-[0.4em] font-bold" />
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                    PIN 번호 변경 저장
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h2 className="font-bold text-base mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />본사 관리자 계정 추가 및 PIN 관리
                  </h2>
                  <form onSubmit={handleAddAdminAccount} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="추가 관리자 이름 (예: 홍길동 팀장)"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                      required
                    />
                    <input
                      type="text"
                      maxLength={4}
                      value={newAdminAccountPin}
                      onChange={(e) => setNewAdminAccountPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="관리자 PIN 4자리"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-center font-mono"
                      required
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" />관리자 계정 추가
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2">관리자 구분</th>
                          <th className="py-2">현재 PIN</th>
                          <th className="py-2 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <td className="py-2.5 font-bold text-slate-800">본사 마스터 관리자 (기본)</td>
                          <td className="py-2.5 font-mono font-bold text-indigo-600">{adminPin}</td>
                          <td className="py-2.5 text-right text-slate-400">하단 마스터 PIN 변경에서 수정</td>
                        </tr>
                        {adminAccounts.map((adm) => (
                          <tr key={adm.id} className="border-b border-slate-100">
                            <td className="py-2.5 font-bold">{adm.name}</td>
                            <td className="py-2.5 font-mono font-bold text-indigo-600">{adm.pin}</td>
                            <td className="py-2.5 text-right space-x-2">
                              <button onClick={() => handleResetAdminAccountPin(adm.id, adm.name)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700">
                                <Edit3 className="w-3 h-3" />PIN 변경
                              </button>
                              <button onClick={() => handleDeleteAdminAccount(adm.id, adm.name)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50">
                                <Trash2 className="w-3 h-3" />삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h2 className="font-bold text-base mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />판매사원 계정 · 부여 연차 · PIN 관리
                  </h2>
                  <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="직원 성명" className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" required />
                    <select value={newStaffStore} onChange={(e) => setNewStaffStore(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      {stores.map((st) => (<option key={st.id} value={st.id}>{st.name}</option>))}
                    </select>
                    <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="매니저">매니저</option>
                      <option value="시니어">시니어</option>
                      <option value="사원">사원</option>
                      <option value="아르바이트">아르바이트</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newStaffAnnualLeave}
                      onChange={(e) => setNewStaffAnnualLeave(e.target.value)}
                      placeholder="연차일수"
                      title="부여 연차 일수"
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-center font-semibold"
                    />
                    <input type="text" maxLength={4} value={newStaffPin} onChange={(e) => setNewStaffPin(e.target.value.replace(/\D/g, ''))} placeholder="초기 PIN 4자리" className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-center font-mono" required />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" />직원 추가
                    </button>
                  </form>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2">성명</th>
                          <th className="py-2">소속 매장</th>
                          <th className="py-2">직책</th>
                          <th className="py-2 text-center">잔여 연차(일)</th>
                          <th className="py-2">현재 PIN</th>
                          <th className="py-2 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((stf) => {
                          const stName = stores.find((s) => s.id === stf.storeId)?.name || '미지정';
                          return (
                            <tr key={stf.id} className="border-b border-slate-100">
                              <td className="py-2.5 font-bold">{stf.name}</td>
                              <td className="py-2.5">{stName}</td>
                              <td className="py-2.5">{stf.role}</td>
                              <td className="py-2.5 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={stf.annualLeave ?? 0}
                                  onChange={(e) => handleUpdateStaffLeaveDays(stf.id, e.target.value)}
                                  className="w-20 border border-slate-300 rounded px-2 py-1 text-center font-semibold"
                                />
                              </td>
                              <td className="py-2.5 font-mono font-bold text-indigo-600">{stf.pin}</td>
                              <td className="py-2.5 text-right space-x-2">
                                <button onClick={() => handleResetStaffPin(stf.id, stf.name)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700">
                                  <Edit3 className="w-3 h-3" />PIN 변경
                                </button>
                                <button onClick={() => handleDeleteStaff(stf.id, stf.name)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50">
                                  <Trash2 className="w-3 h-3" />삭제
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h2 className="font-bold text-base mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    {year}년 {month + 1}월 매장별 스케줄 승인 상태 관리 (승인 시 매니저 임의 변경 잠금)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {stores.map((st) => {
                      const approved = isStoreMonthApproved(st.id);
                      return (
                        <div key={st.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                          <span className="text-xs font-bold text-slate-800 truncate pr-2">{st.name}</span>
                          <button
                            onClick={() => handleToggleScheduleApproval(st.id, !approved)}
                            className={approved
                              ? 'px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shrink-0'
                              : 'px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0'}
                          >
                            {approved ? '승인완료 (해제)' : '승인하기'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h2 className="font-bold text-base mb-3">지점명 및 월 목표 매출 설정 (7개점)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stores.map((st, idx) => (
                      <div key={st.id} className="flex items-center gap-2 border border-slate-200 rounded-lg p-2.5">
                        <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                        <input type="text" value={st.name} onChange={(e) => handleUpdateStore(st.id, 'name', e.target.value)} className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold" />
                        <input type="number" step="1000000" value={st.targetSales} onChange={(e) => handleUpdateStore(st.id, 'targetSales', e.target.value)} className="w-32 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-right font-mono" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-base mb-1">본사 마스터 관리자 PIN 변경</h3>
                    <p className="text-xs text-slate-500 mb-3">현재 마스터 PIN: <span className="font-mono font-bold">{adminPin}</span></p>
                    <form onSubmit={handleUpdateAdminPin} className="flex gap-2">
                      <input type="text" maxLength={4} value={newAdminPinInput} onChange={(e) => setNewAdminPinInput(e.target.value.replace(/\D/g, ''))} placeholder="새 마스터 PIN 4자리" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" />
                      <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold">변경</button>
                    </form>
                  </div>

                  <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-sm">
                    <h3 className="font-bold text-base text-rose-700 mb-1">당월({year}년 {month + 1}월) 데이터 일괄 삭제</h3>
                    <p className="text-xs text-slate-500 mb-3">테스트 데이터를 지우고 새 달을 시작할 때 사용하세요.</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleClearMonthData('schedule')} className="flex-1 border border-rose-300 text-rose-700 hover:bg-rose-50 py-2 rounded-lg text-xs font-semibold">
                        당월 스케줄 초기화
                      </button>
                      <button onClick={() => handleClearMonthData('sales')} className="flex-1 border border-rose-300 text-rose-700 hover:bg-rose-50 py-2 rounded-lg text-xs font-semibold">
                        당월 매출 초기화
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
