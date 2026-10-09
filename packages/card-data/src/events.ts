import type { EventCardDefinition } from "./types";

export const EVENT_CARDS: EventCardDefinition[] = [
  {
    id: "sete", originalName: "Sete", nameVi: "Cơn Khát",
    textVi: "Mỗi người chơi chỉ rút lá đầu tiên, không rút lá thứ hai, trong lượt rút bài của mình.",
    image: "/cards/events/sete.png", category: "event", effect: "negative",
  },
  {
    id: "roulette-russa", originalName: "Roulette Russa", nameVi: "Cò Quay Nga",
    textVi: "Khi Cò Quay Nga có hiệu lực, bắt đầu từ Cảnh Sát Trưởng, mỗi người lần lượt bỏ một lá MISSED!. Ai không bỏ thì mất 2 máu và vòng cò quay dừng lại.",
    image: "/cards/events/roulette-russa.png", category: "event", effect: "positive",
  },
  {
    id: "agguato", originalName: "Agguato", nameVi: "Mai Phục",
    textVi: "Khoảng cách giữa hai người chơi bất kỳ luôn là 1. Chỉ các lá bài đang trên bàn mới thay đổi được khoảng cách này.",
    image: "/cards/events/agguato.png", category: "event", effect: "positive",
  },
  {
    id: "sermone", originalName: "Sermone", nameVi: "Bài Giảng",
    textVi: "Không người chơi nào được dùng lá BANG! trong lượt của mình.",
    image: "/cards/events/sermone.png", category: "event", effect: "negative",
  },
  {
    id: "vendetta", originalName: "Vendetta", nameVi: "Báo Thù",
    textVi: "Cuối lượt của mình, mỗi người chơi lật một lá để kiểm tra: nếu là chất Cơ, người đó được chơi thêm một lượt nữa (nhưng không kiểm tra lại lần nữa).",
    image: "/cards/events/vendetta.png", category: "event", effect: "positive",
  },
  {
    id: "il-dottore", originalName: "Il Dottore", nameVi: "Bác Sĩ",
    textVi: "Khi Bác Sĩ có hiệu lực, (những) người chơi còn sống có ít máu nhất hồi lại 1 máu.",
    image: "/cards/events/il-dottore.png", category: "event", effect: "negative",
  },
  {
    id: "liquore-forte", originalName: "Liquore Forte", nameVi: "Rượu Mạnh",
    textVi: "Mỗi người chơi có thể bỏ qua lượt rút bài của mình để hồi lại 1 máu.",
    image: "/cards/events/liquore-forte.png", category: "event", effect: "positive",
  },
  {
    id: "corsa-all-oro", originalName: "Corsa all'Oro", nameVi: "Cơn Sốt Vàng",
    textVi: "Chơi một vòng ngược chiều kim đồng hồ, luôn bắt đầu từ Cảnh Sát Trưởng. Hiệu ứng của các lá bài vẫn tính theo chiều kim đồng hồ.",
    image: "/cards/events/corsa-all-oro.png", category: "event", effect: "negative",
  },
  {
    id: "il-treno", originalName: "Il Treno", nameVi: "Chuyến Tàu",
    textVi: "Mỗi người chơi rút thêm một lá vào cuối lượt rút bài của mình.",
    image: "/cards/events/il-treno.png", category: "event", effect: "negative",
  },
  {
    id: "i-dalton", originalName: "I Dalton", nameVi: "Anh Em Nhà Dalton",
    textVi: "Khi Anh Em Nhà Dalton có hiệu lực, người chơi nào có lá xanh dương trước mặt phải chọn một lá và bỏ đi.",
    image: "/cards/events/i-dalton.png", category: "event", effect: "negative",
  },
  {
    id: "fratelli-di-sangue", originalName: "Fratelli di Sangue", nameVi: "Anh Em Kết Nghĩa",
    textVi: "Đầu lượt của mình, mỗi người chơi có thể mất 1 máu (trừ máu cuối cùng) để trao 1 máu cho người chơi bất kỳ mình chọn.",
    image: "/cards/events/fratelli-di-sangue.png", category: "event", effect: "positive",
  },
  {
    id: "mezzogiorno-di-fuoco", originalName: "Mezzogiorno di Fuoco", nameVi: "Giờ Ngọ Đẫm Máu",
    textVi: "Mỗi người chơi mất 1 máu vào đầu lượt của mình.",
    image: "/cards/events/mezzogiorno-di-fuoco.png", category: "event", effect: "negative",
  },
  {
    id: "ranch", originalName: "Ranch", nameVi: "Trang Trại",
    textVi: "Cuối lượt rút bài, mỗi người chơi được một lần bỏ bao nhiêu lá tùy ý trên tay để rút lại đúng bấy nhiêu lá từ chồng bài.",
    image: "/cards/events/ranch.png", category: "event", effect: "positive",
  },
  {
    id: "il-giudice", originalName: "Il Giudice", nameVi: "Quan Tòa",
    textVi: "Không ai được đánh bài xanh dương / xanh lá trước mặt mình hoặc trước mặt người chơi khác.",
    image: "/cards/events/il-giudice.png", category: "event", effect: "positive",
  },
  {
    id: "benedizione", originalName: "Benedizione", nameVi: "Phước Lành",
    textVi: "Mọi lá bài đều được tính là chất Cơ.",
    image: "/cards/events/benedizione.png", category: "event", effect: "negative",
  },
  {
    id: "cecchino", originalName: "Cecchino", nameVi: "Xạ Thủ Bắn Tỉa",
    textVi: "Trong lượt của mình, người chơi có thể bỏ 2 lá BANG! cùng lúc để nhắm vào một người chơi: đòn này chỉ có thể hóa giải bằng 2 MISSED!.",
    image: "/cards/events/cecchino.png", category: "event", effect: "positive",
  },
  {
    id: "peyote", originalName: "Peyote", nameVi: "Xương Rồng Ảo Giác",
    textVi: "Thay vì rút bài, người chơi đoán màu của lá trên cùng chồng bài là Đỏ hay Đen. Sau đó lật lá bài: nếu đoán đúng thì giữ lá đó và được đoán tiếp; nếu sai thì không rút nữa.",
    image: "/cards/events/peyote.png", category: "event", effect: "positive",
  },
  {
    id: "sbornia", originalName: "Sbornia", nameVi: "Cơn Say",
    textVi: "Tất cả nhân vật mất khả năng đặc biệt của mình.",
    image: "/cards/events/sbornia.png", category: "event", effect: "negative",
  },
  {
    id: "citta-fantasma", originalName: "Città Fantasma", nameVi: "Thị Trấn Ma",
    textVi: "Trong lượt của mình, người chơi đã bị loại quay lại ván đấu dưới dạng hồn ma. Họ rút 3 lá thay vì 2 và không thể chết. Cuối lượt, họ bị loại trở lại.",
    image: "/cards/events/citta-fantasma.png", category: "event", effect: "negative",
  },
  {
    id: "per-un-pugno-di-carte", originalName: "Per un Pugno di Carte", nameVi: "Vì Một Nắm Bài",
    textVi: "Đầu lượt của mình, người chơi hứng chịu số lá BANG! bằng đúng số lá bài đang có trên tay.",
    image: "/cards/events/per-un-pugno-di-carte.png", category: "event", effect: "positive",
  },
  {
    id: "il-reverendo", originalName: "Il Reverendo", nameVi: "Mục Sư",
    textVi: "Không ai được đánh lá Beer.",
    image: "/cards/events/il-reverendo.png", category: "event", effect: "negative",
  },
  {
    id: "rimbalzo", originalName: "Rimbalzo", nameVi: "Đạn Lạc",
    textVi: "Người chơi có thể bỏ lá BANG! để bắn vào một lá bài đang nằm trước mặt người khác: lá đó bị bỏ đi nếu chủ nhân không đánh một lá MISSED! cho mỗi phát bắn.",
    image: "/cards/events/rimbalzo.png", category: "event", effect: "positive",
  },
  {
    id: "miniera-abbandonata", originalName: "Miniera Abbandonata", nameVi: "Mỏ Hoang",
    textVi: "Trong lượt rút bài, người chơi rút từ chồng bài bỏ; nếu chồng bài bỏ đã hết thì rút từ chồng bài chính. Trong lượt bỏ bài, người chơi đặt các lá bỏ úp mặt lên trên chồng bài chính.",
    image: "/cards/events/miniera-abbandonata.png", category: "event", effect: "positive",
  },
  {
    id: "sparatoria", originalName: "Sparatoria", nameVi: "Đấu Súng",
    textVi: "Mỗi người chơi được đánh lá BANG! thứ hai trong lượt của mình.",
    image: "/cards/events/sparatoria.png", category: "event", effect: "negative",
  },
  {
    id: "maledizione", originalName: "Maledizione", nameVi: "Lời Nguyền",
    textVi: "Mọi lá bài đều được tính là chất Bích.",
    image: "/cards/events/maledizione.png", category: "event", effect: "negative",
  },
  {
    id: "dead-man", originalName: "Dead Man", nameVi: "Người Chết Trở Lại",
    textVi: "Khi lá này có hiệu lực, người chơi bị loại đầu tiên quay lại ván đấu với 2 máu và 2 lá bài.",
    image: "/cards/events/dead-man.png", category: "event", effect: "positive",
  },
  {
    id: "lazo", originalName: "Lazo", nameVi: "Dây Thòng Lọng",
    textVi: "Mọi lá bài nằm trước mặt người chơi đều mất tác dụng.",
    image: "/cards/events/lazo.png", category: "event", effect: "positive",
  },
  {
    id: "legge-del-west", originalName: "Legge del West", nameVi: "Luật Miền Tây",
    textVi: "Ở lượt rút bài, mỗi người chơi phải lật ngửa lá bài thứ hai mình rút: nếu có thể đánh được, bắt buộc phải đánh lá đó.",
    image: "/cards/events/legge-del-west.png", category: "event", effect: "positive",
  },
];
