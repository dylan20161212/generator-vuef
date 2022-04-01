<template>
    <div >
        <div class="card">

            <%
               //获取entityInfo
               const entity = app.entities.find(item=>item.name===entityName);

               const cols = entity.body;

               const colNamesStr = cols.map(item=>item.name).join(',');




            %>


            

            <DataTable :value="items" :paginator="true" :totalRecords="totalRecords"  :rows="10" @page="onPage($event)" @sort="onSort($event)" sortMode="multiple" :lazy="true" class="p-datatable-customers"  ref="dt"
                dataKey="id" v-model:filters="filters2" @filter="onFilter($event)" filterDisplay="row" :loading="loading2" editMode="row" v-model:editingRows="editingRows" @row-edit-save="onRowEditSave" responsiveLayout="scroll"
                :globalFilterFields="[<%=colNamesStr%>]"
                 v-model:selection="selectedItems" :selectAll="selectAll" @select-all-change="onSelectAllChange" @row-select="onRowSelect" @row-unselect="onRowUnselect"
                
                >     

                <template #header>
                    
                    <div class="flex justify-content-start">
                        <span class="p-input-icon-left">
                            
                             <Button label="新增" icon="pi pi-plus" class="p-button-success mr-2 p-button-sm" @click="openMaximizable" />
                        </span>
                        <span class="p-input-icon-left ">
                            <!-- <i class="pi pi-search" />
                            <InputText v-model="filters2['global'].value" placeholder="Keyword Search" /> -->
                            <Button label="删除" icon="pi pi-trash" class="p-button-danger mr-2 p-button-sm" @click="confirmDeleteSelected" :disabled="!selectedItems || !selectedItems.length" />
                        </span>
                    </div>
                </template>
                <template #empty>
                    No products found.
                </template>
                <template #loading>
                    Loading products data. Please wait.
                </template>
                <Column selectionMode="multiple" headerStyle="width: 3em"></Column>

                 <% for (col of cols){ %>
                    <Column field="<%=col.name %>" header="<%=col.javadoc %>" style="min-width:12rem" :sortable="true">
                        <template #body="{data}">
                            <% if(col.type==='Instant'||col.type==='Date') { %>
                                 {{dataFormat(data.<%=col.name %>)}}
                            <%}else{%>
                                {{data.<%=col.name %>}}
                            <%}%>
                        </template>
                        <template #filter="{filterModel,filterCallback}">
                            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" :placeholder="`查询通过<%=col.javadoc %>`" v-tooltip.top.focus="'回车键过滤'"/>
                        </template>
                        <template #editor="{ data, field }">
                             <% if(col.type==='Instant'||col.type==='Date') { %>
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
                
                <Column :rowEditor="true" style="width:10%; min-width:8rem" bodyStyle="text-align:center"></Column>
                
                
            </DataTable>
        </div>


         <Dialog header="新增" v-model:visible="displayMaximizable" :style="{width: '50vw'}" :maximizable="true" :modal="true">
            <div class="card">
                <h5 class="text-center"><%=entity.javadoc %></h5>
                 <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-fluid">
                    <% for (col of cols){ %>
                         <div class="field">
                            <div class="p-float-label">

                             <% if(col.type==='Instant'||col.type==='Date') { %>

                                    <%if(col.validations.length>0){ %>
                                      <Calendar id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" :showTime="true" :showSeconds="true" />
                                    <%} else{ %>

                                         <Calendar id="<%=col.name %>" v-model="state.<%=col.name %>" :showTime="true" :showSeconds="true" />
                                    <%}%>
                               
                             <%} else if(col.type === 'TextBlob') {%>
                                    <%if(col.validations.length>0){ %>
                                       <TextArea id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}" autofocus/>
                                    <%} else{ %>
                                       <TextArea id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus/>
                                    <%}%>
                             <%} else {%>
                                    <%if(col.validations.length>0){ %>
                                     <InputText id="<%=col.name %>" v-model="v$.<%=col.name %>.$model" :class="{'p-invalid':v$.<%=col.name %>.$invalid && submitted}"  autofocus/>
                                    <%} else{ %>
                                         <InputText id="<%=col.name %>" v-model="state.<%=col.name %>" autofocus/>
                                    <%}%>
                             <%}%>

                                <%if(col.validations.length>0){ %>
                                    <label for="<%=col.name %>" :class="{'p-error':v$.<%=col.name %>.$invalid && submitted}"><%=col.javadoc %><% if(col.validations.some(ele=>ele.key='required')){%>*<%}%>
                                        
                                    </label>

                                    <small v-if="(v$.<%=col.name %>.$invalid && submitted) || v$.<%=col.name %>.$pending.$response" class="p-error">{{v$.<%=col.name %>.required.$message.replace('Value', '<%=col.javadoc %>')}}</small>
                                <%} else{ %>
                                    <label for="<%=col.name %>"><%=col.javadoc %></label>
                                <%}%>
                                
                            </div>
                           
                        </div>
                    <%}%>
                   
                 </form>


            </div>




            <template #footer>
                <Button label="取消" icon="pi pi-times" @click="closeMaximizable" class="p-button-text"/>
                <Button label="提交" icon="pi pi-check" @click="handleSubmit(!v$.$invalid)" autofocus />
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


        <Dialog v-model:visible="deleteItemsDialog" :style="{width: '450px'}" header="确认" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span >您确定要删除勾选的项目吗?</span>
            </div>
            <template #footer>
                <Button label="取消" icon="pi pi-times" class="p-button-text" @click="deleteItemsDialog = false"/>
                <Button label="确定" icon="pi pi-check" class="p-button-text" @click="deleteSelectedItems" />
            </template>
        </Dialog>
    </div>                    
</template>

<script  lang="ts">
import { ref, onMounted,reactive  } from 'vue';
import {FilterMatchMode,FilterOperator} from 'primevue/api';
import ModelService from './api/ModelService';

import { email, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { useToast } from 'primevue/usetoast';

export default {
   setup() {
        onMounted(() => {
            lazyParams.value = {
                first: 0,
                rows: dt.value.rows,
                sortField: null,
                sortOrder: null,
                filters: filters2.value
            };

            loadLazyData();
           
        })


        const toast = useToast();
        const loadLazyData = ()=>{
            loading2.value = true;
            modelService.value.getItems(JSON.stringify(lazyParams.value)).then(result => {
                totalRecords.value = parseInt(result.totalRecords);
                items.value = result.data;
                setTimeout(() => loading2.value = false, 500);
               
            });
        }

        
        const submitted = ref(false);
        const modelService = ref(new ModelService());
        const items:any =  ref(null);
        const selectedItems = ref();
        const selectAll = ref(false);
        const totalRecords = ref(0);
        const filters2 = ref({

           <% for (col of cols){  %>
                '<%=col.name %>': {value: null, matchMode: FilterMatchMode.EQUALS},
           <%}%>
          
           
        });
        const loading2 = ref(false);


        // form 表单最大化
        const displayMaximizable = ref(false);
        const openMaximizable = () => {
            displayMaximizable.value = true;
        };
        const closeMaximizable = () => {
            displayMaximizable.value = false;
        };


        // 新增form
        const showMessage = ref(false);
        const state = reactive({
                 id:'',
           <% for (col of cols){ %>
                 <%=col.name %>:'',
           <%}%>

        });

        const rules:any = {

            <% for (col of cols){  
                   
            %>
                <%if(col.validations.length>0) {
                    const ruleStr =  col.validations.map((v)=>{
                            return  v.key+':'+v.key+(v.value?('('+v.value+')'):'')
                     }).join('    ,')

                %>
                  <%=col.name %>: { <%=ruleStr%> },
                <%}%>
            <%
              }
            %>

        };

        const v$ = useVuelidate(rules, state);
        const handleSubmit = (isFormValid:Boolean) => {
            submitted.value = true;

            if (!isFormValid) {
               
                return;
            }

            modelService.value.addItem(JSON.stringify(state)).then((ret)=>{
                displayMaximizable.value = false;
                toggleDialog();
                loadLazyData();
                resetForm();
            });
           
            
        }


        const toggleDialog = () => {
            showMessage.value = !showMessage.value;
        
            if(!showMessage.value) {
                resetForm();
            }
        }

        const resetForm = () => {
              state.id = '';
            <% for (col of cols){  %>
               state.<%=col.name %>='';
            <%}%>


            submitted.value = false;
        }
        //编辑
         const editingRows = ref([]);
         const onRowEditSave = (event:any) => {
            let { newData, index } = event;

            items.value[index] = newData;
            modelService.value.editItem(JSON.stringify(newData)).then((res)=>{
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
            selectedItems.value = [];
            
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
                selectedItems.value = items.value;
                
            }
            else {
                selectAll.value = false;
                selectedItems.value = [];
            }
        }
        const onRowSelect = () => {
            selectAll.value = items.value.length === totalRecords.value;
        }
        const onRowUnselect = () => {
            selectAll.value = false;
        }



      //删除 
       const deleteItemsDialog = ref(false);
       const deleteSelectedItems = () => {
            const myItems:any[] = selectedItems.value;
            for(let item of myItems){
                modelService.value.deleteItem(item.id).then((res)=>{
                    deleteItemsDialog.value = false;
                    selectedItems.value = null;
                    toast.add({severity:'success', summary: '删除成功', detail: '项目已被删除', life: 3000});
                    loadLazyData();
                });
            }

          
            
        };
        const confirmDeleteSelected = () => {
            deleteItemsDialog.value = true;
        };


        //日期格式化
        const dataFormat = (time:any)=>{

             if(typeof time === 'string'){
                 return time.replace("T"," ").replace("Z","");
             }else{
                 return `${time.getFullYear()}-${time.getMonth() + 1 >= 10 ? (time.getMonth() + 1) : '0' + (time.getMonth() + 1)}-${time.getDate() >= 10 ? time.getDate() : '0' + time.getDate()}
                     ${time.getHours() >= 10 ? time.getHours() : '0' + time.getHours()} : ${time.getMinutes()>=10?time.getMinutes():'0'+time.getMinutes()} : ${time.getSeconds() >= 10 ? time.getSeconds() : '0' + time.getSeconds()}`;
             

             }
           
        }



        return {  items,displayMaximizable,openMaximizable,closeMaximizable,loading2,filters2,state, v$, handleSubmit, toggleDialog, submitted ,resetForm ,showMessage ,editingRows,onRowEditSave ,totalRecords,onPage,onFilter,loadLazyData,lazyParams,dt,onSort,
            selectAll,selectedItems,onSelectAllChange,onRowSelect,onRowUnselect,
            deleteSelectedItems,confirmDeleteSelected,deleteItemsDialog,dataFormat

        }
    }
}
</script>