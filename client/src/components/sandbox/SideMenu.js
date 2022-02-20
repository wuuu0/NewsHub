import React,{useEffect,useState} from 'react'
import { Layout, Menu } from 'antd';
import './index.css'
import {withRouter} from 'react-router-dom'
import {
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios'
import {connect} from 'react-redux'
const { Sider } = Layout;
const { SubMenu } = Menu

//模拟数组结构
// const  menuList = [
//   {
//     key:"/home",
//     title:"首页",
//     icon:<UserOutlined />
//   },
//   {
//     key:"/user-manage",
//     title:"用户管理",
//     icon:<UserOutlined />,
//     children:[
//       {
//         key:"/user-manage/list",
//         title:"用户列表",
//         icon:<UserOutlined />
//       }
//     ]
//   },
//   {
//     key:"/right-manage",
//     title:"权限管理",
//     icon:<UserOutlined />,
//     children:[
//       {
//         key:"/right-manage/role/list",
//         title:"角色列表",
//         icon:<UserOutlined />
//       },
//       {
//         key:"/right-manage/right/list",
//         title:"权限列表",
//         icon:<UserOutlined />
//       }
//     ]
//   }
// ]
const iconList = {
  "/home":<UserOutlined />,
  "/user-manage":<UserOutlined />,
  "/user-manage/list":<UserOutlined />,
  "/right-manage":<UserOutlined />,
  "/right-manage/role/list":<UserOutlined />,
  "/right-manage/right/list":<UserOutlined />
  //.......
}


function SideMenu(props) {
  const [meun, setMeun] = useState([])
  useEffect(()=>{

    // 获取完整的权限列表
    axios.get("/rights?_embed=children").then(res=>{
      console.log(res.data)

      // 获取到数据后根据数据构造 meun 数据
      setMeun(res.data)
    })
  },[])

  // 根据当前登录的用户信息，来获取用户可以使用的权限的列表
  // 用于后续渲染侧边栏时，同后端的完整权限列表作比较，看哪些该渲染出来
  const {role:{rights}} = JSON.parse(localStorage.getItem("token"))

  // 根据获取的用户权限和权限列表的papgepermission属性，进行路由权限管理
  const checkPagePermission = (item)=>{
    return item.pagepermisson && rights.includes(item.key)
  }
  const renderMenu = (menuList)=>{
    return menuList.map(item=>{
      if(item.children?.length>0 && checkPagePermission(item)){
        return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
           { renderMenu(item.children) }
        </SubMenu>
      }

      // js 语法，会先判断第一个的值，若为真则直接返回第二个值
      return checkPagePermission(item) && <Menu.Item key={item.key} icon={iconList[item.key]}  onClick={()=>{
        //  console.log(props)
        props.history.push(item.key)
      }}>{item.title}</Menu.Item>
    })
  }

  // console.log(props.location.pathname)
  const selectKeys = [props.location.pathname]
  const openKeys = ["/"+props.location.pathname.split("/")[1]]
  return (
    <Sider trigger={null} collapsible collapsed={props.isCollapsed} >
      <div style={{display:"flex",height:"100%","flexDirection":"column"}}>
        <div className="logo" >全球新闻发布管理系统</div>
        <div style={{flex:1,"overflow":"auto"}}>
          <Menu theme="dark" mode="inline" selectedKeys={selectKeys} className="aaaaaaa" defaultOpenKeys={openKeys}>
              {renderMenu(meun)}
          </Menu>
        </div>
      </div>
    </Sider>
  )
}
const mapStateToProps = ({CollApsedReducer:{isCollapsed}})=>({
  isCollapsed
})
export default connect(mapStateToProps)(withRouter(SideMenu))