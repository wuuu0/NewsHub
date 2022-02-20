import React, { useEffect, useState } from 'react'
import Home from '../../views/sandbox/home/Home'
import Nopermission from '../../views/sandbox/nopermission/Nopermission'
import RightList from '../../views/sandbox/right-manage/RightList'
import RoleList from '../../views/sandbox/right-manage/RoleList'
import UserList from '../../views/sandbox/user-manage/UserList'
import { Switch, Route, Redirect } from 'react-router-dom'
import NewsAdd from '../../views/sandbox/news-manage/NewsAdd'
import NewsDraft from '../../views/sandbox/news-manage/NewsDraft'
import NewsCategory from '../../views/sandbox/news-manage/NewsCategory'
import Audit from '../../views/sandbox/audit-manage/Audit'
import AuditList from '../../views/sandbox/audit-manage/AuditList'
import Unpublished from '../../views/sandbox/publish-manage/Unpublished'
import Published from '../../views/sandbox/publish-manage/Published'
import Sunset from '../../views/sandbox/publish-manage/Sunset'
import axios from 'axios'
import NewsPreview from '../../views/sandbox/news-manage/NewsPreview'
import NewsUpdate from '../../views/sandbox/news-manage/NewsUpdate'
import {Spin } from 'antd'

import {connect} from 'react-redux'
const LocalRouterMap = {
    "/home": Home,
    "/user-manage/list": UserList,
    "/right-manage/role/list": RoleList,
    "/right-manage/right/list": RightList,
    "/news-manage/add": NewsAdd,
    "/news-manage/draft": NewsDraft,
    "/news-manage/category": NewsCategory,
    "/news-manage/preview/:id": NewsPreview,
    "/news-manage/update/:id": NewsUpdate,
    "/audit-manage/audit": Audit,
    "/audit-manage/list": AuditList,
    "/publish-manage/unpublished": Unpublished,
    "/publish-manage/published": Published,
    "/publish-manage/sunset": Sunset
}

function NewsRouter(props) {

    const [BackRouteList, setBackRouteList] = useState([])
    useEffect(() => {
        Promise.all([
            axios.get("/rights"),
            axios.get("/children"),
        ]).then(res => {

            // BackRouteList 对应的是完整的权限列表
            // console.log(res)
            setBackRouteList([...res[0].data, ...res[1].data])
            // console.log(BackRouteList)
        })
    }, [])


    // 根据用户登录信息，取出用户权限
    const { role: { rights } } = JSON.parse(localStorage.getItem("token"))

    // 检查权限是否对应路由组件；检查是否开启，对应我们此前的权限管理中的 switch 开关的功能
    const checkRoute = (item) => {
        return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
    }

    // 检查用户是否拥有路由权限
    const checkUserPermission = (item) => {
        return rights.includes(item.key)
    }

    return (
        <Spin size="large" spinning={props.isLoading}>
            <Switch>
                {
                    BackRouteList.map(item => {
                        if (checkRoute(item) && checkUserPermission(item)) {
                            return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact />
                        }
                        return null
                    }
                    )
                }

                <Redirect from="/" to="/home" exact />
                {
                    BackRouteList.length > 0 && <Route path="*" component={Nopermission} />
                }
            </Switch>
        </Spin>
    )
}

const mapStateToProps = ({LoadingReducer:{isLoading}})=>({
    isLoading
  })

export default connect(mapStateToProps)(NewsRouter)