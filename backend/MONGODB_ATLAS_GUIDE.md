# MongoDB Atlas 云端数据库配置指南

## 为什么使用云端数据库？

使用 MongoDB Atlas (云端数据库) 有以下优势：

- ✅ 无需本地安装 MongoDB
- ✅ 自动备份和恢复
- ✅ 高可用性和可扩展性
- ✅ 全球分布式部署
- ✅ 免费层级可用于开发

## 配置步骤

### 1. 创建 MongoDB Atlas 账户

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册免费账户
3. 创建新的集群 (Cluster)

### 2. 获取连接字符串

1. 在 Atlas 控制台中，点击 "Connect"
2. 选择 "Connect your application"
3. 复制连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

### 3. 配置环境变量

在 `.env` 文件中替换 `MONGODB_URI`：

```env
# 替换 <db_username> 和 <db_password> 为你的实际凭据
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.rl0jvlr.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=Cluster0
```

### 4. 网络访问配置

1. 在 Atlas 控制台中，进入 "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow access from anywhere" (开发环境) 或添加你的特定 IP

### 5. 数据库用户配置

1. 在 Atlas 控制台中，进入 "Database Access"
2. 创建数据库用户
3. 设置用户名和密码
4. 给予 "Read and write to any database" 权限

## 测试连接

### 方法 1: 使用我们的测试脚本

```bash
npm run test-atlas
```

### 方法 2: 使用原生 MongoDB 驱动测试

```bash
node test-atlas.js
```

## 切换数据库

### 使用云端数据库

在 `.env` 文件中设置：

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=Cluster0
```

### 使用本地数据库

在 `.env` 文件中设置：

```env
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
```

## 数据迁移

如果你已经有本地数据，可以使用以下方法迁移到云端：

### 1. 导出本地数据

```bash
mongodump --db online-learning-platform --out ./backup
```

### 2. 导入到 Atlas

```bash
mongorestore --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/online-learning-platform" ./backup/online-learning-platform
```

### 3. 或者重新运行种子脚本

```bash
npm run seed
```

## 常见问题

### 1. 连接超时

- 检查网络访问白名单
- 确认用户名和密码正确

### 2. 认证失败

- 验证数据库用户凭据
- 检查用户权限设置

### 3. 数据库不存在

- 数据库会在首次写入时自动创建
- 确认连接字符串中的数据库名称

## 示例配置

完整的 `.env` 配置示例：

```env
# Environment variables
NODE_ENV=development
PORT=5000

# Local MongoDB (uncomment to use local database)
# MONGODB_URI=mongodb://localhost:27017/online-learning-platform

# Cloud MongoDB Atlas (replace with your actual credentials)
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.rl0jvlr.mongodb.net/online-learning-platform?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production
JWT_EXPIRE=30d
```

## 安全建议

1. **不要在代码中硬编码密码**
2. **使用强密码**
3. **限制网络访问** (生产环境中不要使用 "Allow access from anywhere")
4. **定期轮换密码**
5. **使用环境变量**管理敏感信息

## 监控和管理

Atlas 提供了强大的监控功能：

- 实时性能指标
- 查询分析
- 索引建议
- 自动备份

通过 Atlas 控制台可以轻松管理你的数据库。
