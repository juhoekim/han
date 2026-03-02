'use client';

import { useState, useEffect } from 'react';

export default function YearlyReportPage() {
    const [yearlyData, setYearlyData] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const [year, setYear] = useState(null);

    useEffect(() => {
        const now = new Date();
        setYear(now.getFullYear());
    }, []);

    useEffect(() => {
        if (year) {
            loadYearlyReport();
        }
    }, [year]);

    async function loadYearlyReport() {
        setLoading(true);
        try {
            const [txRes, setRes] = await Promise.all([
                fetch(`/api/transactions?year=${year}`),
                fetch('/api/settings'),
            ]);

            const txData = await txRes.json();
            const setData = await setRes.json();
            const transactions = txData.transactions || [];

            const monthlyData = [];
            for (let m = 1; m <= 12; m++) {
                const monthTx = transactions.filter(t => {
                    const d = new Date(t.date);
                    return (d.getMonth() + 1) === m;
                });

                const income = monthTx
                    .filter(t => t.type === 'income')
                    .reduce((s, t) => s + t.amount, 0);
                const expense = monthTx
                    .filter(t => t.type === 'expense')
                    .reduce((s, t) => s + t.amount, 0);

                monthlyData.push({
                    month: m,
                    income,
                    expense,
                    balance: income - expense,
                    count: monthTx.length,
                });
            }

            setYearlyData(monthlyData);
            setSettings(setData);
        } catch (error) {
            console.error('Yearly report error:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatAmount(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    const totalIncome = yearlyData.reduce((s, m) => s + m.income, 0);
    const totalExpense = yearlyData.reduce((s, m) => s + m.expense, 0);
    const totalBalance = totalIncome - totalExpense;

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = 2024; y <= currentYear + 1; y++) years.push(y);

    return (
        <div>
            <div className="print-header">
                <h1>{settings?.churchName || '교회'} 연간 재정 보고서</h1>
                <p>{year}년 결산</p>
            </div>

            <div className="page-header no-print">
                <h1 className="page-title">연간 결산 보고서</h1>
                <p className="page-subtitle">{year}년도 월별 재정 현황을 확인합니다</p>
            </div>

            <div className="report-controls no-print">
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value))}
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ 인쇄
                </button>
            </div>

            {loading || !year ? (
                <div className="loading">불러오는 중...</div>
            ) : (
                <>
                    <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                        <div className="stat-card income">
                            <div className="stat-label">📥 연간 총 수입</div>
                            <div className="stat-value income">{formatAmount(totalIncome)}</div>
                        </div>
                        <div className="stat-card expense">
                            <div className="stat-label">📤 연간 총 지출</div>
                            <div className="stat-value expense">{formatAmount(totalExpense)}</div>
                        </div>
                        <div className="stat-card balance">
                            <div className="stat-label">💰 연간 수지 차액</div>
                            <div className="stat-value balance">{formatAmount(totalBalance)}</div>
                        </div>
                    </div>

                    <div className="card yearly-table">
                        <div className="card-title">📅 월별 상세</div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>월</th>
                                        <th>수입</th>
                                        <th>지출</th>
                                        <th>수지 차액</th>
                                        <th>거래 수</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearlyData.map(m => (
                                        <tr key={m.month}>
                                            <td style={{ textAlign: 'left', fontWeight: 600 }}>{m.month}월</td>
                                            <td className="amount-income">
                                                {m.income > 0 ? formatAmount(m.income) : '-'}
                                            </td>
                                            <td className="amount-expense">
                                                {m.expense > 0 ? formatAmount(m.expense) : '-'}
                                            </td>
                                            <td style={{
                                                fontWeight: 600,
                                                color: m.balance >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)',
                                            }}>
                                                {m.income > 0 || m.expense > 0 ? formatAmount(m.balance) : '-'}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{m.count > 0 ? `${m.count}건` : '-'}</td>
                                        </tr>
                                    ))}
                                    <tr className="total-row">
                                        <td style={{ textAlign: 'left', fontWeight: 700 }}>합계</td>
                                        <td className="amount-income" style={{ fontWeight: 700 }}>{formatAmount(totalIncome)}</td>
                                        <td className="amount-expense" style={{ fontWeight: 700 }}>{formatAmount(totalExpense)}</td>
                                        <td style={{
                                            fontWeight: 700,
                                            color: totalBalance >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)',
                                        }}>
                                            {formatAmount(totalBalance)}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                                            {yearlyData.reduce((s, m) => s + m.count, 0)}건
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
