
<%
	//获取entityInfo
	const entity = app.entities.find(item=>item.name===entityName);
	const entityNameSmall = entityName.charAt(0).toLowerCase()+entityName.substring(1);
	const entityNameHyphen = entityName.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
    const entityName_ = entityName.replace(/([a-z])([A-Z])/g,"$1_$2").toLowerCase();
	const cols = entity.body;

	let doubleNames='';
    if(entityNameHyphen.endsWith('s')||entityNameHyphen.endsWith('x')||entityNameHyphen.endsWith('ch')||entityNameHyphen.endsWith('sh')){
        doubleNames=entityNameHyphen+'es';
    }else if(entityNameHyphen.endsWith('f')){
         doubleNames= entityNameHyphen.substring(0,entityNameHyphen.length-1)+'ves'
    }else if(entityNameHyphen.endsWith('fe')){
         doubleNames= entityNameHyphen.substring(0,entityNameHyphen.length-2)+'ves'
    }else if(entityNameHyphen.endsWith('y') && !(entityNameHyphen.endsWith('ay')||entityNameHyphen.endsWith('ey')||entityNameHyphen.endsWith('iy')||entityNameHyphen.endsWith('oy')||entityNameHyphen.endsWith('uy')) ){
         doubleNames= entityNameHyphen.substring(0,entityNameHyphen.length-1)+'ies'
    }else{
        doubleNames= entityNameHyphen+'s';
    }

	const colNamesStr = cols.map(item=>item.name).join(',');

	const manyToOnes = app.relationships.filter((item)=>{
		return item.from.name === entityName && (item.cardinality==='ManyToOne'||item.cardinality==='OneToOne');
	});

	const manyToMany= app.relationships.filter((item)=>{
		return item.from.name === entityName && (item.cardinality==='ManyToMany'||item.cardinality==='OneToMany');
	});
%>

import request from '@/utils/request';

const <%=entityNameSmall%>sApi={
	<%=entityNameSmall%>sUri: '/api/<%=doubleNames%>',

 
}

export default class <%=entityName%>Service {

    get<%=entityName%>s(params:any) {
		

		const paramJson = JSON.parse(params);

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
      
		//TODO
       

		//过滤
        const filters = paramJson["filters"];
        const filterParam = Object.keys(filters).filter(key=>filters[key].value).map(key=>{
        	if(filters[key].value.length>1){
				return key+".in"+"="+ filters[key].value;
			}
            return key+"."+filters[key].matchMode+"="+ filters[key].value;
        }).join('&')


		return request({
			url: <%=entityNameSmall%>sApi.<%=entityNameSmall%>sUri+"?"+pageParam+sortParam+"&"+filterParam,
			method: 'GET',
			json: true
	
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  })
		
		

	
	
	}



	add<%=entityName%>(data :any){
		const dataJson = JSON.parse(data);
		this.deleteObjPropIdNull(dataJson);
		return request({
			url: <%=entityNameSmall%>sApi.<%=entityNameSmall%>sUri,
			method: 'POST',
			json: true,
			data:dataJson
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  },(erro)=>{
			return Promise.reject(erro)
		  })
	}




	edit<%=entityName%>(data :any){
		
		const dataJson = JSON.parse(data);
		this.deleteObjPropIdNull(dataJson);
		return request({
			url: <%=entityNameSmall%>sApi.<%=entityNameSmall%>sUri+"/"+dataJson.id,
			method: 'PUT',
			json: true,
			data:dataJson
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  },(erro)=>{
			return Promise.reject(erro)
		  })
	}


	delete<%=entityName%>(id:any){
		return request({
			url: <%=entityNameSmall%>sApi.<%=entityNameSmall%>sUri+"/"+id,
			method: 'DELETE',
			json: true
			
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  },(erro)=>{
			return Promise.reject(erro)
		  })
	}

 <% for (let col of cols) {  
	 
 %>
   		<%if(col.javadoc.trim().endsWith('_字典项') ){
			const toColName =  col.name.charAt(0).toUpperCase()+col.name.substring(1);
			
		%>

			
			get<%=toColName%>s(){

				let data =  [{
					name:'<%=col.javadoc%>1',
					value:'001'
				},
				{
					name:'<%=col.javadoc%>2',
					value:'002'
				},
				{
					name:'<%=col.javadoc%>3',
					value:'003'
				}
				];

				return new Promise((resolve,reject)=>{
					resolve(data);
				});
			}

		<%}%>

	<%}%>



	deleteObjPropIdNull(obj:any){
		for(let key of Object.keys(obj)){
			if(typeof obj[key] === 'object' && !obj[key].id){
				delete obj[key];
			}
		}
 
	 }

	
}