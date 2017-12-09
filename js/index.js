let loadingRender = (function ($) {
    let $loadingBox = $('.loadingBox'),
        $run = $loadingBox.find('.run');

    //=>我们需要处理的图片
    let imgList = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    let total = imgList.length,
        cur = 0;
    //=>控制图片加载进度，计算滚动条加载长度
    let computed = function () {
        imgList.forEach(function (item) {
            let tempImg = new Image;
            tempImg.src = item;
            tempImg.onload = function () {
                tempImg = null;
                cur++;
                runFn();
            }
        });
    };
    //=>计算加载长度
    let runFn = function () {
        $run.css('width', cur / total * 100 + '%');
        if (cur >= total) {
            let delayTimer = setTimeout(() => {
                //=>需要延迟的图片都加载成功了：进入到下一个区域(设置一个缓冲等待时间，当加载完成，让用户看到加载完成的效果，再进入到下个一区域)
                $loadingBox.remove();
                phoneRender.init();
                clearInterval(delayTimer);
            }, 1500)
        }
    };


    return {

        init: function () {
            //=>我们在CSS中把所有区域的DISPLAY都数值为NONE，以后开发的时候，开发哪个区域，我们就执行哪个区域init方法，在这个方法中首先控制当前区域展示，其他区域都是隐藏的
            $loadingBox.css('display', 'block');
            computed();
        }
    }
})(Zepto);


let phoneRender = (function ($) {
    let $phoneBox = $('.phoneBox');
    let $time = $phoneBox.find('.time');
    let $listen = $phoneBox.find('.listen');
    let $listenTouch = $listen.find('.touch');
    let $detail = $phoneBox.find('.detail');
    let $detailTouch = $detail.find('.touch');
    let audioBell = $('#audioBell')[0];
    let audioSay = $('#audioSay')[0];

    let $phonePlan = $.Callbacks();

    $phonePlan.add(function () {
        $listen.remove();
        $detail.css('transform', 'translateY(0)');
    });
    let sayTimer = null;
    //=>控制SAY播放
    $phonePlan.add(function () {
        audioBell.pause();
        audioSay.play();
        $time.css('display', 'block');

        sayTimer = setInterval(() => {
            //=>总时间和已经播放时间：单位S
            let duration = audioSay.duration;
            let curTime = audioSay.currentTime;

            let minute = Math.floor(curTime / 60);
            let second = Math.floor(curTime - minute * 60);

            minute < 10 ? minute = '0' + minute : null;
            second < 10 ? second = '0' + second : null;

            $time.html(`${minute}:${second}`);

            if (curTime >= duration) {
                clearInterval(sayTimer);
                enterNext();
            }

        }, 1000);

    });

    //=>DETAIL-TOUCH
    // $phonePlan.add(()=>$detailTouch.tap(enterNext);

    $phonePlan.add(function () {
        $detailTouch.tap(enterNext);
        clearInterval(sayTimer);
    });

    //=>进入下一个区域（MESSAGE）
    let enterNext = function () {
        audioSay.pause();
        $phoneBox.remove();
        messageRender.init();
    };

    return {
        init: function () {
            $phoneBox.css('display', 'block');
            //=>控制BELL播放；
            audioBell.play();
            audioBell.volume = .2;

            $listenTouch.tap($phonePlan.fire);
        }
    }
})(Zepto);


/*--MESSAGE--*/
let messageRender = (function ($) {
    let $messageBox = $('.messageBox');
    let $talkBox = $messageBox.find('.talkBox');
    let $talkList = $talkBox.find('li');
    let $keyBord = $messageBox.find('.keyBord');
    let $keyBordText = $keyBord.find('span');
    let $submit = $keyBord.find('.submit');
    let musicAudio = $('#musicAudio')[0];

    let $plan = $.Callbacks();

    //=>控制消息列表逐条显示
    let step = -1;
    let autoTimer = null;
    let interval = 1500;
    let offset = 0;

    $plan.add(() => {
        autoTimer = setInterval(() => {
            step++;
            let $cur = $talkList.eq(step);
            $cur.css({
                opacity: 1,
                transform: 'translateY(0)'
            });
            //=>当第三条完全展示后立即调取出键盘（STEP===2 && 当前LI显示的动画已经完成）
            if (step === 2) {
                //=>当前元素正在运行的CSS3过渡动画已经完成，就会触发这个事件（有几个元素样式需要改变，就会被触发执行几次）
                $cur.one('transitionend', () => {
                    //=>one:
                    $keyBord.css('transform', 'translateY(0)').one('transitionend', textMove);

                });
                clearInterval(autoTimer);
                return;
            }

            if (step >= 4) {
                offset += -$cur[0].offsetHeight;
                $talkBox.css('transform', `translateY(${offset}px)`);
            }
            //=>已经把LI都显示了：结束动画，进入到下一个区域即可
            if (step >= $talkList.length - 1) {
                clearInterval(autoTimer);

                let delayTimer = setTimeout(() => {
                    musicAudio.pause();
                    $messageBox.remove();
                    cubeRender.init();
                    clearInterval(delayTimer);
                }, interval);

            }

        }, interval)
    });


    //=>文字打印机
    let textMove = function () {
        let text = $keyBordText.html();
        $keyBordText.css('display', 'block').html('');

        let timer = null,
            n = -1;
        timer = setInterval(() => {
            if (n >= text.length) {
                //=>打印机效果完成：让发送按钮显示,并且給其绑定点击事件

                clearInterval(timer);
                $keyBordText.html(text);
                $submit.css('display', 'block').tap(() => {
                    $keyBordText.css('display', 'none');
                    $keyBord.css('transform', 'translateY(3.7rem)');
                    $plan.fire();//=>此时计划表中只有一个方法，重新通知计划表中的方法执行
                });
                return;
            }
            n++;
            $keyBordText[0].innerHTML += text.charAt(n);
        }, 100)
    };

    return {
        init: function () {
            $messageBox.css('display', 'block');
            musicAudio.play();
            $plan.fire();
        }
    }
})(Zepto);

/*--CUBE--*/
$(document).on('touchstart touchmove touchend', function (e) {
    e.preventDefault();
});

let cubeRender = (function ($) {
    let $cubeBox = $('.cubeBox');
    let $box = $cubeBox.find('.box');
    let $imgList = $cubeBox.find('img');


    let touchBegin = function (e) {
        let point = e.changedTouches[0];
        $(this).attr({
            strX: point.clientX,
            strY: point.clientY,
            isMove: false,
            changeX: 0,
            changeY: 0
        });
    };

    let touching = function (e) {
        let point = e.changedTouches[0];
        let $this = $(this);
        let changX = point.clientX - parseFloat($this.attr('strX'));
        let changY = point.clientY - parseFloat($this.attr('strY'));
        if (Math.abs(changX) > 10 || Math.abs(changY) > 10) {
            $this.attr({
                isMove: true,
                changeX: changX,
                changeY: changY,
            });
        }

    };

    let touchEnd = function (e) {
        let point = e.changedTouches[0];
        let $this = $(this);
        let isMove = $this.attr('isMove');
        let changeX = parseFloat($this.attr('changeX'));
        let changeY = parseFloat($this.attr('changeY'));
        let rotateX = parseFloat($this.attr('rotateX'));
        let rotateY = parseFloat($this.attr('rotateY'));

        if (isMove === 'false') return;

        rotateX = rotateX - changeY / 3;
        rotateY = rotateY + changeX / 3;

        $this.css('transform', `scale(.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
            rotateX: rotateX,
            rotateY: rotateY
        });
    };

    return {
        init: function () {
            $cubeBox.css('display', 'block');
            $box.attr({
                rotateX: -30,
                rotateY: 45,
            }).on({
                touchstart: touchBegin,
                touchmove: touching,
                touchend: touchEnd,
            });

            $box.find('li').tap(function () {
                $cubeBox.css('display', 'none');
                let index=$(this).index();
                detailRender.init(index)

            })

        }
    }
})(Zepto);
// cubeRender.init();
// messageRender.init();


let detailRender = (function () {
    let $detailBox = $('.detailBox');
    let swiperExample = null;

    let $returnLink = $detailBox.find('.returnLink');
    let $cubeBox = $('.cubeBox');

    let $makisuBox = $('#makisuBox');


    let change = function (example) {
        // example.activeIndex  当前活动块的索引
        //example.slides 数组，存储了当前所有活动块

        let {slides:slideAry, activeIndex} = example;

        //=>page1单独处理
        if(activeIndex === 0){
            //展开
            $makisuBox.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.8

            });
            $makisuBox.makisu('open');

        } else{
            //收起
            $makisuBox.makisu({
                selector:'dd',
                overlap:0,
                speed:0
            });
            $makisuBox.makisu('close');
        }

        //=>给当前活动块设置ID，其他块移除ID
        [].forEach.call(slideAry,(item, index) => {
            if(index===activeIndex){
                item.id='page'+(activeIndex+1);
                return;
            }
            item.id = null;
        })


    }

    return {
        init: function (index = 0) {
            $detailBox.css('display', 'block');





            if(!swiperExample){

                //=>RETURN
                $returnLink.tap(()=>{
                    $detailBox.css('display', 'none');
                    $cubeBox.css('display', 'block');
                });

                swiperExample = new Swiper('.swiper-container', {
                    effect: 'coverflow',
                    onInit:change,
                    onTransitionEnd:change,
                });
            }


            index = index > 5 ? 5 : index;
            swiperExample.slideTo(index, 0);

        }
    }
})();
// detailRender.init(1);
// cubeRender.init();
loadingRender.init();

/*
* 基于SWIPER实现每一个页面的动画
* 1、滑到某一个页面的室友，给当前这个页面设置一个ID，例如：滑动到第二个页面，我们给其设置ID=PAGE2
* 2、当滑出这个页面的时候，我们把之前设置的ID移除掉
* 3、我们把当前页面中元素需要的动画效果全部写在指定的ID下
*
* #page2 h2{
*   animation:xxx 1s...
* }
*
* 细节处理
* 1、我们是基于animate.css帧动画库完成的动画
* 2、我们让需要运动元素初始样式是透明度为0
* 3、当设置ID让其运动的时候，我们自己在动画公式完成的时候，让其透明度为1
*
* */
