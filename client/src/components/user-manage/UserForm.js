import React, { forwardRef,useEffect,useState } from 'react'
import {Form,Input,Select} from 'antd'
const {Option}  = Select
const UserForm = forwardRef((props,ref) => {

    // 用于判断 “区域” 输入框是否禁用，对应管理员身份
    const [isDisabled, setisDisabled] = useState(false)
    
    // 为什么要用副作用来更新状态？props.isUpdateDisabled 改变时
    // UserForm 不是会自动更新吗？
    // 因为我们之前已经为 UserForm 设计了 isDisabled状态
    // 所以我们现在要做的是勾连父子组件状态，而不能简单用子组件的props
    // 要注意，一定是 props.isUpdateDisabled 前后两次改变了才会触发副作用
    useEffect(()=>{
        setisDisabled(props.isUpdateDisabled)
    },[props.isUpdateDisabled])

    // 添加后端数据库后，roleId 是随机分配的，这里的1、2、3要对应修改成后端的Id
    // 前端不会添加修改后端 roles Id、name 等属性，所以这个映射关系可以写死
    // 但后端可能会修改，修改时需要告知我们，然后我们做调整
    const {roleId,region}  = JSON.parse(localStorage.getItem("token"))
    const roleObj = {
        "1":"superadmin",
        "2":"admin",
        "3":"editor"
    }
    const checkRegionDisabled = (item)=>{
        if(props.isUpdate){
            if(roleObj[roleId]==="superadmin"){
                return false
            }else{
                return true
            }
        }else{
            if(roleObj[roleId]==="superadmin"){
                return false
            }else{
                return item.value!==region
            }
        }
    }

    // 检查当前用户角色权限，开放相应的区域选项
    const checkRoleDisabled = (item)=>{
        if(props.isUpdate){
            if(roleObj[roleId]==="superadmin"){
                return false
            }else{
                return true
            }
        }else{
            if(roleObj[roleId]==="superadmin"){
                return false
            }else{
                return roleObj[item.id]!=="editor"
            }
        }
    }

    return (
        <Form
            ref={ref}
            layout="vertical"
        >
            <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="region"
                label="区域"
                rules={isDisabled?[]:[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Select disabled={isDisabled}>
                    {
                        props.regionList.map(item =>
                            <Option value={item.value} key={item.id} disabled={checkRegionDisabled(item)}>{item.title}</Option>
                        )
                    }
                </Select>
            </Form.Item>
            <Form.Item
                name="roleId"
                label="角色"
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Select onChange={(value)=>{
                    // console.log(value)
                    // 添加后端后，1要改成后台的Id
                    // 绑定在表单角色项 onChange 事件上，也就意味着
                    // 得选了角色才会去检查是否应该禁用区域项
                    if(value === 1){
                        setisDisabled(true)
                        ref.current.setFieldsValue({
                            region:""
                        })
                    }else{
                        setisDisabled(false)
                    }
                }}>
                    {
                        props.roleList.map(item =>
                            <Option value={item.id} key={item.id} disabled={checkRoleDisabled(item)}>{item.roleName}</Option>
                        )
                    }
                </Select>
            </Form.Item>
        </Form>
    )
})
export default UserForm