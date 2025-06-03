import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const RegisterForm = ({ onSubmit, isLoading }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName) newErrors.fullName = "Tên đầy đủ không được để trống";
    if (!email) newErrors.email = "Email không được để trống";
    if (!password) newErrors.password = "Mật khẩu không được để trống";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ fullName, email, password, confirmPassword });
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Input
        label="Tên đầy đủ"
        type="text"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        placeholder="Nhập tên đầy đủ"
        disabled={isLoading}
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="Nhập email"
        disabled={isLoading}
      />
      <Input
        label="Mật khẩu"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="Nhập mật khẩu"
        disabled={isLoading}
      />
      <Input
        label="Xác nhận mật khẩu"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="Nhập lại mật khẩu"
        disabled={isLoading}
      />
      <div className="mt-4">
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Đăng ký
        </Button>
      </div>
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-blue-600 text-sm hover:underline">
          Đã có tài khoản? Đăng nhập
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;
