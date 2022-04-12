
<%
        //获取entityInfo
        const entity = app.entities.find(item=>item.name===entityName);
        const entityNameSmall = entityName.charAt(0).toLowerCase()+entityName.substring(1);
        const entityNameHyphen = entityName.replace(/([a-z])([A-Z])/g,"-$1").toLowerCase();
        const entityName_ = entityName.replace(/([a-z])([A-Z])/g,"_$1").toLowerCase();
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
import { ref, onMounted,reactive ,computed } from 'vue';
import { email, required ,minLength,maxLength,minValue,maxValue } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { helpers  } from '@vuelidate/validators'
export default function(<%=entityNameSmall%>Service:any){

   

    const isAdd = ref(false);
    const showMessage = ref(false);
    const state:any = reactive({
        id:'',

    <%for(let col of cols) { %>
            <%=col.name%>: '', 
    <%}%>
       
      
    <% for(let manyToOne of manyToOnes){
        const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
        const toEntity = app.entities.find((e)=>{
            return  e.name ===manyToOne.name;
        }); %>
        <%=toName%>:null,
    <%}%>

    <% for(let manyToMany of manyToManys){
        const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
        const toEntity = app.entities.find((e)=>{
            return  e.name ===manyToMany.name;
        }); %>
        <%=toName%>s:null,
    <%}%>
    });

     <% for (let col of cols){ 
            const patterns =  col.validations.filter((item)=>item.key==='pattern').map(ele=>{
                return   "const "+col.name+'Pattern'+"= helpers.regex(/"+(ele.value?ele.value:'')+"/)";
             }).join(";");



     %>
         
          <%=patterns%>                            

     <%}%>

    <% for(let manyToOne of manyToOnes){
         const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
         const toEntity = app.entities.find((e)=>{
            return  e.name ===manyToOne.name;
         });
         let displayField = "id";
         if(manyToOne.from.javadoc){
               displayField=  manyToOne.from.javadoc.trim();
         }

    %>
         const <%=toName%><%=displayField%> = computed(()=>{
            if(state.<%=toName%> && state.<%=toName%>.<%=displayField%>){
                return state.<%=toName%>.<%=displayField%>;
            }else{
                return '';
            }
          });

    <%}%>


     <% for(let manyToMany of manyToManys){
         const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
         const toEntity = app.entities.find((e)=>{
            return  e.name ===manyToMany.name;
         });
         let displayField = "id";
         if(manyToMany.from.javadoc){
               displayField=  manyToMany.from.javadoc.trim();
         }
         const displayFieldFirstLow = displayField.charAt(0).toLowerCase()+displayField.substring(1)

    %>
         const <%=toName%><%=displayFieldFirstLow%>s = computed(()=>{
            if(state.<%=toName%>s && state.<%=toName%>s.length>0){
                if(state.<%=toName%>s.some((item:any)=>!item.id)){
                    return '';
                }     
                return state.<%=toName%>s.map((item:any)=>item.<%=displayField%>).join(',');
            }else{
                return '';
            }
          });

    <%}%>

     const patternMsg = '输入格式不正确';

    

    const rules:any = {
            <% for (let col of cols){
                if(col.validations && col.validations.length>0) {
                    let ruleStr1 =  col.validations.map((v)=>{

                                    
                                    if(v.key==='minlength'){
                                       return 'minLength:minLength'+(v.value?('('+v.value+')'):'')
                                    }else
                                    if(v.key==='maxlength'){
                                       return 'maxLength:maxLength'+(v.value?('('+v.value+')'):'')
                                    }else
                                    if(v.key.trim()==="min"){ 
                                         return 'minValue:minValue'+(v.value?('('+v.value+')'):'')
                                    }else

                                    if(v.key==='max'){
                                         return 'maxValue:maxValue'+(v.value?('('+v.value+')'):'')
                                    }else

                                    

                                    if(v.key==='pattern'){
                                      return  col.name+'Pattern'+':'+"helpers.withMessage(patternMsg,"+col.name+"Pattern)"

                                    }else

                                    if (v.key==='required') {
                                        return v.key+':'+v.key
                                    }else
                                      {
                                         return  ''
                                      } 
                     }).join('    ,')

                %>

                  <%=col.name %>: { <%=ruleStr1%> },
                <%}%>
            <%
              }
            %>
    };

    //字典树或者所属辖区
    <% for(let col of cols){ -%>
        <% if(col.javadoc.trim()==='所属辖区'||col.javadoc.trim().endsWith('字典树')){%>

            const <%=col.name%>Nodes = ref();//ADD
        <%}%>

    <%}%>

    const v$ = useVuelidate(rules, state);

    const submitted = ref(false);

  


    //form 最大化
    const displayMaximizable = ref(false);
    
    const openMaximizable = () => {
        resetForm();
        isAdd.value = true;
        displayMaximizable.value = true;
    };

    const openEditMaximizable = (newData:any) => {
        let data = JSON.parse(JSON.stringify(newData));
     
        state.id = data.id;
        <% for(let col of cols) { %>

            <% if(col.javadoc.trim()==='所属辖区'||col.javadoc.trim().endsWith('字典树')){%>
                if(data.<%=col.name%>){//ADD
                    let obj:any = {};
                    obj[ data.<%=col.name%>+'']=true;
                    state.<%=col.name%> =obj;
                }else{
                    state.<%=col.name%> = data.<%=col.name%>;
                }
                
            <%}else{%>
                state.<%=col.name%> = data.<%=col.name%>;
            <%}%>



        <%}%>
        
        <% for(let manyToOne of manyToOnes){
            const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
            const toEntity = app.entities.find((e)=>{
                return  e.name ===manyToOne.to.name;
            }); %>
        state.<%=toName%> = data.<%=toName%>;
        
        <%}%>

        <% for(let manyToMany of manyToManys){
            const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
            const toEntity = app.entities.find((e)=>{
                return  e.name ===manyToMany.name;
            }); %>
        state.<%=toName%>s = data.<%=toName%>s;
        <%}%>

        isAdd.value = false;
        displayMaximizable.value = true;
    };
    
    const closeMaximizable = () => {
        displayMaximizable.value = false;
    };

    const handleSubmit = (isFormValid:Boolean,loadLazyData:any) => {
        submitted.value = true;
        if (!isFormValid) {
           
            return;
        }


        <%for(let col of cols){ %>
            <% if(col.javadoc.trim()==='所属辖区'||col.javadoc.trim().endsWith('字典树')){%>
                if(state.<%=col.name%>){ //ADD
                    state.<%=col.name%>=Object.keys(state.<%=col.name%>)[0];
                }
                
            <%}%>
        <%}%>

        if(isAdd.value){
            <%=entityNameSmall%>Service.value.add<%=entityName%>(JSON.stringify(state)).then((ret:any)=>{
                displayMaximizable.value = false;
                toggleDialog();
                loadLazyData();
                resetForm();
            }); 
        }else{

            <%=entityNameSmall%>Service.value.edit<%=entityName%>(JSON.stringify(state)).then((ret:any)=>{
                displayMaximizable.value = false;
                toggleDialog();
                loadLazyData();
                resetForm();
            }); 

        }
       
        
    }


    const toggleDialog = () => {
        showMessage.value = !showMessage.value;
        if(!showMessage.value) {
            resetForm();
        }
    }

    const resetForm = () => {
            state.id = '';
        <% for(let col of cols) { %>
            state.<%=col.name%> = '';
        <%}%>
       
       

        <% for(let manyToOne of manyToOnes){
            const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
            const toEntity = app.entities.find((e)=>{
                return  e.name ===manyToOne.name;
            }); %>
        state.<%=toName%> = null;
        <%}%>

        <% for(let manyToMany of manyToManys){
            const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
            const toEntity = app.entities.find((e)=>{
                return  e.name ===manyToMany.name;
            }); %>
        state.<%=toName%>s = null;
        <%}%>
        submitted.value = false;
    }



    return {
       showMessage,state,rules,v$,submitted,displayMaximizable,isAdd,
       <%=treeFieldNames%>
       openMaximizable,openEditMaximizable,closeMaximizable,handleSubmit,toggleDialog,resetForm,<%=computeFieldsStr%>


     

    }


}