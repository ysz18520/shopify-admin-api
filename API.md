# Coollaa 预约系统 API 文档

Base URL: `http://your-server:3000/api/coollaa`

---

## 1. 获取商家配置

获取预约系统的基本信息，包括时区、可选时长、会议方式等。前端初始化页面时调用。

**请求**

| 项目 | 内容 |
|------|------|
| 方法 | `GET` |
| 地址 | `/booking/config` |

**响应示例**

```json
{
  "timeZone": "Asia/Shanghai",
  "timeZoneName": "UTC +08:00 中国、中国香港、新加坡",
  "durationOptions": [30, 60],
  "intervalMinutes": 15,
  "meetingOptions": ["WhatsApp Call", "In-Person Appointment"]
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `timeZone` | string | 商家时区 |
| `timeZoneName` | string | 时区显示名称 |
| `durationOptions` | number[] | 可选时长（分钟），30 或 60 |
| `intervalMinutes` | number | 时间间隔（分钟），前端生成时段列表用 |
| `meetingOptions` | string[] | 会议方式选项 |

---

## 2. 查询某天可用时段

根据日期、时长、用户时区，返回当天所有可预约的时间段。已被预约、午休、过期、节假日等时段均不返回。

**请求**

| 项目 | 内容 |
|------|------|
| 方法 | `GET` |
| 地址 | `/booking/slots` |

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | string | 是 | 日期，格式 `yyyy-MM-dd`，商家时区日期 |
| `duration` | number | 是 | 时长，30 或 60 |
| `timezone` | string | 是 | 用户时区，如 `Asia/Shanghai`、`America/New_York` |

**请求示例**

```
GET /api/coollaa/booking/slots?date=2026-05-15&duration=30&timezone=Asia/Shanghai
```

**响应示例 - 有可用时段**

```json
{
  "date": "2026-05-15",
  "duration": 30,
  "slots": [
    {
      "utc": "2026-05-15T01:00:00.000Z",
      "localTime": "09:00",
      "localDate": "2026-05-15"
    },
    {
      "utc": "2026-05-15T01:15:00.000Z",
      "localTime": "09:15",
      "localDate": "2026-05-15"
    }
  ]
}
```

**响应示例 - 无可用时段（周末/节假日/已约满/过去日期）**

```json
{
  "date": "2026-05-15",
  "duration": 30,
  "slots": []
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `date` | string | 查询日期 |
| `duration` | number | 查询时长 |
| `slots` | array | 可用时段列表 |
| `slots[].utc` | string | UTC 时间（ISO 8601），创建预约时传 `startTime` 用 |
| `slots[].localTime` | string | 用户时区的时间，如 `09:00` |
| `slots[].localDate` | string | 用户时区的日期，跨天时可能不同 |

> **注意**：午休时间（12:00-14:00）和已被预约的时段不会出现在 `slots` 中。前端直接展示 `slots` 列表即可。

**错误响应**

| 状态码 | 说明 |
|--------|------|
| `400` | 缺少参数或 `duration` 不是 30/60 |
| `500` | 服务器内部错误 |

---

## 3. 创建预约

用户选定时段并填写信息后提交。

**请求**

| 项目 | 内容 |
|------|------|
| 方法 | `POST` |
| 地址 | `/booking` |
| Content-Type | `application/json` |

**Body 参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | string | 是 | 日期 `yyyy-MM-dd`（商家时区） |
| `startTime` | string | 是 | 开始时间 `HH:mm`（商家时区），如 `09:00` |
| `duration` | number | 是 | 时长，30 或 60 |
| `userTimezone` | string | 是 | 用户选择的时区 |
| `lastName` | string | 是 | 姓氏 |
| `firstName` | string | 否 | 名字 |
| `email` | string | 否 | 邮箱 |
| `company` | string | 是 | 公司名称 |
| `phone` | string | 是 | 电话号码 |
| `meetingType` | string | 是 | 会议方式，从配置中选取，如 `WhatsApp Call` |

**请求示例**

```json
{
  "date": "2026-05-15",
  "startTime": "09:00",
  "duration": 30,
  "userTimezone": "Asia/Shanghai",
  "lastName": "张",
  "firstName": "三",
  "email": "zhangsan@example.com",
  "company": "ABC公司",
  "phone": "13800138000",
  "meetingType": "WhatsApp Call"
}
```

**响应示例 - 成功**

```json
{
  "id": "cm8xxxxx",
  "site": "coollaa",
  "startTime": "2026-05-15T01:00:00.000Z",
  "endTime": "2026-05-15T01:30:00.000Z",
  "duration": 30,
  "lastName": "张",
  "firstName": "三",
  "email": "zhangsan@example.com",
  "company": "ABC公司",
  "phone": "13800138000",
  "meetingType": "WhatsApp Call",
  "userTimezone": "Asia/Shanghai",
  "status": "confirmed",
  "createdAt": "2026-05-13T08:30:00.000Z",
  "updatedAt": "2026-05-13T08:30:00.000Z"
}
```

**错误响应**

| 状态码 | 错误信息 | 说明 |
|--------|----------|------|
| `400` | `Missing required fields` | 缺少必填字段 |
| `400` | `duration must be 30 or 60` | 时长错误 |
| `400` | `不能预约已过期的时段` | 选择了过去的时间 |
| `409` | `该时段已被预约` | 提交时该时段刚被别人预约 |
| `500` | `Internal server error` | 服务器错误 |

---

## 4. 取消预约

```
PUT /coollaa/booking/:id/cancel
```

---

## 5. 管理后台 API

Base URL: `http://your-server:3000/api/admin`

所有接口（除登录外）需要在 Header 中携带：`Authorization: Bearer {token}`

### 5.1 管理员登录

```
POST /admin/login
Content-Type: application/json

{ "username": "admin", "password": "admin" }
```

**响应**：
```json
{
  "token": "xxx",
  "username": "admin",
  "role": "super",
  "site": "all"
}
```

**账号体系**：
| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `admin` | `admin` | `super` | 超管，可查看所有店铺 |
| `coollaa` | `coollaa` | `site` | 店铺管理员，只能看 coollaa 数据 |
| `longshade` | `longshade` | `site` | 店铺管理员，只能看 longshade 数据 |

### 5.2 预约列表

```
GET /admin/bookings?page=1&pageSize=10&status=confirmed&site=coollaa
```

### 5.3 取消预约

```
PUT /admin/bookings/:id/cancel
```

### 5.4 统计数据

```
GET /admin/stats?site=coollaa
```

**响应**：`{ "today": 0, "week": 0, "month": 0, "pending": 0, "total": 0 }`

### 5.5 可用性配置

```
GET /admin/availability?site=coollaa
PUT /admin/availability?site=coollaa
Body: { "availability": [...], "breaks": [...] }
```

### 5.6 特殊日期（节假日）

```
GET /admin/holidays?site=coollaa
POST /admin/holidays?site=coollaa       Body: { "date": "2026-01-01", "reason": "元旦" }
DELETE /admin/holidays/:id?site=coollaa
```

---

## 前端对接流程建议

1. **初始化**：调用 `GET /booking/config`，获取时区、时长选项、会议方式，渲染页面。
2. **选日期**：用户点击日历某天，调用 `GET /booking/slots?date=...&duration=...&timezone=...`，拿到可用时段列表渲染。
3. **选时段**：用户点击某个时段，记录 `startTime`（商家时区 `HH:mm`）和 `date`。
4. **填信息**：用户填写表单，进入确认页。
5. **提交**：调用 `POST /booking`，传入所有信息。成功则展示预约成功页，失败（409）提示时段已被预约，返回重新选择。

## 本地开发

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

服务运行在 `http://localhost:3000`。
