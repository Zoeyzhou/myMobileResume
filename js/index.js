
$(document).on('touchmove',function(ev){
    ev.preventDefault();
})
$(function(){
    //解决各设备高度适配问题
    var viewHeight=$(window).height();
    var $li=$('#list').find('>li');
    $('#main').css('height',viewHeight);
    slidePage();
    function slidePage(){
        var startY=null;
        var step=1/4;
        var nowIndex=0;
        var nextorprevIndex=0;
        var bOk=true;
        //绑定touchstart事件
        $li.on('touchstart',function(ev){
            if(bOk==false) return;
            bOk=false;
            var touch=ev.originalEvent.touches[0];
            startY=touch.pageY;
            nowIndex=$(this).index();
            $li.on('touchmove.move',function(ev){
                var touch=ev.originalEvent.touches[0];
                $(this).siblings('li').hide();
                //首先会进行上下划动的判断
                //缩放公式：1-Math.abs(touch.pageY-startY)/viewHeight*step 0~0.25 1~0.75
                if(touch.pageY<startY){//up
                    nextorprevIndex=nowIndex==$li.length-1?0:nowIndex+1;
                    $li.eq(nextorprevIndex).css('transform','translate(0,'+(viewHeight+touch.pageY-startY)+'px)')
                }else if(touch.pageY>startY){//down
                    nextorprevIndex=nowIndex==0?$li.length-1:nowIndex-1;
                    $li.eq(nextorprevIndex).css('transform','translate(0,'+(-viewHeight+touch.pageY-startY)+'px)')
                }else{
                    bOk=true;
                }
                $(this).css('transform','translate(0,'+(touch.pageY-startY)*step+'px) scale('+(1-Math.abs(touch.pageY-startY)/viewHeight*step)+')');
                $li.eq(nextorprevIndex).addClass('zIndex').show();
            });
            $li.on('touchend.move',function(ev){
                var touch=ev.originalEvent.changedTouches[0];
                if(touch.pageY<startY) {//up
                    $(this).css('transform','translate(0,'+(-viewHeight*step)+'px) scale('+(1-step)+')')
                }else if(touch.pageY>startY) {//down
                    $(this).css('transform','translate(0,'+(viewHeight*step)+'px) scale('+(1-step)+')')
                }else{
                    bOk=true;
                }
                $li.eq(nextorprevIndex).css('transform','translate(0,0)');
                $li.eq(nextorprevIndex).css('transition','.3s');
                $li.eq(nowIndex).css('transition','.3s');
                $li.off('.move');
            })
        })
        $li.on('transitionend webkitTransitionend',function(ev){
            if(!$li.is(ev.target)) return;
            resetFn();
        })
        function resetFn(){
            $li.css('transform','');
            $li.css('transition','');
            $li.eq(nextorprevIndex).removeClass('zIndex').siblings('li').hide();
            bOk=true;
        }
    }

    //音乐播放部分
    var music = document.getElementById("music"), audio = document.getElementById("audio");
    //->给页面的加载缓冲500MS时间
    window.setTimeout(function () {
        audio.play();

        //->当音频文件可以播放(出声了)的时候:canplay/canplaythrough
        audio.addEventListener("canplay", function () {
            music.style.display = "block";
            music.className = "music musicMove";
        }, false);
    }, 500);

    //->移动端使用CLICK存在300MS的延迟
    music.addEventListener("click", function () {
        //->当前是暂停的
        if (audio.paused) {
            audio.play();
            music.className = "music musicMove";
            return;
        }
        //->当前是播放的
        audio.pause();
        music.className = "music";
    }, false);
    /*改变第三屏每个技能点的top值*/
    var $list = $('#list').children('li').eq(2).children('.wrap').find('.html');
    $list.each(function () {
        var index = $(this).index();
        $(this).css('top',index*80+'px');
    })

    /*第四屏作品展示轮播图区域代码*/
    var ary = ["imgs/banner1.png", "imgs/banner2.png", "imgs/banner3.png"], count = ary.length;
    var winW = document.documentElement.clientWidth;

    var banner = document.getElementById("banner"),
        bannerInner = banner.firstElementChild,
        bannerTip = banner.lastElementChild;

    var divList = bannerInner.getElementsByTagName("div"),
        imgList = bannerInner.getElementsByTagName("img"),
        tipList = bannerTip.getElementsByTagName("li");

//->设置轮播图区域的宽度:图片的总数+2(前后需要多方一张) * 屏幕的宽度
    bannerInner.style.width = winW * (count + 2) + "px";

//->数据绑定:拼接字符串
    ~function () {
        var str = "", str2 = "";
        //拼接的是轮播图区域的HTML
        str += "<div><img src='' trueImg='" + ary[count - 1] + "'/></div>";
        for (var i = 0; i < count; i++) {
            str += "<div><img src='' trueImg='" + ary[i] + "'/></div>";
            //->拼接焦点区域的字符串
            var strClass = i === 0 ? "bg" : null;
            str2 += "<li class='" + strClass + "'></li>";
        }
        str += "<div><img src='' trueImg='" + ary[0] + "'/></div>";
        bannerInner.innerHTML = str;
        bannerTip.innerHTML = str2;
    }();

//->设置每一张图片区域的宽度值
    [].forEach.call(divList, function (curDiv, index) {
        curDiv.style.width = winW + "px";
    });

//->图片的延迟加载
    window.setTimeout(function () {
        [].forEach.call(imgList, function (curImg, index) {
            var oImg = new Image;
            oImg.src = curImg.getAttribute("trueImg");
            oImg.onload = function () {
                curImg.src = this.src;
                curImg.className = "imgMove";
                oImg = null;
            }
        });
    }, 500);

//->焦点对齐
    function changeTip() {
        var temp = step;
        temp > count ? temp = 1 : null;
        temp < 1 ? temp = count : null;
        [].forEach.call(tipList, function (curTip, index) {
            curTip.className = index + 1 === temp ? "bg" : null;
        });
    }

//->自动轮播
    var step = 1, interval = 2000, autoTimer = null, autoDelay = null;
    autoTimer = window.setInterval(autoMove, interval);
    function autoMove() {
        bannerInner.style.webkitTransitionDuration = "0.3s";
        step++;
        bannerInner.style.left = -winW * step + "px";
        //->当运动到最后一张图片的时候,立马让其回归到真实的第一张图片位置
        if (step > count) {
            window.setTimeout(function () {
                bannerInner.style.webkitTransitionDuration = "0s";
                bannerInner.style.left = -winW + "px";
                step = 1;
            }, 300);
        }
        changeTip();
    }

//->实现左右切换
//->想给页面中的某一个元素绑定touchmove这个行为,需要提前把浏览器touchmove这个事件默认的行为给阻止掉
    document.addEventListener("touchmove", function (e) {
        e.preventDefault();
    }, false);

    ["start", "move", "end"].forEach(function (item, index) {
        bannerInner.addEventListener("touch" + item, eval(item), false);
    });

    function start(e) {
        window.clearInterval(autoTimer);
        window.clearInterval(autoDelay);

        var touchPoint = e.touches[0];
        this["strX"] = touchPoint.clientX;
        this["strY"] = touchPoint.clientY;
        this["strL"] = parseFloat(window.getComputedStyle(this, null)["left"]);
    }

    function move(e) {
        var touchPoint = e.touches[0];
        this["curX"] = touchPoint.clientX;
        this["curY"] = touchPoint.clientY;

        //->检测当前是否是滑动
        this["isFlag"] = swipeFlag(this["strX"], this["curX"], this["strY"], this["curY"]);
        if (this["isFlag"]) {
            //->获取滑动的方向,只有左右滑动的时候我们才进行相关的操作
            this["swipeDir"] = swipeDirection(this["strX"], this["curX"], this["strY"], this["curY"]);
            if (/^(Left|Right)$/.test(this["swipeDir"])) {
                this["changeX"] = this["curX"] - this["strX"];
                this["curL"] = this["changeX"] + this["strL"];
                //->边界判断
                this.style.webkitTransitionDuration = "0s";
                if (this["curL"] > 0) {
                    this.style.left = "0px";
                } else if (this["curL"] < -(count + 1) * winW) {
                    this.style.left = -(count + 1) * winW + "px";
                } else {
                    this.style.left = this["curL"] + "px";
                }
            }
        }
    }

    function end(e) {
        //->滑动结束,我们过一段时间在开启自动轮播
        autoDelay = window.setTimeout(function () {
            autoTimer = window.setInterval(autoMove, interval);
        }, interval);

        //->如果没有发生移动,我们不需要在执行下述的操作了
        if (!this["isFlag"]) {
            return;
        }

        if (this["swipeDir"] === "Left") {//->向左滑
            if (Math.abs(this["changeX"]) > winW / 4) {
                step++;
            }
        } else {//->向右滑
            if (Math.abs(this["changeX"]) > winW / 4) {
                step--;
            }
        }
        this.style.webkitTransitionDuration = "0.3s";
        this.style.left = -step * winW + "px";
        changeTip();

        var _this = this;
        if (step < 1) {//->已经到达左边界
            window.setTimeout(function () {
                _this.style.webkitTransitionDuration = "0s";
                step = count;
                _this.style.left = -step * winW + "px";
            }, 300);
        } else if (step > count) {//->已经到达右边界
            window.setTimeout(function () {
                _this.style.webkitTransitionDuration = "0s";
                step = 1;
                _this.style.left = -step * winW + "px";
            }, 300);
        }

        //->把所有设置的自定义属性清空
        ["strX", "strY", "strL", "curX", "curY", "curL", "changeX", "isFlag", "swipeDir"].forEach(function (item) {
            this[item] = null;
        }, this);
    }

//->检测是否为滑动
//x1:x轴的起始位置 x2:x轴的结束位置 y1:y轴的起始位置 y2:y轴的结束位置
    function swipeFlag(x1, x2, y1, y2) {
        return Math.abs(x2 - x1) > 30 || Math.abs(y2 - y1) > 30;
    }

//->检测出我们滑动的方向
    function swipeDirection(x1, x2, y1, y2) {
        var changeX = x2 - x1, changeY = y2 - y1;
        return Math.abs(changeX) > Math.abs(changeY) ? (changeX < 0 ? "Left" : "Right") : (changeY < 0 ? "Up" : "Down");
    }

    //点击有惊喜部分
    var $textClick = $('#list>li').eq(4).children('strong')[0];
    $textClick.addEventListener('click',show,false);
    function show(e){
        var tar = e.target;
        if(tar.tagName.toUpperCase()=='STRONG'){
            $('.code').stop().show();
        }
}
})