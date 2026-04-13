// utils/password.ts
export const getStrengthBlocks = (pwd: string) => {
  let score = 0;

  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  // Tạo 4 block cho 4 cấp độ
  const blocks = [false, false, false, false];

  if (score <= 1) blocks[0] = true; // Yếu
  if (score === 2 || score === 3) {
    blocks[0] = blocks[1] = true; // Trung bình
  }
  if (score === 4) {
    blocks[0] = blocks[1] = blocks[2] = true; // Mạnh
  }
  if (score === 5) {
    blocks.fill(true); // Rất mạnh
  }

  // Xác định level + color
  let level = "Yếu";
  let color = "bg-red-500";

  const activeCount = blocks.filter(Boolean).length;
  if (activeCount === 2) {
    level = "Trung bình";
    color = "bg-yellow-400";
  } else if (activeCount === 3) {
    level = "Mạnh";
    color = "bg-green-400";
  } else if (activeCount === 4) {
    level = "Rất mạnh";
    color = "bg-green-600";
  }

  return { blocks, level, color };
};
