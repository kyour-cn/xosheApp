
/**
 * 项目中的App支持方案
 */
(function(w){

    var vapp = {};
    //浏览图片
    vapp.ImagePreview = function(param){

        var closeViewer = function(){
            pv.close();
            api.closeFrame({name: 'photoview'});
            api.removeEventListener({name: 'saveimage'});
            App.goBack(true);
        }
		//判断是否不是数组
		if (!Array.isArray(param.images)) {
			param.images = [param.images];
		}
        if(!'startPosition' in param){
            param.startPosition = 0;
        }
		var pv = api.require('UIPhotoViewer');
		pv.open({
            activeIndex: param.startPosition, //显示第几张
			images: param.images,
            gestureClose: false,
            bgColor: '#333',
            mode: 2,
            atime: 500
		}, function(ret, err) {
            if (ret){
                if(ret.eventType == 'show'){
                    api.openFrame({
                        name: 'photoview',
                        url: 'widget://html/ui/photoview.html',
                        rect: {
                            x: 0,
                            y: api.winHeight - 70,
                            w: api.winWidth,
                            h: 50
                        }
                    });
                    App.addBack(function(){
                        closeViewer();
                    });

                    //监听保存事件
                    api.addEventListener({
                        name: 'saveimage'
                    }, function(ret, err){
                        pv.getIndex(function(ret, err){
                            if(ret){
                                api.toast({msg: '正在保存'+param.images[ret.index]});
                                api.saveMediaToAlbum({
                                    path: param.images[ret.index],
                                    groupName: ''
                                }, function(ret, err) {
                                    console.log(JSON.stringify(ret));
                                    api.toast({
                                        msg: (ret && ret.status) ? '保存成功' : '保存失败',
                                        duration: 1500,
                                        location: 'bottom'
                                    });
                                });
                            }else{
                                alert(JSON.stringify(err));
                            }
                        });

                        // pv.getImage({
                        //     // index: 2
                        // }, function(ret, err) {
                        //     if (ret) {
                        //         var ret_path = ret.path;
                        //         pv.getIndex(function(ret, err) {
                        //             if (ret) {
                        //                 var type = param.images[ret.index].split('.').pop().toLowerCase();
                        //                 var path = 'fs://save_temp.'+type;
                        //                 console.log(path);
                        //                 //先保存到缓存目录
                        //                 var fs = api.require('fs');
                        //                 fs.copyTo({
                        //                     oldPath: ret_path,
                        //                     newPath: path
                        //                 }, function(ret, err) {
                        //                     if (ret.status) {
                        //                         console.log(ret_path);
                        //                         api.saveMediaToAlbum({
                        //                             path: path,
                        //                             groupName: 'xoshe'
                        //                         }, function(ret, err) {
                        //                             api.toast({
                        //                                 msg: (ret && ret.status)?'保存成功': '保存失败',
                        //                                 duration: 1500,
                        //                                 location: 'bottom'
                        //                             });
                        //                         });
                        //                     } else {
                        //                         alert(JSON.stringify(err));
                        //                     }
                        //                 });
                        //
                        //             } else {
                        //                 alert(JSON.stringify(err));
                        //             }
                        //         });
                        //
                        //     } else {
                        //         alert(JSON.stringify(err));
                        //     }
                        // });
                    });

                }else if(ret.eventType == 'click'){
                    closeViewer();
                }else{
                    // console.log(ret.eventType);
                }
            } else {
                alert(JSON.stringify(err));
            }
        });
    }

    w.vapp = vapp;
})(window);
