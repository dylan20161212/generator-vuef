const Generator = require('yeoman-generator')
const jhisterLib = require('jhipster-core');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;

module.exports = class extends Generator {
 async prompting(){

     this.answers =  await this.prompt([{
        type: 'input',
        name: 'jdlName',
        message: '请输入您的jdl文件名',
        default: 'E:/work/tongyimenhu/code/wisdomcity/jdls/jdlTest2.jdl',
		store:true,
    },
	{
        type: 'input',
        name: 'entityName',
        message: '请输入您的要生成的entity名称(默认值*代表所有，多个entity用英文,分隔）',
        default: '*',
		store:true,
    },
    {
        type: 'input',
        name: 'genPath',
        message: '请输入生成路径',
        default: 'E:/work/tongyimenhu/code/test/gens',
		store:true,
    }
    ])
  }
 async writing(){
	if(!this.answers.jdlName){
		this.log.error('jdl 文件名不能为空');
		return;
	}

	if(!this.answers.entityName){
		this.log.error('entity名称 不能为空');
		return;
	}

	if(!this.answers.genPath){
		this.log.error('生成的路径不能为空');
		return;
	}

	const files = [this.answers.jdlName];
	let result = null;
    try{
		result = jhisterLib.parseFromFiles(files);
	}catch(error){
		this.log.error("jdl 解析异常，请核实路径或者文件内容");
		return;
	}

	this.context = {};
    this.context["app"] = result;
	//this.log(JSON.stringify(this.context));
	//this.log("this.answers.entityName----------------"+this.answers.entityName);
	if(result && this.answers.entityName !=='*'){
		const entityNames = this.answers.entityName.split(',');
		//this.log("execute----------------0");
		for(let entityName of entityNames){
			this.context.entityName = entityName;
			this._genViewFile();

		}

	}


	if(result && this.answers.entityName ==='*'){
		//this.log("execute----------------1");
		const entityNames = result.entities.map(entity=>entity.name);
		for(let entityName of entityNames){
			this.context.entityName = entityName;
			this._genViewFile();

		}

	}
		
  
  }


   
   _genComponentFiles(){
   		this.log("生成"+this.context.entityName+"的关系组件...");

	   	const relationEntityNames = this.context.app.relationships.filter((item)=>{
	   		this.log(item.from.name === this.context.entityName);
	   		this.log(item.from.name +"==="+ this.context.entityName);
			return item.from.name === this.context.entityName
		}).map(ele=>ele.to.name);
	   	this.log("生成"+this.context.entityName+"的关系组件为："+relationEntityNames);
	    const componentModels = this._getComponentModelFiles();
   		for(let entityName of relationEntityNames){
   			let componentContext = {};
   			componentContext["entityName"]=entityName;
   			componentContext["app"] = this.context.app;
   			let fileName =entityName.replaceAll(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
   			//let fileName =entityName;
   			// 模板文件路径
   			for(let m of componentModels){
   				//模板
   				// const tmpl = this.templatePath('vue_tls1/components'+m);
   				// this.log("tmpl-->"+tmpl);
   				//const output = this.destinationPath(this.answers.genPath+'/components/'+fileName+"/"+fileName+'.vue')
   				this.log("--------------------:"+this.templatePath('vue_tls1'));
   				const dest = this.answers.genPath+'/'+m.replaceAll("modelName",fileName).substring(this.templatePath('vue_tls1').length);
   				this.log("output-->"+dest);
   				this.fs.copyTpl(m, dest, componentContext)
   			}

   		}
   		this.log(this.context.entityName+"的关系组件生成完成");


   }


   _genViewFile(){
   	        this._genComponentFiles();
   			this.log("生成"+this.context.entityName+" view 实体");
   			const entityName = this.context.entityName ;


			//this.log(JSON.stringify(this.context));
			const viewModels = this._getViewModelFiles();

			for(let view of viewModels){
				    this.log("开始生成模板..."+view)
					// 模板文件路径
					//const tmpl = this.templatePath('vue_tls1/views'+view);
					// 驼峰标示转为中划线
					let fileName =entityName.replaceAll(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
					//let fileName =entityName;
					const dest = view.replaceAll("modelName",fileName).substring(this.templatePath('vue_tls1').length);
					this.log("output-->"+dest);
					
					// 输出文件路径
					const output = this.destinationPath(this.answers.genPath+'/'+dest)
					this.fs.copyTpl(view, output, this.context)

			}


   }



   _getComponentModelFiles(){
     	this.log("查看组件模板目录");
     	 
		const componentModels = [];
		const tmpl = this.templatePath('vue_tls1/components');
		this._readFileList(tmpl,componentModels);
		this.log(componentModels);
		return componentModels;
  }


   _getViewModelFiles(){
     	this.log("查看视图模板目录");
     	const componentModels = [];
     	const tmpl = this.templatePath('vue_tls1/views');
     	this._readFileList(tmpl,componentModels)
     	this.log(componentModels);
		return componentModels;
  }


   _readFileList(dir, filesList = []) {
	  const files = fs.readdirSync(dir);
	  //this.log(files);
	  files.forEach((item, index) => {
	    var fullPath = path.join(dir, item);
	    const stat = fs.statSync(fullPath);
	    if (stat.isDirectory()) {   
	      this._readFileList(path.join(dir, item), filesList); //递归读取文件
	    } else {        
	      filesList.push(fullPath);           
	    }    
	  });
	  return filesList;
  }






}


