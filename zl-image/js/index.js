window.ZLImage = (function () {

    var zlimageLock = false;

    function __constructor(images) {
        var arr = [];

        // detect IE8 one way or another
        var ieversion=function(){
            for(var e,i=3,n=document.createElement("div"),t=n.getElementsByTagName("i");
                n.innerHTML="<!--[if gt IE "+ ++i+"]><i></i><![endif]-->",t[0];);return i>4?i:e
        }();

        var isOldIE = false;

        if (ieversion === 8 || ieversion === 9) {
            isOldIE = true;
        }

        function fadeOut(el){
            el.style.opacity = 1;

            (function fade() {
                if ((el.style.opacity -= 0.005) < 0) {
                    el.style.display = "none";
                } else {
                    requestAnimationFrame(fade);
                }
            })();
        }

        var ie8opacity = 100;
        function fadeOutIE8(el){
            (function fade() {
                el.style.filter = "alpha(opacity="+ ie8opacity +")";
                if ((ie8opacity -= 0.6) < 0) {
                    el.style.display = "none";
                } else {
                    requestAnimationFrame(fade);
                }
            })();
        }

        function addClass(el, className) {
            if (el.classList) {
                el.classList.add(className);
            }
            else {
                el.className += ' ' + className;
            }
        }

        var readyToShow = function (img) {
            setTimeout(function () {
                addClass(img, "zl-image-blur");
            }, 32);
        };

        var handleInnerNode = function(nodes, index) {
            var innerNode = nodes[index];
            if (innerNode.tagName === 'IMG') {
                return innerNode;
            }
            return false;
        };

        for(var i=0; i<images.length; ++i) {
            (function (index) {
                var image = images[index];
                var defualtImage = false;
                var originImage = false;

                for (var outerIndex = 0; outerIndex < image.children.length; outerIndex++) {
                    (function (outerIndexUse) {
                        var outNode = image.children[outerIndex];
                        if (outNode.getAttribute("data-imagetype") === 'default') {
                            defualtImage = outNode;
                        }

                        if (outNode.getAttribute("data-imagetype") === 'origin') {
                            if (outNode.tagName === 'PICTURE') {
                                if (outNode.children.length < 0) {
                                    throw new Error("picture must have img");
                                }
                                for ( var innerIndex = 0; innerIndex < outNode.children;  innerIndex++) {
                                    originImage = handleInnerNode(outNode.children, innerIndex);
                                }
                            } else {
                                originImage = outNode;
                            }
                        }
                    })(outerIndex);
                }

                if (!defualtImage || !originImage) {
                    throw new Error("zl-image");
                }

                // 上一张图片加载成功后去除锁
                function show() {
                    zlimageLock = true;
                    if (ieversion === 8) {
                        setTimeout(function () {
                            originImage.src = originImage.getAttribute("data-src");
                            originImage.onload = function () {
                                zlimageLock = false;
                                readyToShow(originImage);
                            };
                        }, 0);
                        setTimeout(function () {
                            fadeOutIE8(defualtImage);
                        }, 52);
                    } else {
                        defualtImage.onload = (function (index) {
                            originImage.src = originImage.getAttribute("data-src");
                            originImage.onload = function () {
                                zlimageLock = false;
                                readyToShow(originImage);
                            };
                            setTimeout(function () {
                                if (isOldIE) {
                                    fadeOut(defualtImage);
                                } else {
                                    addClass(defualtImage, "zl-image-opacity");
                                }

                            }, 32);
                        })(i);
                    }
                }

                arr.push({
                    image: image,
                    defualtImage: defualtImage,
                    originImage: originImage,
                    show: show
                });

            })(i);
        }

        return arr;
    }


    return {
        init: __constructor,
        lock: zlimageLock
    }
})();
