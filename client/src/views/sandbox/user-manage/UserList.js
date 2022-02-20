import React, { useState, useEffect, useRef } from 'react'
import { Button, Table, Modal, Switch } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import UserForm from '../../../components/user-manage/UserForm'
const { confirm } = Modal

export default function UserList() {
    const [dataSource, setdataSource] = useState([])
    const [isAddVisible, setisAddVisible] = useState(false)
    const [isUpdateVisible, setisUpdateVisible] = useState(false)
    const [roleList, setroleList] = useState([])
    const [regionList, setregionList] = useState([])
    const [current, setcurrent] = useState(null)

    const [isUpdateDisabled, setisUpdateDisabled] = useState(false)
    const addForm = useRef(null)
    const updateForm = useRef(null)
    
    // 获取用户登录信息
    const {roleId,region,username}  = JSON.parse(localStorage.getItem("token"))

    useEffect(() => {

        // 添加后端数据库后，roleId 是随机分配的，这里的1、2、3要对应修改成后端的Id
        const roleObj = {
            "1":"superadmin",
            "2":"admin",
            "3":"editor"
        }
        axios.get("/users?_expand=role").then(res => {
            const list = res.data

            // 根据当前登录身份，来选择性渲染用户界面 Table
            setdataSource(roleObj[roleId]==="superadmin"?list:[
                ...list.filter(item=>item.username===username),
                ...list.filter(item=>item.region===region&& roleObj[item.roleId]==="editor")
            ])
        })
    }, [roleId,region,username])

    useEffect(() => {
        axios.get("/regions").then(res => {
            const list = res.data
            setregionList(list)
        })
    }, [])

    useEffect(() => {
        axios.get("/roles").then(res => {
            const list = res.data
            setroleList(list)
        })
    }, [])

    const columns = [
        {
            title: '区域',
            dataIndex: 'region',
            filters: [
                ...regionList.map(item=>({
                    text:item.title,
                    value:item.value
                })),
                {
                    text:"全球",
                    value:"全球"
                }    

            ],

            onFilter:(value,item)=>{
                if(value==="全球"){
                    return item.region===""
                }
                return item.region===value
            },
          
            render: (region) => {
                return <b>{region === "" ? '全球' : region}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'role',
            render: (role) => {
                return role?.roleName
            }
        },
        {
            title: "用户名",
            dataIndex: 'username'
        },
        {
            title: "用户状态",
            dataIndex: 'roleState',
            render: (roleState, item) => {
                return <Switch checked={roleState} disabled={item.default} onChange={()=>handleChange(item)}></Switch>
            }
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} disabled={item.default} />

                    <Button type="primary" shape="circle" icon={<EditOutlined />} disabled={item.default} onClick={()=>handleUpdate(item)}/>
                </div>
            }
        }
    ];

    const handleUpdate = (item)=>{

        // 此处用 setTimeout，主要是让此处的 setisUpdateVisible
        // 能够同步更新 UpdateVisible 状态，也就是让 Modal 立刻 visible
        // 因为 Modal 不 visible 的话，在首次渲染时，底层 DOM 可能根本不存在？
        // 也就意味着子组件 Form 都还不存在，setFieldsValue 自然无法运行
        // 总之，就是要确保 setFieldsValue 的时候 Form 真实存在
        setTimeout(()=>{
            setisUpdateVisible(true)

            // 添加后端数据库后，roleId 是随机分配的，这里的1、2、3要对应修改成后端的Id
            
            // 这里需要手动检查预选结果是否应该禁用区域项，不然的话预选
            // 到管理员也不会禁用区域项，因为一般情况下只会在表单中选角色的时候 onChange
            // 才会进行检查并禁用区域项

            // 但还有一个特殊情况
            // 点了 Table 的 非管理员 item，setisUpdateDisabled(false)
            // 对于 UserForm 来说 props.isUpdateDisabled 从未定义变成 false 进而触发副作用 isDisabled false
            // 然后在 UserForm 表单上 角色项 选择 管理员，Select onChange 导致 isDisabled true
            // 点击 Modal 取消/更新，UserForm 仍然 isDisabled true
            // 再点 Table 的 非管理员 item，setisUpdateDisabled(false)，props.isUpdateDisabled 仍未 false
            // UserForm 副作用未触发，进而保持 isDisabled true，导致预设的 非管理员item 的表单区域项也被禁用
            // 通过在点击取消/更新后添加 setisUpdateDisabled(!isUpdateDisabled) 来解决
            if(item.roleId===1){
                //禁用
                setisUpdateDisabled(true)
            }else{
                //取消禁用
                setisUpdateDisabled(false)
            }
            
            // 由于是修改用户信息，在点击编辑的时候
            // 最好先将原来的用户信息显示在表单上
            updateForm.current.setFieldsValue(item)
        },0)

        setcurrent(item)
    }

    const handleChange = (item)=>{
        // console.log(item)
        item.roleState = !item.roleState
        setdataSource([...dataSource])

        axios.patch(`/users/${item.id}`,{
            roleState:item.roleState
        })
    }

    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除?',
            icon: <ExclamationCircleOutlined />,
            // content: 'Some descriptions',
            onOk() {
                //   console.log('OK');
                deleteMethod(item)
            },
            onCancel() {
                //   console.log('Cancel');
            },
        });

    }
    //删除
    const deleteMethod = (item) => {
        // console.log(item)
        // 当前页面同步状态 + 后端同步

        setdataSource(dataSource.filter(data=>data.id!==item.id))

        axios.delete(`/users/${item.id}`)
    }

    const addFormOK = () => {
        addForm.current.validateFields().then(value => {
            // console.log(value)

            setisAddVisible(false)

            addForm.current.resetFields()
            //post到后端，生成id，再设置 datasource, 方便后面的删除和更新
            axios.post(`/users`, {
                ...value,
                "roleState": true,
                "default": false,
            }).then(res=>{
                console.log(res.data)
                setdataSource([...dataSource,{
                    ...res.data,
                    role:roleList.filter(item=>item.id===value.roleId)[0]
                }])
            })
        }).catch(err => {
            console.log(err)
        })
    }

    const updateFormOK = ()=>{
        updateForm.current.validateFields().then(value => {
            // console.log(value)
            setisUpdateVisible(false)

            setdataSource(dataSource.map(item=>{
                if(item.id===current.id){
                    return {
                        ...item,
                        ...value,
                        role:roleList.filter(data=>data.id===value.roleId)[0]
                    }
                }
                return item
            }))
            setisUpdateDisabled(!isUpdateDisabled)

            axios.patch(`/users/${current.id}`,value)
        })
    }

    return (
        <div>
            <Button type="primary" onClick={() => {
                setisAddVisible(true)
            }}>添加用户</Button>
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 5
                }}
                rowKey={item => item.id}
            />

            <Modal
                visible={isAddVisible}
                title="添加用户"
                okText="确定"
                cancelText="取消"
                onCancel={() => {
                    setisAddVisible(false)
                }}
                onOk={() => addFormOK()}
            >
                <UserForm regionList={regionList} roleList={roleList} ref={addForm}></UserForm>
            </Modal>

            <Modal
                visible={isUpdateVisible}
                title="更新用户"
                okText="更新"
                cancelText="取消"
                onCancel={() => {
                    setisUpdateVisible(false)
                    setisUpdateDisabled(!isUpdateDisabled)
                }}
                onOk={() => updateFormOK()}
            >
                <UserForm regionList={regionList} roleList={roleList} ref={updateForm} isUpdateDisabled={isUpdateDisabled} isUpdate={true}></UserForm>
            </Modal>

        </div>
    )
}
