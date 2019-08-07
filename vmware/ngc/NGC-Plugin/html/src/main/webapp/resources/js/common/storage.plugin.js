/**
 * 获取提交Value
 * @return
 */
function getAllDocumentData() {
	var allData = {};
	$.each($("input[id^='txt']"), function(i){
		var value = $.trim(this.value);
		eval("allData." + this.id + "='" + value + "';");
	});
	$.each($("select[id^='sel']"), function(i){
		eval("allData." + this.id + "='" + this.value + "';");
	});
	return allData;
}

/**
 * 验证
 * @param doms
 * @return
 */
function validateForm(doms){
	if (Object.prototype.toString.call(doms) == '[object Array]') {
		for (var i=0; i<doms.length; i++){
			var dom = doms[i];
			var jqDom = $("#" + dom);
			var val = $.trim(jqDom.val());
			var domName = jqDom.prop("domName");
			if(domName && lang.indexOf("en") >= 0)
			{
				domName = changeToLowercase(domName);
			}
			//验证必填
			var req = $("#"+dom).prop("required");
			if (jqDom.prop("required") == "true") {
				if (!val || val == "") {
					var info = pageParam.validate.required.replace("[xxx]", domName);
					var pop_alert = top.ShowAlertCallBack(dom,ERROR, "/StoragePluginV1R1/image/alert_failed.png",info,240,120,function(){
						$('#'+dom).focus();
						pop_alert.close();
					});
					return false;
				}
			}
			//验证密码长度
			if (jqDom.prop("passwordLength") == "true") {
				if (val.length < 8) {
					var info = pageParam.validate.passwordLength;
					ShowAlert(ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,240,120);
					return false;
				}
				if(val.length > 32) {
					var info = pageParam.validate.passwordLengthMax;
					ShowAlert(ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,240,120);
					return false;
				}
			}
			//验证用户名长度
			if(jqDom.prop("usernameLength") == "true")
			{
				if(val.length > 32) {
					var info = pageParam.validate.usernameLengthMax;
					ShowAlert(ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,240,120);
					return false;
				}
			}
			//验证特殊字符(字母中文或_开头,由数字、字母、中文、_和-组成,且不能为空)
			if (jqDom.prop("special") == "true") {
				if (!checkSpecialCharacters(val)) {
					var info = pageParam.validate.special.replace("[xxx]", domName)
					.replace("[xxx]", domName);
					ShowAlert(ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,240,120);
					return false;
				}
			}
			//验证IP
			if (jqDom.prop("ip") == "true") {
				var ipStatus = checkIP(val);
				if (jqDom.prop("required") == "false"){
					if (val != ""){
						if (ipStatus != 2){
							if (ipStatus == 0){
								
								ShowAlert(ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,270,130);
							} else if (ipStatus == 1){
								var info = pageParam.validate.ipFormat.replace("[xxx]", val);
								ShowAlert(ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,300,150);
							}
							return false;
						}
					}
				} else {
					if (ipStatus != 2){
						if (ipStatus == 0){
							var info = "";
							var width = 270;
							var height = 130;
							info= pageParam.validate.ip.replace("[xxx]",val);
							width = 300;
							height = 150;
							var pop_alert = top.ShowAlertCallBack(dom,ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,width,height,function(){
								$('#'+dom).focus();
								pop_alert.close();
							});
						} else if (ipStatus == 1){
							var info = pageParam.validate.ipFormat.replace("[xxx]", val);
							var width = 300;
							var height = 150;
							if(lang.indexOf("en") >= 0)
							{
								width = 370;
								height = 150;
							}
							var pop_alert = top.ShowAlertCallBack(dom,ERROR,"/StoragePluginV1R1/image/alert_failed.png",info,width,height,function(){
								$('#'+dom).focus();
								pop_alert.close();
							});
						}
						return false;
					}
				} 
			}
			
		}
		return true;
	}
}

//首字母转换为小写,未考虑缩略语等不做转换
function changeToLowercase(word)
{
	var wordSplitStr = " "; 
    var words  = word.split(wordSplitStr); 
    var reg = /\b(\w)|\s(\w)/g; 
    var replaceReg = words[0].replace(reg,function(m){return m.toLowerCase();});
    var returnWord = replaceReg + wordSplitStr;
    
    for(var i=1; i< words.length; i++)
    {
    	returnWord += words[i] + wordSplitStr;
    }
    return returnWord;
}

/**
 * 检查IP
 * @param ip
 * @return 0:不是正确的IP
 * 			1:IP格式不对（首位只能为1到223的整数,其余部分只能为0到255的整数,且首位不能为127末位不能为0.）
 * 			2:验证通过
 */
function checkIP(ip) { 
	var exp = /^((\d|\d\d|[0-1]\d\d|2[0-4]\d|25[0-5])\.(\d|\d\d|[0-1]\d\d|2[0-4]\d|25[0-5])\.(\d|\d\d|[0-1]\d\d|2[0-4]\d|25[0-5])\.(\d|\d\d|[0-1]\d\d|2[0-4]\d|25[0-5]))$/;
	var bool = ip.match(exp);
	//不是IP
	if (!bool){ return 0;}
	else {
		var ips = ip.split(".");
		if (ips[0] < 1 || ips[0] > 223 || ips[0] == 127
				|| ips[1] < 0 || ips[1] > 255
				|| ips[2] < 0 || ips[2] > 255 
				|| ips[3] <= 0 || ips[3] > 255){
			return 1;
		}
	}
	return 2;
}


/**
 * 检查特殊字符（字母中文或_开头,由数字、字母、中文、_和-组成,且不能为空）
 * @param val
 * @return
 */
function checkSpecialCharacters(val) {
	var exp = /^[\u4E00-\u9FA5A-Za-z_]{1}[\u4E00-\u9FA5A-Za-z0-9_\-\.]{0,31}$/;
	return val.match(exp);
}

/**
 * 检查特殊字符2（只能由数字、字母和特殊字符组成.）
 * @param val
 * @return
 */
function checkSpecialCharacters2(val) {
	var exp = /^[\x00-\xff]*$/;
	return val.match(exp);
}

/**
 * 多选框列表的初始化
 * @return
 */
function init() {
	var rowNum = $(".tablesorter tbody").children().length;
	if (rowNum > 0) {
		setPageCheckBox(rowNum);
	}
}
function makeHelp()
{
	$("#help").mousemove(function(){
		$(this).css("cursor","pointer");
	}).click(function(){
		var url = $(this).attr("url");
			var patt = "";
			if(url=="1"){//Datastores
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188722.html";
			}else if(url=="2"){//LUNs
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188723.html";
			}else if(url=="3"){//目标器
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188724.html";
			}else if(url=="4"){//虚拟机裸映射磁盘
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188728.html";
			}else if(url=="5"){//虚拟机磁盘
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188727.html";
			}else if(url=="start"){//快速入门
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188709.html";
			}else if(url=="mange_device"){//管理设备
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188712.html";
			}else if(url=="discovery"){//发现设备
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188713.html";
			}else if(url=="systeminfo"){//系统信息
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188717.html";
			}else if(url=="pool"){//存储池信息
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188718.html";
			}else if(url=="alarminfo"){//告警信息
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188719.html";
			}else if(url=="datastore_create"){
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188729.html";
			}else if(url=="Mount"){//挂载
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188730.html";
			}else if(url=="unmount"){//卸载
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188731.html";
			}else if(url=="snapshot"){//备份还原
				patt = "/web_help/en/en-us_bookmap_0041188707.htm#en-us_topic_0041188732.html";
			}
			window.open("/vsphere-client/opensds" + patt);
	});
	}
/**
 * 设置页面多选框,rowNum为table行数
 * @param rowNum
 * @return
 */
function setPageCheckBox(rowNum){
	var all = pageParam.chk.all;
	var child = pageParam.chk.child;
	var btn = parent.$("#btnDel");
	parent.$("#" + all).unbind("click");
	parent.$("#" + all).click(function(){
		var chkAll = this.checked;
		if (chkAll) {
			parent.$("#btnDel").prop("disabled", "");
			parent.$("#btnDel .plugin_button_div").css("cursor", "pointer");
		} else {
			parent.$("#btnDel").prop("disabled", "disabled");
			parent.$("#btnDel .plugin_button_div").css("cursor", "default");
		}
		$("input[id^='"+child+"']").each(function (i){
			if (chkAll){
				if (!this.checked){
					this.checked = true;
				}
			} else {
				if (this.checked){
					this.checked = false;
				}
			}
		});
	});
	$("input[id^='"+child+"']").click(function(){
		var num = 0;
		
		$("input[id^='"+child+"']").each(function (i){
			if (this.checked){
				num++;
			}
		});
		if(num == rowNum){
			if (!parent.$("#" + all)[0].checked){
				parent.$("#" + all).prop("checked","checked");
			}
		} else {
			parent.$("#"+all).prop("checked","");
		}
		if (num > 0){
			parent.$("#btnDel").prop("disabled", "");
			parent.$("#btnDel .plugin_button_div").css("cursor", "pointer");
		} else {
			parent.$("#btnDel").prop("disabled", "disabled");
			parent.$("#btnDel .plugin_button_div").css("cursor", "default");
			parent.$("#" + all).prop("checked","");
		}
	});
}

/**
 * 获取多选框选中的行的deviceId
 * @return
 */
function getDeviceIds()
{
	var deviceIds = [];
	$.each($("input[id^='"+pageParam.chk.child+"']"), function(i){
		if (this.checked){
			var id = this.id.split("_")[1];
			deviceIds.push($("#hidID_" + id).val());
		}
	});
	return deviceIds;
}
/**
 * 获取多选框选中的行的LunId
 * @return
 */
function getMountLunIds()
{
	var deviceIds = [];
	$.each($("input[id^='"+pageParam.chk.child+"']"), function(i){
		if (this.checked){
			var id = this.id.split("_")[1];
			deviceIds.push($("#hidID_" + id).val());
		}
	});
	return deviceIds;
}
/**
 * 获取多选框选中的行的LunName
 * @return
 */
function getMountLunNames()
{
	var deviceIds = [];
	$.each($("input[id^='"+pageParam.chk.child+"']"), function(i){
		if (this.checked){
			var id = this.id.split("_")[1];
			deviceIds.push($("#hidName_" + id).val());
		}
	});
	return deviceIds;
}
/**
 * 获取多选框选中的行的LunWWN
 * @return
 */
function getMountLunWWNs()
{
	var deviceIds = [];
	$.each($("input[id^='"+pageParam.chk.child+"']"), function(i){
		if (this.checked){
			var id = this.id.split("_")[1];
			deviceIds.push($("#hidWWN_" + id).val());
		}
	});
	return deviceIds;
}
/**
 * 获取多选框选中的行的deviceId
 * @return
 */
function getMountLunDeviceIds()
{
	var deviceIds = [];
	$.each($("input[id^='"+pageParam.chk.child+"']"), function(i){
		if (this.checked){
			var id = this.id.split("_")[1];
			deviceIds.push($("#hidDeviceID_" + id).val());
		}
	});
	return deviceIds;
}
function shieldCombinationKey() {
	$(document).keydown(function () {
		//屏蔽alt+'->'或'<-'
        if ((window.event.altKey) && (window.event.keyCode == 37 || window.event.keyCode == 39)) {
            event.returnValue=false;  
        }
		//屏蔽F5
		if (event.keyCode==116) {
			event.keyCode = 0;
			event.returnValue = false;
		}
		//屏蔽 Ctrl+n  
		if ((event.ctrlKey)&&(event.keyCode==78)){  
			event.keyCode=0; 
			event.returnValue=false;  
		}  
		//屏蔽 shift+F10
		if ((event.shiftKey)&&(event.keyCode==121)){  
			event.keyCode=0; 
			event.returnValue=false;  
		}  
		//屏蔽ctrl+c
		if ((event.ctrlKey)&&(event.keyCode==67)){  
			event.keyCode=0; 
			event.returnValue=false;  
		}  
		//屏幕ctrl+v
		if ((event.ctrlKey)&&(event.keyCode==86)){  
			event.keyCode=0; 
			event.returnValue=false;  
		}  
	}).bind('contextmenu',function(e){
	      return false;
    });
}