// Danh sách tỉnh/thành và quận/huyện Việt Nam (rút gọn mẫu, có thể mở rộng)
// Cấu trúc: [{ code, name, districts: [{ code, name }] }]
const vietnamProvinces = [
  {
    code: "01",
    name: "Thành phố Hà Nội",
    districts: [
      { code: "001", name: "Quận Ba Đình" },
      { code: "002", name: "Quận Hoàn Kiếm" },
      { code: "003", name: "Quận Tây Hồ" },
      // ... thêm các quận/huyện khác
    ],
  },
  {
    code: "79",
    name: "Thành phố Hồ Chí Minh",
    districts: [
      { code: "760", name: "Quận 1" },
      { code: "761", name: "Quận 12" },
      { code: "764", name: "Quận Gò Vấp" },
      // ... thêm các quận/huyện khác
    ],
  },
  // ... thêm các tỉnh/thành khác
];

export default vietnamProvinces;
