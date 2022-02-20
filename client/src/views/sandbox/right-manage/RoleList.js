import React, { useState, useEffect } from 'react'
import { Table, Button, Modal,Tree } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
const { confirm } = Modal
export default function RoleList() {
    const [dataSource, setdataSource] = useState([])
    const [rightList, setRightList] = useState([])
    const [currentRights, setcurrentRights] = useState([])
    const [currentId, setcurrentId] = useState(0)
    const [isModalVisible, setisModalVisible] = useState(false)
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName'
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={()=>{
                        setisModalVisible(true)
                        setcurrentRights(item.rights)
                        setcurrentId(item.id)
                    }}/>
                </div>
            }
        }
    ]

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
        setdataSource(dataSource.filter(data => data.id !== item.id))
        axios.delete(`/roles/${item.id}`)
    }

    useEffect(() => {
        axios.get("/roles").then(res => {
            // console.log(res.data)
            setdataSource(res.data)
        })
    }, [])

    useEffect(() => {
        axios.get("/rights?_embed=children").then(res => {
            // console.log(res.data)
            setRightList(res.data)
        })
    }, [])


    // popover 确认之后，隐藏 popover-tree 框
    // 根据 currentRights ，更新 Table 的表现，并更新后台数据
    const handleOk = ()=>{
        console.log(currentRights,currentId)
        setisModalVisible(false)
        //同步datasource
        setdataSource(dataSource.map(item=>{
            if(item.id===currentId){
                return {
                    ...item,
                    rights:currentRights
                }
            }
            return item
        }))
        //patch

        axios.patch(`/roles/${currentId}`,{
            rights:currentRights
        })
    }

    const handleCancel  =()=>{
        setisModalVisible(false)
    }


    // 每点一个选项，Tree 组件就会记录当前选中的所有项
    // checkKeys 形参就是接收点击后的所有选择项
    const onCheck = (checkKeys)=>{
        // console.log(checkKeys)
        setcurrentRights(checkKeys.checked)
    }
    return (
        <div>

            // Table 组件 要求 dataSource 数组的对象都要有 “key” 属性
            // 当没有 “key” 属性时，要设置 rowKey 属性 指定一个属性代替 “key” 
            <Table dataSource={dataSource} columns={columns}
                rowKey={(item) => item.id}></Table>

            // Modal 和 Table 的关系更像是并行关系。
            // 但是 Table 中的按钮控制 Modal 的出现和消失，并且两者共享 currentRights 状态
            <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            
            // 注意 checkedKeys 和 onCheck 的形参不是一回事
            // checkedKeys 属性决定了树形复选框的当前勾选表现 
            <Tree
                checkable
                checkedKeys = {currentRights}
                onCheck={onCheck}
                checkStrictly = {true}
                treeData={rightList}
            />

            </Modal>
        </div>
    )
}
