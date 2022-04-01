
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
%>
import { ref, onMounted,reactive  } from 'vue';
import { email, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
export default function(<%=entityNameSmall%>Service:any){



    const isAdd = ref(false);
    const showMessage = ref(false);
    const state = reactive({
        id:'',

    <%for(let col of cols) { %>
            <%=col.name%>: '', 
    <%}%>
       
      
    <% for(let manyToOne of manyToOnes){
        const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
        const toEntity = app.entities.find((e)=>{
            return  e.name ===manyToOne.name;
        }); %>
        <%=toName%>:{
            id:''
        },
    <%}%>

    <% for(let manyToMany of manyToManys){
        const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
        const toEntity = app.entities.find((e)=>{
            return  e.name ===manyToMany.name;
        }); %>
        <%=toName%>s:[],
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
        state.<%=col.name%> = data.<%=col.name%>;
        <%}%>
        
        <% for(let manyToOne of manyToOnes){
            const toName =  manyToOne.to.name.charAt(0).toLowerCase()+manyToOne.to.name.substring(1);
            const toEntity = app.entities.find((e)=>{
                return  e.name ===manyToOne.to.name;
            }); %>
        state.<%=toName%> = data.<%=toName%>;
        if(!state.<%=toName%>){
            state.<%=toName%> = {id : ''};
        }
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
        state.<%=toName%>.id = '';
        <%}%>

        <% for(let manyToMany of manyToManys){
            const toName =  manyToMany.to.name.charAt(0).toLowerCase()+manyToMany.to.name.substring(1);
            const toEntity = app.entities.find((e)=>{
                return  e.name ===manyToMany.name;
            }); %>
        state.<%=toName%>s = [];
        <%}%>
        submitted.value = false;
    }



    return {
       showMessage,state,rules,v$,submitted,displayMaximizable,isAdd,
       openMaximizable,openEditMaximizable,closeMaximizable,handleSubmit,toggleDialog,resetForm
    }


}