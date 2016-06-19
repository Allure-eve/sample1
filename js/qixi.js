var Qixi=function() {
	var confi= {
		keepZoomRatio:false, layer: {
			"width":"100%", "height":"100%", "top":0, "left":0
		}, audio: {
			enable:true, playURl:"media/happy.wav", cycleURL:"media/circulation.wav"
		}, setTime: {

			walkToThird:6000, //走第一段路的时间
			walkToMiddle:6500, //第一段走到路中间
			walkToEnd:6500, //第一段走路结束
			walkTobridge:2000, //走上桥
			bridgeWalk:2000,//桥上走
			 walkToShop:1500, //进商店
			 walkOutShop:1500, //出商店
			 openDoorTime:800, //开门
			 shutDoorTime:500, //关门
			 waitRotate:850, //等待转身
			 waitFlower:800//取花等待
			  }, 
			snowflakeURl://雪花资源
			["img/55adde120001d34e00410041.png", 
			"img/55adde2a0001a91d00410041.png",
			"img/55adde5500013b2500400041.png", 
			"img/55adde62000161c100410041.png", 
			"img/55adde7f0001433000410041.png", 
			"img/55addee7000117b500400041.png"]
		};
		var debug=0;
		if(debug) {
			$.each(confi.setTime, function(key, val) {
				confi.setTime[key]=500
			}
			)
		}
		if(confi.keepZoomRatio) {
			var proportionY=900/1440;
			var screenHeight=$(document).height();
			var zooomHeight=screenHeight*proportionY;
			var zooomTop=(screenHeight-zooomHeight)/2;
			confi.layer.height=zooomHeight;
			confi.layer.top=zooomTop
		}
		var instanceX;
		var container=$("#content");
		container.css(confi.layer);
	// 页面可视区域
	var visualWidth=container.width();
	var visualHeight=container.height();
	 // 获取数据
	 var getValue=function(className) {
	 	var $elem=$(""+className+"");
		//走路的路线坐标
		return {
			height:$elem.height(), top:$elem.position().top
		}
	};
	var pathY=function() {
		 // 路的Y轴
		 var data=getValue(".a_background_middle");
		 return data.top+data.height/2
		}
		();
		var bridgeY=function() {
		 // 设置下高度  
		 var data=getValue(".c_background_middle");
		 return data.top
		}
		();
		var animationEnd=(function() {
		// 暂停
		var explorer=navigator.userAgent;
		if(~explorer.indexOf("WebKit")) {
			return"webkitAnimationEnd"
		}
		return"animationend"
	}
	)();
	if(confi.audio.enable) {
		//播放音频
		var audio1=Hmlt5Audio(confi.audio.playURl);
		audio1.end(function() {
			Hmlt5Audio(confi.audio.cycleURL, true)
		}
		)
	}
	var swipe=Swipe(container);
	function scrollTo(time, proportionX) {
		////////////
	    //页面滑动//
	   ////////////
	   var distX=visualWidth*proportionX;
	   swipe.scrollTo(distX, time)
	}
	var girl= {
		//女孩动画
		elem:$(".girl"), getHeight:function() {
			return this.elem.height()
		}, rotate:function() {
			this.elem.addClass("girl-rotate")
		}, setOffset:function() {
			this.elem.css( {
				left:visualWidth/2, top:bridgeY-this.getHeight()
			}
			)
			//修正小女孩位置
		}, getOffset:function() {
			return this.elem.offset()
		}, getWidth:function() {
			return this.elem.width()
		}
	};
	var bird= {

		////////////
	   //鸟   飞 //
	  ////////////
	  elem:$(".bird"), fly:function() {
	  	this.elem.addClass("birdFly");
	  	this.elem.transition( {right:visualWidth}, 15000, "linear")
	  }
	};
	
	var boy=BoyWalk();
	 /////////////////////////////////////////////////////////////////////////////////////////////////////////
	////===========================================男孩对象===============================================///
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
	   boy.walkTo(confi.setTime.walkToThird, 0.6).then(function() {
	   	scrollTo(confi.setTime.walkToMiddle, 1);
	   	return boy.walkTo(confi.setTime.walkToMiddle, 0.5)
	   }
	   ).then(function() {
	   	bird.fly()
	   }
	   ).then(function() {
	   	boy.stopWalk();
	   	return BoyToShop(boy)
	   }
	   ).then(function() {
	   	girl.setOffset();
	   	scrollTo(confi.setTime.walkToEnd, 2);
	   	return boy.walkTo(confi.setTime.walkToEnd, 0.15)
	   }
	   ).then(function() {
	   	return boy.walkTo(confi.setTime.walkTobridge, 0.25, (bridgeY-girl.getHeight())/visualHeight)
	   }
	   ).then(function() {
	   	var proportionX=(girl.getOffset().left-boy.getWidth()-instanceX+girl.getWidth()/5)/visualWidth;
	   	return boy.walkTo(confi.setTime.bridgeWalk, proportionX)
	   }
	   ).then(function() {
	   	boy.resetOriginal();
	   	setTimeout(function() {
	   		// 转身动作 
	   		girl.rotate();
	   		boy.rotate(function() {
                 //开始飘雪花
	   			snowflake()
	   		}
	   		)
	   	}, confi.setTime.waitRotate)
	   }
	   );
	   function BoyWalk() {
		//男孩走动画
		var $boy=$("#boy");
		var boyWidth=$boy.width();
		var boyHeight=$boy.height();
		$boy.css( {
			top:pathY-boyHeight+25
		}
		);
		function pauseWalk() {
			$boy.addClass("pauseWalk")
		}
		function restoreWalk() {
			$boy.removeClass("pauseWalk")
		}
		function slowWalk() {
			$boy.addClass("slowWalk")
		}
		function stratRun(options, runTime) {
			var dfdPlay=$.Deferred();
			restoreWalk();
			$boy.transition(options, runTime, "linear", function() {
				dfdPlay.resolve()
			}
			);
			return dfdPlay
		}
		function walkRun(time, dist, disY) {
			time=time||3000;
			slowWalk();
			var d1=stratRun( {
				"left":dist+"px", "top":disY?disY:undefined
			}, time);
			return d1
		}
		function walkToShop(doorObj, runTime) {
			var defer=$.Deferred();
			var doorObj=$(".door");
			var offsetDoor=doorObj.offset();
			var doorOffsetLeft=offsetDoor.left;
			var offsetBoy=$boy.offset();
			var boyOffetLeft=offsetBoy.left;
			instanceX=(doorOffsetLeft+doorObj.width()/2)-(boyOffetLeft+$boy.width()/2);
			var walkPlay=stratRun( {
				transform:"translateX("+instanceX+"px),scale(0.3,0.3)", opacity:0.1
			}, 2000);
			walkPlay.done(function() {
				$boy.css( {
					opacity:0
				}
				);
				defer.resolve()
			}
			);
			return defer
		}
		function walkOutShop(runTime) {
			var defer=$.Deferred();
			restoreWalk();
			var walkPlay=stratRun( {
				transform:"translate("+instanceX+"px,0px),scale(1,1)", opacity:1
			}, runTime);
			walkPlay.done(function() {
				defer.resolve()
			}
			);
			return defer
		}
		function calculateDist(direction, proportion) {
			return(direction=="x"?visualWidth:visualHeight)*proportion
		}
		return {
			walkTo:function(time, proportionX, proportionY) {
				var distX=calculateDist("x", proportionX);
				var distY=calculateDist("y", proportionY);
				return walkRun(time, distX, distY)
			}, stopWalk:function() {
				pauseWalk()
			}, resetOriginal:function() {
				this.stopWalk();
				$boy.removeClass("slowWalk slowFlolerWalk").addClass("boyOriginal")
			}, toShop:function() {
				return walkToShop.apply(null, arguments)
			}, outShop:function() {
				return walkOutShop.apply(null, arguments)
			}, rotate:function(callback) {
				restoreWalk();
				// 男孩转身动作
				$boy.addClass("boy-rotate");
				if(callback) {
					$boy.on(animationEnd, function() {
						callback();
						$(this).off()
					}
					)
				}
			}, getWidth:function() {
				return $boy.width()
			}, getDistance:function() {
				return $boy.offset().left
			}, talkFlower:function() {
				$boy.addClass("slowFlolerWalk")
			}
		}
	}
	 /////////////////////////////////////////////////////////////////////////////////////////////////////////
	////============================================进商店===============================================////
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
	var BoyToShop=function(boyObj) {
		var defer=$.Deferred();
		var $door=$(".door");
		var doorLeft=$(".door-left");
		var doorRight=$(".door-right");
		function doorAction(left, right, time) {
			var defer=$.Deferred();
			var count=2;
			// 等待开门完成
			var complete=function() {
				if(count==1) {
					defer.resolve();
					return
				}
				count--
			};
			doorLeft.transition( {
				"left":left
			}, time, complete);
			doorRight.transition( {
				"left":right
			}, time, complete);
			return defer
		}
		  // 开门
		function openDoor(time) {
			return doorAction("-50%", "100%", time)
		}
		 // 关门
		function shutDoor(time) {
			return doorAction("0%", "50%", time)
		}
		//取到花
		function talkFlower() {
			var defer=$.Deferred();
			boyObj.talkFlower();
			setTimeout(function() {
				defer.resolve()
			}, confi.setTime.waitFlower);
			return defer
		}
	 /////////////////////////////////////////////////////////////////////////////////////////////////////////
	////============================================灯对象===============================================////
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
		var lamp= {
			elem:$(".b_background"), bright:function() {
				this.elem.addClass("lamp-bright")
			}, dark:function() {
				this.elem.removeClass("lamp-bright")
			}
		};

		var waitOpen=openDoor(confi.setTime.openDoorTime);
		waitOpen.then(function() {
			//开灯
			lamp.bright();
			//进商店
			return boyObj.toShop($door, confi.setTime.walkToShop)
		}
		).then(function() {
			//拿到花
			return talkFlower()
		}
		).then(function() {
		//出商店
			return boyObj.outShop(confi.setTime.walkOutShop)
		}
		).then(function() {
			//关门
			shutDoor(confi.setTime.shutDoorTime);
			//关灯
			lamp.dark();
			defer.resolve()
		}
		);
		return defer
	};
	 /////////////////////////////////////////////////////////////////////////////////////////////////////////
	////============================================飘雪花===============================================////
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
	function snowflake() {
		// 雪花容器
		var $flakeContainer=$("#snowflake");
		function getImagesName() {
			return confi.snowflakeURl[[Math.floor(Math.random()*6)]]
		}
		function createSnowBox() {
			var url=getImagesName();
			return $('<div class="snowbox" />').css( {
				"width":41, "height":41, "position":"absolute", "backgroundSize":"cover", "zIndex":100000, "top":"-41px", "backgroundImage":"url("+url+")"
			}
			).addClass("snowRoll")
		}
		 ///////////////////////
		//////设置运动轨迹/////
	   ///////////////////////
		setInterval(function() {
			var startPositionLeft=Math.random()*visualWidth-100, startOpacity=1;
			endPositionTop=visualHeight-40, endPositionLeft=startPositionLeft-100+Math.random()*500, duration=visualHeight*10+Math.random()*5000;
			var randomStart=Math.random();
			randomStart=randomStart<0.5?startOpacity:randomStart;
		 ///////////////////////
		//////创建一个雪花/////
	   ///////////////////////
			var $flake=createSnowBox();
		 ///////////////////////
		//////设置起点位置/////
	   ///////////////////////
			$flake.css( {
				left:startPositionLeft, opacity:randomStart
			}
			);
		 ///////////////////////
		//////加入起点容器/////
	   ///////////////////////
			$flakeContainer.append($flake);
		 ///////////////////////
		//////开始执行动画/////
	   ///////////////////////
			$flake.transition( {
				top:endPositionTop, left:endPositionLeft, opacity:0.7
			}, duration, "ease-out", function() {
				$(this).remove()//结束后删除
			}
			)
		}, 200)
	}
	 /////////////////////////////////////////////////////////////////////////////////////////////////////////
	////============================================背景乐===============================================////
   /////////////////////////////////////////////////////////////////////////////////////////////////////////
	function Hmlt5Audio(url, loop) {
		var audio=new Audio(url);//创建一个音频对象并传入地址
		audio.autoplay=true;//自动播放
		audio.loop=loop||false;//是否循环
		audio.play();
		return {
			end:function(callback) {
				audio.addEventListener("ended", function() {
					callback()
				}, false)
			}
		}
	}
};
$(function() {
	Qixi()
}
);
function Swipe(container, options) {
	var element=container.find(":first");
	var swipe= {
	};
	var slides=element.find(">");//等同于find child
	var width=container.width();
	var height=container.height();
	element.css( {
		width:(slides.length*width)+"px", height:height+"px"
	}
	);
	$.each(slides, function(index) {
		var slide=slides.eq[index];
		slides.eq(index).css( {
			width:width+"px", height:height+"px"
		}
		)
	}
	);
	var isComplete=false;
	var timer;
	var callbacks= {
	};
	container[0].addEventListener("transitionend", function() {
		isComplete=true
	}, false);
	function monitorOffet(element) {
		timer=setTimeout(function() {
			if(isComplete) {
				clearInterval(timer);
				return
			}
			callbacks.move(element.offset().left);
			monitorOffet(element)
		}, 500)
	}
	swipe.watch=function(eventName, callback) {
		callbacks[eventName]=callback
	};
	// 页面滚动到指定的位置
	//用来临时调整页面
	swipe.scrollTo=function(x, speed) {
		element.css( {
			"transition-timing-function":"linear", "transition-duration":speed+"ms", "transform":"translate3d(-"+x+"px,0px,0px)"
		}
		);
		return this
	};
	return swipe
};
