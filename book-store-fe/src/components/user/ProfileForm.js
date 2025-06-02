import React, { useState, useEffect } from "react";
import styles from "./ProfileForm.module.css";
import Input from "../common/Input";
import Button from "../common/Button";

const ProfileForm = ({ userData = {}, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({ ...formData, ...userData });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  return (
    <form className={styles.profileForm} onSubmit={handleSubmit}>
      <Input
        label="Họ và tên"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        readOnly
      />
      <Input
        label="Số điện thoại"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Input
        label="Ngày sinh"
        name="birthDate"
        type="date"
        value={formData.birthDate}
        onChange={handleChange}
      />
      <Button type="submit">Lưu thay đổi</Button>
    </form>
  );
};

export default ProfileForm;
