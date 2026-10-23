# Rule

Các rule cần tuân theo

1. Cấu trúc và Markdown

   * Sử dụng đúng Markdown để phân cấp tiêu đề (H1 `#`, H2 `##`). H1 sẽ dùng làm tiêu đề bài viết. Hạn chế dùng tiếng anh trong heading này. Nếu nó là thuật ngữ không nên dịch/dịch không rõ nghĩa thì được phép giữ tiếng anh.
   * Tuyệt đối không chèn thêm mã HTML, widget, hay các thành phần hiển thị rác ngoài văn bản thô (Markdown).

2. Hình ảnh và Chú thích (Caption)

   * Xóa bỏ mọi số thứ tự của hình ảnh (ví dụ: đổi "Hình 7.8" thành `*Hình: ...*`).
   * Caption ảnh phải cực kỳ ngắn gọn, đúng trọng tâm (chỉ giữ đúng 1 câu mô tả).

3. Các khối chú ý (Callout Blocks)

   * Sử dụng cú pháp blockquote chuẩn xác cho các phần đặc biệt và **không kèm số thứ tự**:
   * Ví dụ: `> [!Example] Ví dụ`
   * Định nghĩa: `> [!Definition] Định nghĩa`
   * Nhận xét/Lưu ý: `> [!Remark] Nhận xét` hoặc `> [!Remark] Lưu ý`

4. Xử lý thuật ngữ tiếng Anh và In đậm

   * **In đậm** các khái niệm, thuật ngữ chuyên ngành quan trọng ở **lần xuất hiện đầu tiên**.
   * Giữ lại thuật ngữ tiếng Anh gốc trong ngoặc đơn ở **lần xuất hiện đầu tiên** đi kèm với từ in đậm (ví dụ: **tối ưu toàn cục** (global optimality)).
   * **Không** lặp lại tiếng Anh ở các lần xuất hiện sau của cùng một từ để tránh rườm rà, rối mắt.
   * **Không** dịch và chèn tiếng Anh đối với các từ mang tính chất mô tả thông thường hoặc nghĩa đen (không làm kiểu "cắt bớt (truncate)" hay "đổ đầy (filling in)").
   * Giữ nguyên tiếng Anh đối với các thuật ngữ toán học đặc thù không nên dịch khiên cưỡng (ví dụ: affine, supremum).
   * Quan trọng nhất: Nếu dịch thì phải đúng nghĩa với ngữ cảnh hiện tại của các post blog về Machine Learning, Deep Learning, AI, không được phép nhầm lẫn.

5. Tham chiếu và Đánh số

   * Loại bỏ toàn bộ đánh số của phương trình, định nghĩa, ví dụ (ví dụ: (7.45), Ví dụ 7.7).
   * Nếu trong bài có tham chiếu đến các chương/phần khác (ví dụ: "Chương 12", "Phần 7.2"), phải khái quát hóa thành "phần sau", "phần trước", "chương sau".
   * **Tuyệt đối không được xóa nguyên câu** chỉ vì trong câu đó có chứa tham chiếu đến chương khác. Phải giữ nguyên câu và chỉ sửa lại từ khóa tham chiếu.

6. Giao tiếp

   * Không giải thích dông dài, không xin lỗi lặp đi lặp lại.
   * Có thể mở lời ngắn gọn 1-2 câu để xác nhận nếu cần, sau đó in ra ngay kết quả đúng chuẩn.
   * Trả về nội dung đã được bọc \`\`\`markdown \`\`\`
