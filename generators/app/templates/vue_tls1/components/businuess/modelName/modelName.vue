<%
	//获取entityInfo
	const entity = app.entities.find(item=>item.name===entityName);
	const entityNameSmall = entityName.charAt(0).toLowerCase()+entityName.substring(1);
    const entityNameHyphen = entityName.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();

    let doubleNames='';
    if(entityNameHyphen.endsWith('s')||entityNameHyphen.endsWith('x')||entityNameHyphen.endsWith('ch')||entityNameHyphen.endsWith('sh')){
        doubleNames=entityNameHyphen+'es';
    }else if(entityNameHyphen.endsWith('f')){
         doubleNames= entityNameHyphen.substring(0,entityNameHyphen.length-1)+'ves';
    }else if(entityNameHyphen.endsWith('fe')){
         doubleNames= entityNameHyphen.substring(0,entityNameHyphen.length-2)+'ves';
    }else if(entityNameHyphen.endsWith('y') && !(entityNameHyphen.endsWith('ay')||entityNameHyphen.endsWith('ey')||entityNameHyphen.endsWith('iy')||entityNameHyphen.endsWith('oy')||entityNameHyphen.endsWith('uy')) ){
         doubleNames= entityNameHyphen.substring(0,entityNameHyphen.length-1)+'ies';
    }else{
        doubleNames= entityNameHyphen+'s';
    }

    const entityName_ = entityName.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
    

	const cols = entity.body;

	const colNamesStr = cols.map(item=>item.name).join(',');

	const manyToOnes = app.relationships.filter((item)=>{
		return item.from.name === entityName && (item.cardinality==='ManyToOne'||item.cardinality==='OneToOne');
	});

	const manyToMany= app.relationships.filter((item)=>{
		return item.from.name === entityName && (item.cardinality==='ManyToMany'||item.cardinality==='OneToMany');
	});
%>

<template>
     <Dialog header="<%=entity.javadoc%>" v-model:visible="displayCPXX" :style="{width: '80vw'}" :maximizable="true" :modal="true">
            
            <!-- <template #header>
                <div style="width:100%;display:flex;direction:start;background:blue;">
                     产品信息
                </div>
            </template> -->

            

            <DataTable :value="selected<%=entityName%>s" class="p-datatable-sm"  ref="dt"
                dataKey="id"   responsiveLayout="scroll"
                               
                >
                <template #header>
                   已添加的<%=entity.javadoc%>
                </template>
               
                <template #empty>
                    无数据...
                </template>
                <template #loading>
                    加载数据中...请稍后
                </template>
                <% for (let col of cols){ %>
                <Column field="<%=col.name%>" header="<%=col.javadoc.replaceAll('_字典项','')%>" style="min-width:12rem" :sortable="true">
                    <template #body="{data}">
                        <% if(col.type==='Instant'||col.type==='Date') { %>
                                 {{dateFormat(data.<%=col.name %>)}}
                        <%}else if(col.javadoc.trim().endsWith('_字典项')){

                             const toColName = col.name.charAt(0).toUpperCase()+col.name.substring(1);
                        %>
                                 
                                  {{getNameOf<%=toColName%>s(data.<%=col.name %>)}}
                        <%}else{%>
                                 {{data.<%=col.name %>}}
                        <%}%>
                    </template>  
                </Column>
                <%}%>
                
            </DataTable>
           

            <div class="formgrid grid" style="margin-top:5rem;"> 
                 <% for (let i=0;i<cols.length&&i<4;i++){
                        let col = cols[i];  
                 %>
                        
               
                <div class="field col">
                     <label  for="<%=col.name%>"><%=col.javadoc.replaceAll('_字典项','')%></label>

                      <% if(col.type==='Instant'||col.type==='Date'){%>
                    
                         <Calendar id="<%=col.name%>" v-model="<%=entityNameSmall%>.<%=col.name%>" class="p-inputtext-sm" :showTime="true" :showSeconds="true" dataFormat="yy-mm-dd"/>
                      <%}else if(col.javadoc.trim().endsWith('_字典项')){%>
                         <Dropdown  id="<%=col.name %>" :options="<%=col.name%>s" optionLabel="name" optionValue="value"  v-model="<%=entityNameSmall%>.<%=col.name%>" class="p-dropdown-sm"   />
                     <%}else{%>
                         <InputText id="typeCode" v-model="<%=entityNameSmall%>.<%=col.name%>" class="p-inputtext-sm" placeholder="<%=col.javadoc%>" />
                     <%}%>



                     
                
                </div>
                <%}%>
            </div>

            <div class="flex flex-row justify-content-center" style="margin-bottom:0.5rem;">
                <Button label="查询" @click="doSearch" class="p-button-sm" style="margin:0 1rem"/>
                <Button label="重置" @click="doReset" class="p-button-sm p-button-warning" style="margin:0 1rem"/>
                <Button label="添加" @click="doAdd" class="p-button-sm p-button-warning" style="margin:0 1rem"/>
            </div>

           <DataTable :value="<%=entityNameSmall%>s" :paginator="true" :totalRecords="totalRecords"  :rows="10" @page="onPage($event)" @sort="onSort($event)" sortMode="multiple" :lazy="true" class="p-datatable-sm"   ref="dt"
                dataKey="id"   responsiveLayout="scroll"
                 v-model:selection="doSelecteds" :selectAll="selectAll" @select-all-change="onSelectAllChange" @row-select="onRowSelect" @row-unselect="onRowUnselect" :selectionMode="selectModel"
                
                >

                <template #header>
                   可查询的<%=entity.javadoc%>
                </template>
               
                <template #empty>
                    无数据...
                </template>
                <template #loading>
                    加载数据中... 请稍后
                </template>
                <Column :selectionMode="selectModel" headerStyle="width: 3em"></Column>
                
                 <% for (col of cols){ 
                    const toColName = col.name.charAt(0).toUpperCase()+col.name.substring(1);
                 %>
                    <Column field="<%=col.name %>" header="<%=col.javadoc.replaceAll('_字典项','') %>" style="min-width:12rem" :sortable="true">
                        <template #body="{data}">
                            <% if(col.type==='Instant'||col.type==='Date') {%>
                                 {{dateFormat(data.<%=col.name %>)}}
                            <%}else if(col.javadoc.trim().endsWith('_字典项')){%>
                                    {{getNameOf<%=toColName%>s(data.<%=col.name %>)}}
                            <%}else{%>
                                {{data.<%=col.name %>}}
                            <%}%>
                        </template>
                        
                    </Column>
                <%}%>
                
              
                
                
            </DataTable>
          
          
            
            <!-- <template #footer>
                <Button label="No" icon="pi pi-times" @click="closeMaximizable" class="p-button-text"/>
                <Button label="Yes" icon="pi pi-check" @click="closeMaximizable" autofocus />
            </template> -->
        </Dialog>
</template>
<script lang="ts">
    import request from '@/utils/request';
   


    import { defineComponent, ref, onMounted, toRefs, watch } from 'vue'
    import DateFormat from '@/utils/dateTools';

    export default defineComponent({
        name: '<%=entityName%>s',
        props: {
           selectionModel:String
        },
        emits: ['doAdd<%=entityName%>'],
        setup(props, { emit }) {

            onMounted(() => {
            lazyParams.value = {
                first: 0,
                rows: 10,
                sortField: null,
                sortOrder: null,
                filters: null
            };


           <% for(let col of cols){%>
           <%   if(col.javadoc.trim().endsWith('_字典项')){%>
                     
                    getWisdomDataDics('<%=entityName%>_<%=col.name%>').then((res)=>{
                        <%=col.name%>s.value = res.data;
                    });
           <%   }%>
           <% }%>

          
           
        })

            const { dateFormat } = DateFormat();
            const displayCPXX = ref(true);
            const selectAll = ref(false);
            const { selectionModel } = toRefs(props)
            const <%=entityNameSmall%> = ref({
                <%for(let col of cols){%>
                    <%if(col.type==='Instant'||col.type==='date'){%>
                         <%=col.name%>:null,
                    <%}else{%>
                         <%=col.name%>:'',
                    <%}%>
                   
                <%}%>
            });
            const doSelecteds=ref();;
            const selected<%=entityName%>s:any = ref([]);
            const <%=entityNameSmall%>s:any = ref([]);
           
            const lazyParams:any = ref({});
            setTimeout(() => {
                doSearch(); 
            }, 500);

            // 数据字典变量

           <% for(let col of cols){%>
           <%   if(col.javadoc.trim().endsWith('_字典项')){%>
                    const <%=col.name%>s = ref([]);
           <%   }%>
           <% }%>
            
            

            //分页

            const totalRecords = ref();
            const onPage=(event:any)=>{
                lazyParams.value = event;
                doSearch();
            };

            const onSort=(event:any)=>{
                 lazyParams.value = event;
                 doSearch();
            };

            const onSelectAllChange=(event:any)=>{
                //const checkAll = event.checked;

            }

            const onRowSelect=()=>{

            }

            const onRowUnselect=()=>{
                
            }


            // 查询
           

            const doSearch=()=>{
                <%=entityNameSmall%>s.value = [];
                
                const api = "/api/<%=doubleNames%>";
               
                    
                    const paramJson = JSON.parse(JSON.stringify(lazyParams.value));

                    //分页
                    const mypageInfo = [];
                    //const pageInfo = params.originalEvent;
                
                    const page = "page="+paramJson.first/paramJson.rows;
                    
                    const size = "size="+paramJson.rows;
                    mypageInfo.push(page);
                    mypageInfo.push(size);

                    const pageParam = mypageInfo.join("&");
                    //排序

                    let sortParam = '';
                    if(paramJson.sortField){
                        const sorts = [];    
                        const sigleSort = 'sort='+paramJson.sortField+((paramJson.sortOrder===-1)?',desc':'');
                        sorts.push(sigleSort);
                        sortParam = '&'+sorts.join("&");
                    }


                    if(paramJson.multiSortMeta && paramJson.multiSortMeta.length>0){
                        const sorts = [];   
                        for(let item of paramJson.multiSortMeta){
                            const sortP ='sort='+item.field+((item.order===-1)?',desc':'');
                            sorts.push(sortP);
                        }
                        sortParam = '&'+sorts.join("&");
                    }
                
                 
                

                    //过滤
                    const filters = paramJson["filters"];
                    let filterParam = "";
                    if(filters){
                        filterParam = Object.keys(filters).filter(key=>filters[key].value).map(key=>{
                        return key+"."+filters[key].matchMode+"="+ filters[key].value;
                    }).join('&')
                    }

                   const pt =  JSON.parse(JSON.stringify(<%=entityNameSmall%>.value));
                   const searchParams=  Object.keys(pt).filter((key:any)=>pt[key]).map((key:any)=>{
                       return key+".contains="+pt[key]
                   }).join("&")
                    


                    return request({
                        url: api+"?"+pageParam+sortParam+"&"+filterParam+"&"+searchParams,
                        method: 'GET',
                        json: true
                
                    }).then((res) => {
                        
                         totalRecords.value = res.totalRecords;
                         <%=entityNameSmall%>s.value= res.data;
                    
                    })
		
		
                

                
            }

            const doReset=()=>{
                    <%=entityNameSmall%>.value={
                    <%for(let col of cols){%>
                        <%if(col.type==='Instant'||col.type==='date'){%>
                            <%=col.name%>:null,
                        <%}else{%>
                            <%=col.name%>:'',
                        <%}%>
                    
                    <%}%>
                };
            }

            //const selectModel = ref("multiple");

            const selectModel = ref("single");

            if(selectionModel.value ==='multiple'){
                selectModel.value = "multiple";
            }

            //添加
            const doAdd=()=>{
               //alert(JSON.stringify(doSelecteds.value));
               if(selectModel.value === "single"){//单选
                    selected<%=entityName%>s.value = [];
                    selected<%=entityName%>s.value.push(doSelecteds.value);
               }else{
                  for(let e of doSelecteds.value){
                        if(!selected<%=entityName%>s.value.some( (m:any)=> {return m.id===e.id})){
                            selected<%=entityName%>s.value.push(e);
                        }
                  }
               }
              
               emit('doAdd<%=entityName%>',selected<%=entityName%>s.value);
            }

            const showMe = (selectedValues:any[])=>{
                
                let ids = selectedValues.map((ele)=>ele.id);

               
                const api = "/api/<%=doubleNames%>";
                request({
                    url: api+"?id.in="+ids,
                    method: 'GET',
                    json: true
            
                }).then((res) => {
                    
                        selected<%=entityName%>s.value = [];
                        res.data.forEach((item:any)=>{
                            selected<%=entityName%>s.value.push(item);
                        })
                
                })

                displayCPXX.value = true;

            }


            const getWisdomDataDics = (key:any) =>{
                    const api = "/api/wisdom-data-dics";
                    return request({
                        url: api+"?other.equals="+key,
                        method: 'GET',
                        json: true
                
                    });

            };


            <% for (let col of cols) {%>
                <%if(col.javadoc.trim().endsWith('_字典项') ){
                  const toColName =  col.name.charAt(0).toUpperCase().toUpperCase()+col.name.substring(1);
                  
                %>        
                    const getNameOf<%=toColName%>s = (value:any)=>{
                        let c:any = <%=col.name%>s.value.find((item:any)=>{
                            return item.value === value;
                        });
                        return c?.name?c.name:value;
                    }
                 <%}%>

            <%}%>  


            return {
                dateFormat,displayCPXX,showMe,selected<%=entityName%>s,<%=entityNameSmall%>s,onPage,totalRecords,onSort,selectAll,doSelecteds,onSelectAllChange,onRowSelect,onRowUnselect,<%=entityNameSmall%>,doSearch,doReset,doAdd,selectModel,

               <% for(let col of cols){
                     const toColName =  col.name.charAt(0).toUpperCase().toUpperCase()+col.name.substring(1);
               %>
               <%   if(col.javadoc.trim().endsWith('_字典项')){%>
                         
                       
                            <%=col.name%>s,getNameOf<%=toColName%>s,
               <%   }%>
               <% }%>


            }

        }

    });
</script>