const Generator = require('yeoman-generator')


const { Client } = require('pg')
var conString = "postgres://postgres:123321@localhost:5432/wisdomcity";//此时数据库必须已经创建
const client = new Client(conString)



module.exports = class extends Generator {
 async prompting(){

     this.answers =  await this.prompt([{
        type: 'input',
        name: 'name',
        message: '请输入您的表名前缀，全表名称以$结尾',
        default: this.appname 
    },
    {
        type: 'input',
        name: 'rootPath',
        message: '请输入生成路径',
        default: '/home/genfiles'
    }

    ])
  }
 async writing(){
 	//const context = this.answers  // context 编程用户的回答内容
 	console.log( this.answers )
 	console.log("writing start")
 	client.connect()
 	
 	await this._findTableInfo();


 	console.log(this.tables);

 	for( let tableInfo of this.tables){
 		this.context = tableInfo;
 		

    	await this._findTableInfoCols(this.context.table_name);

	    if(!this.context.cols){
	    	console.error(this.context.tableName+"列不存在！");
	    	this.client.end();
	 		return;
	    }

	    // 模板文件路径
	    const tmpl = this.templatePath('foo.txt')
	    // 输出文件路径
	    const output = this.destinationPath(this.answers.rootPath+'/'+this.context.table_name+'.txt')
	    // 模板数据上下文
	    
	    this.fs.copyTpl(tmpl, output, this.context)

 	}
 	
 	
    client.end();
  }


  async _findTableInfo(  ){
		
		if(this.answers.name.charAt(this.answers.name.length-1)=='$'){
			this.answers.name= this.answers.name.substring(0,this.answers.name.length-1);
		}
		const values = [this.answers.name+'%'];


		var sql = 'SELECT	"table_name",	table_catalog,table_schema,obj_description ( oid, \'pg_class\' ) FROM	information_schema.tables t1,	pg_class t2 WHERE	table_schema = \'public\' AND t1."table_name" = t2.relname and table_name like $1';
		console.log(sql);
		this.tables = [];
		try{
	        const res = await  client.query(sql,values);
			if(res.rows.length<=0){
				console.error("符合条件的表不存在...!");
				client.end();
				return false;
			}else{
				for(let table of res.rows){
					this.tables.push(table);
				}
				 
				
				console.log(this.tables);
			}
	    }catch (err) {
		  console.log(err.stack)
		   client.end();
		}
		
  }



  async _findTableInfoCols( tableName ){
		
		const values =[tableName] ;
		var sql =   " SELECT                                                                                                             "+
					" 	base.column_name,                                                                                                "+
					" 	col_description ( t1.oid, t2.attnum ) col_description,                                                                           "+
					" 	is_nullable,                                                                                                     "+
					" 	base.udt_name  data_type,                                                                                                   "+
					" 	COALESCE(character_maximum_length, numeric_precision, datetime_precision) col_len,                                       "+
					" 	(CASE                                                                                                            "+
					" 		WHEN ( SELECT t2.attnum = ANY ( conkey ) FROM pg_constraint WHERE conrelid = t1.oid AND contype = 'p' ) = 't'  "+
					" 		THEN 1 ELSE 0                                                                                                  "+
					" 	END ) iskey                                                                                                      "+
					" FROM                                                                                                               "+
					" 	information_schema.COLUMNS base,                                                                                 "+
					" 	pg_class t1,                                                                                                     "+
					" 	pg_attribute t2                                                                                                  "+
					" WHERE                                                                                                              "+
					" 	base.table_name = $1                                                                                  "+
					" 	AND t1.relname = base.table_name                                                                               "+
					" 	AND t2.attname = base.column_name                                                                              "+
					" 	AND t1.oid = t2.attrelid                                                                                         ";

		//console.log(sql);
		//console.log(values);
		
		try{
	        const res = await  client.query(sql,values);
			if(res.rows.length<=0){
				console.error("列不存在...!");
				client.end();
				return false;
			}else{

				const cols = [];
				for(let col of res.rows){
					cols.push(col);
				}
				 
				
				this.context["cols"] = cols;
				console.log("----列信息为-----column_name,,col_description,is_nullable,data_type,col_len,iskey");
			}
	    }catch (err) {
		  console.log(err.stack)
		  client.end();
		}

		
		
  }
}


