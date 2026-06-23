"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "seeders", "data", "static-seed-data.cjs");
const seedData = require(seedPath);

const branchProfiles = {
  1: {
    audience:
      "sinh viên khu Đại học Quốc gia, người trẻ tại Thủ Đức, nhân viên văn phòng và các câu lạc bộ thường xuyên tổ chức giao lưu",
    location:
      "nằm trên trục Lê Văn Chí, thuận tiện kết nối khu Linh Trung, khu Đại học Quốc gia và các khu dân cư lân cận",
    personality:
      "trẻ trung, năng động và phù hợp với nhịp luyện tập thường xuyên của cộng đồng người chơi phía Đông thành phố",
  },
  2: {
    audience:
      "nhân viên văn phòng, khách hàng làm việc tại khu trung tâm, nhóm bạn và người chơi muốn vận động sau giờ làm",
    location:
      "tọa lạc trên đường Nguyễn Thị Minh Khai, thuận tiện di chuyển từ các khu vực trung tâm và những tuyến đường lớn của Quận 1",
    personality:
      "hiện đại, thuận tiện và linh hoạt cho những lịch chơi ngắn trong ngày hoặc các buổi giao lưu buổi tối",
  },
  3: {
    audience:
      "người chơi tại Tân Bình, nhân viên khu văn phòng Cộng Hòa, nhóm bạn và các đội phong trào cần địa điểm tập luyện ổn định",
    location:
      "nằm trên đường Cộng Hòa, dễ tiếp cận từ khu vực sân bay, Hoàng Văn Thụ và các quận lân cận",
    personality:
      "thực dụng, sôi động và phù hợp cho cả tập luyện định kỳ lẫn những trận đấu giao lưu sau giờ làm",
  },
  4: {
    audience:
      "học sinh, sinh viên, gia đình trẻ, người chơi phong trào và các câu lạc bộ hoạt động tại khu vực Gò Vấp",
    location:
      "nằm trên trục Quang Trung, thuận tiện kết nối nhiều khu dân cư và tuyến giao thông chính của Gò Vấp",
    personality:
      "gần gũi, năng động và hướng đến việc xây dựng một điểm hẹn thể thao quen thuộc cho cộng đồng địa phương",
  },
  5: {
    audience:
      "cư dân Quận 7, nhân viên văn phòng, gia đình, nhóm bạn và người chơi tại khu đô thị phía Nam thành phố",
    location:
      "tọa lạc trên đường Nguyễn Thị Thập, thuận tiện di chuyển từ Tân Quy, Phú Mỹ Hưng và các khu vực lân cận",
    personality:
      "thoải mái, chỉn chu và phù hợp cho những buổi tập cá nhân, giao lưu đội nhóm hoặc hoạt động thể thao cuối tuần",
  },
};

const buildBranchDescription = (branch) => {
  const profile = branchProfiles[branch.id] || {
    audience: "người mới chơi, người chơi phong trào, nhóm bạn và câu lạc bộ",
    location: `nằm tại ${branch.address}, ${branch.districtName}`,
    personality: "thân thiện, hiện đại và thuận tiện",
  };
  const fullAddress = [
    branch.address.trim(),
    branch.wardName,
    branch.districtName,
    branch.provinceName,
  ]
    .filter(Boolean)
    .join(", ");

  return `<div class="space-y-6 text-gray-700 leading-relaxed">
  <div class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6">
    <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-600">B-Hub Badminton Center</p>
    <h2 class="text-3xl font-bold text-slate-900">${branch.branchName}</h2>
    <p class="mt-3 text-base"><strong>${branch.branchName}</strong> là tổ hợp cầu lông được phát triển theo mô hình “đặt sân, mua sắm và kết nối cộng đồng” tại cùng một địa điểm. Chi nhánh mang phong cách ${profile.personality}, phục vụ ${profile.audience}.</p>
  </div>

  <section>
    <h3 class="mb-2 text-xl font-bold text-sky-700">Vị trí thuận tiện, dễ sắp xếp lịch chơi</h3>
    <p>Chi nhánh ${profile.location}. Địa chỉ đầy đủ tại <strong>${fullAddress}</strong>, giúp khách hàng dễ chủ động lên lịch chơi trước giờ học, sau giờ làm hoặc vào cuối tuần.</p>
    <p class="mt-2">Thông qua hệ thống B-Hub, người chơi có thể xem lịch sân, lựa chọn ngày và khung giờ phù hợp, theo dõi lịch đã đặt và chuẩn bị thanh toán trên cùng một nền tảng. Cách vận hành này giúp giảm thời gian trao đổi thủ công và tạo trải nghiệm rõ ràng hơn cho cả khách lẻ lẫn đội nhóm.</p>
  </section>

  <div class="grid gap-4 md:grid-cols-2">
    <section class="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
      <h3 class="mb-3 text-lg font-bold text-emerald-700">Không gian dành cho cầu lông</h3>
      <ul class="list-disc space-y-2 pl-5">
        <li>Sân được tổ chức theo lịch đặt rõ ràng, phù hợp cho tập luyện và thi đấu giao lưu.</li>
        <li>Không gian hướng đến sự sạch sẽ, thoáng và thuận tiện khi di chuyển quanh sân.</li>
        <li>Phù hợp cho người mới chơi, người chơi phong trào và nhóm tập định kỳ.</li>
        <li>Hỗ trợ nhiều khung giờ để khách hàng linh hoạt sắp xếp theo lịch cá nhân.</li>
      </ul>
    </section>

    <section class="rounded-xl border border-amber-100 bg-amber-50 p-5">
      <h3 class="mb-3 text-lg font-bold text-amber-700">Tiện ích ngay tại chi nhánh</h3>
      <ul class="list-disc space-y-2 pl-5">
        <li>Khu vực mua sắm vợt, giày, quần áo, túi và phụ kiện cầu lông.</li>
        <li>Quầy nước phục vụ nhu cầu giải khát và bổ sung năng lượng sau khi vận động.</li>
        <li>Nhân viên hỗ trợ thông tin sân, đơn hàng và các nhu cầu phát sinh tại quầy.</li>
        <li>Hệ sinh thái tài khoản giúp theo dõi lịch sân, đơn hàng và hoạt động cá nhân.</li>
      </ul>
    </section>
  </div>

  <section>
    <h3 class="mb-2 text-xl font-bold text-sky-700">Đầy đủ dụng cụ cho một buổi chơi trọn vẹn</h3>
    <p>Bên cạnh dịch vụ sân, <strong>${branch.branchName}</strong> kết nối trực tiếp với khu vực sản phẩm của B-Hub. Khách hàng có thể tìm vợt, giày indoor, quần áo thể thao, quấn cán, cước đan vợt, cầu và các phụ kiện hỗ trợ khác. Việc mua sắm ngay trong hệ thống giúp người chơi chuẩn bị dụng cụ thuận tiện hơn và xử lý nhanh những tình huống phát sinh trước giờ vào sân.</p>
    <p class="mt-2">Danh mục sản phẩm được sắp xếp theo từng nhóm rõ ràng, có hình ảnh và thông tin mô tả để khách hàng dễ tham khảo. Các sản phẩm phù hợp có thể được đặt mua và theo dõi cùng với những tiện ích khác trên tài khoản B-Hub.</p>
  </section>

  <section>
    <h3 class="mb-2 text-xl font-bold text-sky-700">Không gian kết nối cộng đồng người chơi</h3>
    <p>B-Hub không chỉ hướng đến việc cung cấp sân theo giờ mà còn tạo môi trường để người chơi duy trì thói quen vận động, gặp gỡ bạn bè và kết nối với những người có cùng sở thích. Chi nhánh phù hợp cho các trận đấu giải trí, buổi tập kỹ thuật, hoạt động đội nhóm và những giải giao lưu quy mô câu lạc bộ.</p>
    <p class="mt-2">Sau khi chơi, khách hàng có thể nghỉ ngơi, dùng nước và trao đổi cùng đồng đội ngay tại khu vực phục vụ của chi nhánh. Sự kết hợp giữa thể thao, mua sắm và cộng đồng giúp mỗi lần đến sân trở thành một trải nghiệm liền mạch hơn.</p>
  </section>

  <section class="rounded-xl border border-slate-200 bg-slate-50 p-5">
    <h3 class="mb-2 text-lg font-bold text-slate-800">Thông tin liên hệ</h3>
    <p><strong>Địa chỉ:</strong> ${fullAddress}</p>
    <p class="mt-1"><strong>Điện thoại:</strong> ${branch.phoneNumber}</p>
    <p class="mt-3">Khách hàng nên kiểm tra lịch trống và đặt sân trước trên hệ thống B-Hub để lựa chọn được khung giờ phù hợp, đặc biệt vào buổi tối và cuối tuần.</p>
  </section>

  <p><strong>${branch.branchName}</strong> mong muốn trở thành điểm hẹn cầu lông đáng tin cậy tại ${branch.districtName}, nơi mỗi người chơi có thể dễ dàng đặt sân, chuẩn bị trang bị và tận hưởng thời gian vận động cùng cộng đồng.</p>
</div>`;
};

for (const branch of seedData.branches) {
  branch.description = buildBranchDescription(branch);
}

const output = `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`;
fs.writeFileSync(seedPath, output, "utf8");

console.log(`Đã cập nhật description cho ${seedData.branches.length} chi nhánh.`);
