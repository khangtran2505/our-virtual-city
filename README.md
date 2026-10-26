# Our Virtual City — Ho Chi Minh

Web game 3D chơi trực tiếp trên Safari/Chrome điện thoại. Hai người cùng mở một URL HTTPS và nhập tên phòng `Ho Chi Minh`. Không cần cài ứng dụng.

## Triển khai để có link công khai

1. Đăng nhập GitHub, tạo repository và upload **nội dung thư mục `virtual-city`** (không upload ZIP như một file duy nhất).
2. Truy cập https://render.com, chọn New > Web Service và kết nối repository GitHub.
3. Render đọc `render.yaml` nếu chọn Blueprint, hoặc chọn Node, Build command `npm install`, Start command `npm start`.
4. Chờ deploy hoàn tất. Render cấp URL HTTPS, dạng `https://ten-ung-dung.onrender.com`. URL thực tế do Render cấp.
5. Gửi URL cho người thứ hai. Cả hai vào phòng `Ho Chi Minh` (server chuẩn hóa thành `HO-CHI-MINH`).

## Chạy local (chỉ dành cho người phát triển)
`npm install && npm start`, mở `http://localhost:3000`.

## Chức năng
3D Three.js; điều khiển joystick điện thoại; camera FPS/Front/TPS; lái xe đơn giản; minimap; chat realtime; 2 người/phòng; nhiệm vụ giao hàng +$50.

## Giới hạn
Đây là prototype, đồ họa low-poly chưa phải GTA realistic. Chưa có va chạm, giao thông AI, hệ thống tài khoản và chống gian lận đầy đủ. Dữ liệu tiền lưu trong `save.json` trên filesystem tạm thời, có thể mất khi hosting khởi động lại hoặc deploy; cần database cho lưu trữ lâu dài. Tên phòng không có xác thực, người biết tên phòng có thể tham gia. Hosting miễn phí có thể ngủ khi không sử dụng. WebGL và CDN Three.js cần Internet.
