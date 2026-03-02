'use client';

import { useState, useEffect } from 'react';

export default function ReportPage() {
    const [transactions, setTransactions] = useState([]);
    const [carryOver, setCarryOver] = useState(0);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingCarry, setEditingCarry] = useState(false);
    const [carryInput, setCarryInput] = useState('');
    const [toast, setToast] = useState('');

    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);

    useEffect(() => {
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth() + 1);
    }, []);

    useEffect(() => {
        if (year && month) {
            loadReport();
        }
    }, [year, month]);

    async function loadReport() {
        setLoading(true);
        try {
            const [txRes, carryRes, setRes] = await Promise.all([
                fetch(`/api/transactions?year=${year}&month=${month}`),
                fetch(`/api/carryover?year=${year}&month=${month}`),
                fetch('/api/settings'),
            ]);

            const txData = await txRes.json();
            const carryData = await carryRes.json();
            const setData = await setRes.json();

            setTransactions(txData.transactions || []);
            setCarryOver(carryData.carryOver || 0);
            setSettings(setData);
            setEditingCarry(false);
        } catch (error) {
            console.error('Report load error:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatAmount(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    async function saveCarryOver() {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        const newCarryOver = { ...settings.carryOver, [key]: parseInt(carryInput) || 0 };

        try {
            await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carryOver: newCarryOver }),
            });
            showToast('✅ 이월금이 수정되었습니다');
            loadReport();
        } catch (error) {
            showToast('❌ 저장 중 오류가 발생했습니다');
        }
    }

    const incomeItems = transactions
        .filter(t => t.type === 'income')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const expenseItems = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const incomeTotal = incomeItems.reduce((s, t) => s + t.amount, 0);
    const expenseTotal = expenseItems.reduce((s, t) => s + t.amount, 0);
    const nextCarryOver = carryOver + incomeTotal - expenseTotal;

    const years = [];
    for (let y = 2024; y <= now.getFullYear() + 1; y++) years.push(y);

    return (
        <div>
            <div className="print-header">
                <h1>{settings?.churchName || '교회'} 재정 보고서</h1>
                <p>{year}년 {month}월 결산 보고서</p>
            </div>

            <div className="page-header no-print">
                <h1 className="page-title">월별 결산 보고서</h1>
                <p className="page-subtitle">수입과 지출을 한눈에 확인합니다</p>
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
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={month}
                    onChange={e => setMonth(parseInt(e.target.value))}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}월</option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ 인쇄
                </button>
            </div>

            {loading || !year || !month ? (
                <div className="loading">불러오는 중...</div>
            ) : (
                <>
                    <div className="report-container">
                        {/* 왼쪽: 이월금 + 수입 */}
                        <div className="report-panel income">
                            <div className="report-panel-header">
                                📥 수입 내역
                            </div>
                            <div className="report-items">
                                <div className="report-item report-carryover">
                                    <div className="item-label">
                                        <span className="item-desc">전월 이월금</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {editingCarry ? (
                                            <>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ width: '140px', padding: '0.35rem 0.5rem', fontSize: '0.9rem' }}
                                                    value={carryInput}
                                                    onChange={e => setCarryInput(e.target.value)}
                                                    autoFocus
                                                />
                                                <button className="btn btn-success btn-sm" onClick={saveCarryOver}>저장</button>
                                                <button className="btn btn-outline btn-sm" onClick={() => setEditingCarry(false)}>취소</button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="item-amount">{formatAmount(carryOver)}</span>
                                                <button
                                                    className="btn btn-outline btn-sm no-print"
                                                    onClick={() => { setCarryInput(carryOver.toString()); setEditingCarry(true); }}
                                                >
                                                    수정
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {incomeItems.length === 0 ? (
                                    <div className="report-item">
                                        <span style={{ color: 'var(--text-muted)' }}>수입 내역이 없습니다</span>
                                    </div>
                                ) : (
                                    incomeItems.map(t => (
                                        <div key={t.id} className="report-item">
                                            <div className="item-label">
                                                <span className="item-category">{t.date} · {t.category}</span>
                                                <span className="item-desc">{t.description}</span>
                                            </div>
                                            <span className="item-amount amount-income">{formatAmount(t.amount)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="report-total income">
                                <span>수입 합계</span>
                                <span>{formatAmount(incomeTotal)}</span>
                            </div>
                        </div>

                        {/* 오른쪽: 지출 */}
                        <div className="report-panel expense">
                            <div className="report-panel-header">
                                📤 지출 내역
                            </div>
                            <div className="report-items">
                                {expenseItems.length === 0 ? (
                                    <div className="report-item">
                                        <span style={{ color: 'var(--text-muted)' }}>지출 내역이 없습니다</span>
                                    </div>
                                ) : (
                                    expenseItems.map(t => (
                                        <div key={t.id} className="report-item">
                                            <div className="item-label">
                                                <span className="item-category">{t.date} · {t.category}</span>
                                                <span className="item-desc">{t.description}</span>
                                            </div>
                                            <span className="item-amount amount-expense">{formatAmount(t.amount)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="report-total expense">
                                <span>지출 합계</span>
                                <span>{formatAmount(expenseTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 하단 요약 */}
                    <div className="report-summary">
                        <div className="summary-item">
                            <span className="summary-label">이월금 + 수입</span>
                            <span className="summary-value" style={{ color: 'var(--accent-green)' }}>
                                {formatAmount(carryOver + incomeTotal)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">총 지출</span>
                            <span className="summary-value" style={{ color: 'var(--accent-red)' }}>
                                {formatAmount(expenseTotal)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">차기 이월금</span>
                            <span className="summary-value" style={{ color: 'var(--accent-blue)' }}>
                                {formatAmount(nextCarryOver)}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
