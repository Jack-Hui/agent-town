# 房子系统验证步骤

## 方式一：通过 Convex Dashboard 验证数据（推荐，3分钟）

### 1. 启动开发服务器
```bash
cd ai-town-fork
bun run dev:backend
```

### 2. 初始化世界数据
在另一个终端窗口执行：
```bash
npx convex run init
```

### 3. 打开 Convex Dashboard
```bash
npx convex dashboard
```

浏览器会自动打开 `https://dashboard.convex.dev/...`

### 4. 验证房子数据
1. 在左侧菜单点击 **"Data"** → **"houses"**
2. 应看到 **5 条房子记录**：
   - id: h:0, name: "Cozy Cottage", x: 5, y: 5
   - id: h:1, name: "Garden House", x: 20, y: 5
   - ...
3. 点击任意房子，确认 `ownerAgentId` 字段已分配给某个 agent

### 5. 验证 Agent 数据
1. 在 Data 页面点击 **"worlds"**
2. 点击唯一的 world 记录
3. 在 JSON 中找到 `agents` 数组
4. 确认每个 agent 都有：
   - `houseId`: 对应房子的 ID
   - `homeLocation`: {x, y} 坐标
   - `isAtHome`: false (初始状态)

---

## 方式二：观察 Agent 行为验证（5分钟）

### 1. 启动前端
```bash
cd ai-town-fork
bun run dev
```

### 2. 打开游戏界面
浏览器访问：**http://localhost:5173**

### 3. 创建 Agent（如果还没有）
```bash
npx convex run init
```

### 4. 观察 Agent 回家行为
1. 在游戏界面中，点击左上角的 **任意一个 Agent**（小人）
2. 在右侧详情面板中，应该能看到 Agent 的名字（如 "Lucky", "Bob"）
3. 等待游戏时间推进（约 1-2 分钟），或者：
   
   **加速时间测试（可选）**：
   ```bash
   # 修改 convex/aiTown/time.ts 中的 DAY_DURATION
   # 改为 60_000 (1分钟=1天) 以便快速看到效果
   ```

4. 观察 Agent 的行为变化：
   - **白天 (6:00-20:00)**：Agent 在地图上随机走动、对话
   - **晚上 (20:00 后)**：Agent 开始向自己的房子移动
   - **到达门口**：Agent 停在门位置，不再参与对话和活动

### 5. 验证回家行为
1. 点击一个 Agent
2. 观察它的移动路径
3. 晚上时它应该走向地图上的某个房子区域（房子大约在 x=5,20,35,50,65, y=5 的位置）

---

## 方式三：运行测试验证（1分钟）

```bash
# 在项目根目录
bun test
```

预期输出：
```
bun test v1.x.x

✓ convex/tests/schema.test.ts (2 tests)
  ✓ schema integrity
  ✓ table relationships

Test Files  1 passed
     Tests  2 passed
```

---

## 常见问题排查

### 看不到房子数据？
```bash
# 重置世界数据
npx convex run testing:resetWorld
# 重新初始化
npx convex run init
```

### Agent 不回家？
1. 确认时间系统在工作：检查 `worlds` 表中的 `time` 字段是否在更新
2. 确认 Agent 有分配房子：检查 `agents.houseId` 字段

### 构建失败？
```bash
# 安装依赖
bun install

# 重新构建
cd ai-town-fork && bun run build
```
