import React, { useEffect, useState } from 'react';
import accountService from '../../services/accountService';
import { useNavigate } from 'react-router-dom';

const genderOptions = [
  { value: '', label: 'Chọn giới tính' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const ProfileForm = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await accountService.getProfile();
        setProfile(res.data);
        setForm({
          ...res.data,
          info: res.data.info || {}
        });
      } catch (err) {
        setError('Không thể tải thông tin tài khoản.');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      info: { ...prev.info, [name]: value }
    }));
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setForm(profile);
    setEditMode(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { info: form.info };
      const res = await accountService.updateProfile(payload);
      setProfile(res.data);
      setForm({
        ...res.data,
        info: res.data.info || {}
      });
      setEditMode(false);
      setFormErrors({});
    } catch (err) {
      const msg = err.message || 'Cập nhật thất bại.';
      if (msg.includes('Số điện thoại')) {
        setFormErrors({ phone: msg });
      } else if (msg.includes('16 tuổi')) {
        setFormErrors({ birthday: msg });
      } else {
        setFormErrors({ general: msg });
      }
    }
    setSaving(false);
  };

  const handleChangePassword = () => {
    navigate('/auth/change-password');
  };

  if (loading) return <div>Đang tải thông tin...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <form className="max-w-4xl mx-auto bg-white p-6 rounded shadow" onSubmit={handleSave}>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Thông tin cá nhân</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email || ''}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Họ tên</label>
          <input
            type="text"
            name="fullName"
            value={form.info.fullName || ''}
            onChange={handleInfoChange}
            disabled={!editMode}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={form.info.phone || ''}
            onChange={handleInfoChange}
            disabled={!editMode}
            className="w-full border rounded px-3 py-2"
          />
          {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={form.info.address || ''}
            onChange={handleInfoChange}
            disabled={!editMode}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Giới tính</label>
          <select
            name="gender"
            value={form.info.gender || ''}
            onChange={handleInfoChange}
            disabled={!editMode}
            className="w-full border rounded px-3 py-2"
          >
            {genderOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Ngày sinh</label>
          <input
            type="date"
            name="birthday"
            value={form.info.birthday?.slice(0, 10) || ''}
            onChange={handleInfoChange}
            disabled={!editMode}
            className="w-full border rounded px-3 py-2"
          />
          {formErrors.birthday && <p className="text-red-500 text-sm mt-1">{formErrors.birthday}</p>}
        </div>
      </div>

      {formErrors.general && <p className="text-red-500 text-sm mt-4">{formErrors.general}</p>}

      <div className="flex gap-3 mt-8 justify-end">
        <button
          type="button"
          onClick={handleChangePassword}
          className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600"
        >
          Đổi mật khẩu
        </button>
        {!editMode ? (
          <button
            type="button"
            onClick={handleEdit}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Chỉnh sửa
          </button>
        ) : (
          <>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
            >
              Hủy
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;
