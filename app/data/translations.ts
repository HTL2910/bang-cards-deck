/**
 * Bản dịch tiếng Việt cho Event cards.
 *
 * Nguồn: dịch từ phần chữ tiếng Anh in trên mỗi lá bài.
 * Đây KHÔNG phải bản dịch chính thức của nhà xuất bản — hãy chỉnh lại
 * thoải mái cho khớp cách gọi quen thuộc của nhóm bạn.
 *
 * `name`  — tên hiển thị dưới lá bài.
 * `text`  — mô tả hiệu ứng, sẽ overlay đè lên khung chữ gốc.
 *
 * Key phải khớp `id` trong EVENT_CARD_DEFS (app/data/cards.ts).
 */

export type EventCardText = {
  name: string;
  text: string;
};

export const EVENT_CARD_TEXT_VI: Record<string, EventCardText> = {
  sete: {
    name: "Cơn Khát",
    text: "Mỗi người chơi chỉ rút lá đầu tiên, không rút lá thứ hai, trong lượt rút bài của mình.",
  },
  "roulette-russa": {
    name: "Cò Quay Nga",
    text: "Khi Cò Quay Nga có hiệu lực, bắt đầu từ Cảnh Sát Trưởng, mỗi người lần lượt bỏ một lá MISSED!. Ai không bỏ thì mất 2 máu và vòng cò quay dừng lại.",
  },
  agguato: {
    name: "Mai Phục",
    text: "Khoảng cách giữa hai người chơi bất kỳ luôn là 1. Chỉ các lá bài đang trên bàn mới thay đổi được khoảng cách này.",
  },
  sermone: {
    name: "Bài Giảng",
    text: "Không người chơi nào được dùng lá BANG! trong lượt của mình.",
  },
  vendetta: {
    name: "Báo Thù",
    text: "Cuối lượt của mình, mỗi người chơi lật một lá để kiểm tra: nếu là chất Cơ, người đó được chơi thêm một lượt nữa (nhưng không kiểm tra lại lần nữa).",
  },
  "il-dottore": {
    name: "Bác Sĩ",
    text: "Khi Bác Sĩ có hiệu lực, (những) người chơi còn sống có ít máu nhất hồi lại 1 máu.",
  },
  "liquore-forte": {
    name: "Rượu Mạnh",
    text: "Mỗi người chơi có thể bỏ qua lượt rút bài của mình để hồi lại 1 máu.",
  },
  "corsa-all-oro": {
    name: "Cơn Sốt Vàng",
    text: "Chơi một vòng ngược chiều kim đồng hồ, luôn bắt đầu từ Cảnh Sát Trưởng. Hiệu ứng của các lá bài vẫn tính theo chiều kim đồng hồ.",
  },
  "il-treno": {
    name: "Chuyến Tàu",
    text: "Mỗi người chơi rút thêm một lá vào cuối lượt rút bài của mình.",
  },
  "i-dalton": {
    name: "Anh Em Nhà Dalton",
    text: "Khi Anh Em Nhà Dalton có hiệu lực, người chơi nào có lá xanh dương trước mặt phải chọn một lá và bỏ đi.",
  },
  "fratelli-di-sangue": {
    name: "Anh Em Kết Nghĩa",
    text: "Đầu lượt của mình, mỗi người chơi có thể mất 1 máu (trừ máu cuối cùng) để trao 1 máu cho người chơi bất kỳ mình chọn.",
  },
  "mezzogiorno-di-fuoco": {
    name: "Giờ Ngọ Đẫm Máu",
    text: "Mỗi người chơi mất 1 máu vào đầu lượt của mình.",
  },
  ranch: {
    name: "Trang Trại",
    text: "Cuối lượt rút bài, mỗi người chơi được một lần bỏ bao nhiêu lá tùy ý trên tay để rút lại đúng bấy nhiêu lá từ chồng bài.",
  },
  "il-giudice": {
    name: "Quan Tòa",
    text: "Không ai được đánh bài xanh dương / xanh lá trước mặt mình hoặc trước mặt người chơi khác.",
  },
  benedizione: {
    name: "Phước Lành",
    text: "Mọi lá bài đều được tính là chất Cơ.",
  },
  cecchino: {
    name: "Xạ Thủ Bắn Tỉa",
    text: "Trong lượt của mình, người chơi có thể bỏ 2 lá BANG! cùng lúc để nhắm vào một người chơi: đòn này chỉ có thể hóa giải bằng 2 MISSED!.",
  },
  peyote: {
    name: "Xương Rồng Ảo Giác",
    text: "Thay vì rút bài, người chơi đoán màu của lá trên cùng chồng bài là Đỏ hay Đen. Sau đó lật lá bài: nếu đoán đúng thì giữ lá đó và được đoán tiếp; nếu sai thì không rút nữa.",
  },
  sbornia: {
    name: "Cơn Say",
    text: "Tất cả nhân vật mất khả năng đặc biệt của mình.",
  },
  "citta-fantasma": {
    name: "Thị Trấn Ma",
    text: "Trong lượt của mình, người chơi đã bị loại quay lại ván đấu dưới dạng hồn ma. Họ rút 3 lá thay vì 2 và không thể chết. Cuối lượt, họ bị loại trở lại.",
  },
  "per-un-pugno-di-carte": {
    name: "Vì Một Nắm Bài",
    text: "Đầu lượt của mình, người chơi hứng chịu số lá BANG! bằng đúng số lá bài đang có trên tay.",
  },
  "il-reverendo": {
    name: "Mục Sư",
    text: "Không ai được đánh lá Beer.",
  },
  rimbalzo: {
    name: "Đạn Lạc",
    text: "Người chơi có thể bỏ lá BANG! để bắn vào một lá bài đang nằm trước mặt người khác: lá đó bị bỏ đi nếu chủ nhân không đánh một lá MISSED! cho mỗi phát bắn.",
  },
  "miniera-abbandonata": {
    name: "Mỏ Hoang",
    text: "Trong lượt rút bài, người chơi rút từ chồng bài bỏ; nếu chồng bài bỏ đã hết thì rút từ chồng bài chính. Trong lượt bỏ bài, người chơi đặt các lá bỏ úp mặt lên trên chồng bài chính.",
  },
  sparatoria: {
    name: "Đấu Súng",
    text: "Mỗi người chơi được đánh lá BANG! thứ hai trong lượt của mình.",
  },
  maledizione: {
    name: "Lời Nguyền",
    text: "Mọi lá bài đều được tính là chất Bích.",
  },
  "dead-man": {
    name: "Người Chết Trở Lại",
    text: "Khi lá này có hiệu lực, người chơi bị loại đầu tiên quay lại ván đấu với 2 máu và 2 lá bài.",
  },
  lazo: {
    name: "Dây Thòng Lọng",
    text: "Mọi lá bài nằm trước mặt người chơi đều mất tác dụng.",
  },
  "legge-del-west": {
    name: "Luật Miền Tây",
    text: "Ở lượt rút bài, mỗi người chơi phải lật ngửa lá bài thứ hai mình rút: nếu có thể đánh được, bắt buộc phải đánh lá đó.",
  },
};
