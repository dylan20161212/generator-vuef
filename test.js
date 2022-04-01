  
  var fs = require("fs");
  var path = require('path');
  var exec = require('child_process').exec;

  _getComponentModelFiles();
  _getViewModelFiles();

 function _getComponentModelFiles(){
     	console.log("查看组件模板目录");
     	 
		const componentModels = [];
		readFileList("generators/app/templates/vue_tls1/components",componentModels);
		console.log(componentModels);
		return componentModels;
  }


  function _getViewModelFiles(){
     	console.log("查看视图模板目录");
     	const componentModels = [];
     	readFileList("generators/app/templates/vue_tls1/views",componentModels)
     	console.log(componentModels);
		return componentModels;
  }


  function readFileList(dir, filesList = []) {
	  const files = fs.readdirSync(dir);
	  //console.log(files);
	  files.forEach((item, index) => {
	    var fullPath = path.join(dir, item);
	    const stat = fs.statSync(fullPath);
	    if (stat.isDirectory()) {   
	      readFileList(path.join(dir, item), filesList); //递归读取文件
	    } else {        
	      filesList.push(fullPath);           
	    }    
	  });
	  return filesList;
  }