module.exports = function(fis) {

var namespace = fis.get('namespace');
if (typeof namespace != "string" || namespace.length <= 0) {
    fis.log.error('Invalid namespace[%s].[%s]', namespace, fis.project.getProjectPath());
}
var last = namespace.substr(-1, 1);
if ('/' == last || '\\' == last) {
    namespace = namespace.substr(0, namespace.length - 1);
    fis.set('namespace', namespace);
}
 
fis.set('cache_suffix', Date.now());

fis.set('resources_dir', '/resource');
fis.set('views_dir', '${resources_dir}/view_file');
fis.set('static_dir', '/public/static');

fis.set('resource_files', '**.{css,js,oft,svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur,webp,swf,ttf,eot,woff2}');
//css,tpl,js,php,txt,json,xml,htm,text,xhtml,html,md,conf,po,config,tmpl,coffee,less,sass,jsp,scss,manifest,bak,asp,tmp,haml,jade,aspx,ashx,java,py,c,cpp,h,cshtml,asax,master,ascx,cs,ftl,vm,ejs,styl,jsx,handlebars,shtml,ts,tsx,yml,sh,es,es6,es7,map
//oft,svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur,webp,swf,ttf,eot,woff2

var normal_release = {
    release: '${static_dir}/${namespace}$0',
    url: '/static/${namespace}$0',
};
/* 默认处理方式 */
//所有文件不发布
fis.match('*', {
    release: false,
    useCache: false
});
//blade后端视图模板文件放到模板目录中
fis.match('/(**.tpl)', {
	release: '${views_dir}/${namespace}$0',
    url: '${namespace}/$1',
    isHtmlLike: true,
    useMap: true,
    useSameNameRequire: true,
	"isPage" : true,
    "extras": {
        "isPage": true,
    }
});
//所有js文件开启同名依赖
fis.match('**.js', {
    useSameNameRequire: true,
});
//JS模块化文件(文件名包含".mod.")设置模块标识
fis.match('/(**).mod{,.min}.js', {
    isMod: true,
    moduleId:'$1',
});
/* 针对文件或者目录特殊处理 */
//page目录
//资源文件放到static目录下
fis.match('/page/${resource_files}', normal_release);
//模板文件

//static目录
//资源文件特殊处理
fis.match('/static/(${resource_files})', {
	release: '${static_dir}/${namespace}/$1',
	url: '/static/${namespace}/$1'
});
//widget目录
//资源文件放到static目录下
fis.match('/widget/${resource_files}', normal_release);
//模板文件

//map.json放到config目录下
fis.match('/map.json', {
	release: '${resources_dir}/view_map/${namespace}-map.json'
});
//prod模式下的规则
fis
    .media("prod")
	//所有js文件加后缀,同时进行压缩处理
    .match('**.js', {
        query: '?' + fis.get('cache_suffix'),
        optimizer: fis.plugin('uglify-js', {}),
    })
    //.min.js的js文件不压缩
	.match('**.min.js', {
        optimizer: false,
    })
    //所有css文件
	.match('**.css', {
        query: '?' + fis.get('cache_suffix'),
        //压缩
        optimizer: fis.plugin('clean-css', {
            'keepBreaks': true //保持一个规则一个换行
        }),
    })
    .match('*.png', {
        // fis-optimizer-png-compressor 插件进行压缩，已内置
        optimizer: fis.plugin('png-compressor')
    })
;

//以cmd模块规范进行模块化
fis.hook('cmd');

};
