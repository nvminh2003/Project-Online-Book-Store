import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";

// Danh sách thành phố/tỉnh
const cities = [
  { value: "01", label: "Thành phố Hà Nội" },
  { value: "02", label: "Tỉnh Hà Giang" },
  { value: "04", label: "Tỉnh Cao Bằng" },
  { value: "06", label: "Tỉnh Bắc Kạn" },
  { value: "08", label: "Tỉnh Tuyên Quang" },
  { value: "10", label: "Tỉnh Lào Cai" },
  { value: "11", label: "Tỉnh Điện Biên" },
  { value: "12", label: "Tỉnh Lai Châu" },
  { value: "14", label: "Tỉnh Sơn La" },
  { value: "15", label: "Tỉnh Yên Bái" },
  { value: "17", label: "Tỉnh Hòa Bình" },
  { value: "19", label: "Tỉnh Thái Nguyên" },
  { value: "20", label: "Tỉnh Lạng Sơn" },
  { value: "22", label: "Tỉnh Quảng Ninh" },
  { value: "24", label: "Tỉnh Bắc Giang" },
  { value: "25", label: "Tỉnh Phú Thọ" },
  { value: "26", label: "Tỉnh Vĩnh Phúc" },
  { value: "27", label: "Tỉnh Bắc Ninh" },
  { value: "30", label: "Tỉnh Hải Dương" },
  { value: "31", label: "Thành phố Hải Phòng" },
  { value: "33", label: "Tỉnh Hưng Yên" },
  { value: "34", label: "Tỉnh Thái Bình" },
  { value: "35", label: "Tỉnh Hà Nam" },
  { value: "36", label: "Tỉnh Nam Định" },
  { value: "37", label: "Tỉnh Ninh Bình" },
  { value: "38", label: "Tỉnh Thanh Hóa" },
  { value: "40", label: "Tỉnh Nghệ An" },
  { value: "42", label: "Tỉnh Hà Tĩnh" },
  { value: "44", label: "Tỉnh Quảng Bình" },
  { value: "45", label: "Tỉnh Quảng Trị" },
  { value: "46", label: "Thành phố Huế" },
  { value: "48", label: "Thành phố Đà Nẵng" },
  { value: "49", label: "Tỉnh Quảng Nam" },
  { value: "51", label: "Tỉnh Quảng Ngãi" },
  { value: "52", label: "Tỉnh Bình Định" },
  { value: "54", label: "Tỉnh Phú Yên" },
  { value: "56", label: "Tỉnh Khánh Hòa" },
  { value: "58", label: "Tỉnh Ninh Thuận" },
  { value: "60", label: "Tỉnh Bình Thuận" },
  { value: "62", label: "Tỉnh Kon Tum" },
  { value: "64", label: "Tỉnh Gia Lai" },
  { value: "66", label: "Tỉnh Đắk Lắk" },
  { value: "67", label: "Tỉnh Đắk Nông" },
  { value: "68", label: "Tỉnh Lâm Đồng" },
  { value: "70", label: "Tỉnh Bình Phước" },
  { value: "72", label: "Tỉnh Tây Ninh" },
  { value: "74", label: "Tỉnh Bình Dương" },
  { value: "75", label: "Tỉnh Đồng Nai" },
  { value: "77", label: "Tỉnh Bà Rịa - Vũng Tàu" },
  { value: "79", label: "Thành phố Hồ Chí Minh" },
  { value: "80", label: "Tỉnh Long An" },
  { value: "82", label: "Tỉnh Tiền Giang" },
  { value: "83", label: "Tỉnh Bến Tre" },
  { value: "84", label: "Tỉnh Trà Vinh" },
  { value: "86", label: "Tỉnh Vĩnh Long" },
  { value: "87", label: "Tỉnh Đồng Tháp" },
  { value: "89", label: "Tỉnh An Giang" },
  { value: "91", label: "Tỉnh Kiên Giang" },
  { value: "92", label: "Thành phố Cần Thơ" },
  { value: "93", label: "Tỉnh Hậu Giang" },
  { value: "94", label: "Tỉnh Sóc Trăng" },
  { value: "95", label: "Tỉnh Bạc Liêu" },
  { value: "96", label: "Tỉnh Cà Mau" },
];

// Danh sách quận/huyện theo mã tỉnh/thành (giữ nguyên từ query của bạn)
const districts = {
  "01": [
    { value: "001", label: "Quận Ba Đình" },
    { value: "002", label: "Quận Hoàn Kiếm" },
    { value: "003", label: "Quận Tây Hồ" },
    { value: "004", label: "Quận Long Biên" },
    { value: "005", label: "Quận Cầu Giấy" },
    { value: "006", label: "Quận Đống Đa" },
    { value: "007", label: "Quận Hai Bà Trưng" },
    { value: "008", label: "Quận Hoàng Mai" },
    { value: "009", label: "Quận Thanh Xuân" },
    { value: "016", label: "Huyện Sóc Sơn" },
    { value: "017", label: "Huyện Đông Anh" },
    { value: "018", label: "Huyện Gia Lâm" },
    { value: "019", label: "Quận Nam Từ Liêm" },
    { value: "020", label: "Huyện Thanh Trì" },
    { value: "021", label: "Quận Bắc Từ Liêm" },
    { value: "250", label: "Huyện Mê Linh" },
    { value: "268", label: "Quận Hà Đông" },
    { value: "269", label: "Thị xã Sơn Tây" },
    { value: "271", label: "Huyện Ba Vì" },
    { value: "272", label: "Huyện Phúc Thọ" },
    { value: "273", label: "Huyện Đan Phượng" },
    { value: "274", label: "Huyện Hoài Đức" },
    { value: "275", label: "Huyện Quốc Oai" },
    { value: "276", label: "Huyện Thạch Thất" },
    { value: "277", label: "Huyện Chương Mỹ" },
    { value: "278", label: "Huyện Thanh Oai" },
    { value: "279", label: "Huyện Thường Tín" },
    { value: "280", label: "Huyện Phú Xuyên" },
    { value: "281", label: "Huyện Ứng Hòa" },
    { value: "282", label: "Huyện Mỹ Đức" },
  ],
  "02": [
    { value: "024", label: "Thành phố Hà Giang" },
    { value: "026", label: "Huyện Đồng Văn" },
    { value: "027", label: "Huyện Mèo Vạc" },
    { value: "028", label: "Huyện Yên Minh" },
    { value: "029", label: "Huyện Quản Bạ" },
    { value: "030", label: "Huyện Vị Xuyên" },
    { value: "031", label: "Huyện Bắc Mê" },
    { value: "032", label: "Huyện Hoàng Su Phì" },
    { value: "033", label: "Huyện Xín Mần" },
    { value: "034", label: "Huyện Bắc Quang" },
    { value: "035", label: "Huyện Quang Bình" },
  ],
  "04": [
    { value: "040", label: "Thành phố Cao Bằng" },
    { value: "042", label: "Huyện Bảo Lâm" },
    { value: "043", label: "Huyện Bảo Lạc" },
    { value: "045", label: "Huyện Hà Quảng" },
    { value: "047", label: "Huyện Trùng Khánh" },
    { value: "048", label: "Huyện Hạ Lang" },
    { value: "049", label: "Huyện Quảng Hòa" },
    { value: "051", label: "Huyện Hòa An" },
    { value: "052", label: "Huyện Nguyên Bình" },
    { value: "053", label: "Huyện Thạch An" },
  ],
  "06": [
    { value: "058", label: "Thành phố Bắc Kạn" },
    { value: "060", label: "Huyện Pác Nặm" },
    { value: "061", label: "Huyện Ba Bể" },
    { value: "062", label: "Huyện Ngân Sơn" },
    { value: "063", label: "Huyện Bạch Thông" },
    { value: "064", label: "Huyện Chợ Đồn" },
    { value: "065", label: "Huyện Chợ Mới" },
    { value: "066", label: "Huyện Na Rì" },
  ],
  "08": [
    { value: "070", label: "Thành phố Tuyên Quang" },
    { value: "071", label: "Huyện Lâm Bình" },
    { value: "072", label: "Huyện Na Hang" },
    { value: "073", label: "Huyện Chiêm Hóa" },
    { value: "074", label: "Huyện Hàm Yên" },
    { value: "075", label: "Huyện Yên Sơn" },
    { value: "076", label: "Huyện Sơn Dương" },
  ],
  10: [
    { value: "080", label: "Thành phố Lào Cai" },
    { value: "082", label: "Huyện Bát Xát" },
    { value: "083", label: "Huyện Mường Khương" },
    { value: "084", label: "Huyện Si Ma Cai" },
    { value: "085", label: "Huyện Bắc Hà" },
    { value: "086", label: "Huyện Bảo Thắng" },
    { value: "087", label: "Huyện Bảo Yên" },
    { value: "088", label: "Thị xã Sa Pa" },
    { value: "089", label: "Huyện Văn Bàn" },
  ],
  11: [
    { value: "094", label: "Thành phố Điện Biên Phủ" },
    { value: "095", label: "Thị xã Mường Lay" },
    { value: "096", label: "Huyện Mường Nhé" },
    { value: "097", label: "Huyện Mường Chà" },
    { value: "098", label: "Huyện Tủa Chùa" },
    { value: "099", label: "Huyện Tuần Giáo" },
    { value: "100", label: "Huyện Điện Biên" },
    { value: "101", label: "Huyện Điện Biên Đông" },
    { value: "102", label: "Huyện Mường Ảng" },
    { value: "103", label: "Huyện Nậm Pồ" },
  ],
  12: [
    { value: "105", label: "Thành phố Lai Châu" },
    { value: "106", label: "Huyện Tam Đường" },
    { value: "107", label: "Huyện Mường Tè" },
    { value: "108", label: "Huyện Sìn Hồ" },
    { value: "109", label: "Huyện Phong Thổ" },
    { value: "110", label: "Huyện Than Uyên" },
    { value: "111", label: "Huyện Tân Uyên" },
    { value: "112", label: "Huyện Nậm Nhùn" },
  ],
  14: [
    { value: "116", label: "Thành phố Sơn La" },
    { value: "118", label: "Huyện Quỳnh Nhai" },
    { value: "119", label: "Huyện Thuận Châu" },
    { value: "120", label: "Huyện Mường La" },
    { value: "121", label: "Huyện Bắc Yên" },
    { value: "122", label: "Huyện Phù Yên" },
    { value: "123", label: "Thị xã Mộc Châu" },
    { value: "124", label: "Huyện Yên Châu" },
    { value: "125", label: "Huyện Mai Sơn" },
    { value: "126", label: "Huyện Sông Mã" },
    { value: "127", label: "Huyện Sốp Cộp" },
    { value: "128", label: "Huyện Vân Hồ" },
  ],
  15: [
    { value: "132", label: "Thành phố Yên Bái" },
    { value: "133", label: "Thị xã Nghĩa Lộ" },
    { value: "135", label: "Huyện Lục Yên" },
    { value: "136", label: "Huyện Văn Yên" },
    { value: "137", label: "Huyện Mù Căng Chải" },
    { value: "138", label: "Huyện Trấn Yên" },
    { value: "139", label: "Huyện Trạm Tấu" },
    { value: "140", label: "Huyện Văn Chấn" },
    { value: "141", label: "Huyện Yên Bình" },
  ],
  17: [
    { value: "148", label: "Thành phố Hòa Bình" },
    { value: "150", label: "Huyện Đà Bắc" },
    { value: "152", label: "Huyện Lương Sơn" },
    { value: "153", label: "Huyện Kim Bôi" },
    { value: "154", label: "Huyện Cao Phong" },
    { value: "155", label: "Huyện Tân Lạc" },
    { value: "156", label: "Huyện Mai Châu" },
    { value: "157", label: "Huyện Lạc Sơn" },
    { value: "158", label: "Huyện Yên Thủy" },
    { value: "159", label: "Huyện Lạc Thủy" },
  ],
  19: [
    { value: "164", label: "Thành phố Thái Nguyên" },
    { value: "165", label: "Thành phố Sông Công" },
    { value: "167", label: "Huyện Định Hóa" },
    { value: "168", label: "Huyện Phú Lương" },
    { value: "169", label: "Huyện Đồng Hỷ" },
    { value: "170", label: "Huyện Võ Nhai" },
    { value: "171", label: "Huyện Đại Từ" },
    { value: "172", label: "Thành phố Phổ Yên" },
    { value: "173", label: "Huyện Phú Bình" },
  ],
  20: [
    { value: "178", label: "Thành phố Lạng Sơn" },
    { value: "180", label: "Huyện Tràng Định" },
    { value: "181", label: "Huyện Bình Gia" },
    { value: "182", label: "Huyện Văn Lãng" },
    { value: "183", label: "Huyện Cao Lộc" },
    { value: "184", label: "Huyện Văn Quan" },
    { value: "185", label: "Huyện Bắc Sơn" },
    { value: "186", label: "Huyện Hữu Lũng" },
    { value: "187", label: "Huyện Chi Lăng" },
    { value: "188", label: "Huyện Lộc Bình" },
    { value: "189", label: "Huyện Đình Lập" },
  ],
  22: [
    { value: "193", label: "Thành phố Hạ Long" },
    { value: "194", label: "Thành phố Móng Cái" },
    { value: "195", label: "Thành phố Cẩm Phả" },
    { value: "196", label: "Thành phố Uông Bí" },
    { value: "198", label: "Huyện Bình Liêu" },
    { value: "199", label: "Huyện Tiên Yên" },
    { value: "200", label: "Huyện Đầm Hà" },
    { value: "201", label: "Huyện Hải Hà" },
    { value: "202", label: "Huyện Ba Chẽ" },
    { value: "203", label: "Huyện Vân Đồn" },
    { value: "205", label: "Thành phố Đông Triều" },
    { value: "206", label: "Thị xã Quảng Yên" },
    { value: "207", label: "Huyện Cô Tô" },
  ],
  24: [
    { value: "213", label: "Thành phố Bắc Giang" },
    { value: "215", label: "Huyện Yên Thế" },
    { value: "216", label: "Huyện Tân Yên" },
    { value: "217", label: "Huyện Lạng Giang" },
    { value: "218", label: "Huyện Lục Nam" },
    { value: "219", label: "Huyện Lục Ngạn" },
    { value: "220", label: "Huyện Sơn Động" },
    { value: "222", label: "Thị xã Việt Yên" },
    { value: "223", label: "Huyện Hiệp Hòa" },
    { value: "224", label: "Thị xã Chũ" },
  ],
  25: [
    { value: "227", label: "Thành phố Việt Trì" },
    { value: "228", label: "Thị xã Phú Thọ" },
    { value: "230", label: "Huyện Đoan Hùng" },
    { value: "231", label: "Huyện Hạ Hòa" },
    { value: "232", label: "Huyện Thanh Ba" },
    { value: "233", label: "Huyện Phù Ninh" },
    { value: "234", label: "Huyện Yên Lập" },
    { value: "235", label: "Huyện Cẩm Khê" },
    { value: "236", label: "Huyện Tam Nông" },
    { value: "237", label: "Huyện Lâm Thao" },
    { value: "238", label: "Huyện Thanh Sơn" },
    { value: "239", label: "Huyện Thanh Thủy" },
    { value: "240", label: "Huyện Tân Sơn" },
  ],
  26: [
    { value: "243", label: "Thành phố Vĩnh Yên" },
    { value: "244", label: "Thành phố Phúc Yên" },
    { value: "246", label: "Huyện Lập Thạch" },
    { value: "247", label: "Huyện Tam Dương" },
    { value: "248", label: "Huyện Tam Đảo" },
    { value: "249", label: "Huyện Bình Xuyên" },
    { value: "251", label: "Huyện Yên Lạc" },
    { value: "252", label: "Huyện Vĩnh Tường" },
    { value: "253", label: "Huyện Sông Lô" },
  ],
  27: [
    { value: "256", label: "Thành phố Bắc Ninh" },
    { value: "258", label: "Huyện Yên Phong" },
    { value: "259", label: "Thị xã Quế Võ" },
    { value: "260", label: "Huyện Tiên Du" },
    { value: "261", label: "Thành phố Từ Sơn" },
    { value: "262", label: "Thị xã Thuận Thành" },
    { value: "263", label: "Huyện Gia Bình" },
    { value: "264", label: "Huyện Lương Tài" },
  ],
  30: [
    { value: "288", label: "Thành phố Hải Dương" },
    { value: "290", label: "Thành phố Chí Linh" },
    { value: "291", label: "Huyện Nam Sách" },
    { value: "292", label: "Thị xã Kinh Môn" },
    { value: "293", label: "Huyện Kim Thành" },
    { value: "294", label: "Huyện Thanh Hà" },
    { value: "295", label: "Huyện Cẩm Giàng" },
    { value: "296", label: "Huyện Bình Giang" },
    { value: "297", label: "Huyện Gia Lộc" },
    { value: "298", label: "Huyện Tứ Kỳ" },
    { value: "299", label: "Huyện Ninh Giang" },
    { value: "300", label: "Huyện Thanh Miện" },
  ],
  31: [
    { value: "303", label: "Quận Hồng Bàng" },
    { value: "304", label: "Quận Ngô Quyền" },
    { value: "305", label: "Quận Lê Chân" },
    { value: "306", label: "Quận Hải An" },
    { value: "307", label: "Quận Kiến An" },
    { value: "308", label: "Quận Đồ Sơn" },
    { value: "309", label: "Quận Dương Kinh" },
    { value: "311", label: "Thành phố Thủy Nguyên" },
    { value: "312", label: "Quận An Dương" },
    { value: "313", label: "Huyện An Lão" },
    { value: "314", label: "Huyện Kiến Thụy" },
    { value: "315", label: "Huyện Tiên Lãng" },
    { value: "316", label: "Huyện Vĩnh Bảo" },
    { value: "317", label: "Huyện Cát Hải" },
    { value: "318", label: "Huyện Bạch Long Vĩ" },
  ],
  33: [
    { value: "323", label: "Thành phố Hưng Yên" },
    { value: "325", label: "Huyện Văn Lâm" },
    { value: "326", label: "Huyện Văn Giang" },
    { value: "327", label: "Huyện Yên Mỹ" },
    { value: "328", label: "Thị xã Mỹ Hào" },
    { value: "329", label: "Huyện Ân Thi" },
    { value: "330", label: "Huyện Khoái Châu" },
    { value: "331", label: "Huyện Kim Động" },
    { value: "332", label: "Huyện Tiên Lữ" },
    { value: "333", label: "Huyện Phù Cừ" },
  ],
  34: [
    { value: "336", label: "Thành phố Thái Bình" },
    { value: "338", label: "Huyện Quỳnh Phụ" },
    { value: "339", label: "Huyện Hưng Hà" },
    { value: "340", label: "Huyện Đông Hưng" },
    { value: "341", label: "Huyện Thái Thụy" },
    { value: "342", label: "Huyện Tiền Hải" },
    { value: "343", label: "Huyện Kiến Xương" },
    { value: "344", label: "Huyện Vũ Thư" },
  ],
  35: [
    { value: "347", label: "Thành phố Phủ Lý" },
    { value: "349", label: "Thị xã Duy Tiên" },
    { value: "350", label: "Thị xã Kim Bảng" },
    { value: "351", label: "Huyện Thanh Liêm" },
    { value: "352", label: "Huyện Bình Lục" },
    { value: "353", label: "Huyện Lý Nhân" },
  ],
  36: [
    { value: "356", label: "Thành phố Nam Định" },
    { value: "359", label: "Huyện Vụ Bản" },
    { value: "360", label: "Huyện Ý Yên" },
    { value: "361", label: "Huyện Nghĩa Hưng" },
    { value: "362", label: "Huyện Nam Trực" },
    { value: "363", label: "Huyện Trực Ninh" },
    { value: "364", label: "Huyện Xuân Trường" },
    { value: "365", label: "Huyện Giao Thủy" },
    { value: "366", label: "Huyện Hải Hậu" },
  ],
  37: [
    { value: "370", label: "Thành phố Tam Điệp" },
    { value: "372", label: "Huyện Nho Quan" },
    { value: "373", label: "Huyện Gia Viễn" },
    { value: "374", label: "Thành phố Hoa Lư" },
    { value: "375", label: "Huyện Yên Khánh" },
    { value: "376", label: "Huyện Kim Sơn" },
    { value: "377", label: "Huyện Yên Mô" },
  ],
  38: [
    { value: "380", label: "Thành phố Thanh Hóa" },
    { value: "381", label: "Thị xã Bỉm Sơn" },
    { value: "382", label: "Thành phố Sầm Sơn" },
    { value: "384", label: "Huyện Mường Lát" },
    { value: "385", label: "Huyện Quan Hóa" },
    { value: "386", label: "Huyện Bá Thước" },
    { value: "387", label: "Huyện Quan Sơn" },
    { value: "388", label: "Huyện Lang Chánh" },
    { value: "389", label: "Huyện Ngọc Lặc" },
    { value: "390", label: "Huyện Cẩm Thủy" },
    { value: "391", label: "Huyện Thạch Thành" },
    { value: "392", label: "Huyện Hà Trung" },
    { value: "393", label: "Huyện Vĩnh Lộc" },
    { value: "394", label: "Huyện Yên Định" },
    { value: "395", label: "Huyện Thọ Xuân" },
    { value: "396", label: "Huyện Thường Xuân" },
    { value: "397", label: "Huyện Triệu Sơn" },
    { value: "398", label: "Huyện Thiệu Hóa" },
    { value: "399", label: "Huyện Hoằng Hóa" },
    { value: "400", label: "Huyện Hậu Lộc" },
    { value: "401", label: "Huyện Nga Sơn" },
    { value: "402", label: "Huyện Như Xuân" },
    { value: "403", label: "Huyện Như Thanh" },
    { value: "404", label: "Huyện Nông Cống" },
    { value: "406", label: "Huyện Quảng Xương" },
    { value: "407", label: "Thị xã Nghi Sơn" },
  ],
  40: [
    { value: "412", label: "Thành phố Vinh" },
    { value: "414", label: "Thị xã Thái Hòa" },
    { value: "415", label: "Huyện Quế Phong" },
    { value: "416", label: "Huyện Quỳ Châu" },
    { value: "417", label: "Huyện Kỳ Sơn" },
    { value: "418", label: "Huyện Tương Dương" },
    { value: "419", label: "Huyện Nghĩa Đàn" },
    { value: "420", label: "Huyện Quỳ Hợp" },
    { value: "421", label: "Huyện Quỳnh Lưu" },
    { value: "422", label: "Huyện Con Cuông" },
    { value: "423", label: "Huyện Tân Kỳ" },
    { value: "424", label: "Huyện Anh Sơn" },
    { value: "425", label: "Huyện Diễn Châu" },
    { value: "426", label: "Huyện Yên Thành" },
    { value: "427", label: "Huyện Đô Lương" },
    { value: "428", label: "Huyện Thanh Chương" },
    { value: "429", label: "Huyện Nghi Lộc" },
    { value: "430", label: "Huyện Nam Đàn" },
    { value: "431", label: "Huyện Hưng Nguyên" },
    { value: "432", label: "Thị xã Hoàng Mai" },
  ],
  42: [
    { value: "436", label: "Thành phố Hà Tĩnh" },
    { value: "437", label: "Thị xã Hồng Lĩnh" },
    { value: "439", label: "Huyện Hương Sơn" },
    { value: "440", label: "Huyện Đức Thọ" },
    { value: "441", label: "Huyện Vũ Quang" },
    { value: "442", label: "Huyện Nghi Xuân" },
    { value: "443", label: "Huyện Can Lộc" },
    { value: "444", label: "Huyện Hương Khê" },
    { value: "445", label: "Huyện Thạch Hà" },
    { value: "446", label: "Huyện Cẩm Xuyên" },
    { value: "447", label: "Huyện Kỳ Anh" },
    { value: "449", label: "Thị xã Kỳ Anh" },
  ],
  44: [
    { value: "450", label: "Thành phố Đồng Hới" },
    { value: "452", label: "Huyện Minh Hóa" },
    { value: "453", label: "Huyện Tuyên Hóa" },
    { value: "454", label: "Huyện Quảng Trạch" },
    { value: "455", label: "Huyện Bố Trạch" },
    { value: "456", label: "Huyện Quảng Ninh" },
    { value: "457", label: "Huyện Lệ Thủy" },
    { value: "458", label: "Thị xã Ba Đồn" },
  ],
  45: [
    { value: "461", label: "Thành phố Đông Hà" },
    { value: "462", label: "Thị xã Quảng Trị" },
    { value: "464", label: "Huyện Vĩnh Linh" },
    { value: "465", label: "Huyện Hướng Hóa" },
    { value: "466", label: "Huyện Gio Linh" },
    { value: "467", label: "Huyện Đa Krông" },
    { value: "468", label: "Huyện Cam Lộ" },
    { value: "469", label: "Huyện Triệu Phong" },
    { value: "470", label: "Huyện Hải Lăng" },
    { value: "471", label: "Huyện Cồn Cỏ" },
  ],
  46: [
    { value: "474", label: "Quận Thuận Hóa" },
    { value: "475", label: "Quận Phú Xuân" },
    { value: "476", label: "Thị xã Phong Điền" },
    { value: "477", label: "Huyện Quảng Điền" },
    { value: "478", label: "Huyện Phú Vang" },
    { value: "479", label: "Thị xã Hương Thủy" },
    { value: "480", label: "Thị xã Hương Trà" },
    { value: "481", label: "Huyện A Lưới" },
    { value: "482", label: "Huyện Phú Lộc" },
  ],
  48: [
    { value: "490", label: "Quận Liên Chiểu" },
    { value: "491", label: "Quận Thanh Khê" },
    { value: "492", label: "Quận Hải Châu" },
    { value: "493", label: "Quận Sơn Trà" },
    { value: "494", label: "Quận Ngũ Hành Sơn" },
    { value: "495", label: "Quận Cẩm Lệ" },
    { value: "497", label: "Huyện Hòa Vang" },
    { value: "498", label: "Huyện Hoàng Sa" },
  ],
  49: [
    { value: "502", label: "Thành phố Tam Kỳ" },
    { value: "503", label: "Thành phố Hội An" },
    { value: "504", label: "Huyện Tây Giang" },
    { value: "505", label: "Huyện Đông Giang" },
    { value: "506", label: "Huyện Đại Lộc" },
    { value: "507", label: "Thị xã Điện Bàn" },
    { value: "508", label: "Huyện Duy Xuyên" },
    { value: "509", label: "Huyện Quế Sơn" },
    { value: "510", label: "Huyện Nam Giang" },
    { value: "511", label: "Huyện Phước Sơn" },
    { value: "512", label: "Huyện Hiệp Đức" },
    { value: "513", label: "Huyện Thăng Bình" },
    { value: "514", label: "Huyện Tiên Phước" },
    { value: "515", label: "Huyện Bắc Trà My" },
    { value: "516", label: "Huyện Nam Trà My" },
    { value: "517", label: "Huyện Núi Thành" },
    { value: "518", label: "Huyện Phú Ninh" },
  ],
  51: [
    { value: "522", label: "Thành phố Quảng Ngãi" },
    { value: "524", label: "Huyện Bình Sơn" },
    { value: "525", label: "Huyện Trà Bồng" },
    { value: "527", label: "Huyện Sơn Tịnh" },
    { value: "528", label: "Huyện Tư Nghĩa" },
    { value: "529", label: "Huyện Sơn Hà" },
    { value: "530", label: "Huyện Sơn Tây" },
    { value: "531", label: "Huyện Minh Long" },
    { value: "532", label: "Huyện Nghĩa Hành" },
    { value: "533", label: "Huyện Mộ Đức" },
    { value: "534", label: "Thị xã Đức Phổ" },
    { value: "535", label: "Huyện Ba Tơ" },
    { value: "536", label: "Huyện Lý Sơn" },
  ],
  52: [
    { value: "540", label: "Thành phố Quy Nhơn" },
    { value: "542", label: "Huyện An Lão" },
    { value: "543", label: "Thị xã Hoài Nhơn" },
    { value: "544", label: "Huyện Hoài Ân" },
    { value: "545", label: "Huyện Phù Mỹ" },
    { value: "546", label: "Huyện Vĩnh Thạnh" },
    { value: "547", label: "Huyện Tây Sơn" },
    { value: "548", label: "Huyện Phù Cát" },
    { value: "549", label: "Thị xã An Nhơn" },
    { value: "550", label: "Huyện Tuy Phước" },
    { value: "551", label: "Huyện Vân Canh" },
  ],
  54: [
    { value: "555", label: "Thành phố Tuy Hòa" },
    { value: "557", label: "Thị xã Sông Cầu" },
    { value: "558", label: "Huyện Đồng Xuân" },
    { value: "559", label: "Huyện Tuy An" },
    { value: "560", label: "Huyện Sơn Hòa" },
    { value: "561", label: "Huyện Sông Hinh" },
    { value: "562", label: "Huyện Tây Hòa" },
    { value: "563", label: "Huyện Phú Hòa" },
    { value: "564", label: "Thị xã Đông Hòa" },
  ],
  56: [
    { value: "568", label: "Thành phố Nha Trang" },
    { value: "569", label: "Thành phố Cam Ranh" },
    { value: "570", label: "Huyện Cam Lâm" },
    { value: "571", label: "Huyện Vạn Ninh" },
    { value: "572", label: "Thị xã Ninh Hòa" },
    { value: "573", label: "Huyện Khánh Vĩnh" },
    { value: "574", label: "Huyện Diên Khánh" },
    { value: "575", label: "Huyện Khánh Sơn" },
    { value: "576", label: "Huyện Trường Sa" },
  ],
  58: [
    { value: "582", label: "Thành phố Phan Rang-Tháp Chàm" },
    { value: "584", label: "Huyện Bác Ái" },
    { value: "585", label: "Huyện Ninh Sơn" },
    { value: "586", label: "Huyện Ninh Hải" },
    { value: "587", label: "Huyện Ninh Phước" },
    { value: "588", label: "Huyện Thuận Bắc" },
    { value: "589", label: "Huyện Thuận Nam" },
  ],
  60: [
    { value: "593", label: "Thành phố Phan Thiết" },
    { value: "594", label: "Thị xã La Gi" },
    { value: "595", label: "Huyện Tuy Phong" },
    { value: "596", label: "Huyện Bắc Bình" },
    { value: "597", label: "Huyện Hàm Thuận Bắc" },
    { value: "598", label: "Huyện Hàm Thuận Nam" },
    { value: "599", label: "Huyện Tánh Linh" },
    { value: "600", label: "Huyện Đức Linh" },
    { value: "601", label: "Huyện Hàm Tân" },
    { value: "602", label: "Huyện Phú Quý" },
  ],
  62: [
    { value: "608", label: "Thành phố Kon Tum" },
    { value: "610", label: "Huyện Đắk Glei" },
    { value: "611", label: "Huyện Ngọc Hồi" },
    { value: "612", label: "Huyện Đắk Tô" },
    { value: "613", label: "Huyện Kon Plông" },
    { value: "614", label: "Huyện Kon Rẫy" },
    { value: "615", label: "Huyện Đắk Hà" },
    { value: "616", label: "Huyện Sa Thầy" },
    { value: "617", label: "Huyện Tu Mơ Rông" },
    { value: "618", label: "Huyện Ia H' Drai" },
  ],
  64: [
    { value: "622", label: "Thành phố Pleiku" },
    { value: "623", label: "Thị xã An Khê" },
    { value: "624", label: "Thị xã Ayun Pa" },
    { value: "625", label: "Huyện KBang" },
    { value: "626", label: "Huyện Đăk Đoa" },
    { value: "627", label: "Huyện Chư Păh" },
    { value: "628", label: "Huyện Ia Grai" },
    { value: "629", label: "Huyện Mang Yang" },
    { value: "630", label: "Huyện Kông Chro" },
    { value: "631", label: "Huyện Đức Cơ" },
    { value: "632", label: "Huyện Chư Prông" },
    { value: "633", label: "Huyện Chư Sê" },
    { value: "634", label: "Huyện Đăk Pơ" },
    { value: "635", label: "Huyện Ia Pa" },
    { value: "637", label: "Huyện Krông Pa" },
    { value: "638", label: "Huyện Phú Thiện" },
    { value: "639", label: "Huyện Chư Pưh" },
  ],
  66: [
    { value: "643", label: "Thành phố Buôn Ma Thuột" },
    { value: "644", label: "Thị xã Buôn Hồ" },
    { value: "645", label: "Huyện Ea H'leo" },
    { value: "646", label: "Huyện Ea Súp" },
    { value: "647", label: "Huyện Buôn Đôn" },
    { value: "648", label: "Huyện Cư M'gar" },
    { value: "649", label: "Huyện Krông Búk" },
    { value: "650", label: "Huyện Krông Năng" },
    { value: "651", label: "Huyện Ea Kar" },
    { value: "652", label: "Huyện M'Đrắk" },
    { value: "653", label: "Huyện Krông Bông" },
    { value: "654", label: "Huyện Krông Pắc" },
    { value: "655", label: "Huyện Krông A Na" },
    { value: "656", label: "Huyện Lắk" },
    { value: "657", label: "Huyện Cư Kuin" },
  ],
  67: [
    { value: "660", label: "Thành phố Gia Nghĩa" },
    { value: "661", label: "Huyện Đăk Glong" },
    { value: "662", label: "Huyện Cư Jút" },
    { value: "663", label: "Huyện Đắk Mil" },
    { value: "664", label: "Huyện Krông Nô" },
    { value: "665", label: "Huyện Đắk Song" },
    { value: "666", label: "Huyện Đắk R'Lấp" },
    { value: "667", label: "Huyện Tuy Đức" },
  ],
  68: [
    { value: "672", label: "Thành phố Đà Lạt" },
    { value: "673", label: "Thành phố Bảo Lộc" },
    { value: "674", label: "Huyện Đam Rông" },
    { value: "675", label: "Huyện Lạc Dương" },
    { value: "676", label: "Huyện Lâm Hà" },
    { value: "677", label: "Huyện Đơn Dương" },
    { value: "678", label: "Huyện Đức Trọng" },
    { value: "679", label: "Huyện Di Linh" },
    { value: "680", label: "Huyện Bảo Lâm" },
    { value: "682", label: "Huyện Đạ Huoai" },
  ],
  70: [
    { value: "688", label: "Thị xã Phước Long" },
    { value: "689", label: "Thành phố Đồng Xoài" },
    { value: "690", label: "Thị xã Bình Long" },
    { value: "691", label: "Huyện Bù Gia Mập" },
    { value: "692", label: "Huyện Lộc Ninh" },
    { value: "693", label: "Huyện Bù Đốp" },
    { value: "694", label: "Huyện Hớn Quản" },
    { value: "695", label: "Huyện Đồng Phú" },
    { value: "696", label: "Huyện Bù Đăng" },
    { value: "697", label: "Thị xã Chơn Thành" },
    { value: "698", label: "Huyện Phú Riềng" },
  ],
  72: [
    { value: "703", label: "Thành phố Tây Ninh" },
    { value: "705", label: "Huyện Tân Biên" },
    { value: "706", label: "Huyện Tân Châu" },
    { value: "707", label: "Huyện Dương Minh Châu" },
    { value: "708", label: "Huyện Châu Thành" },
    { value: "709", label: "Thị xã Hòa Thành" },
    { value: "710", label: "Huyện Gò Dầu" },
    { value: "711", label: "Huyện Bến Cầu" },
    { value: "712", label: "Thị xã Trảng Bàng" },
  ],
  74: [
    { value: "718", label: "Thành phố Thủ Dầu Một" },
    { value: "719", label: "Huyện Bàu Bàng" },
    { value: "720", label: "Huyện Dầu Tiếng" },
    { value: "721", label: "Thành phố Bến Cát" },
    { value: "722", label: "Huyện Phú Giáo" },
    { value: "723", label: "Thành phố Tân Uyên" },
    { value: "724", label: "Thành phố Dĩ An" },
    { value: "725", label: "Thành phố Thuận An" },
    { value: "726", label: "Huyện Bắc Tân Uyên" },
  ],
  75: [
    { value: "731", label: "Thành phố Biên Hòa" },
    { value: "732", label: "Thành phố Long Khánh" },
    { value: "734", label: "Huyện Tân Phú" },
    { value: "735", label: "Huyện Vĩnh Cửu" },
    { value: "736", label: "Huyện Định Quán" },
    { value: "737", label: "Huyện Trảng Bom" },
    { value: "738", label: "Huyện Thống Nhất" },
    { value: "739", label: "Huyện Cẩm Mỹ" },
    { value: "740", label: "Huyện Long Thành" },
    { value: "741", label: "Huyện Xuân Lộc" },
    { value: "742", label: "Huyện Nhơn Trạch" },
  ],
  77: [
    { value: "747", label: "Thành phố Vũng Tàu" },
    { value: "748", label: "Thành phố Bà Rịa" },
    { value: "750", label: "Huyện Châu Đức" },
    { value: "751", label: "Huyện Xuyên Mộc" },
    { value: "753", label: "Huyện Long Đất" },
    { value: "754", label: "Thành phố Phú Mỹ" },
    { value: "755", label: "Huyện Côn Đảo" },
  ],
  79: [
    { value: "760", label: "Quận 1" },
    { value: "761", label: "Quận 12" },
    { value: "764", label: "Quận Gò Vấp" },
    { value: "765", label: "Quận Bình Thạnh" },
    { value: "766", label: "Quận Tân Bình" },
    { value: "767", label: "Quận Tân Phú" },
    { value: "768", label: "Quận Phú Nhuận" },
    { value: "769", label: "Thành phố Thủ Đức" },
    { value: "770", label: "Quận 3" },
    { value: "771", label: "Quận 10" },
    { value: "772", label: "Quận 11" },
    { value: "773", label: "Quận 4" },
    { value: "774", label: "Quận 5" },
    { value: "775", label: "Quận 6" },
    { value: "776", label: "Quận 8" },
    { value: "777", label: "Quận Bình Tân" },
    { value: "778", label: "Quận 7" },
    { value: "783", label: "Huyện Củ Chi" },
    { value: "784", label: "Huyện Hóc Môn" },
    { value: "785", label: "Huyện Bình Chánh" },
    { value: "786", label: "Huyện Nhà Bè" },
    { value: "787", label: "Huyện Cần Giờ" },
  ],
  80: [
    { value: "794", label: "Thành phố Tân An" },
    { value: "795", label: "Thị xã Kiến Tường" },
    { value: "796", label: "Huyện Tân Hưng" },
    { value: "797", label: "Huyện Vĩnh Hưng" },
    { value: "798", label: "Huyện Mộc Hóa" },
    { value: "799", label: "Huyện Tân Thạnh" },
    { value: "800", label: "Huyện Thạnh Hóa" },
    { value: "801", label: "Huyện Đức Huệ" },
    { value: "802", label: "Huyện Đức Hòa" },
    { value: "803", label: "Huyện Bến Lức" },
    { value: "804", label: "Huyện Thủ Thừa" },
    { value: "805", label: "Huyện Tân Trụ" },
    { value: "806", label: "Huyện Cần Đước" },
    { value: "807", label: "Huyện Cần Giuộc" },
    { value: "808", label: "Huyện Châu Thành" },
  ],
  82: [
    { value: "815", label: "Thành phố Mỹ Tho" },
    { value: "816", label: "Thành phố Gò Công" },
    { value: "817", label: "Thị xã Cai Lậy" },
    { value: "818", label: "Huyện Tân Phước" },
    { value: "819", label: "Huyện Cái Bè" },
    { value: "820", label: "Huyện Cai Lậy" },
    { value: "821", label: "Huyện Châu Thành" },
    { value: "822", label: "Huyện Chợ Gạo" },
    { value: "823", label: "Huyện Gò Công Tây" },
    { value: "824", label: "Huyện Gò Công Đông" },
    { value: "825", label: "Huyện Tân Phú Đông" },
  ],
  83: [
    { value: "829", label: "Thành phố Bến Tre" },
    { value: "831", label: "Huyện Châu Thành" },
    { value: "832", label: "Huyện Chợ Lách" },
    { value: "833", label: "Huyện Mỏ Cày Nam" },
    { value: "834", label: "Huyện Giồng Trôm" },
    { value: "835", label: "Huyện Bình Đại" },
    { value: "836", label: "Huyện Ba Tri" },
    { value: "837", label: "Huyện Thạnh Phú" },
    { value: "838", label: "Huyện Mỏ Cày Bắc" },
  ],
  84: [
    { value: "842", label: "Thành phố Trà Vinh" },
    { value: "844", label: "Huyện Càng Long" },
    { value: "845", label: "Huyện Cầu Kè" },
    { value: "846", label: "Huyện Tiểu Cần" },
    { value: "847", label: "Huyện Châu Thành" },
    { value: "848", label: "Huyện Cầu Ngang" },
    { value: "849", label: "Huyện Trà Cú" },
    { value: "850", label: "Huyện Duyên Hải" },
    { value: "851", label: "Thị xã Duyên Hải" },
  ],
  86: [
    { value: "855", label: "Thành phố Vĩnh Long" },
    { value: "857", label: "Huyện Long Hồ" },
    { value: "858", label: "Huyện Mang Thít" },
    { value: "859", label: "Huyện Vũng Liêm" },
    { value: "860", label: "Huyện Tam Bình" },
    { value: "861", label: "Thị xã Bình Minh" },
    { value: "862", label: "Huyện Trà Ôn" },
    { value: "863", label: "Huyện Bình Tân" },
  ],
  87: [
    { value: "866", label: "Thành phố Cao Lãnh" },
    { value: "867", label: "Thành phố Sa Đéc" },
    { value: "868", label: "Thành phố Hồng Ngự" },
    { value: "869", label: "Huyện Tân Hồng" },
    { value: "870", label: "Huyện Hồng Ngự" },
    { value: "871", label: "Huyện Tam Nông" },
    { value: "872", label: "Huyện Tháp Mười" },
    { value: "873", label: "Huyện Cao Lãnh" },
    { value: "874", label: "Huyện Thanh Bình" },
    { value: "875", label: "Huyện Lấp Vò" },
    { value: "876", label: "Huyện Lai Vung" },
    { value: "877", label: "Huyện Châu Thành" },
  ],
  89: [
    { value: "883", label: "Thành phố Long Xuyên" },
    { value: "884", label: "Thành phố Châu Đốc" },
    { value: "886", label: "Huyện An Phú" },
    { value: "887", label: "Thị xã Tân Châu" },
    { value: "888", label: "Huyện Phú Tân" },
    { value: "889", label: "Huyện Châu Phú" },
    { value: "890", label: "Thị xã Tịnh Biên" },
    { value: "891", label: "Huyện Tri Tôn" },
    { value: "892", label: "Huyện Châu Thành" },
    { value: "893", label: "Huyện Chợ Mới" },
    { value: "894", label: "Huyện Thoại Sơn" },
  ],
  91: [
    { value: "899", label: "Thành phố Rạch Giá" },
    { value: "900", label: "Thành phố Hà Tiên" },
    { value: "902", label: "Huyện Kiên Lương" },
    { value: "903", label: "Huyện Hòn Đất" },
    { value: "904", label: "Huyện Tân Hiệp" },
    { value: "905", label: "Huyện Châu Thành" },
    { value: "906", label: "Huyện Giồng Riềng" },
    { value: "907", label: "Huyện Gò Quao" },
    { value: "908", label: "Huyện An Biên" },
    { value: "909", label: "Huyện An Minh" },
    { value: "910", label: "Huyện Vĩnh Thuận" },
    { value: "911", label: "Thành phố Phú Quốc" },
    { value: "912", label: "Huyện Kiên Hải" },
    { value: "913", label: "Huyện U Minh Thượng" },
    { value: "914", label: "Huyện Giang Thành" },
  ],
  92: [
    { value: "916", label: "Quận Ninh Kiều" },
    { value: "917", label: "Quận Ô Môn" },
    { value: "918", label: "Quận Bình Thủy" },
    { value: "919", label: "Quận Cái Răng" },
    { value: "923", label: "Quận Thốt Nốt" },
    { value: "924", label: "Huyện Vĩnh Thạnh" },
    { value: "925", label: "Huyện Cờ Đỏ" },
    { value: "926", label: "Huyện Phong Điền" },
    { value: "927", label: "Huyện Thới Lai" },
  ],
  93: [
    { value: "930", label: "Thành phố Vị Thanh" },
    { value: "931", label: "Thành phố Ngã Bảy" },
    { value: "932", label: "Huyện Châu Thành A" },
    { value: "933", label: "Huyện Châu Thành" },
    { value: "934", label: "Huyện Phụng Hiệp" },
    { value: "935", label: "Huyện Vị Thủy" },
    { value: "936", label: "Huyện Long Mỹ" },
    { value: "937", label: "Thị xã Long Mỹ" },
  ],
  94: [
    { value: "941", label: "Thành phố Sóc Trăng" },
    { value: "942", label: "Huyện Châu Thành" },
    { value: "943", label: "Huyện Kế Sách" },
    { value: "944", label: "Huyện Mỹ Tú" },
    { value: "945", label: "Huyện Cù Lao Dung" },
    { value: "946", label: "Huyện Long Phú" },
    { value: "947", label: "Huyện Mỹ Xuyên" },
    { value: "948", label: "Thị xã Ngã Năm" },
    { value: "949", label: "Huyện Thạnh Trị" },
    { value: "950", label: "Thị xã Vĩnh Châu" },
    { disapproval: "951", label: "Huyện Trần Đề" },
  ],
  95: [
    { value: "954", label: "Thành phố Bạc Liêu" },
    { value: "956", label: "Huyện Hồng Dân" },
    { value: "957", label: "Huyện Phước Long" },
    { value: "958", label: "Huyện Vĩnh Lợi" },
    { value: "959", label: "Thị xã Giá Rai" },
    { value: "960", label: "Huyện Đông Hải" },
    { value: "961", label: "Huyện Hòa Bình" },
  ],
  96: [
    { value: "964", label: "Thành phố Cà Mau" },
    { value: "966", label: "Huyện U Minh" },
    { value: "967", label: "Huyện Thới Bình" },
    { value: "968", label: "Huyện Trần Văn Thời" },
    { value: "969", label: "Huyện Cái Nước" },
    { value: "970", label: "Huyện Đầm Dơi" },
    { value: "971", label: "Huyện Năm Căn" },
    { value: "972", label: "Huyện Phú Tân" },
    { value: "973", label: "Huyện Ngọc Hiển" },
  ],
};

const ShippingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const existingShippingInfo = location.state?.shippingInfo;

  const [formData, setFormData] = useState({
    fullName: existingShippingInfo?.fullName || "",
    phone: existingShippingInfo?.phone || "",
    houseName: existingShippingInfo?.houseName || "",
    city: existingShippingInfo?.city || "",
    district: existingShippingInfo?.district || "",
  });

  const [errors, setErrors] = useState({});
  const [cityOptions] = useState(cities);
  const [districtOptions, setDistrictOptions] = useState([]);

  useEffect(() => {
    if (formData.city) {
      setDistrictOptions(districts[formData.city] || []);
    } else {
      setDistrictOptions([]);
    }
  }, [formData.city]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ tên người nhận.";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^\d{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ.";
    }
    if (!formData.houseName.trim())
      newErrors.houseName = "Vui lòng nhập số nhà và tên đường.";
    if (!formData.city) newErrors.city = "Vui lòng chọn thành phố/tỉnh.";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận/huyện.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (name === "city") {
      setFormData({ ...formData, city: value, district: "" });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Get city and district labels
      const cityLabel =
        cities.find((c) => c.value === formData.city)?.label || formData.city;
      const districtLabel =
        (districts[formData.city] || []).find(
          (d) => d.value === formData.district
        )?.label || formData.district;
      const address = [formData.houseName, districtLabel, cityLabel]
        .filter(Boolean)
        .join(", ");
      const shippingInfo = {
        ...formData,
        cityLabel,
        districtLabel,
        address,
      };
      navigate("/auth/checkout/payment", { state: { shippingInfo } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Thông tin giao hàng
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        {/* Họ tên */}
        <div>
          <Input
            label="Họ và tên người nhận"
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            error={errors.fullName}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <Input
            label="Số điện thoại"
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="09xxxxxxxx"
            error={errors.phone}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Số nhà và tên đường */}
        <div>
          <Input
            label="Số nhà và tên đường"
            type="text"
            name="houseName"
            id="houseName"
            value={formData.houseName}
            onChange={handleChange}
            placeholder="123 Đường ABC"
            error={errors.houseName}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Thành phố/Tỉnh */}
        <div>
          <Select
            label="Thành phố/Tỉnh"
            name="city"
            id="city"
            value={formData.city}
            onChange={(e) => handleSelectChange("city", e.target.value)}
            options={cityOptions}
            error={errors.city}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Quận/Huyện */}
        <div>
          <Select
            label="Quận/Huyện"
            name="district"
            id="district"
            value={formData.district}
            onChange={(e) => handleSelectChange("district", e.target.value)}
            options={districtOptions}
            error={errors.district}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Nút tiếp tục */}
        <Button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Tiếp tục đến thanh toán
        </Button>
      </div>
    </div>
  );
};

export default ShippingPage;
