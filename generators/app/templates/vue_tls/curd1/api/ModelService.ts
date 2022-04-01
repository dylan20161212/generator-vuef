


import request from '@/utils/request';

const modelApi={
	modelUri: '/api/Service',
}

export default class Service {

    get(params:any) {
		

		const paramJson = JSON.parse(params);

		//分页
		const mypageInfo = [];
		
       
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
        const filterParam = Object.keys(filters).filter(key=>filters[key].value).map(key=>{
            return key+"."+filters[key].matchMode+"="+ filters[key].value;
        }).join('&')


		return request({
			url: modelApi.modelUri+"?"+pageParam+sortParam+"&"+filterParam,
			method: 'GET',
			json: true
	
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  })
		
	
	}



	add(data :any){
		return request({
			url: modelApi.modelUri,
			method: 'POST',
			json: true,
			data:data
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  },(erro)=>{
			return Promise.reject(erro)
		  })
	}

	edit(data :any){
		const dataJson = JSON.parse(data)
		return request({
			url: modelApi.modelUri+"/"+dataJson.id,
			method: 'PUT',
			json: true,
			data:data
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  },(erro)=>{
			return Promise.reject(erro)
		  })
	}

	delete(id:any){
		return request({
			url: modelApi.modelUri+"/"+id,
			method: 'DELETE',
			json: true
			
		  }).then((res) => {
			
			  return Promise.resolve(res)
		   
		  },(erro)=>{
			return Promise.reject(erro)
		  })
	}

}