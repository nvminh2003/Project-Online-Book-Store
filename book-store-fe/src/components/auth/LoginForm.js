import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const LoginForm = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "Email không được để trống";
    if (!password) newErrors.password = "Mật khẩu không được để trống";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ email, password });
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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
      <div className="mt-4">
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Đăng nhập
        </Button>
      </div>
      <div className="mt-4 flex justify-between">
        <a
          href="/forgot-password"
          className="text-blue-600 text-sm hover:underline"
        >
          Quên mật khẩu?
        </a>
        <a
          href="/auth/register"
          className="text-blue-600 text-sm hover:underline"
        >
          Đăng ký tài khoản mới
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
