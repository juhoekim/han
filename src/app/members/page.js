'use client';

import { useState, useEffect } from 'react';

export default function MembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({ name: '', role: '성도' });

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        try {
            const res = await fetch('/api/members');
            const data = await res.json();
            setMembers(data.members || []);
        } catch (error) {
            console.error('Members load error:', error);
        } finally {
            setLoading(false);
        }
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    function openModal(member = null) {
        if (member) {
            setEditingMember(member);
            setForm({ name: member.name, role: member.role });
        } else {
            setEditingMember(null);
            setForm({ name: '', role: '성도' });
        }
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingMember(null);
        setForm({ name: '', role: '성도' });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast('❌ 이름을 입력해주세요');
            return;
        }

        try {
            if (editingMember) {
                await fetch('/api/members', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingMember.id, ...form }),
                });
                showToast('✅ 멤버가 수정되었습니다');
            } else {
                await fetch('/api/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                showToast('✅ 멤버가 추가되었습니다');
            }
            closeModal();
            loadMembers();
        } catch (error) {
            showToast('❌ 오류가 발생했습니다');
        }
    }

    async function handleDelete(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
            showToast('🗑️ 멤버가 삭제되었습니다');
            loadMembers();
        } catch (error) {
            showToast('❌ 삭제 중 오류가 발생했습니다');
        }
    }

    const roles = ['성도', '집사', '권사', '장로', '목사', '전도사', '기타'];

    if (loading) return <div className="loading">불러오는 중...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">멤버 관리</h1>
                <p className="page-subtitle">모임 인원 명단을 관리합니다</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    ➕ 멤버 추가
                </button>
                <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    총 {members.length}명
                </span>
            </div>

            {members.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <p>등록된 멤버가 없습니다</p>
                    </div>
                </div>
            ) : (
                <div className="members-grid">
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-avatar">
                                {member.name.charAt(0)}
                            </div>
                            <div className="member-info">
                                <div className="member-name">{member.name}</div>
                                <div className="member-role">{member.role}</div>
                            </div>
                            <div className="member-actions">
                                <button className="btn btn-outline btn-sm" onClick={() => openModal(member)}>
                                    수정
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(member.id)}>
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingMember ? '멤버 수정' : '새 멤버 추가'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">이름</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="이름을 입력하세요"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">직분</label>
                                <select
                                    className="form-select"
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                >
                                    {roles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>
                                    취소
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingMember ? '수정' : '추가'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
