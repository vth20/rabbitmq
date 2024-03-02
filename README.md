# Rabbitmq
list queue: `$ rabbitmqctl list_queues` \

**Note**
![AMQP Architecture](./assets/images/AMQP.png)
Exchange connect to the Queue by Binding and binding key.


Direct Exchange: \
`await channel.assertExchange('direct_exchange', 'direct', { durable: true });` \
Direct Exchange định tuyến tin nhắn dựa trên một routing key cụ thể.
Khi một tin nhắn được gửi tới Direct Exchange, nó sẽ được chuyển tới Queue có binding với Exchange đó và có routing key khớp với routing key của tin nhắn.
![Direct exchange](./assets/images/directex.png)

Fanout Exchange: \
`await channel.assertExchange('fanout_exchange', 'fanout', { durable: true });` \
Fanout Exchange gửi tin nhắn tới tất cả các Queue mà nó được binding với, mà không quan tâm đến routing key.
Điều này thích hợp cho các trường hợp khi một tin nhắn cần được gửi tới nhiều Queue mà không cần quan tâm đến nội dung của tin nhắn.
![Topic exchange](./assets/images/fanoutex.png)

Topic Exchange: \
`await channel.assertExchange('topic_exchange', 'topic', { durable: true });` \
Topic Exchange định tuyến tin nhắn dựa trên một mẫu hoặc pattern của routing key.
Khi một tin nhắn được gửi tới Topic Exchange, nó sẽ được chuyển tới các Queue có binding với Exchange đó và có routing key phù hợp với pattern được xác định trước.
![Topic exchange](./assets/images/topicex.png)

Headers Exchange: \
`await channel.assertExchange('headers_exchange', 'headers', { durable: true });` \
Headers Exchange định tuyến tin nhắn dựa trên các thuộc tính header của tin nhắn.
Headers Exchange cho phép định tuyến tin nhắn dựa trên các thuộc tính header cụ thể mà người dùng xác định.
![Headers exchange](./assets/images/headerex.png)

Default Exchange: \
Default Exchange là một Exchange có sẵn trong RabbitMQ mà tất cả các Queue đều được binding với nó mặc định.
Khi một tin nhắn được gửi tới Default Exchange và không có Exchange nào khác khớp với routing key, nó sẽ được gửi tới Queue được đặt tên giống với routing key.
![Default exchange](./assets/images/default.png)

**Core concepts**
>`Producer` emits messages to `exchange` \
>`Consumer` receives messages from `queue` \
>`Binding` connects an exchange with a queue using `binding key` \
>Exchange compares `routing key` with binding key \
>Messages distribution depends on `exchange type` \
>Exchange types: fanout, direct, topic and headers

## Prefetch trong RabbitMQ

Trong RabbitMQ, prefetch được sử dụng để kiểm soát số lượng tin nhắn mà một consumer có thể nhận từ một hàng đợi trước khi gửi lại acknowledgment. Điều này giúp kiểm soát tải của consumer và giảm nguy cơ quá tải hàng đợi.

### Prefetch Count
Prefetch count là số lượng tin nhắn tối đa mà một consumer có thể nhận từ hàng đợi trước khi gửi lại acknowledgment.

### Tác dụng của Prefetch
- **Giảm tải cho consumer**: Prefetch cho phép consumer chỉ nhận một lượng nhất định các tin nhắn từ hàng đợi một cách đồng thời, giúp giảm tải cho consumer trong trường hợp hàng đợi có nhiều tin nhắn đang chờ xử lý.
- **Tối ưu hóa hiệu suất**: Bằng cách kiểm soát số lượng tin nhắn được nhận cùng một lúc, prefetch có thể giúp tối ưu hóa hiệu suất của hệ thống bằng cách tránh tình trạng quá tải hoặc tắc nghẽn.

### Cấu hình Prefetch
Prefetch có thể được cấu hình trên mỗi consumer hoặc trên cấp độ kênh (channel) trong RabbitMQ.
- Trên mỗi consumer: Sử dụng phương thức `channel.prefetch(count, global)`, trong đó `count` là số lượng tin nhắn tối đa và `global` xác định xem prefetch áp dụng cho consumer cụ thể hay toàn bộ kết nối.
- Trên cấp độ kênh: Sử dụng phương thức `channel.prefetch(count, global)` với `global` được đặt thành `true`.

### Ví dụ:
```javascript
// Cấu hình prefetch count trên mỗi consumer
const channel = await connection.createChannel();
channel.prefetch(10); // Chỉ nhận tối đa 10 tin nhắn từ hàng đợi
```
## Time To Live (TTL) trong RabbitMQ

Trong RabbitMQ, "Time To Live" (TTL) là một thuộc tính được thiết lập cho tin nhắn trong hàng đợi, xác định thời gian mà tin nhắn được phép tồn tại trong hàng đợi trước khi bị loại bỏ.

### Tính chất của TTL
- **Độ tin cậy**: TTL cho phép đảm bảo rằng các tin nhắn không còn hữu ích sau một khoảng thời gian nhất định sẽ được loại bỏ khỏi hàng đợi, giúp làm sạch hàng đợi và giảm tải cho RabbitMQ.
- **Quản lý tài nguyên**: Bằng cách thiết lập TTL, bạn có thể quản lý tài nguyên hàng đợi một cách hiệu quả bằng cách loại bỏ các tin nhắn cũ không còn hữu ích.

### Cách sử dụng TTL
- **Thiết lập cho hàng đợi**: Bạn có thể thiết lập TTL cho toàn bộ hàng đợi, điều này áp dụng cho tất cả các tin nhắn trong hàng đợi mà không có TTL cụ thể.
- **Thiết lập cho từng tin nhắn**: Bạn cũng có thể thiết lập TTL cho từng tin nhắn cụ thể bằng cách bao gồm một thuộc tính TTL trong tiêu đề của tin nhắn.

### Ví dụ
```javascript
// Thiết lập TTL cho hàng đợi (milliseconds)
await channel.assertQueue('myQueue', { messageTtl: 60000 }); // TTL = 60s

// Thiết lập TTL cho từng tin nhắn (milliseconds)
const message = { content: 'Hello RabbitMQ!', expiration: 30000 }; // TTL = 30s
channel.sendToQueue('myQueue', Buffer.from(JSON.stringify(message)));
```

## Exclusive trong RabbitMQ

### Giải thích:
- **`exclusive`**: Nếu được đặt thành `true`, hàng đợi (queue) chỉ có thể được sử dụng bởi kết nối hiện tại. Điều này có nghĩa là chỉ có kết nối đó có thể gửi hoặc nhận tin nhắn từ hàng đợi đó. Khi kết nối đó đóng kết nối với hàng đợi, hàng đợi sẽ bị xóa. Điều này hữu ích khi bạn muốn tạo hàng đợi tạm thời chỉ dành cho một kết nối hoặc một phiên làm việc cụ thể.

### Lưu ý:
1. **Sử dụng trong các tình huống tạm thời**: Thuộc tính `exclusive` thường được sử dụng cho các hàng đợi tạm thời hoặc trong các tình huống mà bạn muốn đảm bảo rằng một hàng đợi chỉ có thể được sử dụng bởi một kết nối cụ thể.

2. **Không chia sẻ giữa nhiều kết nối**: Khi sử dụng `exclusive`, hãy nhớ rằng hàng đợi sẽ không thể chia sẻ giữa nhiều kết nối. Điều này có thể gây ra vấn đề nếu bạn cố gắng truy cập vào hàng đợi từ nhiều ứng dụng hoặc kết nối.

3. **Đóng kết nối khi không cần thiết**: Khi sử dụng `exclusive`, hãy chắc chắn rằng bạn đóng kết nối đến hàng đợi khi không cần thiết để giải phóng tài nguyên và tránh tình trạng hàng đợi bị lãng phí.

4. **Thường được sử dụng với hàng đợi tạm thời**: `exclusive` thường được sử dụng với hàng đợi tạm thời mà bạn muốn xóa khi kết thúc một phiên làm việc hoặc một kết nối cụ thể.

Trong RabbitMQ, việc sử dụng `exclusive` cần được xem xét cẩn thận và chỉ nên được áp dụng khi cần thiết.
### Ví dụ:
```javascript
// Tạo một hàng đợi tạm thời chỉ sử dụng bởi kết nối hiện tại
const { queue } = await channel.assertQueue('', { exclusive: true });
console.log(`Created temporary queue: ${queue}`);
```

## Sử dụng Wildcard trong Routing Key của RabbitMQ

Trong RabbitMQ, khi sử dụng loại sổ định tuyến `topic`, bạn có thể sử dụng `*` và `#` trong `routing key` để xác định các mẫu định tuyến khác nhau. Dưới đây là sự so sánh giữa hai ký tự này:

1. **`*` (Wildcard `*`)**:
   - Khi sử dụng `*` trong `routing key`, nó sẽ thay thế cho một từ (hay một phần của từ) trong `routing key`.
   - Ví dụ: `topic.*` sẽ khớp với `topic.message`, `topic.notification`, nhưng không khớp với `topic.message.alert`.
   - `*` chỉ đại diện cho một phần của `routing key`.

2. **`#` (Wildcard `#`)**:
   - Khi sử dụng `#` trong `routing key`, nó sẽ khớp với bất kỳ từ nào hoặc không có từ nào trong `routing key`.
   - Ví dụ: `topic.#` sẽ khớp với `topic.message`, `topic.message.alert`, `topic.notification`, và cả `topic` nếu không có từ phụ nào.
   - `#` có thể đại diện cho một hoặc nhiều phần của `routing key`.

Ví dụ cụ thể:

- `topic.*` sẽ khớp với tất cả các `routing key` bắt đầu bằng `topic.` và theo sau là một từ duy nhất.
- `topic.#` sẽ khớp với tất cả các `routing key` bắt đầu bằng `topic.` và có thể kết thúc ở đó hoặc tiếp tục với các từ/phần của từ phụ.

Tóm lại, `*` và `#` trong `routing key` cho phép bạn xác định các mẫu định tuyến linh hoạt, giúp bạn định tuyến tin nhắn đến các hàng đợi một cách chính xác theo yêu cầu của ứng dụng của bạn.
### Ví dụ
- [Topic](./tips//topic/)
