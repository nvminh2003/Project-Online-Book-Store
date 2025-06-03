import React, { useState, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const AddressForm = ({ initialData = {}, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    address: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  return (
    <form className="flex flex-col gap-4 max-w-md" onSubmit={handleSubmit}>
      <Input
        label="Họ và tên"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
      />
      <Input
        label="Số điện thoại"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <Input
        label="Tỉnh/Thành"
        name="province"
        value={formData.province}
        onChange={handleChange}
        required
      />
      <Input
        label="Quận/Huyện"
        name="district"
        value={formData.district}
        onChange={handleChange}
        required
      />
      <Input
        label="Phường/Xã"
        name="ward"
        value={formData.ward}
        onChange={handleChange}
        required
      />
      <Input
        label="Địa chỉ cụ thể"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
      />
      <Button type="submit">Lưu địa chỉ</Button>
    </form>
  );
};

export default AddressForm;
