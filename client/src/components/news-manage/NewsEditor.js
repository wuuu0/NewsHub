import React,{useEffect, useState} from 'react'
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function NewsEditor(props) {
    useEffect(()=>{
        // console.log(props.content)
        // NewsUpdate 组件传入的，主要是为了能够显示出已有的news的内容
        // html-===> draft, 
        const html = props.content
        if(html===undefined) return 
        const contentBlock = htmlToDraft(html);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          const editorState = EditorState.createWithContent(contentState);
          setEditorState(editorState)
        }
        /* 
        为何要和 props.content 绑定，不是挂载的时候设置一下Editor内容就好了吗?

        考虑纯前端更新？
        
        Editor内容变化时，会自己setEditorState更新状态+显示内容
        且点击 上一步下一步切换后 不会消失
        （因为我们通过设置display来隐藏，DOM上节点还是存在的）
        
        何况，等到真的改变了 props.content（保存草稿、提交审核），
        路由也已切换，会再次刷新请求后台数据的
        
        并且 NewsAdd 中也没有用到这个副作用

        只能说，这里我们是要根据 props.content 来预设内容
        useEffect 绑定它，功能上一般不会有错
        */
    },[props.content])

    const [editorState, setEditorState] = useState("")
    return (
        <div>
            <Editor
                editorState={editorState}
                toolbarClassName="aaaaa"
                wrapperClassName="bbbbb"
                editorClassName="ccccc"
                // 此 editorState 是代表事件信息的参数，而非组件中的状态 editorState
                onEditorStateChange={(editorState)=>setEditorState(editorState)}

                onBlur={()=>{
                    // console.log()
                    // 在失去焦点时，将编辑器内容转换成HTML，调用父组件传递的方法
                    // 将内容存放在父组件的状态 Content 中
                    props.getContent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
                }}
            />
        </div>
    )
}
