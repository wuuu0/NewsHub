# NewsHub 说明文档

## 项目简介

本项目实现了一个新闻展示+后台管理网站。其中，前端基于 React + Redux + react-router-dom + Ant Design 搭建；后端基于轻服务 express 框架搭建。项目演示地址： [https://qcigwi.app.cloudendpoint.cn](https://qcigwi.app.cloudendpoint.cn)（测试账号：admin 密码：123456）

## 项目初始化

### 前端

进入 /client 文件夹

使用 yarn 安装相关依赖包
```bash
yarn install
```

安装完后运行
```bash
yarn start
```

待编译完成打开 http://localhost:3000/ 即可访问网页

关于访问服务端：服务端地址设置为 http://localhost:8080

仅测试前端不运行后端时，可运行 Json Server 模拟后端。

```bash
# 安装 json-server
npm i -g json-server

# 于 /server/.backup 路径下运行
json-server --watch db.json --port 8080
```

### 后端

安装轻服务脚手架
```bash
yarn global add @byteinspire/cli
```

按照指示登录轻服务账号
```bash
inspire login
```

进入 /server 文件夹，按照指示初始化项目（选择以现有项目初始化，受邀进入轻服务团队后可关联团队项目）
```bash
inspire init
```

以开发环境运行
```bash
inspire dev
```

部署
```bash
inspire deploy -m "A Message"
```

## 功能需求&项目架构

### 前端

1. 前端需求和数据请求关系

<div align="center">
<img src="https://s2.loli.net/2022/02/19/IB35YnE1RiWUjMw.png" width=90%>
</div>

2. 前端路由结构

<div align="center">
  <img src="https://s2.loli.net/2022/02/11/DR3PBFC48jlXKcm.png" width=70%>
</div>

3. 前端权限管理

- 权限列表```rights```是最根本的列表，它保存了网址的所有权限。侧边栏根据它来渲染导航项，内容区根据它来添加路由组件。可以直接在这个层级上进行统一的权限开关。

- 用户系统和角色系统编辑维护```users```和```roles```两个列表。届时，要先获取用户信息和其角色信息——包含一个存放角色权限信息的数组。路由在侧边栏```SideMenu```渲染的时候，以角色权限数组和后端权限列表作比较，来确定是否渲染对应的侧边栏项。关闭侧边栏导航远远不够，为了防止用户直接在地址栏输入相应路由，还需要在编写内容去区```Content```时，检查用户的角色权限数组，来决定是否添加相应的路由组件。

- 所谓权限管理：都是通过编辑后端相应的列表数据来实现的。而真正的让权限管理生效，则是通过在前端业务逻辑中，对比用户登录数据和后端数据，来决定是否渲染相应内容来实现——是否渲染侧边栏对应路由权限，是否渲染具体页面中的小组件或下拉栏选项对应非路由权限。

  - 路由权限：① 针对第一点修改```rights```表，可以控制```SideMenu``` ```Content```从后端获取的数据进而在前端隐藏相应导航项或路由组件；② 针对第二点修改```roles``` ```users```表，可以控制用户角色，以及特定角色从后端获取到的```roles```表，在渲染```SideMenu```和构建```Content```的时候通过逻辑给绕过某些导航项或路由组件。
  
  - 非路由权限：① 后台管理页面-用户列表页面：“添加用户”“修改用户”功能，会根据当前用户角色权限来做一定的限制。```UserList``` 根据登录用户角色权限，渲染了有限的用户```Table```项；```UserForm```根据登录用户角色权限，让 添加/修改用户 的表单中，只能创建有限种类的区域和角色的用户。② 后台管理页面-新闻、审核、发布管理页面：都需要核验用户登录信息，检查其权限，来确定哪些```Table```项应该被渲染。

### 后端

1. 接口 API

详见 ```/doc/api.md```

```
users
| - get
    | - /
        | - queryString:
            | - username
            | - password
            | - roleState
            | - _expand=role
| - post
    | - /
| - patch
    | - /:id
| - delect
    | - /:id

roles
| - get
    | - /
| - patch
    | - /:id
| - delect
    | - /:id

children
| - get
    | - /
| - patch
    | - /:id
| - delect
    | - /:id

rights
| - get
    | - /
        | - queryString:
            | - _embed = children
| - patch
    | - /:id
| - delect
    | - /:id

categories
| - get
    | - /
| - patch
    | - /:id
| - delect
    | - /:id

regions
| - get
    | - /

news
| - get
    | - /:id
        | - queryString:
            | - _expand=category
            | - _expand=role
    | - /
        | - queryString
            | - publishState
            | - author=${username}
            | - auditState=1
            | - _expand=category
            | - _sort=view
            | - _order=desc
            | - _limit=6
| - post
    | - /
| - patch
    | - /:id
| - delect
    | - /:id
```

2. 数据库设计

- rights

| 字段名        | 数据类型 | 说明                           |
| ------------- | -------- | ------------------------------ |
| id            | Number   | 权限Id                         |
| title         | String   | 权限名/侧边栏导航项标题        |
| key           | String   | 路由地址当作key                |
| pagepermisson | Number   | 开关状态，用于判断权限是否可用 |
| grade         | Number   | 权限层级（默认1）              |

- children

| 字段名        | 数据类型 | 说明                                                     |
| ------------- | -------- | -------------------------------------------------------- |
| id            | Number   | 权限Id                                                   |
| title         | String   | 权限名/导航项标题/功能名称                               |
| rightId       | Number   | 对应一级权限的Id                                         |
| key           | String   | 路由地址当作key                                          |
| pagepermisson | Number   | 开关状态，用于判断权限是否可用；<br>非路由权限没有此字段 |
| grade         | Number   | 权限层级（默认2）                                        |

- users

| 字段名    | 数据类型 | 说明                           |
| --------- | -------- | ------------------------------ |
| id        | Number   | 用户Id                         |
| username  | String   | 用户名                         |
| password  | String   | 密码                           |
| roleState | Bool     | 开关状态，用于判断用户是否可用 |
| default   | Bool     | 用于判断用户是否可编辑         |
| region    | String   | 用户地区                       |
| roleId    | Number   | 用户角色的Id                   |

- roles

| 字段名   | 数据类型     | 说明                                 |
| -------- | ------------ | ------------------------------------ |
| id       | Number       | 角色Id                               |
| roleName | String       | 角色名称                             |
| roleType | Number       | 角色类型                             |
| rights   | Array-String | 角色权限列表，<br>权限用路由地址表示 |

- categories

| 字段名 | 数据类型 | 说明               |
| ------ | -------- | ------------------ |
| id     | Number   | 文章类别Id         |
| title  | String   | 文章类别标题       |
| value  | String   | 文章类别值（备用） |

- regions

| 字段名 | 数据类型 | 说明           |
| ------ | -------- | -------------- |
| id     | Number   | 地区Id         |
| title  | String   | 地区标题       |
| value  | String   | 地区值（备用） |

- news

| 字段名       | 数据类型 | 说明              |
| ------------ | -------- | ----------------- |
| id           | Number   | 文章Id            |
| title        | String   | 文章标题          |
| categoryId   | Number   | 文章类别Id        |
| content      | String   | 文章内容-html格式 |
| region       | String   | 文章作者所在区域  |
| author       | String   | 作者用户名        |
| roleId       | Number   | 作者角色Id        |
| auditState   | Number   | 审核状态          |
| publishState | Number   | 发布状态          |
| createTime   | Number   | 创建时间          |
| star         | Number   | 获赞数            |
| view         | Number   | 浏览数            |
| publishTime  | Number   | 发表时间          |

