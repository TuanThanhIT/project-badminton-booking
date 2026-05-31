"use strict";

module.exports = {
  "branch": {
    "id": 1,
    "branchName": "B-Hub Badminton Center",
    "phoneNumber": "0901234567",
    "description": "<h2>B-Hub Badminton Center</h2><p>B-Hub Badminton Center là chi nhánh mẫu được thiết kế để phục vụ đầy đủ các luồng demo của hệ thống: đặt sân, quản lý lịch chơi, quản lý nhân sự, bán sản phẩm thể thao và phục vụ đồ uống tại quầy.</p><p>Không gian sân được mô phỏng theo mô hình trung tâm cầu lông trong nhà, có nhiều khu sân theo tầng, phù hợp cho cả người chơi phong trào, nhóm bạn, lớp học cầu lông và các ca tập luyện sau giờ làm.</p><h3>Tiện ích nổi bật</h3><ul><li>36 sân cầu lông trong nhà, chia theo nhiều khu vực để dễ quản lý lịch đặt.</li><li>Có khu vực bán vợt, giày, quần áo, phụ kiện tập luyện và nước uống thể thao.</li><li>Hỗ trợ demo phân quyền cho admin, quản lý chi nhánh, nhân viên và khách hàng.</li><li>Phù hợp để kiểm thử các nghiệp vụ đặt sân, check-in, thanh toán, hủy lịch, quản lý ca làm và bán hàng.</li></ul><h3>Gợi ý sử dụng demo</h3><p>Bạn có thể dùng chi nhánh này để tạo lịch đặt sân theo ngày, kiểm tra bảng giá theo khung giờ, tạo đơn hàng sản phẩm hoặc kiểm thử quy trình vận hành tại quầy. Dữ liệu ảnh hiện chỉ là dữ liệu mẫu và có thể thay bằng ảnh thật sau.</p>",
    "address": "231 Le Van Chi, Phuong Linh Trung",
    "districtName": "Thanh pho Thu Duc",
    "provinceName": "Ho Chi Minh",
    "wardName": "Linh Trung",
    "provinceId": 202,
    "districtId": 1442,
    "wardCode": "20101",
    "latitude": 10.8505,
    "longitude": 106.7717,
    "isActive": true,
    "ghnShopId": null,
    "createdAt": "2025-11-25T10:00:00",
    "updatedAt": "2025-11-25T10:00:00"
  },
  "users": [
    {
      "id": 9,
      "username": "user1",
      "password": "$2b$10$fo14noTzHyivjX2Pkc47deW.TOXXwQG.5LCzY1iv4V9q1sdUloame",
      "email": "22110418@student.hcmute.edu.vn",
      "isVerified": true,
      "isActive": true,
      "roleId": 2,
      "createdAt": "2025-09-25T16:32:23",
      "updatedAt": "2025-10-14T09:23:30"
    },
    {
      "id": 10,
      "username": "user2",
      "password": "$2b$10$msICjcG6sNWt4TjGyPFn9OaO81IGGnjj1XMQd02LJK1k1AniPqyc6",
      "email": "nguyenthuhuong070209@gmail.com",
      "isVerified": true,
      "isActive": true,
      "roleId": 2,
      "createdAt": "2025-10-14T08:40:51",
      "updatedAt": "2025-10-14T08:41:27"
    },
    {
      "id": 18,
      "username": "tuanthanh123",
      "password": "$2b$10$bu9YqvB.Lo82h5nZj8ZkmOl/ljHB0GmV/rEX0TqpO/A5EnFqBdHFK",
      "email": "baohiptanlac@gmail.com",
      "isVerified": true,
      "isActive": true,
      "roleId": 2,
      "createdAt": "2025-11-25T10:47:19",
      "updatedAt": "2025-11-25T10:59:17"
    }
  ],
  "profiles": [
    {
      "id": 1,
      "fullName": "Nguyễn Tuấn Thành",
      "dob": "2000-01-01T00:00:00",
      "gender": "male",
      "address": "231 Lê Văn Chí, Phường Linh Trung, TP. Thủ Đức, TP.HCM",
      "phoneNumber": "0912345678",
      "avatar": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763203462/e3pnwganwqtwxhg6dexh.jpg",
      "level": "BEGINNER",
      "userId": 9,
      "createdAt": "2025-09-25T16:32:23",
      "updatedAt": "2025-11-15T12:06:58"
    },
    {
      "id": 2,
      "fullName": "Nguyễn Văn A",
      "dob": "2000-01-01T00:00:00",
      "gender": "male",
      "address": "231 Lê Văn Chí, Phường Linh Trung, TP. Thủ Đức, TP.HCM",
      "phoneNumber": "0912345678",
      "avatar": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1757343301/istockphoto-1337144146-612x612_blyh7z.jpg",
      "level": "BEGINNER",
      "userId": 10,
      "createdAt": "2025-10-14T08:40:51",
      "updatedAt": "2025-10-14T08:40:51"
    },
    {
      "id": 10,
      "fullName": "Nguyễn Tuấn Thành A",
      "dob": "2000-01-01T00:00:00",
      "gender": "male",
      "address": "231 Lê Văn Chí, Phường Linh Trung, TP. Thủ Đức, TP.HCM",
      "phoneNumber": "0123456789",
      "avatar": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764067694/shsarikh9hn7mvokdezr.jpg",
      "level": "BEGINNER",
      "userId": 18,
      "createdAt": "2025-11-25T10:47:19",
      "updatedAt": "2025-11-25T10:50:23"
    }
  ],
  "categories": [
    {
      "id": 1,
      "cateName": "Vợt cầu lông Yonex",
      "menuGroup": "Vợt cầu lông",
      "createdAt": "2025-09-25T16:33:47",
      "updatedAt": "2025-09-25T16:33:47"
    },
    {
      "id": 2,
      "cateName": "Vợt cầu lông Victor",
      "menuGroup": "Vợt cầu lông",
      "createdAt": "2025-09-25T16:34:08",
      "updatedAt": "2025-09-25T16:34:08"
    },
    {
      "id": 3,
      "cateName": "Vợt cầu lông Lining",
      "menuGroup": "Vợt cầu lông",
      "createdAt": "2025-09-25T16:34:21",
      "updatedAt": "2025-09-25T16:34:21"
    },
    {
      "id": 4,
      "cateName": "Vợt cầu lông Mizuno",
      "menuGroup": "Vợt cầu lông",
      "createdAt": "2025-09-25T16:34:39",
      "updatedAt": "2025-09-25T16:34:39"
    },
    {
      "id": 5,
      "cateName": "Giày cầu lông Yonex",
      "menuGroup": "Giày cầu lông",
      "createdAt": "2025-09-25T16:35:22",
      "updatedAt": "2025-09-25T16:35:22"
    },
    {
      "id": 6,
      "cateName": "Giày cầu lông Victor",
      "menuGroup": "Giày cầu lông",
      "createdAt": "2025-09-25T16:35:31",
      "updatedAt": "2025-09-25T16:35:31"
    },
    {
      "id": 7,
      "cateName": "Giày cầu lông Lining",
      "menuGroup": "Giày cầu lông",
      "createdAt": "2025-09-25T16:35:37",
      "updatedAt": "2025-09-25T16:35:37"
    },
    {
      "id": 8,
      "cateName": "Giày cầu lông Mizuno",
      "menuGroup": "Giày cầu lông",
      "createdAt": "2025-09-25T16:35:44",
      "updatedAt": "2025-09-25T16:35:44"
    },
    {
      "id": 9,
      "cateName": "Áo cầu lông Yonex",
      "menuGroup": "Áo cầu lông",
      "createdAt": "2025-09-25T16:36:13",
      "updatedAt": "2025-09-25T16:36:13"
    },
    {
      "id": 10,
      "cateName": "Áo cầu lông Victor",
      "menuGroup": "Áo cầu lông",
      "createdAt": "2025-09-25T16:36:19",
      "updatedAt": "2025-09-25T16:36:19"
    },
    {
      "id": 11,
      "cateName": "Áo cầu lông Kamito",
      "menuGroup": "Áo cầu lông",
      "createdAt": "2025-09-25T16:36:25",
      "updatedAt": "2025-09-25T16:36:25"
    },
    {
      "id": 12,
      "cateName": "Áo cầu lông Lining",
      "menuGroup": "Áo cầu lông",
      "createdAt": "2025-09-25T16:36:30",
      "updatedAt": "2025-09-25T16:36:30"
    },
    {
      "id": 13,
      "cateName": "Váy cầu lông Yonex",
      "menuGroup": "Váy cầu lông",
      "createdAt": "2025-09-25T16:37:10",
      "updatedAt": "2025-09-25T16:37:10"
    },
    {
      "id": 14,
      "cateName": "Váy cầu lông Victor",
      "menuGroup": "Váy cầu lông",
      "createdAt": "2025-09-25T16:37:18",
      "updatedAt": "2025-09-25T16:37:18"
    },
    {
      "id": 15,
      "cateName": "Váy cầu lông Lining",
      "menuGroup": "Váy cầu lông",
      "createdAt": "2025-09-25T16:37:23",
      "updatedAt": "2025-09-25T16:37:23"
    },
    {
      "id": 16,
      "cateName": "Váy cầu lông Kamito",
      "menuGroup": "Váy cầu lông",
      "createdAt": "2025-09-25T16:37:29",
      "updatedAt": "2025-09-25T16:37:29"
    },
    {
      "id": 17,
      "cateName": "Quần cầu lông Yonex",
      "menuGroup": "Quần cầu lông",
      "createdAt": "2025-09-25T16:38:07",
      "updatedAt": "2025-09-25T16:38:07"
    },
    {
      "id": 18,
      "cateName": "Quần cầu lông Kamito",
      "menuGroup": "Quần cầu lông",
      "createdAt": "2025-09-25T16:38:14",
      "updatedAt": "2025-09-25T16:38:14"
    },
    {
      "id": 19,
      "cateName": "Quần cầu lông Victor",
      "menuGroup": "Quần cầu lông",
      "createdAt": "2025-09-25T16:38:19",
      "updatedAt": "2025-09-25T16:38:19"
    },
    {
      "id": 20,
      "cateName": "Quần cầu lông Lining",
      "menuGroup": "Quần cầu lông",
      "createdAt": "2025-09-25T16:38:24",
      "updatedAt": "2025-09-25T16:38:24"
    },
    {
      "id": 21,
      "cateName": "Túi vợt cầu lông Yonex",
      "menuGroup": "Túi vợt cầu lông",
      "createdAt": "2025-09-25T16:38:56",
      "updatedAt": "2025-09-25T16:38:56"
    },
    {
      "id": 22,
      "cateName": "Túi vợt cầu lông Victor",
      "menuGroup": "Túi vợt cầu lông",
      "createdAt": "2025-09-25T16:39:01",
      "updatedAt": "2025-09-25T16:39:01"
    },
    {
      "id": 23,
      "cateName": "Túi vợt cầu lông Kamito",
      "menuGroup": "Túi vợt cầu lông",
      "createdAt": "2025-09-25T16:39:06",
      "updatedAt": "2025-09-25T16:39:06"
    },
    {
      "id": 24,
      "cateName": "Túi vợt cầu lông Lining",
      "menuGroup": "Túi vợt cầu lông",
      "createdAt": "2025-09-25T16:39:11",
      "updatedAt": "2025-09-25T16:39:11"
    },
    {
      "id": 25,
      "cateName": "Balo cầu lông Yonex",
      "menuGroup": "Balo cầu lông",
      "createdAt": "2025-09-25T16:39:43",
      "updatedAt": "2025-09-25T16:39:43"
    },
    {
      "id": 26,
      "cateName": "Balo cầu lông Lining",
      "menuGroup": "Balo cầu lông",
      "createdAt": "2025-09-25T16:39:48",
      "updatedAt": "2025-09-25T16:39:48"
    },
    {
      "id": 27,
      "cateName": "Balo cầu lông Kamito",
      "menuGroup": "Balo cầu lông",
      "createdAt": "2025-09-25T16:39:53",
      "updatedAt": "2025-09-25T16:39:53"
    },
    {
      "id": 28,
      "cateName": "Balo cầu lông Victor",
      "menuGroup": "Balo cầu lông",
      "createdAt": "2025-09-25T16:40:01",
      "updatedAt": "2025-09-25T16:40:01"
    },
    {
      "id": 29,
      "cateName": "Vớ cầu lông",
      "menuGroup": "Phụ kiện cầu lông",
      "createdAt": "2025-09-25T16:40:36",
      "updatedAt": "2025-09-25T16:40:36"
    },
    {
      "id": 30,
      "cateName": "Cước đan vợt cầu lông",
      "menuGroup": "Phụ kiện cầu lông",
      "createdAt": "2025-09-25T16:40:46",
      "updatedAt": "2025-09-25T16:40:46"
    },
    {
      "id": 31,
      "cateName": "Quả cầu lông",
      "menuGroup": "Phụ kiện cầu lông",
      "createdAt": "2025-09-25T16:41:00",
      "updatedAt": "2025-09-25T16:41:00"
    },
    {
      "id": 32,
      "cateName": "Băng bó cơ",
      "menuGroup": "Phụ kiện cầu lông",
      "createdAt": "2025-09-25T16:41:06",
      "updatedAt": "2025-09-25T16:41:06"
    },
    {
      "id": 33,
      "cateName": "Móc khóa cầu lông",
      "menuGroup": "Phụ kiện cầu lông",
      "createdAt": "2025-09-25T16:41:13",
      "updatedAt": "2025-09-25T16:41:13"
    }
  ],
  "courts": [
    {
      "id": 1,
      "branchId": 1,
      "courtName": "Sân số 1",
      "location": "Khu số 1, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396011/whbvex8pafiwkwjaxjqh.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 2,
      "branchId": 1,
      "courtName": "Sân số 2",
      "location": "Khu số 1, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396064/wylxslwofb2e7jvxtl5b.jpg",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 3,
      "branchId": 1,
      "courtName": "Sân số 3",
      "location": "Khu số 1, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396081/jucfbwrw4bo8nhskofpp.jpg",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 4,
      "branchId": 1,
      "courtName": "Sân số 4",
      "location": "Khu số 1, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396095/phyftciinmzwsysxmwia.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 5,
      "branchId": 1,
      "courtName": "Sân số 5",
      "location": "Khu số 2, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396115/cbi8yrybpioqwkwgcbdy.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 6,
      "branchId": 1,
      "courtName": "Sân số 6",
      "location": "Khu số 2, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396128/iude8dgkkyabrx6wb4h0.jpg",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 7,
      "branchId": 1,
      "courtName": "Sân số 7",
      "location": "Khu số 2, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396143/etbsvfjxxgcfcdlarti9.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 8,
      "branchId": 1,
      "courtName": "Sân số 8",
      "location": "Khu số 2, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396164/nsxqb86iaiijgjljh65l.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 9,
      "branchId": 1,
      "courtName": "Sân số 9",
      "location": "Khu số 3, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396193/h505dpxb26vn7sj3su3d.avif",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 10,
      "branchId": 1,
      "courtName": "Sân số 10",
      "location": "Khu số 3, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396208/tsuyt2dha2ehyr4hiyde.avif",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 11,
      "branchId": 1,
      "courtName": "Sân số 11",
      "location": "Khu số 3, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396219/po9iktfk4mfeltncj01h.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 12,
      "branchId": 1,
      "courtName": "Sân số 12",
      "location": "Khu số 3, Tầng 1",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396234/jqmyfodebnme3q3lxmi3.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 13,
      "branchId": 1,
      "courtName": "Sân số 13",
      "location": "Khu số 1, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396255/b2tqo6ebudgo04pz8ats.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 14,
      "branchId": 1,
      "courtName": "Sân số 14",
      "location": "Khu số 1, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396266/tlg4n7swmrtcsegyiuej.jpg",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 15,
      "branchId": 1,
      "courtName": "Sân số 15",
      "location": "Khu số 1, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396279/ps8iuut90pyijl9xuluu.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 16,
      "branchId": 1,
      "courtName": "Sân số 16",
      "location": "Khu số 1, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396339/eidhkflks2mgieippsca.avif",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 17,
      "branchId": 1,
      "courtName": "Sân số 17",
      "location": "Khu số 2, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396356/sivh17psxfa9ie2hsuqo.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 18,
      "branchId": 1,
      "courtName": "Sân số 18",
      "location": "Khu số 2, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396368/s2qdfuq6c3qzvmcfnjfo.jpg",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 19,
      "branchId": 1,
      "courtName": "Sân số 19",
      "location": "Khu số 2, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396379/ubkq9fw2yt4vyx7zyipb.webp",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 20,
      "branchId": 1,
      "courtName": "Sân số 20",
      "location": "Khu số 2, Tầng 2",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763396392/wod7w7jfcp80gjkhmwf2.jpg",
      "courtStatus": "ACTIVE",
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    }
  ],
  "courtPrices": [
    {
      "id": 39,
      "branchId": 1,
      "dayOfWeek": "Monday",
      "startTime": "06:00:00",
      "endTime": "17:00:00",
      "price": 60000,
      "periodType": "DAYTIME"
    },
    {
      "id": 40,
      "branchId": 1,
      "dayOfWeek": "Monday",
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 100000,
      "periodType": "EVENING"
    },
    {
      "id": 41,
      "branchId": 1,
      "dayOfWeek": "Tuesday",
      "startTime": "06:00:00",
      "endTime": "17:00:00",
      "price": 60000,
      "periodType": "DAYTIME"
    },
    {
      "id": 42,
      "branchId": 1,
      "dayOfWeek": "Tuesday",
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 100000,
      "periodType": "EVENING"
    },
    {
      "id": 43,
      "branchId": 1,
      "dayOfWeek": "Wednesday",
      "startTime": "06:00:00",
      "endTime": "17:00:00",
      "price": 60000,
      "periodType": "DAYTIME"
    },
    {
      "id": 44,
      "branchId": 1,
      "dayOfWeek": "Wednesday",
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 100000,
      "periodType": "EVENING"
    },
    {
      "id": 45,
      "branchId": 1,
      "dayOfWeek": "Thursday",
      "startTime": "06:00:00",
      "endTime": "17:00:00",
      "price": 60000,
      "periodType": "DAYTIME"
    },
    {
      "id": 46,
      "branchId": 1,
      "dayOfWeek": "Thursday",
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 100000,
      "periodType": "EVENING"
    },
    {
      "id": 47,
      "branchId": 1,
      "dayOfWeek": "Friday",
      "startTime": "06:00:00",
      "endTime": "17:00:00",
      "price": 60000,
      "periodType": "DAYTIME"
    },
    {
      "id": 48,
      "branchId": 1,
      "dayOfWeek": "Friday",
      "startTime": "17:00:00",
      "endTime": "22:00:00",
      "price": 100000,
      "periodType": "EVENING"
    },
    {
      "id": 49,
      "branchId": 1,
      "dayOfWeek": "Saturday",
      "startTime": "06:00:00",
      "endTime": "22:00:00",
      "price": 120000,
      "periodType": "WEEKEND"
    },
    {
      "id": 50,
      "branchId": 1,
      "dayOfWeek": "Sunday",
      "startTime": "06:00:00",
      "endTime": "22:00:00",
      "price": 120000,
      "periodType": "WEEKEND"
    }
  ],
  "discounts": [
    {
      "id": 1,
      "code": "SALE20K",
      "type": "AMOUNT",
      "applyType": "ORDER",
      "value": 20000,
      "maxDiscount": null,
      "minAmount": 50000,
      "usageLimit": null,
      "usageCount": 1,
      "isActive": true,
      "startDate": "2025-10-31",
      "endDate": "2025-11-30",
      "createdAt": "2025-11-04T18:07:35",
      "updatedAt": "2025-11-25T10:34:03"
    },
    {
      "id": 2,
      "code": "SALE30K",
      "type": "AMOUNT",
      "applyType": "ORDER",
      "value": 30000,
      "maxDiscount": null,
      "minAmount": 50000,
      "usageLimit": null,
      "usageCount": 1,
      "isActive": true,
      "startDate": "2025-10-31",
      "endDate": "2025-11-30",
      "createdAt": "2025-11-11T16:40:57",
      "updatedAt": "2025-11-25T10:50:54"
    },
    {
      "id": 3,
      "code": "SALE5P",
      "type": "PERCENT",
      "applyType": "ORDER",
      "value": 5,
      "maxDiscount": null,
      "minAmount": 70000,
      "usageLimit": null,
      "usageCount": 0,
      "isActive": true,
      "startDate": "2025-10-31",
      "endDate": "2025-11-30",
      "createdAt": "2025-11-11T16:41:52",
      "updatedAt": "2025-11-11T16:46:34"
    },
    {
      "id": 4,
      "code": "SALE2P",
      "type": "PERCENT",
      "applyType": "ORDER",
      "value": 2,
      "maxDiscount": null,
      "minAmount": 20000,
      "usageLimit": null,
      "usageCount": 0,
      "isActive": true,
      "startDate": "2025-10-31",
      "endDate": "2025-11-30",
      "createdAt": "2025-11-11T16:42:32",
      "updatedAt": "2025-11-11T16:42:32"
    }
  ],
  "products": [
    {
      "id": 1,
      "productName": "Áo Cầu Lông Yonex TPM2969 - Poppy Seed Chính Hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TPM2969 màu Poppy Seed, chất liệu thoáng mát, chính hãng, thiết kế chuẩn cho người chơi cầu lông chuyên nghiệp.\n",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759111663/tfpvgzbjewtligbl5old.webp",
      "categoryId": 9,
      "createdAt": "2025-09-29T02:07:43",
      "updatedAt": "2025-09-29T02:07:43"
    },
    {
      "id": 2,
      "productName": "Áo Cầu Lông Yonex TRM2968 - Glacier Gray Chính Hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM2968 màu Glacier Gray chính hãng, chất liệu thoáng mát, co giãn tốt, thiết kế năng động, phù hợp cho mọi trận đấu và luyện tập hàng ngày.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112226/dxlzghqly7k4uyolyoiy.webp",
      "categoryId": 9,
      "createdAt": "2025-09-29T02:17:06",
      "updatedAt": "2025-09-29T02:17:06"
    },
    {
      "id": 4,
      "productName": "Áo Cầu Lông Yonex TRM2966 - Navy Peony Chính Hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM2968 màu Glacier Gray chính hãng, chất liệu thoáng mát, co giãn tốt, thiết kế năng động, phù hợp cho mọi trận đấu và luyện tập hàng ngày.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112570/hup8zeulomcju8glwfng.webp",
      "categoryId": 9,
      "createdAt": "2025-09-29T02:22:49",
      "updatedAt": "2025-09-29T02:22:49"
    },
    {
      "id": 5,
      "productName": "Áo Cầu Lông Yonex TRM2965 - White Chính Hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM2965 - White chính hãng được làm từ chất liệu polyester cao cấp, thoáng khí, thấm hút mồ hôi hiệu quả, giúp người chơi luôn khô ráo và thoải mái. Thiết kế ôm vừa vặn, linh hoạt, cho phép cử động tay tối ưu trong các pha cầu nhanh. ",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113001/gh8ogwltzpahjcsdinei.webp",
      "categoryId": 9,
      "createdAt": "2025-09-29T02:30:01",
      "updatedAt": "2025-09-29T02:30:01"
    },
    {
      "id": 6,
      "productName": "Vợt Cầu Lông Yonex Astro 100 Game VA",
      "brand": "Yonex",
      "description": "Vợt cầu lông Yonex Astro 100 Game VA, thiết kế hiện đại, trọng lượng nhẹ, linh hoạt, giúp tăng tốc độ phản xạ và kiểm soát cầu tối ưu. Phù hợp cho người chơi nghiệp dư và bán chuyên.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113251/balgpoigxr4h0fxjiixy.jpg",
      "categoryId": 1,
      "createdAt": "2025-09-29T02:34:11",
      "updatedAt": "2025-09-29T02:34:11"
    },
    {
      "id": 7,
      "productName": "Quần cầu lông Yonex TSM2910 - Dark Navy chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex chính hãng với chất liệu co giãn linh hoạt, thấm hút mồ hôi nhanh giúp cơ thể luôn khô ráo, kết hợp kiểu dáng thời trang, đường may chắc chắn và màu sắc đa dạng, mang đến sự thoải mái cho mọi người chơi từ tập luyện đến thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763922315/gubalgjfymdqdjsute7h.webp",
      "categoryId": 17,
      "createdAt": "2025-11-23T18:25:15",
      "updatedAt": "2025-11-23T18:25:15"
    },
    {
      "id": 8,
      "productName": "Quần cầu lông Yonex TSM3064 - Poppy Seed chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM3064 – Poppy Seed mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062161/gussnaxp7ntmm2ju1zda.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:16:02",
      "updatedAt": "2025-11-25T09:16:02"
    },
    {
      "id": 9,
      "productName": "Quần cầu lông Yonex TSM3064 - Skipper Blue chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM3064 - Skipper Blue chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062320/cukk8lhnwut9m6cab7ea.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:18:41",
      "updatedAt": "2025-11-25T09:18:41"
    },
    {
      "id": 10,
      "productName": "Quần cầu lông Yonex TSM3085 - Jet Black chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM3085 - Jet Black chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:20:18",
      "updatedAt": "2025-11-25T09:20:18"
    },
    {
      "id": 11,
      "productName": "Quần cầu lông Yonex TSM2975 - Glacier Gray chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM2975 - Glacier Gray chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:21:42",
      "updatedAt": "2025-11-25T09:21:42"
    },
    {
      "id": 12,
      "productName": "Quần cầu lông Yonex TSM2975 - White chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM2975 - White chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062601/k12fac85gu0nafcr6z0t.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:23:23",
      "updatedAt": "2025-11-25T09:23:23"
    },
    {
      "id": 18,
      "productName": "Quần cầu lông Yonex TSM2844 - Hemlock chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM2844 - Hemlock chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:28:11",
      "updatedAt": "2025-11-25T09:28:11"
    },
    {
      "id": 19,
      "productName": "Quần cầu lông Yonex TSM3085 - White chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM3085 - White chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:30:34",
      "updatedAt": "2025-11-25T09:30:34"
    },
    {
      "id": 20,
      "productName": "Quần cầu lông Yonex TSM2906 - Jet Black chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM2906 - Jet Black chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764063202/l6mnqydfnqrlneyf1kyg.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:31:52",
      "updatedAt": "2025-11-25T09:31:52"
    },
    {
      "id": 21,
      "productName": "Quần cầu lông Yonex TSM2913 - Jet Black chính hãng",
      "brand": "Yonex",
      "description": "Quần cầu lông Yonex TSM2913 - Jet Black chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764063202/l6mnqydfnqrlneyf1kyg.jpg",
      "categoryId": 17,
      "createdAt": "2025-11-25T09:33:24",
      "updatedAt": "2025-11-25T09:33:24"
    },
    {
      "id": 23,
      "productName": "Áo cầu lông Yonex TRM3093 - Viva Magenta chính hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM3093 - Viva Magenta chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064420/kjrl1rk3b0bnvedpo5oj.webp",
      "categoryId": 9,
      "createdAt": "2025-11-25T09:50:40",
      "updatedAt": "2025-11-25T09:50:40"
    },
    {
      "id": 24,
      "productName": "Áo cầu lông Yonex TRM3066 - Georgia Peach chính hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM3066 - Georgia Peach chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064484/fhyp5f2igjxzjlff2wdx.webp",
      "categoryId": 9,
      "createdAt": "2025-11-25T09:54:45",
      "updatedAt": "2025-11-25T09:54:45"
    },
    {
      "id": 25,
      "productName": "Áo cầu lông Yonex TRM2974 - Classic Blue chính hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM2974 - Classic Blue chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064633/zfi7bvjjhfmcqpwgiyv0.webp",
      "categoryId": 9,
      "createdAt": "2025-11-25T09:57:14",
      "updatedAt": "2025-11-25T09:57:14"
    },
    {
      "id": 26,
      "productName": "Áo cầu lông Yonex TRM2974 - True Red chính hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM2974 - True Red chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064707/u3uliucugxk2ec3dihyz.webp",
      "categoryId": 9,
      "createdAt": "2025-11-25T09:58:28",
      "updatedAt": "2025-11-25T09:58:28"
    },
    {
      "id": 27,
      "productName": "Áo cầu lông Yonex TRM2981 - Jet Black chính hãng",
      "brand": "Yonex",
      "description": "Áo cầu lông Yonex TRM2981 - Jet Black chính hãng mang thiết kế thể thao hiện đại, chất vải nhẹ và thoáng giúp vận động thoải mái trong suốt buổi tập. Tông màu Poppy Seed trẻ trung, dễ phối, phù hợp cả luyện tập lẫn thi đấu.",
      "thumbnailUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064776/on6hocufcqhlal2l44yl.webp",
      "categoryId": 9,
      "createdAt": "2025-11-25T09:59:37",
      "updatedAt": "2025-11-25T09:59:37"
    }
  ],
  "productImages": [
    {
      "id": 1,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112072/o9qmnefnjjbhtvktgv4d.webp",
      "productId": 1
    },
    {
      "id": 2,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112377/tmgkodvjxeiwim2hhbkx.webp",
      "productId": 2
    },
    {
      "id": 3,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112779/w9p2ogcbgd83u9hwc9fd.webp",
      "productId": 4
    },
    {
      "id": 4,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113447/lwyngmakyla6xwjuaxzv.jpg",
      "productId": 6
    },
    {
      "id": 5,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113448/enzvywgfwlodtx2hghwv.jpg",
      "productId": 6
    },
    {
      "id": 6,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113449/d1wubn26cjn3ffl9mxz4.jpg",
      "productId": 6
    },
    {
      "id": 7,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759111663/tfpvgzbjewtligbl5old.webp",
      "productId": 1
    },
    {
      "id": 8,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112226/dxlzghqly7k4uyolyoiy.webp",
      "productId": 2
    },
    {
      "id": 9,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759112570/hup8zeulomcju8glwfng.webp",
      "productId": 4
    },
    {
      "id": 10,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113001/gh8ogwltzpahjcsdinei.webp",
      "productId": 5
    },
    {
      "id": 11,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1759113251/balgpoigxr4h0fxjiixy.jpg",
      "productId": 6
    },
    {
      "id": 12,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763922697/yof45ajt2zv2xryvfbgc.webp",
      "productId": 7
    },
    {
      "id": 13,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1763922698/jupk5xjud9vx5wjeip4z.webp",
      "productId": 7
    },
    {
      "id": 14,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062258/qmd8lpkup7bad3yvu61g.jpg",
      "productId": 8
    },
    {
      "id": 15,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062375/opmmsrk4bcbtcvtlc4nm.jpg",
      "productId": 9
    },
    {
      "id": 16,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062448/c6zsi1mxdxb9yqymiukk.jpg",
      "productId": 10
    },
    {
      "id": 17,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "productId": 11
    },
    {
      "id": 18,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "productId": 12
    },
    {
      "id": 19,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764062417/p6ocgzlq3v9thatbiopl.jpg",
      "productId": 18
    },
    {
      "id": 20,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764063202/l6mnqydfnqrlneyf1kyg.jpg",
      "productId": 19
    },
    {
      "id": 21,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764063160/jmjhrsnnhor24o6ehh3h.jpg",
      "productId": 20
    },
    {
      "id": 22,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764063291/cls1p8mzqnzdilgjat0h.jpg",
      "productId": 21
    },
    {
      "id": 23,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064420/kjrl1rk3b0bnvedpo5oj.webp",
      "productId": 23
    },
    {
      "id": 24,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064578/ddekpoirwlkrbqstm0xr.webp",
      "productId": 24
    },
    {
      "id": 25,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064672/hvbhdtmsfdehateolvjq.webp",
      "productId": 25
    },
    {
      "id": 26,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064741/nbxtsqvr7boofpfgzhjr.webp",
      "productId": 26
    },
    {
      "id": 27,
      "imageUrl": "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764064823/vilpn9zo2oibr4evil0p.webp",
      "productId": 27
    }
  ],
  "productVariants": [
    {
      "id": 1,
      "sku": "TPM2969-SS-Poppy-XL",
      "price": 99000,
      "discount": 2,
      "color": "Vàng",
      "size": "L",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 1,
      "stock": 20
    },
    {
      "id": 2,
      "sku": "TPM2969-SS-Poppy-L",
      "price": 119000,
      "discount": 2,
      "color": "Xanh dương",
      "size": "L",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 1,
      "stock": 15
    },
    {
      "id": 3,
      "sku": "TRM2968-SS-Glacier-L",
      "price": 109000,
      "discount": 5,
      "color": "Trắng",
      "size": "L",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 2,
      "stock": 15
    },
    {
      "id": 4,
      "sku": "TRM2968-SS-Glacier-M",
      "price": 109000,
      "discount": 5,
      "color": "Đen",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 2,
      "stock": 20
    },
    {
      "id": 5,
      "sku": "TRM2966-SS-Navy-M",
      "price": 129000,
      "discount": 5,
      "color": "Xanh dương",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 4,
      "stock": 30
    },
    {
      "id": 6,
      "sku": "TRM2966-SS-Navy-XL",
      "price": 109000,
      "discount": 5,
      "color": "Xanh dương",
      "size": "XL",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 4,
      "stock": 25
    },
    {
      "id": 7,
      "sku": "TRM2965-SS-White-S",
      "price": 139000,
      "discount": 5,
      "color": "Trắng",
      "size": "S",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 5,
      "stock": 50
    },
    {
      "id": 8,
      "sku": "ASTRO100-SS-VA-4U",
      "price": 700000,
      "discount": 10,
      "color": "Xanh",
      "size": "4U",
      "material": "Carbon",
      "weight": 0.5,
      "productId": 6,
      "stock": 20
    },
    {
      "id": 9,
      "sku": "ASTRO100-SS-VA-5U",
      "price": 720000,
      "discount": 10,
      "color": "Xanh",
      "size": "5U",
      "material": "Carbon",
      "weight": 0.5,
      "productId": 6,
      "stock": 30
    },
    {
      "id": 10,
      "sku": "YQ-BM001-M",
      "price": 119000,
      "discount": 2,
      "color": "Đen",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 7,
      "stock": 50
    },
    {
      "id": 11,
      "sku": "YQ-BM001-L",
      "price": 129000,
      "discount": 5,
      "color": "Trắng",
      "size": "L",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 7,
      "stock": 50
    },
    {
      "id": 12,
      "sku": "YQ-BM002-L",
      "price": 129000,
      "discount": 2,
      "color": "Trắng",
      "size": "L",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 8,
      "stock": 30
    },
    {
      "id": 13,
      "sku": "YQ-BM003-M",
      "price": 119000,
      "discount": 2,
      "color": "Xanh",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 9,
      "stock": 30
    },
    {
      "id": 14,
      "sku": "YQ-BM004-M",
      "price": 119000,
      "discount": 3,
      "color": "Đen",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 10,
      "stock": 30
    },
    {
      "id": 15,
      "sku": "YQ-BM005-XL",
      "price": 159000,
      "discount": 5,
      "color": "Đỏ",
      "size": "XL",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 11,
      "stock": 30
    },
    {
      "id": 16,
      "sku": "YQ-BM006-M",
      "price": 159000,
      "discount": 5,
      "color": "Trắng",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 12,
      "stock": 30
    },
    {
      "id": 17,
      "sku": "YQ-BM007-XL",
      "price": 159000,
      "discount": 5,
      "color": "Đen",
      "size": "XL",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 18,
      "stock": 30
    },
    {
      "id": 18,
      "sku": "YQ-BM008-M",
      "price": 159000,
      "discount": 5,
      "color": "Đen",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 19,
      "stock": 30
    },
    {
      "id": 19,
      "sku": "YQ-BM009-M",
      "price": 109000,
      "discount": 5,
      "color": "Đen",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 20,
      "stock": 50
    },
    {
      "id": 20,
      "sku": "YQ-BM010-S",
      "price": 99000,
      "discount": 2,
      "color": "Đen",
      "size": "S",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 21,
      "stock": 20
    },
    {
      "id": 21,
      "sku": "YQ-AL001-S",
      "price": 99000,
      "discount": 2,
      "color": "Đỏ",
      "size": "S",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 23,
      "stock": 20
    },
    {
      "id": 22,
      "sku": "YQ-AL002-M",
      "price": 109000,
      "discount": 3,
      "color": "Cam",
      "size": "M",
      "material": "Cotton",
      "weight": 0.5,
      "productId": 24,
      "stock": 20
    },
    {
      "id": 23,
      "sku": "YQ-AL003-L",
      "price": 109000,
      "discount": 3,
      "color": "Xanh",
      "size": "L",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 25,
      "stock": 20
    },
    {
      "id": 24,
      "sku": "YQ-AL004-L",
      "price": 109000,
      "discount": 3,
      "color": "Đỏ",
      "size": "L",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 26,
      "stock": 20
    },
    {
      "id": 25,
      "sku": "YQ-AL005-XL",
      "price": 159000,
      "discount": 2,
      "color": "Đen",
      "size": "XL",
      "material": "Polyester",
      "weight": 0.5,
      "productId": 27,
      "stock": 20
    }
  ],
  "feedbacks": [
    {
      "id": 1,
      "userId": 9,
      "orderId": null,
      "variantId": 1,
      "branchId": null,
      "content": "Áo mặc đẹp vừa vặn với cơ thể đẹp",
      "rating": 4,
      "createdAt": "2025-11-13T13:30:46",
      "updatedAt": "2025-11-21T02:22:16"
    },
    {
      "id": 2,
      "userId": 9,
      "orderId": null,
      "variantId": 9,
      "branchId": null,
      "content": "Vợt xài oke á, bền, đẹp abc",
      "rating": 5,
      "createdAt": "2025-11-13T13:27:24",
      "updatedAt": "2025-11-24T12:00:48"
    },
    {
      "id": 3,
      "userId": 9,
      "orderId": null,
      "variantId": 11,
      "branchId": null,
      "content": "Hàng đẹp giao hàng nhanh",
      "rating": 4,
      "createdAt": "2025-11-25T10:57:32",
      "updatedAt": "2025-11-25T10:57:49"
    }
  ],
  "beverages": [
    {
      "id": 1,
      "beverageName": "Nuoc suoi B-Hub",
      "thumbnailUrl": null,
      "price": 10000,
      "stock": 100,
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    },
    {
      "id": 2,
      "beverageName": "Tra xanh B-Hub",
      "thumbnailUrl": null,
      "price": 15000,
      "stock": 80,
      "createdAt": "2025-11-25T10:00:00",
      "updatedAt": "2025-11-25T10:00:00"
    }
  ]
};

const data = module.exports;
const demoTimestamp = "2025-11-25T10:00:00";

data.categories.push(
  { id: 34, cateName: "Vợt cầu lông Apacs", menuGroup: "Vợt cầu lông", createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 35, cateName: "Vợt cầu lông Kawasaki", menuGroup: "Vợt cầu lông", createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 36, cateName: "Giày cầu lông Adidas", menuGroup: "Giày cầu lông", createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 37, cateName: "Quần áo cầu lông nam", menuGroup: "Quần áo cầu lông", createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 38, cateName: "Quần áo cầu lông nữ", menuGroup: "Quần áo cầu lông", createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 39, cateName: "Phụ kiện tập luyện", menuGroup: "Phụ kiện cầu lông", createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 40, cateName: "Nước uống thể thao", menuGroup: "Đồ uống", createdAt: demoTimestamp, updatedAt: demoTimestamp },
);

data.courts.push(
  ...Array.from({ length: 16 }, (_, index) => {
    const id = 21 + index;
    const floor = id <= 28 ? 3 : 4;
    const zone = id <= 28 ? "Khu so 1" : "Khu so 2";
    return {
      id,
      branchId: data.branch.id,
      courtName: `Sân số ${id}`,
      location: `${zone}, Tầng ${floor}`,
      thumbnailUrl: `https://example.com/images/courts/court-${id}.jpg`,
      courtStatus: "ACTIVE",
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    };
  }),
);

data.products.push(
  {
    id: 101,
    productName: "Vợt cầu lông Apacs Feather Weight 55",
    brand: "Apacs",
    description: "Vợt cầu lông Apacs trọng lượng nhẹ, phù hợp người mới và người chơi thích tốc độ.",
    thumbnailUrl: "https://example.com/images/products/apacs-feather-weight-55.jpg",
    categoryId: 34,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 102,
    productName: "Vợt cầu lông Apacs Ziggler LHI Pro",
    brand: "Apacs",
    description: "Vợt cầu lông Apacs cân bằng, dễ điều khiển và có lực đánh ổn định.",
    thumbnailUrl: "https://example.com/images/products/apacs-ziggler-lhi-pro.jpg",
    categoryId: 34,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 103,
    productName: "Vợt cầu lông Kawasaki Honor S6",
    brand: "Kawasaki",
    description: "Vợt cầu lông Kawasaki thiết kế chắc tay, phù hợp tập luyện hằng ngày.",
    thumbnailUrl: "https://example.com/images/products/kawasaki-honor-s6.jpg",
    categoryId: 35,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 104,
    productName: "Giày cầu lông Adidas Speedcourt",
    brand: "Adidas",
    description: "Giày cầu lông Adidas bám sân tốt, đệm êm, phù hợp thi đấu và tập luyện.",
    thumbnailUrl: "https://example.com/images/products/adidas-speedcourt.jpg",
    categoryId: 36,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 105,
    productName: "Áo cầu lông nam B-Hub Pro Fit",
    brand: "B-Hub",
    description: "Áo cầu lông nam chất liệu thoáng mát, nhanh khô, form thể thao.",
    thumbnailUrl: "https://example.com/images/products/bhub-shirt-men-pro-fit.jpg",
    categoryId: 37,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 106,
    productName: "Áo cầu lông nữ B-Hub Light Move",
    brand: "B-Hub",
    description: "Áo cầu lông nữ chất liệu mềm nhẹ, co giãn tốt, phù hợp vận động mạnh.",
    thumbnailUrl: "https://example.com/images/products/bhub-shirt-women-light-move.jpg",
    categoryId: 38,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 107,
    productName: "Quần cầu lông nam B-Hub Flex",
    brand: "B-Hub",
    description: "Quần cầu lông nam thiết kế gọn, dễ di chuyển và dễ phối đồ.",
    thumbnailUrl: "https://example.com/images/products/bhub-short-men-flex.jpg",
    categoryId: 37,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 108,
    productName: "Váy cầu lông nữ B-Hub Active",
    brand: "B-Hub",
    description: "Váy cầu lông nữ thiết kế thể thao, nhẹ và thoải mái khi thi đấu.",
    thumbnailUrl: "https://example.com/images/products/bhub-skirt-women-active.jpg",
    categoryId: 38,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 109,
    productName: "Bóng tập phản xạ cầu lông",
    brand: "B-Hub",
    description: "Dụng cụ tập phản xạ hỗ trợ luyện tốc độ tay và mắt.",
    thumbnailUrl: "https://example.com/images/products/reaction-ball.jpg",
    categoryId: 39,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 110,
    productName: "Dây nhảy thể lực B-Hub",
    brand: "B-Hub",
    description: "Dây nhảy thể lực hỗ trợ khởi động và tăng sức bền cho người chơi cầu lông.",
    thumbnailUrl: "https://example.com/images/products/jump-rope.jpg",
    categoryId: 39,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 111,
    productName: "Bình nước thể thao B-Hub 750ml",
    brand: "B-Hub",
    description: "Bình nước thể thao dung tích 750ml, nắp kín, tiện lợi khi tập luyện.",
    thumbnailUrl: "https://example.com/images/products/sport-bottle-750ml.jpg",
    categoryId: 39,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
  {
    id: 112,
    productName: "Khăn lau mồ hôi B-Hub Cotton",
    brand: "B-Hub",
    description: "Khăn lau mồ hôi cotton mềm, thích hợp cho tập luyện và thi đấu.",
    thumbnailUrl: "https://example.com/images/products/bhub-towel-cotton.jpg",
    categoryId: 39,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
  },
);

data.productImages.push(
  ...data.products
    .filter((product) => product.id >= 101)
    .flatMap((product, index) => [
      {
        id: 101 + index * 2,
        imageUrl: `https://example.com/images/products/${product.id}-main.jpg`,
        productId: product.id,
      },
      {
        id: 102 + index * 2,
        imageUrl: `https://example.com/images/products/${product.id}-detail.jpg`,
        productId: product.id,
      },
    ]),
);

data.productVariants.push(
  ...data.products
    .filter((product) => product.id >= 101)
    .flatMap((product, index) => {
      const baseVariantId = 101 + index * 3;
      const basePrice = 89000 + index * 35000;
      const common = {
        discount: index % 2 === 0 ? 5 : 0,
        material: product.categoryId <= 35 ? "Carbon" : "Polyester",
        weight: product.categoryId <= 35 ? 0.5 : 0.3,
        productId: product.id,
      };

      return [
        {
          id: baseVariantId,
          sku: `DEMO-${product.id}-S`,
          price: basePrice,
          color: "Black",
          size: "S",
          stock: 25 + index,
          ...common,
        },
        {
          id: baseVariantId + 1,
          sku: `DEMO-${product.id}-M`,
          price: basePrice + 20000,
          color: "Blue",
          size: "M",
          stock: 20 + index,
          ...common,
        },
        {
          id: baseVariantId + 2,
          sku: `DEMO-${product.id}-L`,
          price: basePrice + 40000,
          color: "White",
          size: "L",
          stock: 15 + index,
          ...common,
        },
      ];
    }),
);

data.beverages.push(
  { id: 3, beverageName: "Revive chai 500ml", thumbnailUrl: "https://example.com/images/beverages/revive-500ml.jpg", price: 18000, stock: 60, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 4, beverageName: "Aquarius chai 390ml", thumbnailUrl: "https://example.com/images/beverages/aquarius-390ml.jpg", price: 17000, stock: 55, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 5, beverageName: "Pocari Sweat chai 500ml", thumbnailUrl: "https://example.com/images/beverages/pocari-500ml.jpg", price: 22000, stock: 50, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 6, beverageName: "Nước dừa thể thao", thumbnailUrl: "https://example.com/images/beverages/coconut-sport.jpg", price: 25000, stock: 35, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 7, beverageName: "Trà đào lạnh B-Hub", thumbnailUrl: "https://example.com/images/beverages/peach-tea.jpg", price: 20000, stock: 45, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 8, beverageName: "Cà phê sữa đá B-Hub", thumbnailUrl: "https://example.com/images/beverages/iced-milk-coffee.jpg", price: 25000, stock: 40, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 9, beverageName: "Nước chanh muối B-Hub", thumbnailUrl: "https://example.com/images/beverages/salty-lemon.jpg", price: 18000, stock: 50, createdAt: demoTimestamp, updatedAt: demoTimestamp },
  { id: 10, beverageName: "Sữa đậu nành B-Hub", thumbnailUrl: "https://example.com/images/beverages/soy-milk.jpg", price: 15000, stock: 45, createdAt: demoTimestamp, updatedAt: demoTimestamp },
);

data.products = data.products.map((product) => {
  const plainDescription = product.description.trim();
  const category = data.categories.find((item) => item.id === product.categoryId);
  const categoryName = category?.menuGroup || category?.cateName || "Dụng cụ cầu lông";
  const brand = product.brand || "Đang cập nhật";

  return {
    ...product,
    description: plainDescription.startsWith("<")
      ? plainDescription
      : `<h2>${product.productName}</h2><p>${plainDescription}</p><p>Sản phẩm thuộc nhóm <strong>${categoryName}</strong>, phù hợp để trưng bày trong cửa hàng demo của B-Hub và kiểm thử các luồng xem chi tiết, chọn biến thể, thêm vào giỏ hàng, đặt mua và đánh giá sản phẩm.</p><h3>Điểm nổi bật</h3><ul><li>Thương hiệu: <strong>${brand}</strong>.</li><li>Thiết kế hướng đến người chơi cầu lông phong trào, học viên luyện tập và người chơi bán chuyên.</li><li>Dễ kết hợp với các phụ kiện khác trong cửa hàng như túi vợt, vớ, cước đan vợt, bình nước và khăn lau mồ hôi.</li><li>Dữ liệu có sẵn nhiều biến thể về màu sắc, size hoặc thông số để kiểm thử tồn kho theo từng chi nhánh.</li></ul><h3>Gợi ý sử dụng</h3><p>Người dùng có thể chọn sản phẩm này cho nhu cầu tập luyện hằng ngày, thi đấu giao lưu hoặc mua kèm khi đặt sân. Với các sản phẩm thời trang, nên chọn đúng size và màu sắc trong biến thể. Với vợt hoặc phụ kiện, có thể dùng phần mô tả này để bổ sung thông số kỹ thuật thật sau.</p><p><em>Ảnh hiện đang dùng link mẫu để seed dữ liệu. Khi đưa vào demo chính thức, bạn có thể thay bằng ảnh sản phẩm thật trong Cloudinary hoặc nguồn lưu trữ của dự án.</em></p>`,
  };
});
