# Bao cao kiem thu tu dong - Chuong 6

Ngay thuc hien: 2026-06-06

## 1. Moi truong kiem thu

- Backend: Node.js, Express, Sequelize, MySQL.
- Test runner: Vitest.
- API testing: Supertest.
- Database test: `badminton_test`.
- File cau hinh test: `backend/.env.test`.
- Dich vu ngoai duoc mock: Redis/BullMQ, email, GHN, Socket.IO/realtime, Axios.
- Co che an toan: test chi chay khi `NODE_ENV=test` va `DB_NAME` ket thuc bang `_test`.

## 2. Ket qua tong hop

| Hang muc | Ket qua |
| --- | --- |
| Tong test case tu dong | 20 |
| Pass | 20 |
| Fail | 0 |
| Blocked | 0 |
| Lenh da chay | `npm test`, `npm run test:coverage` |
| Ket qua coverage | Statements 32.11%, Branches 7.99%, Functions 14.81%, Lines 33.72% |

## 3. Danh sach test case da tu dong hoa

| Ma TC | Chuc nang | Ket qua mong doi | Ket qua thuc te | Trang thai |
| --- | --- | --- | --- | --- |
| TC01 | Dang ky tai khoan | Tao user thanh cong | HTTP 201 | Pass |
| TC02 | Dang ky trung email | Tu choi email da ton tai | HTTP 409 | Pass |
| TC03 | Xac thuc OTP hop le | Xac thuc tai khoan thanh cong | HTTP 200 | Pass |
| TC04 | Dang nhap dung thong tin | Tra ve access token | HTTP 200 | Pass |
| TC05 | Dang nhap sai mat khau | Tu choi dang nhap | HTTP 400 | Pass |
| TC06 | Tao booking khung gio trong | Tao booking thanh cong | HTTP 201 | Pass |
| TC07 | Tao booking trung lich | Tu choi booking trung lich | HTTP 400 | Pass |
| TC08 | Thanh toan booking bang vi du so du | Tao giao dich vi thanh cong | HTTP 201 | Pass |
| TC09 | Thanh toan booking bang vi thieu so du | Tu choi thanh toan | HTTP 400 | Pass |
| TC10 | Tao don hang thanh cong | Tao order bang COD | HTTP 201 | Pass |
| TC11 | Tao don hang thieu ton kho | Tu choi checkout | HTTP 400 | Pass |
| TC12 | Nhan vien xac nhan booking hop le | Xac nhan thanh cong | HTTP 200 | Pass |
| TC13 | Nhan vien xu ly booking khac chi nhanh | Tu choi truy cap | HTTP 403 | Pass |
| TC14 | Manager tao san trong chi nhanh | Tao san dung chi nhanh | HTTP 201 | Pass |
| TC15 | Manager cap nhat san khac chi nhanh | Tu choi cap nhat | HTTP 404 | Pass |
| TC16 | Admin khoa/mo user | Cap nhat trang thai user | HTTP 200 | Pass |
| TC17 | User goi API admin | Tu choi phan quyen | HTTP 403 | Pass |
| TC18 | Duyet phieu nhap | Ton kho tang dung so luong | HTTP 200 va stock tang | Pass |
| TC19 | Rollback khi tao order that bai | Khong tao OrderGroup rac | HTTP 400 va count khong doi | Pass |
| TC20 | Callback VNPay sai chu ky | Tu choi callback | HTTP 400 | Pass |

## 4. Loi phat hien trong qua trinh lap test

- Du lieu test ban dau dung email domain `.test` khong qua validation Joi cua du an. Da doi sang domain hop le.
- Mat khau test ban dau thieu ky tu dac biet nen khong qua validation. Da doi sang `Password123!`.
- Duplicate email cua he thong tra `409 Conflict`, khong phai `400`. Test da cap nhat theo contract hien tai.
- Sai mat khau cua he thong tra `400 BadRequest`. Test da cap nhat theo contract hien tai.
- GHN/Redis/BullMQ can mock de khong phu thuoc service ngoai khi chay test.
- Test DB cu co the lam migration loi duplicate constraint. Da reset rieng database `_test` truoc khi chay migration.

## 5. Danh gia

Bo test da bao phu cac luong uu tien cua Chuong 6: khach hang, admin, manager, employee, API, database, transaction rollback, VNPay signature va tich hop mock GHN/realtime/email. Cac test da chay thuc te va dat 20/20.

Phan co the tiep tuc cai thien:

- Bo sung them test cho luong hoan/huy don, huy booking da xac nhan, check-in/check-out san.
- Tang coverage cho cac controller/service admin, manager va employee con it duong di duoc test.
- Them bao cao coverage dang HTML vao quy trinh CI.
- Giam log dotenv/error trong test output de ket qua gon hon.
