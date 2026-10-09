# BANG! Deck Modules

Monorepo gồm bốn website độc lập hỗ trợ chơi BANG! trực tiếp trên điện thoại. Mỗi website quản lý một bộ bài trên thiết bị hiện tại; không có tài khoản, backend, phòng chơi hay đồng bộ giữa người chơi.

## Cấu trúc

```text
apps/
  character-deck/  Rút nhân vật và theo dõi máu
  role-deck/       Rút vai trò riêng tư cho bàn 4–7 người
  play-deck/       Quản lý chồng rút, bài trên tay, bài đang dùng và chồng bỏ
  event-deck/      Rút thẻ sự kiện và xem lịch sử
packages/
  deck-core/       Các phép toán bộ bài và persistence thuần TypeScript
  card-data/       Metadata, số lượng và bản dịch thẻ
  shared-ui/       Component trình bày dùng chung
```

Các app không phụ thuộc lẫn nhau. Một sản phẩm hợp nhất trong tương lai có thể dùng trực tiếp ba package chung mà không phải viết lại deck engine hoặc catalog.

## Yêu cầu và cài đặt

- Node.js 24 trở lên
- npm 11 trở lên

```bash
npm ci
```

## Chạy phát triển

| Website | Lệnh | Địa chỉ |
| --- | --- | --- |
| Character Deck | `npm run dev:character` | `http://localhost:5173` |
| Role Deck | `npm run dev:role` | `http://localhost:5174` |
| Play Deck | `npm run dev:play` | `http://localhost:5175` |
| Event Deck | `npm run dev:event` | `http://localhost:5176` |

## Kiểm chứng và build

```bash
npm test
npm run typecheck
npm run build
```

Mỗi app cũng có thể được kiểm tra hoặc build riêng:

```bash
npm run typecheck --workspace @bang/character-deck
npm run build --workspace @bang/character-deck
```

Thay `character-deck` bằng `role-deck`, `play-deck` hoặc `event-deck`. Build production nằm tại:

- `apps/character-deck/build/`
- `apps/role-deck/build/`
- `apps/play-deck/build/`
- `apps/event-deck/build/`

Sau khi build, chạy riêng từng app bằng `npm run start:character`, `npm run start:role`, `npm run start:play` hoặc `npm run start:event`.

Dockerfile nhận build argument `TARGET` (`character-deck`, `role-deck`, `play-deck`, hoặc mặc định `event-deck`):

```bash
docker build --build-arg TARGET=event-deck -t bang-event .
docker run --rm -p 3000:3000 bang-event
```

## Dữ liệu cục bộ

Trạng thái được kiểm tra phiên bản và lưu bằng `localStorage` riêng cho từng app:

- `bang.character.v1`
- `bang.role.v1`
- `bang.play.v1`
- `bang.play.settings.v1`
- `bang.event.v1`

Dữ liệu không rời khỏi trình duyệt và không được chia sẻ giữa domain hoặc thiết bị. Nếu dữ liệu cũ hay hỏng, app tự tạo trạng thái hợp lệ mới. Các luật, mục tiêu, sát thương, năng lực nhân vật và thưởng máu Cảnh Sát Trưởng vẫn do người chơi áp dụng thủ công.

Tên và mô tả tiếng Việt là bản dịch không chính thức. Artwork gốc được giữ nguyên khi có thể và có fallback chữ nếu ảnh không tải được.

## Asset nguồn

Thư mục `/Bang/` là kho nguồn cục bộ lớn và bị loại khỏi Git. Repository chỉ chứa đúng artwork được catalog tham chiếu trong `apps/*/public/cards/`: 16 Nhân vật, 4 Vai trò, 22 loại bài chơi và 28 Sự kiện.
