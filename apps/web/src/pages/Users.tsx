import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserResponse, UserRole } from '@superbom/shared';
import {
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Loader2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modais e Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CAIXA);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<UserResponse[]>('/users');
      setUsers(res.data);
    } catch (e) {
      setError('Erro ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole(UserRole.CAIXA);
    setPassword('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (userToEdit: UserResponse) => {
    setEditingUser(userToEdit);
    setName(userToEdit.name);
    setEmail(userToEdit.email);
    setRole(userToEdit.role as UserRole);
    setPassword(''); // deixa em branco por padrão
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = { name, email, role };
      if (password) payload.password = password;

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        if (!password) {
          setError('A senha é obrigatória para novos usuários.');
          setSubmitting(false);
          return;
        }
        await api.post('/users', payload);
        setSuccess('Usuário criado com sucesso!');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${id}`);
      setSuccess('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir usuário.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Carregando lista de colaboradores...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      
      {/* Alertas */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl text-center">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Módulo do Administrador</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
            <UserCheck size={22} className="text-indigo-400" />
            Colaboradores
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20"
        >
          <UserPlus size={14} />
          Cadastrar Colaborador
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <th className="px-6 py-3.5">Nome</th>
              <th className="px-6 py-3.5">E-mail</th>
              <th className="px-6 py-3.5">Role / Permissão</th>
              <th className="px-6 py-3.5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-950/20 transition">
                <td className="px-6 py-3.5 font-bold text-slate-200">{u.name}</td>
                <td className="px-6 py-3.5">{u.email}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                    u.role === 'ADMIN' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/30' :
                    u.role === 'GERENTE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/30' :
                    u.role === 'SUPERVISOR' ? 'bg-purple-950 text-purple-400 border border-purple-800/30' :
                    'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-center flex justify-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(u)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                    title="Editar colaborador"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Excluir colaborador"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-slate-100">
              {editingUser ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@superpao.local"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Role / Cargo</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none h-[34px]"
                >
                  <option value={UserRole.CAIXA}>Caixa (Operador)</option>
                  <option value={UserRole.SUPERVISOR}>Supervisor</option>
                  <option value={UserRole.GERENTE}>Gerente</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  Senha {editingUser && '(Deixe em branco para não alterar)'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-600">
                    <Lock size={12} />
                  </span>
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-2 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
