'use client';

import { useState, useEffect } from 'react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [members, setMembers] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('income');
    const [toast, setToast] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: '',
        description: '',
        amount: '',
        memberId: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setForm(f => ({
            ...f,
            type: activeTab,
            category: '',
            memberId: '',
        }));
    }, [activeTab]);

    async function loadData() {
        try {
            const [txRes, memRes, setRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/members'),
                fetch('/api/settings'),
            ]);
            const txData = await txRes.json();
            const memData = await memRes.json();
            const setData = await setRes.json();

            setTransactions(txData.transactions || []);
            setMembers(memData.members || []);
            setSettings(setData);
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    function formatAmount(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.category || !form.amount || !form.description) {
            showToast('❌ 모든 필드를 입력해주세요');
            return;
        }

        try {
            if (editingId) {
                await fetch(`/api/transactions/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                showToast('✅ 거래가 수정되었습니다');
                setEditingId(null);
            } else {
                await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                showToast('✅ 거래가 등록되었습니다');
            }

            setForm({
                date: new Date().toISOString().split('T')[0],
                type: activeTab,
                category: '',
                description: '',
                amount: '',
                memberId: '',
            });
            loadData();
        } catch (error) {
            showToast('❌ 오류가 발생했습니다');
        }
    }

    async function handleDelete(id) {
        try {
            await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            showToast('🗑️ 거래가 삭제되었습니다');
            setDeletingId(null);
            loadData();
        } catch (error) {
            showToast('❌ 삭제 중 오류가 발생했습니다');
        }
    }

    function handleEdit(transaction) {
        setActiveTab(transaction.type);
        setForm({
            date: transaction.date,
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            amount: transaction.amount.toString(),
            memberId: transaction.memberId ? transaction.memberId.toString() : '',
        });
        setEditingId(transaction.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleCancel() {
        setEditingId(null);
        setForm({
            date: new Date().toISOString().split('T')[0],
            type: activeTab,
            category: '',
            description: '',
            amount: '',
            memberId: '',
        });
    }

    function handleMemberSelect(e) {
        const memberId = e.target.value;
        setForm(f => ({ ...f, memberId }));
        if (memberId && activeTab === 'income') {
            const member = members.find(m => m.id === parseInt(memberId));
            if (member && !form.description) {
                setForm(f => ({ ...f, description: `${member.name} ${f.category || '헌금'}` }));
            }
        }
    }

    const categories = activeTab === 'income'
        ? (settings?.incomeCategories || [])
        : (settings?.expenseCategories || []);

    const filteredTransactions = transactions
        .filter(t => t.type === activeTab)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (loading) return <div className="loading">불러오는 중...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">수입/지출 입력</h1>
                <p className="page-subtitle">거래 내역을 등록하고 관리합니다</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'income' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('income'); handleCancel(); }}
                >
                    📥 수입
                </button>
                <button
                    className={`tab ${activeTab === 'expense' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('expense'); handleCancel(); }}
                >
                    📤 지출
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-title">
                    {editingId ? '✏️ 거래 수정' : (activeTab === 'income' ? '📥 수입 등록' : '📤 지출 등록')}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">날짜</label>
                            <input
                                type="date"
                                name="date"
                                className="form-input"
                                value={form.date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">카테고리</label>
                            <select
                                name="category"
                                className="form-select"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="">선택하세요</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">멤버 (선택)</label>
                            <select
                                name="memberId"
                                className="form-select"
                                value={form.memberId}
                                onChange={handleMemberSelect}
                            >
                                <option value="">선택 안함</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">금액</label>
                            <input
                                type="number"
                                name="amount"
                                className="form-input"
                                placeholder="금액을 입력하세요"
                                value={form.amount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">내용</label>
                        <input
                            type="text"
                            name="description"
                            className="form-input"
                            placeholder="내용을 입력하세요"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="btn-group">
                        <button type="submit" className={`btn ${activeTab === 'income' ? 'btn-success' : 'btn-danger'}`}>
                            {editingId ? '수정 완료' : '등록'}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-outline" onClick={handleCancel}>
                                취소
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card-title">
                    {activeTab === 'income' ? '📥 수입 내역' : '📤 지출 내역'}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 'auto' }}>
                        총 {filteredTransactions.length}건
                    </span>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>등록된 {activeTab === 'income' ? '수입' : '지출'} 내역이 없습니다</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>카테고리</th>
                                    <th>내용</th>
                                    <th style={{ textAlign: 'right' }}>금액</th>
                                    <th style={{ textAlign: 'center' }}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.date}</td>
                                        <td>{t.category}</td>
                                        <td>{t.description}</td>
                                        <td style={{ textAlign: 'right' }}
                                            className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                                            {formatAmount(t.amount)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="btn-group" style={{ justifyContent: 'center' }}>
                                                {deletingId === t.id ? (
                                                    <>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                                                            삭제확인
                                                        </button>
                                                        <button className="btn btn-outline btn-sm" onClick={() => setDeletingId(null)}>
                                                            취소
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(t)}>
                                                            수정
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => setDeletingId(t.id)}>
                                                            삭제
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
