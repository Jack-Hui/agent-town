# 房子系统验证步骤（5分钟完成）

## 前置条件
- 项目已克隆：`git clone https://github.com/Jack-Hui/agent-town.git`
- 依赖已安装：`cd agent-town && bun install`

---

## 第1步：启动后端（30秒）

```bash
cd ai-town-fork
bun run dev:backend
```

**预期输出**：
```
Starting convex dev...
Server running on port 3210
```

---

## 第2步：初始化世界数据（30秒）

**新开一个终端窗口**，执行：

```bash
cd agent-town
npx convex run init
```

**预期输出**：
```
Created 5 agents with houses assigned
```

---

## 第3步：打开数据面板验证（2分钟）

在同一终端执行：

```bash
npx convex dashboard
```

**浏览器会自动打开**，地址类似：
```
https://dashboard.convex.dev/d/your-project/data
```

---

## 第4步：验证房子数据（1分钟）

在打开的 Dashboard 页面：

1. **点击左侧菜单「Data」**

2. **点击「houses」表**

3. **验证看到 5 条记录**：

| id | name | ownerAgentId |
|----|------|--------------|
| h:0 | Cozy Cottage | a:0 ✅ |
| h:1 | Garden House | a:1 ✅ |
| h:2 | Scholar Residence | a:2 ✅ |
| h:3 | Quiet Retreat | a:3 ✅ |
| h:4 | Woodland Home | a:4 ✅ |

**验证点**：`ownerAgentId` 列必须有值，不能为 null

---

## 第5步：验证 Agent 数据（1分钟）

在 Dashboard 页面：

1. **点击「worlds」表**

2. **点击唯一的那条记录**

3. **在 JSON 中找到 `agents` 数组，展开第一个 agent**：

```json
{
  "id": "a:0",
  "houseId": "h:0",      ← ✅ 关联了房子
  "homeLocation": {       ← ✅ 家的坐标
    "x": 15,
    "y": 20
  },
  "isAtHome": false       ← ✅ 在家状态
}
```

**验证点**：每个 agent 都有 `houseId`、`homeLocation`、`isAtHome` 字段

4. **在同个 JSON 中找到 `time` 字段**：

```json
"time": {
  "timeOfDay": 1234567,    ← ✅ 时间在工作
  "dayNumber": 1,
  "dayStartTimestamp": 1234567890
}
```

**验证点**：`time` 对象存在且 `timeOfDay` 是数字

---

## 第6步：验证游戏界面（可选，1分钟）

1. **浏览器打开**：http://localhost:5173

2. **点击地图上的任意一个小人**

3. **看右侧面板**：应显示 Agent 名字（如 "Lucky"）

4. **等待 1-2 分钟后观察**：
   - 晚上（20:00 后）小人会走向地图上方的房子区域
   - 到达后停住不动

---

## ✅ 验证通过标准

全部打勾即通过：

- [ ] houses 表有 5 条记录
- [ ] 每条记录的 ownerAgentId 不为空
- [ ] worlds 表的 agent 有 houseId 字段
- [ ] worlds 表的 agent 有 homeLocation 字段  
- [ ] worlds 表的 agent 有 isAtHome 字段
- [ ] worlds 表有 time 对象

---

## 🆘 常见问题

### 问题：houses 表为空
```bash
# 重置并重新初始化
npx convex run testing:resetWorld
npx convex run init
```

### 问题：ownerAgentId 为 null
确认先执行了 `npx convex run init` 再查看数据

### 问题：Dashboard 打不开
检查后端是否在运行（第1步的终端不能关）
