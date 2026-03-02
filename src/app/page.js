'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [txRes, carryRes, settingsRes] = await Promise.all([
        fetch(`/api/transactions?year=${year}&month=${month}`),
        fetch(`/api/carryover?year=${year}&month=${month}`),
        fetch('/api/settings'),
      ]);

      const txData = await txRes.json();
      const carryData = await carryRes.json();
      const settingsData = await settingsRes.json();

      const transactions = txData.transactions || [];
      const incomeTotal = transactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expenseTotal = transactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      setSummary({
        churchName: settingsData.churchName,
        year,
        month,
        carryOver: carryData.carryOver || 0,
        incomeTotal,
        expenseTotal,
        balance: carryData.carryOver + incomeTotal - expenseTotal,
        recentTransactions: transactions.slice(-5).reverse(),
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  }

  if (loading) return <div className="loading">불러오는 중...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{summary?.churchName || '교회'} 재정 현황</h1>
        <p className="page-subtitle">
          {summary?.year}년 {summary?.month}월 재정 요약
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card carryover">
          <div className="stat-label">📌 전월 이월금</div>
          <div className="stat-value carryover">{formatAmount(summary?.carryOver || 0)}</div>
        </div>
        <div className="stat-card income">
          <div className="stat-label">📥 이번달 수입</div>
          <div className="stat-value income">{formatAmount(summary?.incomeTotal || 0)}</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">📤 이번달 지출</div>
          <div className="stat-value expense">{formatAmount(summary?.expenseTotal || 0)}</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label">💰 현재 잔액</div>
          <div className="stat-value balance">{formatAmount(summary?.balance || 0)}</div>
        </div>
      </div>

      <div className="page-header">
        <h2 className="page-title" style={{ fontSize: '1.3rem' }}>바로가기</h2>
      </div>

      <div className="menu-grid">
        <Link href="/transactions" className="menu-card">
          <div className="menu-icon green">📝</div>
          <div>
            <h3>수입/지출 입력</h3>
            <p>수입 및 지출 내역을 등록하고 관리합니다</p>
          </div>
        </Link>
        <Link href="/report" className="menu-card">
          <div className="menu-icon blue">📊</div>
          <div>
            <h3>월별 결산 보고서</h3>
            <p>월별 수입/지출 보고서를 확인하고 인쇄합니다</p>
          </div>
        </Link>
        <Link href="/report/yearly" className="menu-card">
          <div className="menu-icon purple">📈</div>
          <div>
            <h3>연간 결산 보고서</h3>
            <p>연도별 재정 현황을 한눈에 확인합니다</p>
          </div>
        </Link>
        <Link href="/members" className="menu-card">
          <div className="menu-icon yellow">👥</div>
          <div>
            <h3>멤버 관리</h3>
            <p>모임 인원 명단을 관리합니다</p>
          </div>
        </Link>
      </div>

      {summary?.recentTransactions?.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="page-header">
            <h2 className="page-title" style={{ fontSize: '1.3rem' }}>최근 거래</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>구분</th>
                  <th>카테고리</th>
                  <th>내용</th>
                  <th style={{ textAlign: 'right' }}>금액</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge badge-${t.type}`}>
                        {t.type === 'income' ? '수입' : '지출'}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td>{t.description}</td>
                    <td style={{ textAlign: 'right' }}
                      className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
