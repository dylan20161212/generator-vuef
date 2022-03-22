1.配置 postgresql 连接数据库 获取表信息
2.安装yoman
3.npm install
4.npm link
5.yo vuef 按照提示输入表前缀，或者输入单个表名 则以$符号结束

6.模板文件信息 可以使用变量如下：

表名称：<%=table_name %>
表描述：<%=obj_description %>
<% for (col of cols){  %>
    列名：<%=col.column_name %>
    列描述: <%=col.col_description %>
    列是否为空：<%=col.is_nullable%>
    列数据类型：<%=col.data_type%>
    列长度 : <%=col.col_len%>
    是否为键: <%=col.iskey%>


<%}%>

