<template>
    <div >
        <div class="card">

             <%
               //获取entityInfo
               const entity = app.entities.find(item=>item.name===entityName);
               const entityNameSmall = entityName.charAt(0).toLowerCase()+entityName.substring(1);
               const entityNameHyphen = entityName.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
               const entityName_ = entityName.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
               const cols = entity.body;

               const colNamesStr = cols.map(item=>item.name).join(',');

               const manyToOnes = app.relationships.filter((item)=>{
                   return item.from.name === entityName && (item.cardinality==='ManyToOne'||item.cardinality==='OneToOne');
               });

               const manyToManys= app.relationships.filter((item)=>{
                   return item.from.name === entityName && (item.cardinality==='ManyToMany'||item.cardinality==='OneToMany');
               });


                // 获取关系计算属性
        
                const computeFields = [];
                for(let manyToOne of manyToOnes){
                    const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
                    const toEntity = app.entities.find((e)=>{
                        return  e.name ===manyToOne.name;
                    });
                    let displayField = "id";
                    if(manyToOne.from.javadoc){
                        displayField=  manyToOne.from.javadoc.trim();
                    }

                    computeFields.push(toName+displayField)

                }



                for(let manyToMany of manyToManys){
                    const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
                    const toEntity = app.entities.find((e)=>{
                        return  e.name ===manyToMany.name;
                    });
                    let displayField = "id";
                    if(manyToMany.from.javadoc){
                        displayField=  manyToMany.from.javadoc.trim();
                    }
                    const displayFieldFirstLow = displayField.charAt(0).toLowerCase()+displayField.substring(1)
                    
                    computeFields.push(toName+displayFieldFirstLow+'s');
                }

                

                let computeFieldsStr=computeFields.filter((item)=>item).join(',');
                if(computeFieldsStr){
                    computeFieldsStr+=',';
                }


                let treeFieldNames = cols.filter((col)=>{
                    return (col.javadoc.trim()==='所属辖区'||col.javadoc.trim().endsWith('字典树'))
                }).map(c=>(c.name+'Nodes')).join(',');
                if(treeFieldNames){
                    treeFieldNames+=',';
                }

            %>


            <DataTable :value="<%=entityNameSmall%>s" :paginator="true" :totalRecords="totalRecords"  :rows="10" @page="onPage($event)" @sort="onSort($event)" sortMode="multiple" :lazy="true" class="p-datatable-customers"  ref="dt"
                dataKey="id" v-model:filters="filters2" @filter="onFilter($event)" filterDisplay="row" :loading="loading2" editMode="row" v-model:editingRows="editingRows" @row-edit-save="onRowEditSave" responsiveLayout="scroll"
                :globalFilterFields="[<%=colNamesStr%>]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 v-model:selection="selected<%=entity.name%>s" :selectAll="selectAll" @select-all-change="onSelectAllChange" @row-select="onRowSelect" @row-unselect="onRowUnselect"
                 :rowsPerPageOptions="[10,25,50]"
                >
                <template #header>
                    
                    <div class="flex justify-content-start">
                        <span class="p-input-icon-left">
                            
                             <Button label="新增" icon="pi pi-plus" class="p-button-success mr-2 p-button-sm" @click="openMaximizable" />
                        </span>
                        <span class="p-input-icon-left ">
                            <!-- <i class="pi pi-search" />
                            <InputText v-model="filters2['global'].value" placeholder="Keyword Search" /> -->
                            <Button label="删除" icon="pi pi-trash" class="p-button-danger mr-2 p-button-sm" @click="confirmDeleteSelected" :disabled="!selected<%=entityName%>s || !selected<%=entityName%>s.length" />
                        </span>
                    </div>
                </template>
                <template #empty>
                    无数据
                </template>
                <template #loading>
                    加载数据中... 请稍后..
                </template>
                <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
                 <% for (col of cols){ 
                     const upColName = col.name.charAt(0).toUpperCase()+col.name.substring(1);
                     let dataTypeStr= ''
                     if(col.type==='Instant'||col.type==='LocalDate'||col.type==='ZonedDateTime'){
                         dataTypeStr= 'dataType="date"';
                     }else if(col.type==='Integer'||col.type==='Long'||col.type==='Float'||col.type==='Double'||col.type==='BigDecimal'){
                         dataTypeStr= 'dataType="numeric"';
                     }

                 %>
                    <Column field="<%=col.name %>" header="<%=col.javadoc.trim().replaceAll('_字典项','') %>" <%-dataTypeStr%> style="min-width:12rem" :sortable="true">
                        <template #body="{data}">

                            <% if(col.javadoc.trim().endsWith('_字典项')) { %>
                                 {{getNameOf<%=upColName%>s(data.<%=col.name %>)}}

                            <%}else if(col.type==='Instant'||col.type==='LocalDate'||col.type==='ZonedDateTime') { %>
                                 {{dateFormat(data.<%=col.name %>)}}
                            <%}else{%>
                                {{data.<%=col.name %>}}
                            <%}%>
                        </template>
                        <template #filter="{filterModel,filterCallback}">


                          <% if(col.javadoc.trim().endsWith('_字典项')) { %>
                            <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="<%=col.name%>s" optionLabel="name" optionValue="value" placeholder="任何" class="p-column-filter" style="min-width: 10rem;">
                                <template #option="slotProps">
                                    <div class="p-multiselect-representative-option">
                                        <span class="image-text">{{slotProps.option.name}}</span>
                                    </div>
                                </template>
                            </MultiSelect>
                          <%}else if(col.type==='Instant'||col.type==='LocalDate'||col.type==='ZonedDateTime'){%>

                            <Calendar  v-model="filterModel.value" :showTime="false" :showSeconds="false" dateFormat="yy-mm-dd" style="min-width: 10rem;"/>


                          <%}else { %>

                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" :placeholder="`查询通过<%=col.javadoc %>`" v-tooltip.top.focus="'回车键过滤'" style="min-width: 10rem;"/>
                          <%}%>




                        </template>
                        <template #editor="{ data, field }">
                             <% if(col.type==='Instant'||col.type==='LocalDate'||col.type==='ZonedDateTime') { %>
                                 <Calendar  id="dateformat" v-model="data[field]"   :showTime="true" :showSeconds="true"  />
                             <%} else if(col.type === 'TextBlob') {%>
                                <TextArea v-model="data[field]" autofocus />
                             <%} else if(col.type === 'ImageBlob') {%>
                                <img v-model="data[field]"  />
                             <%} else {%>
                                <InputText v-model="data[field]" autofocus />
                             <%}%>
                        </template>
                    </Column>
                <%}%>

                <Column :rowEditor="true" style="width:10%; min-width:8rem" bodyStyle="text-align:center">
                    <template #body="{data}">
                        <Button label="编辑" class="p-button-link" @click="openEditMaximizable(data)"/>
                    </template> 
                </Column>
                
                
            </DataTable>
        </div>


         <Dialog :header="isAdd?'新增':'编辑'" v-model:visible="displayMaximizable" :style="{width: '60vw'}" :maximizable="true" :modal="true">
            <div class="card">
                <h5 class="text-center" style="margin-bottom:1rem;"><%=entity.javadoc %></h5>
                 <form @submit.prevent="handleSubmit(!v$.$invalid)" class="flex flex-row flex-wrap">
                    
                         <div class="formgrid grid">
                          <% for (col of cols){ %>
                            <div class="field col-6">


                              <%if(col.validations.length>0){ %>
                                    <label for="<%=col.name %>" :class="{'p-error':v$.<%=col.name %>.$invalid && submitted}"><% if(col.validations.some(ele=>ele.key==='required')){%>*<%}%><%=col.javadoc.replaceAll('_字典项','') %>
                                        
                                    </label>

                                <%} else{ %>
                                    <label for="<%=col.name %>"><%=col.javadoc.replaceAll('_字典项','').replaceAll('字典树','') %></label>
                              <%}%>

                             <% if(col.javadoc.trim().endsWith('_字典项')) { %>

                                    <%if(col.validations.length>0){ %>
                                      <Dropdown  id="<%=col.name %>" :options="<%=col.name%>s" optionLabel="name" optionValue="value" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" class=" w-full" />
                                    <%} else{ %>

                                         <Dropdown  id="<%=col.name %>" :options="<%=col.name%>s" optionLabel="name" optionValue="value"
                                           v-model="state.<%=col.name %>" :showTime="true" :showSeconds="true" dateFormat="yy-mm-dd" class=" w-full"/>
                                    <%}%>
                             <%} else if(col.javadoc.trim()==='所属辖区'||col.javadoc.trim().endsWith('字典树')) { %>

                                    <%if(col.validations.length>0){ %>
                                      <TreeSelect id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" :options="<%=col.name %>Nodes" placeholder="请选择..." class=" w-full"></TreeSelect>
                                      
                                    <%} else{ %>
                                         <TreeSelect id="<%=col.name %>" v-model="state.<%=col.name %>"  :options="<%=col.name %>Nodes" placeholder="请选择..." class=" w-full"></TreeSelect>
                                         
                                    <%}%>

                             <%} else if(col.type==='Instant'||col.type==='LocalDate'||col.type==='ZonedDateTime') { %>

                                    <%if(col.validations.length>0){ %>
                                      <Calendar id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" :showTime="true" :showSeconds="true" class=" w-full"/>
                                    <%} else{ %>

                                         <Calendar id="<%=col.name %>" v-model="state.<%=col.name %>" :showTime="true" :showSeconds="true" dateFormat="yy-mm-dd" class=" w-full"/>
                                    <%}%>
                               
                             <%} else if(col.type === 'TextBlob') {%>
                                    <%if(col.validations.length>0){ %>
                                       <TextArea id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" autofocus class=" w-full"/>
                                    <%} else{ %>
                                       <Textarea id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus class=" w-full"/>
                                    <%}%>
                              <%} else if(col.type === 'Boolean') {%>
                                    <%if(col.validations.length>0){ %>
                                       <Checkbox  id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" :binary="true" />
                                    <%} else{ %>
                                       <Checkbox  id="<%=col.name %>" v-model="state.<%=col.name %>" :binary="true" class=" w-full"/>
                                    <%}%>
                             <%} else if(col.type === 'Integer') {%>
                                    <%if(col.validations.length>0){ %>
                                       <InputNumber  id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" autofocus class=" w-full"/>
                                    <%} else{ %>
                                       <InputNumber  id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus class=" w-full"/>
                                    <%}%>
                             <%} else if(col.type === 'Long'||col.type==='Duration') {%>
                                    <%if(col.validations.length>0){ %>
                                       <InputNumber  id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" autofocus class=" w-full"/>
                                    <%} else{ %>
                                       <InputNumber  id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus class=" w-full"/>
                                    <%}%>
                             <%} else if(col.type === 'BigDecimal') {%>
                                    <%if(col.validations.length>0){ %>
                                       <InputNumber  id="<%=col.name %>" :minFractionDigits="2" :maxFractionDigits="5" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" autofocus class=" w-full"/>
                                    <%} else{ %>
                                       <InputNumber  :minFractionDigits="2" :maxFractionDigits="5" id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus class=" w-full"/>
                                    <%}%>
                             <%} else if(col.type === 'Float'||col.type === 'Double') {%>
                                    <%if(col.validations.length>0){ %>
                                       <InputNumber  id="<%=col.name %>" :minFractionDigits="2" :maxFractionDigits="2" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" autofocus class=" w-full"/>
                                    <%} else{ %>
                                       <InputNumber  :minFractionDigits="2" :maxFractionDigits="2" id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus class=" w-full"/>
                                    <%}%>
                             <%} else {%>
                                    <%if(col.validations.length>0){ %>
                                     <InputText id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}"  autofocus class=" w-full"/>
                                    <%} else{ %>
                                         <InputText id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus class=" w-full"/>
                                    <%}%>
                             <%}%>

                                <%if(col.validations.length>0){ %>


                                   
                                    <small v-if="(v$.<%=col.name %>.$invalid && submitted) || v$.<%=col.name %>.$pending.$response" class="p-error"><span v-for="error of v$.<%=col.name %>.$errors" :key="error.$uid">{{error.$message.replace('Value', '<%=col.name %>')}},</span></small>
                                <%} %>
                                   
                                
                            </div>

                            



                          <%}%>

                          <% for(let manyToOne of manyToOnes){
                               const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
                               const toEntity = app.entities.find((e)=>{
                                  return  e.name ===manyToOne.to.name;
                               })

                               let displayField = "id";
                               if(manyToOne.from.javadoc){
                                    displayField=  manyToOne.from.javadoc.trim();
                               }

                               const displayCol = toName+displayField;
                                
                            %>
                                
                                    <div class="field col-6">
                                        <label for="<%=toName%>" ><%=toEntity.javadoc%></label>
                                        <InputText id="<%=toName%>" v-model="<%=displayCol%>"  @click="showSelect<%=toEntity.name%>" class="w-full"/>
                                        
                                    </div>
                                    
                                
                            <%}%>


                            <%for(let manyToMany of manyToManys){
                                const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
                                const toEntity = app.entities.find((e)=>{
                                    return  e.name ===manyToMany.to.name;
                                });
                                let displayField = "id";
                                if(manyToMany.from.javadoc){
                                    displayField=  manyToMany.from.javadoc.trim();
                                }
                                const displayFieldFirstLow = displayField.charAt(0).toLowerCase()+displayField.substring(1);
                                
                                const displayCol = toName+displayFieldFirstLow+'s';
                             %>
                                    <div class="field col-6">
                                            <label for="<%=toName%>" ><%=toEntity.javadoc.trim()%></label>
                                            <InputText id="<%=toName%>" v-model="<%=displayCol%>"  @click="showSelect<%=toEntity.name%>" class="w-full"/>
                                            
                                    </div>



                            <%}%>



                        </div>
                   


                    


                    <!--此处需要多对多支持 -->
                 </form>


            </div>




            <template #footer>
                <Button label="取消" icon="pi pi-times" @click="closeMaximizable" class="p-button-text"/>
                <Button label="提交" icon="pi pi-check" @click="handleSubmit(!v$.$invalid,loadLazyData)" autofocus />
            </template>
        </Dialog>

        <Dialog v-model:visible="showMessage" :breakpoints="{ '960px': '80vw' }" :style="{ width: '30vw' }" position="top">
            <div class="flex align-items-center flex-column pt-6 px-3">
                <i class="pi pi-check-circle" :style="{fontSize: '5rem', color: 'var(--green-500)' }"></i>
                <h5>操作成功</h5>
                <p :style="{lineHeight: 1.5, textIndent: '1rem'}">
                    您已经成功添加了这条内容
                </p>
            </div>
            <template #footer>
                <div class="flex justify-content-center">
                    <Button label="确定" @click="toggleDialog" class="p-button-text" />
                </div>
            </template>
        </Dialog>


        <Dialog v-model:visible="delete<%=entity.name%>sDialog" :style="{width: '450px'}" header="确认" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span >您确定要删除勾选的项目吗?</span>
            </div>
            <template #footer>
                <Button label="取消" icon="pi pi-times" class="p-button-text" @click="delete<%=entity.name%>sDialog = false"/>
                <Button label="确定" icon="pi pi-check" class="p-button-text" @click="deleteSelected<%=entity.name%>s" />
            </template>
        </Dialog>

        <% for(let manyToOne of manyToOnes){
          const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);

        %>
            <<%=manyToOne.to.name%>s selectionModel="single"  @doAdd<%=manyToOne.to.name%>="doAdd<%=manyToOne.to.name%>" @doDeleteSelected<%=manyToOne.to.name%>="doDeleteSelected<%=manyToOne.to.name%>" ref="<%=toName%>Ref">
                
            </<%=manyToOne.to.name%>s>
        <%}%>

         <% for(let manyToMany of manyToManys){
             const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
         %>
            <<%=manyToMany.to.name%>s selectionModel="multiple"  @doAdd<%=manyToMany.to.name%>="doAdd<%=manyToMany.to.name%>" @doDeleteSelected<%=manyToMany.to.name%>="doDeleteSelected<%=manyToMany.to.name%>" ref="<%=toName%>Ref">
                
            </<%=manyToMany.to.name%>s>
        <%}%>

        


        
    </div>                    
</template>

<script  lang="ts">
import { ref, onMounted,reactive  } from 'vue';
import {FilterMatchMode,FilterOperator} from 'primevue/api';
import <%=entity.name%>Service from './api/<%=entity.name.replaceAll(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()%>-service';

import { useToast } from 'primevue/usetoast';
import newAdd from './new-add';

import DateFormat from '@/utils/dateTools';

<% for(let manyToOne of manyToOnes){
    const toName =  manyToOne.to.name.replaceAll(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
    const toEntity = app.entities.find((e)=>{
        return  e.name ===manyToOne.to.name;
    }) 
%>
import <%=manyToOne.to.name%>s  from '@/components/business/<%=toName%>/<%=toName%>.vue';
<%}%>


<% for(let manyToMany of manyToManys){
    const toName =  manyToMany.to.name.replaceAll(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
    const toEntity = app.entities.find((e)=>{
        return  e.name ===manyToMany.to.name;
    }) 
%>
import <%=manyToMany.to.name%>s  from '@/components/business/<%=toName%>/<%=toName%>.vue';
<%}%>



export default {
   components:{
       <% for(let manyToOne of manyToOnes){%>
         <%=manyToOne.to.name%>s,
       <%}%>
       <% for(let manyToMany of manyToManys){%>
         <%=manyToMany.to.name%>s,
       <%}%>
   },
   setup() {
        onMounted(() => {
            lazyParams.value = {
                first: 0,
                rows: dt.value.rows,
                sortField: null,
                sortOrder: null,
                filters: filters2.value
            };

<% for (let col of cols) {-%>
    <%if(col.javadoc.trim().endsWith('_字典项') ){
      const toColName =  col.name.charAt(0).toUpperCase()+col.name.substring(1); 
    %>
            <%=entityNameSmall%>Service.value.get<%=toColName%>s().then((res:any)=>{
                <%=col.name%>s.value= res.data;
            });
    <%}%>
     <% if(col.javadoc.trim()==='所属辖区'||col.javadoc.trim().endsWith('字典树')){
         let param = '';
         if(col.javadoc.trim().endsWith('字典树')){
             param = col.name;
         }
         
      %>  
            <%=entityNameSmall%>Service.value.getWisdomDataDicsTree('<%=param%>').then((res)=>{
                <%=col.name%>Nodes.value= res;
            });
     <%}%>

<%}%>

        loadLazyData();

      })



      
        const toast = useToast();
        const loadLazyData = ()=>{
            loading2.value = true;
            <%=entityNameSmall%>Service.value.get<%=entityName%>s(JSON.stringify(lazyParams.value)).then(result => {
                totalRecords.value = parseInt(result.totalRecords);
                <%=entityNameSmall%>s.value = result.data;
                setTimeout(() => loading2.value = false, 500);
               
            });
        }

        
        const <%=entityNameSmall%>Service = ref(new <%=entityName%>Service());
        const <%=entityNameSmall%>s:any =  ref(null);
        const selected<%=entityName%>s = ref();
        const selectAll = ref(false);
        const totalRecords = ref(0);
        const filters2 = ref({
            'global': {value: null, matchMode: FilterMatchMode.CONTAINS},

            <%for(let col of cols){%>
                 '<%=col.name%>': {value: null, matchMode: FilterMatchMode.CONTAINS},
            <%}%>
           
        });
        const loading2 = ref(false);
<%_ for (let col of cols) {-%>
    <%_if(col.javadoc.trim().endsWith('_字典项') ){
      const toColName =  col.name.charAt(0).toUpperCase()+col.name.substring(1);
      
    %>        
        const <%=col.name%>s = ref([]);
     <%}-%>
<%}%>      
        const { dateFormat } = DateFormat();
        const {
          showMessage,
          state,
          v$,
          submitted,
          displayMaximizable,
          openMaximizable,
          openEditMaximizable,
          closeMaximizable,
          handleSubmit,
          toggleDialog,
          resetForm,
          isAdd,
          <%=computeFieldsStr%>
          <%=treeFieldNames%>
       } = newAdd(<%=entityNameSmall%>Service);

        //产品信息
        const displayCPXX = ref(true);

        
        //行编辑
         const editingRows = ref([]);
         const onRowEditSave = (event:any) => {
            let { newData, index } = event;

            <%=entityNameSmall%>s.value[index] = newData;
            <%=entityNameSmall%>Service.value.edit<%=entityName%>(JSON.stringify(newData)).then((res)=>{
                // toggleDialog();
                toast.add({severity:'success', summary: '修改成功', detail: '该项已修改成功', life: 3000});
                resetForm();
            });
        };

        //分页
        const onPage = (event:any) => {
            lazyParams.value = event;
            loadLazyData();
            selectAll.value = false;
            selected<%=entityName%>s.value = [];
            
        };


        //排序
        const onSort = (event:any) => {
            lazyParams.value = event;
            loadLazyData();
        };



        // 过滤 
        const dt = ref();
        const lazyParams:any = ref({});
       
        const onFilter = () => {
            lazyParams.value.filters = filters2.value ;
            loadLazyData();
        }


       // 选择
        const onSelectAllChange = (event:any) => {
            const checkAll = event.checked;
            if (checkAll) {
           
           
                selectAll.value = true;
                selected<%=entityName%>s.value = <%=entityNameSmall%>s.value;
                
            }
            else {
                selectAll.value = false;
                selected<%=entityName%>s.value = [];
            }
        }
        const onRowSelect = () => {
            selectAll.value = <%=entityNameSmall%>s.value.length === totalRecords.value;
        }
        const onRowUnselect = () => {
            selectAll.value = false;
        }



      //删除 
       const delete<%=entityName%>sDialog = ref(false);
       const deleteSelected<%=entityName%>s = () => {
            const my<%=entityNameSmall%>s:any[] = selected<%=entityName%>s.value;
            for(let <%=entityNameSmall%> of my<%=entityNameSmall%>s){
                <%=entityNameSmall%>Service.value.delete<%=entityName%>(<%=entityNameSmall%>.id).then((res)=>{
                    delete<%=entityName%>sDialog.value = false;
                    selected<%=entityName%>s.value = null;
                    toast.add({severity:'success', summary: '删除成功', detail: '项目已被删除', life: 3000});
                    loadLazyData();
                });
            }

            
            
        };
        const confirmDeleteSelected = () => {
            delete<%=entityName%>sDialog.value = true;
        };

        
<%_ for (let col of cols) {-%>
    <%_if(col.javadoc.trim().endsWith('_字典项') ){
      const toColName =  col.name.charAt(0).toUpperCase().toUpperCase()+col.name.substring(1); 
    -%>        
        const getNameOf<%=toColName%>s = (value:any)=>{
            let c = <%=col.name%>s.value.find((item:any)=>{
                return item.value === value;
            });
            return c?.name?c.name:value;
        }
     <%_}-%>
<%_}-%>          

        
<%_for(let manyToOne of manyToOnes){ 
    const toColName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
-%> //manyToOne选择
    const doAdd<%=manyToOne.to.name%>=(eles:any)=>{
            state.<%=toColName%>= eles[0];
    }

    const doDeleteSelected<%=manyToOne.to.name%>=(ids:any[])=>{
            for(let id of ids){
                for(let i =0 ;i<state.<%=toColName%>.length;i++){
                    if(id === state.<%=toColName%>[i].id){
                        state.<%=toColName%>.splice(i,1);
                    }
                }
            }
    }

<%}-%>

<%_ for(let manyToMany of manyToManys){ 
     const toColName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
-%>
        const doAdd<%=manyToMany.to.name%>=(eles:any)=>{
               //多模式    
               state.<%=toColName%>s= JSON.parse(JSON.stringify(eles));
        }

        const doDeleteSelected<%=manyToMany.to.name%>=(ids:any[])=>{
            for(let id of ids){
                for(let i =0 ;i<state.<%=toColName%>s.length;i++){
                    if(id === state.<%=toColName%>s[i].id){
                        state.<%=toColName%>s.splice(i,1);
                    }
                }
            }
        }
<%}-%>
        

       
<%_ for(let manyToOne of manyToOnes){
    const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
    const toEntity = app.entities.find((e)=>{
        return  e.name ===manyToOne.to.name;
    });
 -%>
        const <%=toName%>Ref:any = ref(null);
        const showSelect<%=toEntity.name%> = ()=>{
            const <%=entityNameSmall%> = JSON.parse(JSON.stringify(state));

            let <%=toName%>s = null;
             if(<%=entityNameSmall%>.<%=toName%>){
                 <%=toName%>s = [<%=entityNameSmall%>.<%=toName%>];
             }
        
            <%=toName%>Ref.value.showMe(<%=toName%>s);
        }
<%}-%>


<%_ for(let manyToMany of manyToManys){
    const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
    const toEntity = app.entities.find((e)=>{
        return  e.name ===manyToMany.to.name;
    }); -%>
        const <%=toName%>Ref:any = ref(null);
        const showSelect<%=toEntity.name%> = ()=>{
            const <%=entityNameSmall%> = JSON.parse(JSON.stringify(state));
            let <%=toName%>s=null;
            if(<%=entityNameSmall%>.<%=toName%>s){
                 <%=toName%>s = <%=entityNameSmall%>.<%=toName%>s;
            }
            <%=toName%>Ref.value.showMe(<%=toName%>s);
        }
<%}-%>

        



        return {  <%=entityNameSmall%>s,loading2,filters2,displayMaximizable,openMaximizable,openEditMaximizable,closeMaximizable,state, v$, handleSubmit, toggleDialog, submitted ,resetForm ,showMessage ,editingRows,onRowEditSave ,totalRecords,onPage,onFilter,loadLazyData,lazyParams,dt,onSort,
            selectAll,selected<%=entityName%>s,onSelectAllChange,onRowSelect,onRowUnselect,
            deleteSelected<%=entityName%>s,confirmDeleteSelected,delete<%=entityName%>sDialog,
<%_for (let col of cols) {-%>
    <%if(col.javadoc.trim().endsWith('_字典项') ){
      const toColName =  col.name.charAt(0).toUpperCase()+col.name.substring(1);
    -%>        
        <%=col.name-%>s,getNameOf<%=toColName%>s,
     <%_}-%>
<%_}-%>
            displayCPXX,
            dateFormat,isAdd,
<%=treeFieldNames-%>
<% for(let manyToOne of manyToOnes){ 
     const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);

%>
            <%=toName-%>Ref,
            doAdd<%=manyToOne.to.name%>,showSelect<%=manyToOne.to.name-%>,
            doDeleteSelected<%=manyToOne.to.name%>,
<%_}-%>
<% for(let manyToMany of manyToManys){
    const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);

 %>
            <%=toName-%>Ref,
            doAdd<%=manyToMany.to.name%>,showSelect<%=manyToMany.to.name-%>,
            doDeleteSelected<%=manyToMany.to.name%>,

<%}-%> <%=computeFieldsStr -%>
        }
    }
}
</script>